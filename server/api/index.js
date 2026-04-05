import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { v2 as cloudinary } from 'cloudinary';
import { onRequest } from "firebase-functions/v2/https";

// 1. API Route Imports
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

dotenv.config();

// Critical Environment Check (Diagnostics for Cloud)
console.log('--- PRODUCTION_ENV_DIAGNOSTICS ---');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('MONGODB_URI_PROVIDED:', !!process.env.MONGODB_URI);
console.log('CLOUDINARY_NAME_PROVIDED:', !!process.env.CLOUDINARY_CLOUD_NAME);
console.log('----------------------------------');

const app = express();

// 2. Global Security & Optimization Middleware
app.use(helmet({ contentSecurityPolicy: false }));
app.use(compression());
app.use(cors({
  origin: '*', 
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true
}));

// 3. Specialized Media Stream Route (Must be before general body-parsers)
app.use('/api/media', mediaRoutes);

// 4. Standard Body Parsers (For JSON & Forms)
app.use(express.json({ limit: '30mb' }));
app.use(express.urlencoded({ extended: true, limit: '30mb' }));

// 5. Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100,
  message: { status: 'error', message: 'Too many requests, please try again later.' }
});
app.use('/api/', limiter);

// 6. DB Connection Middleware (Lazy Connection for Functions)
let isConnected = false;
const connectDB = async () => {
  if (isConnected) return;
  const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/snapadda';
  try {
    await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
    isConnected = true;
    console.log('MongoDB connection established');
  } catch (err) {
    console.error('CRITICAL: MongoDB connection error:', err.message);
  }
};

app.use(async (req, res, next) => {
  await connectDB();
  next();
});

// 7. Core Application Routes
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
app.use('/api/promotions', promotionRoutes);
app.use('/api/testimonials', testimonialRoutes);
app.use('/api/questions', questionRoutes);

// 8. Health & Diagnostic Routes
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'success', message: 'Root health check' });
});

app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'success', 
    message: 'SnapAdda Master API is now consolidated',
    time: new Date().toISOString()
  });
});

app.get('/api/media-health', (req, res) => {
  res.status(200).json({ 
    status: 'success', 
    message: 'Media check reached',
    cloudinary: { name: !!process.env.CLOUDINARY_CLOUD_NAME, key: !!process.env.CLOUDINARY_API_KEY }
  });
});

// 9. Error & 404 Management
app.use((err, req, res, next) => {
  console.error('SERVER_ERROR:', err.stack);
  res.status(err.status || 500).json({
    status: 'error',
    message: process.env.NODE_ENV === 'production' ? 'An internal server error occurred' : err.message
  });
});

app.use((req, res) => {
  res.status(404).json({ status: 'error', message: `Cannot ${req.method} ${req.originalUrl}` });
});

// 10. Export for Firebase Functions
export const api = onRequest({ cors: true }, app);

// Local Development Fallback
if (process.env.npm_lifecycle_event === 'start' || process.env.LOCAL_DEV === 'true') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`🚀 Server fully running locally on port ${PORT}`));
}
