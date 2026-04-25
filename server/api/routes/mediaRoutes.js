import express from 'express';
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import Busboy from 'busboy';
import path from 'path';

dotenv.config();

// Ensure Cloudinary is configured
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const router = express.Router();

// Helper to upload a buffer to Cloudinary
const uploadToCloudinary = (buffer, mimetype, originalname) => {
  return new Promise((resolve, reject) => {
    const isVideo = mimetype.startsWith('video/');
    const folder = isVideo ? 'snapadda/videos' : 'snapadda/properties';
    
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: folder,
        resource_type: 'auto',
        public_id: `file_${Date.now()}_${Math.round(Math.random() * 1E9)}`,
        transformation: isVideo ? [] : [{ width: 1280, crop: "limit" }, { fetch_format: "auto", quality: "auto" }]
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result.secure_url);
      }
    );
    uploadStream.end(buffer);
  });
};

// Health Check for Cloudinary Config
router.get('/health', (req, res) => {
  const config = {
    cloud_name: !!process.env.CLOUDINARY_CLOUD_NAME,
    api_key: !!process.env.CLOUDINARY_API_KEY,
    api_secret: !!process.env.CLOUDINARY_API_SECRET
  };
  res.json({ status: 'success', cloudinary_configured: config });
});

// POST /api/media/upload
router.post('/upload', async (req, res) => {
  console.log('UPLOAD_START: Method:', req.method, 'Content-Type:', req.headers['content-type']);

  // Handle JSON (Base64) fallback - though we primarily use FormData now
  if (req.headers['content-type'] && req.headers['content-type'].includes('application/json')) {
    try {
      const { files } = req.body;
      if (!files || !Array.isArray(files) || files.length === 0) {
        return res.status(400).json({ status: 'error', message: 'No files provided' });
      }

      const uploadPromises = files.map(fileStr => {
        const isVideo = fileStr.includes('video/') || fileStr.includes('mp4');
        return cloudinary.uploader.upload(fileStr, {
          folder: 'snapadda/properties',
          resource_type: 'auto',
          transformation: isVideo ? [] : [{ width: 1280, crop: "limit" }, { fetch_format: "auto", quality: "auto" }]
        });
      });

      const results = await Promise.all(uploadPromises);
      return res.json({ status: 'success', data: results.map(r => r.secure_url) });
    } catch (error) {
      console.error('B64 UPLOAD ERROR:', error);
      return res.status(500).json({ status: 'error', message: 'Failed to upload base64 media' });
    }
  }

  // Handle Multipart (FormData) using Busboy (More resilient on Firebase/GCF)
  try {
    const busboy = Busboy({ headers: req.headers });
    const uploadPromises = [];
    
    busboy.on('file', (fieldname, file, info) => {
      const { filename, encoding, mimeType } = info;
      console.log(`Processing file: ${filename}, ${mimeType}`);
      
      const chunks = [];
      file.on('data', (data) => chunks.push(data));
      file.on('end', () => {
        const buffer = Buffer.concat(chunks);
        uploadPromises.push(uploadToCloudinary(buffer, mimeType, filename));
      });
    });

    busboy.on('finish', async () => {
      try {
        const urls = await Promise.all(uploadPromises);
        console.log('UPLOAD_COMPLETE: Files:', urls.length);
        
        if (urls.length === 0) {
          return res.status(400).json({ status: 'error', message: 'No files were detected in the form' });
        }
        
        res.json({ status: 'success', data: urls });
      } catch (err) {
        console.error('CLOUDINARY_BATCH_ERROR:', err);
        res.status(500).json({ status: 'error', message: 'Cloudinary upload failed: ' + err.message });
      }
    });

    busboy.on('error', (err) => {
      console.error('BUSBOY_ERROR:', err);
      res.status(500).json({ status: 'error', message: 'Form parsing error: ' + err.message });
    });

    // If Firebase pre-parsed the body into rawBody, we must use that
    if (req.rawBody) {
      busboy.end(req.rawBody);
    } else {
      req.pipe(busboy);
    }
  } catch (criticalErr) {
    console.error('CRITICAL_UPLOAD_HANDLER_ERROR:', criticalErr);
    res.status(500).json({ status: 'error', message: 'Media handler crash: ' + criticalErr.message });
  }
});

export default router;
