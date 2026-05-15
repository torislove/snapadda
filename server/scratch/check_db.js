import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const uri = process.env.MONGODB_URI;
console.log('Connecting to:', uri ? uri.split('@')[1] : 'UNDEFINED');

if (!uri) {
  console.error('FAILURE: MONGODB_URI is not defined in .env');
  process.exit(1);
}

mongoose.connect(uri)
  .then(() => {
    console.log('SUCCESS: Connected to MongoDB');
    process.exit(0);
  })
  .catch(err => {
    console.error('FAILURE: Could not connect to MongoDB:', err);
    process.exit(1);
  });
