import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import Property from '../api/models/Property.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const flagStaleProperties = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Calculate the date 90 days ago
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    console.log(`🔍 Scanning for properties updated before: ${ninetyDaysAgo.toISOString()}`);

    // Find active properties that haven't been updated in 90 days
    const staleProperties = await Property.find({
      status: 'Active',
      updatedAt: { $lt: ninetyDaysAgo }
    });

    console.log(`⚠️ Found ${staleProperties.length} stale properties.`);

    if (staleProperties.length > 0) {
      // Flag them
      const result = await Property.updateMany(
        { _id: { $in: staleProperties.map(p => p._id) } },
        { 
          $set: { 
            status: 'Pending',
            isVerified: false,
            adminNotes: 'Auto-flagged as Stale (>90 days without update). Needs verification.'
          } 
        }
      );

      console.log(`✅ Successfully flagged ${result.modifiedCount} properties.`);
    }

  } catch (error) {
    console.error('❌ Error flagging properties:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  }
};

flagStaleProperties();
