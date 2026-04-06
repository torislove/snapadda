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
router.post('/upload', (req, res) => {
  console.log('--- MEDIA UPLOAD REQUEST INCOMING ---');
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
      console.log('--- PROCESSING UPLOADED FILES ---');
      console.log('FILES_FOUND:', req.files?.length || 0);

      if (!req.files || req.files.length === 0) {
        console.error('UPLOAD_ERROR: No files in request body');
        return res.status(400).json({ status: 'error', message: 'No files were uploaded. Please select images.' });
      }

      const urls = req.files.map(file => {
        // Cloudinary storage usually puts the URL in 'path' or 'secure_url'
        const url = file.path || file.secure_url || file.url;
        console.log('FILE_PROCESSED:', file.originalname, '->', url);
        return url;
      });

      console.log('UPLOAD_SUCCESS:', urls.length, 'assets uploaded to Cloudinary');
      console.log('--- MEDIA UPLOAD END ---');

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
