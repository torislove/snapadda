import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import Promotion from './api/models/Promotion.js';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/snapadda';

async function run() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB!');
  const result = await Promotion.updateMany({}, { isActive: true });
  console.log(`Updated ${result.modifiedCount} promotions to isActive: true.`);
  await mongoose.disconnect();
}

run().catch(console.error);
