import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Testimonial from './api/models/Testimonial.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/snapadda';

async function check() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');
    const count = await Testimonial.countDocuments();
    const data = await Testimonial.find().limit(5);
    console.log(`Found ${count} testimonials`);
    console.log('Sample Data:', JSON.stringify(data, null, 2));
    await mongoose.connection.close();
  } catch (error) {
    console.error('Error checking testimonials:', error);
    process.exit(1);
  }
}

check();
