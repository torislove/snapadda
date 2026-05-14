import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import Promotion from './api/models/Promotion.js';
import { db } from './api/firebase.js';

const syncPromos = async () => {
  try {
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/snapadda';
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB for sync...');

    const promotions = await Promotion.find({ isActive: true }).sort({ displayOrder: 1, createdAt: -1 });
    console.log(`Found ${promotions.length} active promotions to sync.`);

    if (!db) {
       console.error('Firebase DB not initialized. Check server/api/firebase.js');
       process.exit(1);
    }

    const ref = db.ref('promotions');
    const syncMap = {};
    promotions.forEach((p, index) => {
       const id = p._id.toString();
       syncMap[id] = {
         id,
         type: p.type || 'ad',
         title: p.title || '',
         subtitle: p.subtitle || '',
         image: p.image || '',
         actionText: p.actionText || '',
         actionUrl: p.actionUrl || '',
         cardColor: p.cardColor || 'dark',
         countdownActive: !!p.countdownActive,
         expiryDate: p.endDate || null,
         isActive: true,
         displayOrder: index,
         updatedAt: new Date().toISOString()
       };
    });
    
    await ref.set(syncMap);
    console.log('Successfully synced all promotions to Firebase.');
    process.exit(0);
  } catch (err) {
    console.error('SYNC_ERROR:', err);
    process.exit(1);
  }
};

syncPromos();
