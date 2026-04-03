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
  params: {
    folder: 'snapadda/properties',
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp', 'mp4'],
    resource_type: 'auto'
  }
});

const upload = multer({ storage: storage });

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
router.post('/upload', upload.array('files', 10), (req, res) => {
  try {
    console.log('UPLOAD_REQUEST_RECEIVED:', req.files?.length || 0, 'files');
    
    if (!req.files || req.files.length === 0) {
      console.warn('UPLOAD_WARNING: No files present in request');
      return res.status(400).json({ status: 'error', message: 'No files uploaded' });
    }
    
    const urls = req.files.map(file => file.path || file.secure_url || file.url);
    console.log('MEDIA_UPLOAD_SUCCESS:', urls.length, 'files');
    res.json({
      status: 'success',
      data: urls
    });
  } catch (error) {
    console.error('MEDIA_UPLOAD_ERROR_DETAILS:', {
      message: error.message,
      code: error.http_code,
      details: error.name
    });
    res.status(500).json({ status: 'error', message: error.message || 'Upload process failed' });
  }
});

export default router;
