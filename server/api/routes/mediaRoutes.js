import express from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import dotenv from 'dotenv';

dotenv.config();

// Ensure Cloudinary is configured specifically for this route set
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const router = express.Router();

// Cloudinary Storage Config for Multer
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    const isVideo = file.mimetype.startsWith('video/');
    const folder = isVideo ? 'snapadda/videos' : 'snapadda/properties';
    
    return {
      folder: folder,
      resource_type: 'auto',
      allowed_formats: ['jpg', 'png', 'jpeg', 'webp', 'mp4', 'mov', 'heic', 'heif', 'bmp', 'pdf'],
      public_id: `file_${Date.now()}_${Math.round(Math.random() * 1E9)}`,
      transformation: isVideo ? [] : [{ width: 800, crop: "limit" }, { fetch_format: "auto", quality: "auto" }]
    };
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // Increased to 50MB for videos
    files: 20
  }
});

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
  // Check if it's base64 payload
  if (req.headers['content-type'] && req.headers['content-type'].includes('application/json')) {
    try {
      const { files } = req.body;
      if (!files || !Array.isArray(files) || files.length === 0) {
        return res.status(400).json({ status: 'error', message: 'No files provided' });
      }

      const uploadPromises = files.map(fileStr => {
        const isVideo = fileStr.includes('video/') || fileStr.includes('mp4') || fileStr.includes('webm');
        return cloudinary.uploader.upload(fileStr, {
          folder: 'snapadda/properties',
          resource_type: 'auto',
          transformation: isVideo ? [] : [
            { width: 800, crop: "limit" },
            { fetch_format: "auto", quality: "auto" }
          ]
        });
      });

      const results = await Promise.all(uploadPromises);
      const urls = results.map(r => r.secure_url);

      return res.json({
        status: 'success',
        data: urls
      });
    } catch (error) {
      console.error('B64 UPLOAD ERROR:', error);
      return res.status(500).json({ status: 'error', message: 'Failed to upload media via base64' });
    }
  }

  // Fallback to multer for multipart/form-data
  upload.array('files', 20)(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      console.error('MULTER_SPECIFIC_ERROR:', err.code, err.message);
      let message = 'File upload failed: ' + err.message;
      if (err.code === 'LIMIT_FILE_SIZE') message = 'File too large (Max 50MB)';
      if (err.code === 'LIMIT_FILE_COUNT') message = 'Too many files (Max 20)';
      return res.status(400).json({ status: 'error', message });
    } else if (err) {
      console.error('GENERIC_UPLOAD_ERROR:', err);
      // Detailed error logging for Cloudinary failures
      const errorMsg = err.message || (typeof err === 'string' ? err : 'Unknown failure');
      return res.status(500).json({ 
        status: 'error', 
        message: 'Cloudinary server error: ' + errorMsg,
        details: process.env.NODE_ENV !== 'production' ? err : undefined
      });
    }

    try {
      console.log('FILES_FOUND:', req.files?.length || 0);

      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ status: 'error', message: 'No files were uploaded. Please select images.' });
      }

      const urls = req.files.map(file => file.path || file.secure_url || file.url);
      res.json({
        status: 'success',
        data: urls
      });
    } catch (criticalErr) {
      console.error('CRITICAL_POST_UPLOAD_ERROR:', criticalErr);
      res.status(500).json({ status: 'error', message: 'System error processing uploaded media' });
    }
  });
});

export default router;
