import express from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

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

// POST /api/media/upload
router.post('/upload', upload.array('files', 10), (req, res) => {
  try {
    const urls = req.files.map(file => file.path);
    res.json({
      status: 'success',
      data: urls
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

export default router;
