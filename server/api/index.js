import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { v2 as cloudinary } from 'cloudinary';
import { onRequest } from "firebase-functions/v2/https";

dotenv.config();

const app = express();

// Security & Optimization Middleware
app.use(helmet({
  contentSecurityPolicy: false, // Disable CSP for easier integration with external assets if needed, or configure specifically
}));
app.use(compression()); // Compress all responses
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' })); // Limit body size for security

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: { status: 'error', message: 'Too many requests, please try again later.' }
});
app.use('/api/', limiter);

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('SERVER_ERROR:', err.stack);
  res.status(err.status || 500).json({
    status: 'error',
    message: process.env.NODE_ENV === 'production' 
      ? 'An internal server error occurred' 
      : err.message
  });
});

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

// 2. Optimized MongoDB Connection (Lazy)
let isConnected = false;
const connectDB = async () => {
  if (isConnected) return;
  const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/snapadda';
  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    isConnected = true;
    console.log('MongoDB connection established');
  } catch (err) {
    console.error('CRITICAL: MongoDB connection error:', err.message);
  }
};

// Middleware to ensure DB connection
app.use(async (req, res, next) => {
  await connectDB();
  next();
});

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
import cityRoutes from './routes/cityRoutes.js';
import mediaRoutes from './routes/mediaRoutes.js';
import promotionRoutes from './routes/promotionRoutes.js';
import testimonialRoutes from './routes/testimonialRoutes.js';
import questionRoutes from './routes/questionRoutes.js';

app.use('/api/properties', propertyRoutes);
app.use('/api/cities', cityRoutes);
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
app.use('/api/questions', questionRoutes);

// Export for Firebase Functions
export const api = onRequest({ cors: true }, app);

// Local Development Fallback
// Only run the server if started via 'npm start' or explicitly in local mode
if (process.env.npm_lifecycle_event === 'start' || process.env.LOCAL_DEV === 'true') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`🚀 Server fully running locally on port ${PORT}`);
  });
}
