import 'dotenv/config';
import mongoose from 'mongoose';
import Property from './api/models/Property.js';

const wipe = async () => {
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
  if (!uri) throw new Error('MONGODB_URI is missing');
  await mongoose.connect(uri);
  await Property.deleteMany({});
  console.log('All properties wiped.');
  process.exit(0);
};
wipe();
