import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { v2 as cloudinary } from 'cloudinary';
import { onRequest } from "firebase-functions/v2/https";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// 1. Basic Health Check (Must be at the TOP (to respond even if DB is still connecting))
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'success', 
    message: 'SnapAdda Master API is now consolidated (Vercel Hobby Fix)',
    time: new Date().toISOString()
  });
});

// Cloudinary Configuration
const cloud_name = process.env.CLOUDINARY_CLOUD_NAME;
const api_key = process.env.CLOUDINARY_API_KEY;
const api_secret = process.env.CLOUDINARY_API_SECRET;

if (cloud_name && api_key && api_secret) {
  cloudinary.config({ cloud_name, api_key, api_secret });
}

// 2. MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/snapadda';
mongoose.connect(MONGODB_URI, {
  serverSelectionTimeoutMS: 5000,
})
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('CRITICAL: MongoDB connection error:', err.message));

// 3. API Routes (Restored relative paths, no internal movements)
import propertyRoutes from './routes/propertyRoutes.js';
import settingRoutes from './routes/settingRoutes.js';
import seoRoutes from './routes/seoRoutes.js';
import userRoutes from './routes/userRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import inquiryRoutes from './routes/inquiryRoutes.js';
import leadRoutes from './routes/leadRoutes.js';
import adminStatsRoute from './routes/adminStatsRoute.js';
import contactRoutes from './routes/contactRoutes.js';
import districtRoutes from './routes/districtRoutes.js';
import mediaRoutes from './routes/mediaRoutes.js';
import promotionRoutes from './routes/promotionRoutes.js';
import testimonialRoutes from './routes/testimonialRoutes.js';

app.use('/api/properties', propertyRoutes);
app.use('/api/settings', settingRoutes);
app.use('/api/seo', seoRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/admin', adminStatsRoute);
app.use('/api/inquiries', inquiryRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/districts', districtRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/promotions', promotionRoutes);
app.use('/api/testimonials', testimonialRoutes);

// Export for Firebase Functions
export const api = onRequest({ cors: true }, app);

// Local Development Fallback
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server fully running locally on port ${PORT}`);
});
