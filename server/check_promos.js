import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import Promotion from './api/models/Promotion.js';

const checkPromos = async () => {
  try {
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/snapadda';
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to:', MONGODB_URI.split('@')[1] || MONGODB_URI);

    const promotions = await Promotion.find({});
    console.log(`Total Promotions in DB: ${promotions.length}`);
    promotions.forEach(p => {
      console.log(`- [${p.type}] ${p.title} (${p.isActive ? 'Active' : 'Inactive'})`);
    });
    
    process.exit(0);
  } catch (err) {
    console.error('CHECK_ERROR:', err);
    process.exit(1);
  }
};

checkPromos();
