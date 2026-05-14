import 'dotenv/config';
import mongoose from 'mongoose';
import Property from './api/models/Property.js';

const addSample = async () => {
  const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGO_URI is missing');
  await mongoose.connect(uri);
  const p = new Property({
    title: 'Elite Test Asset - Amaravati',
    price: 5000000,
    priceDisplay: '50 Lakhs',
    location: 'Amaravati',
    district: 'Guntur',
    type: 'Plot',
    purpose: 'Sale',
    status: 'Available',
    isVerified: true,
    isFeatured: true,
    images: ['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1200&auto=format&fit=crop'],
    areaSize: 200,
    measurementUnit: 'Sq.Yards',
    facing: 'East',
    propertyCode: 'SNA-TEST-1'
  });
  await p.save();
  console.log('Sample property added:', p._id);
  process.exit(0);
};
addSample();
