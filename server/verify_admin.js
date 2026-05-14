import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
dotenv.config();

import User from './api/models/User.js';

const verifyAdmin = async () => {
  try {
    const MONGODB_URI = process.env.MONGODB_URI;
    await mongoose.connect(MONGODB_URI);
    
    const admin = await User.findOne({ email: 'admin@snapadda.com' });
    if (!admin) {
      console.log('Admin NOT found!');
    } else {
      const isMatch = await bcrypt.compare('Snapadda@587487', admin.password);
      console.log(`Admin found. Password match: ${isMatch}`);
    }
    
    process.exit(0);
  } catch (err) {
    console.error('VERIFY_ERROR:', err);
    process.exit(1);
  }
};

verifyAdmin();
