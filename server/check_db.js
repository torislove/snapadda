import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });

const propertySchema = new mongoose.Schema({
  title: String,
  type: String,
  status: String,
  verificationStatus: String,
  createdAt: Date
});

const Property = mongoose.model('Property', propertySchema);

async function checkProperties() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/snapadda';
    console.log('Connecting to:', mongoUri);
    await mongoose.connect(mongoUri);
    
    const count = await Property.countDocuments();
    console.log('Total properties:', count);
    
    const recent = await Property.find().sort({ createdAt: -1 }).limit(5);
    console.log('Recent 5 properties:');
    recent.forEach(p => {
      console.log(`- [${p.status}] [${p.verificationStatus}] ${p.type}: ${p.title} (${p._id})`);
    });
    
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

checkProperties();
