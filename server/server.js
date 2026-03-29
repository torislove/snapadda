import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { v2 as cloudinary } from 'cloudinary';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Cloudinary Configuration
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET 
});

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/snapadda';
mongoose.connect(MONGODB_URI)
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => console.error('MongoDB connection error:', err));

// Basic Routes
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'success', message: 'SnapAdda API is running' });
});

import propertyRoutes from './routes/propertyRoutes.js';
import settingRoutes from './routes/settingRoutes.js';
import userRoutes from './routes/userRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import inquiryRoutes from './routes/inquiryRoutes.js';
import adminStatsRoute from './routes/adminStatsRoute.js';
import contactRoutes from './routes/contactRoutes.js';
import franchiseRoutes from './routes/franchiseRoutes.js';
import districtRoutes from './routes/districtRoutes.js';

app.use('/api/properties', propertyRoutes);
app.use('/api/settings', settingRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/admin', adminStatsRoute);
app.use('/api/inquiries', inquiryRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/franchise', franchiseRoutes);
app.use('/api/districts', districtRoutes);

import { onRequest } from "firebase-functions/v2/https";

const PORT = process.env.PORT || 5000;

// Export for Firebase Functions
export const api = onRequest({ region: "us-central1", memory: "256MiB" }, app);

// Standard listener for local development
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}
