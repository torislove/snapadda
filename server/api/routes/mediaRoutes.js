import express from 'express';
import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';
import dotenv from 'dotenv';
import { parseMultipart } from '../utils/multipartParser.js';

dotenv.config();

// Ensure Cloudinary is configured
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const router = express.Router();

/**
 * Helper to upload a buffer to Cloudinary using its SDK stream
 */
const uploadToCloudinary = (fileBuffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: 'snapadda/properties',
        resource_type: 'auto'
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      }
    );
    Readable.from(fileBuffer).pipe(stream);
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

// POST /api/media/upload - Hybrid Parser Version
router.post('/upload', async (req, res) => {
  try {
    console.log('--- HYBRID MEDIA UPLOAD START ---');
    
    // Use the robust parser instead of Multer
    const { files } = await parseMultipart(req);
    
    if (!files || files.length === 0) {
      console.error('UPLOAD_ERROR: No files in request boat');
      return res.status(400).json({ status: 'error', message: 'No files provided.' });
    }

    console.log(`Processing ${files.length} assets...`);
    
    // Upload all files in parallel to Cloudinary
    const uploadPromises = files.map(file => {
      console.log(`Uploading: ${file.originalname} (${(file.size / 1024 / 1024).toFixed(2)} MB)`);
      return uploadToCloudinary(file.buffer);
    });

    const urls = await Promise.all(uploadPromises);

    console.log('--- HYBRID MEDIA UPLOAD SUCCESS ---');
    res.json({
      status: 'success',
      data: urls
    });
  } catch (err) {
    console.error('UPLOAD_FAILURE:', err);
    res.status(500).json({ 
      status: 'error', 
      message: 'Media server error: ' + (err.message || 'Unknown stream failure') 
    });
  }
});

export default router;
