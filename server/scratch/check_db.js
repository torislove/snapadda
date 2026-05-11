import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../../server/.env') });

const PropertySchema = new mongoose.Schema({}, { strict: false });
const Property = mongoose.model('Property', PropertySchema);

async function checkProperties() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    const count = await Property.countDocuments();
    console.log(`Total properties: ${count}`);
    
    const sample = await Property.find().limit(5);
    console.log('Sample properties:', JSON.stringify(sample, null, 2));
    
    await mongoose.disconnect();
  } catch (err) {
    console.error('Error:', err);
  }
}

checkProperties();
