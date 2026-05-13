import mongoose from 'mongoose';
import Property from './api/models/Property.js';
import dotenv from 'dotenv';
dotenv.config();

const MONGODB_URI = 'mongodb+srv://manojkadiyala8_db_user:Manoj587487@cluster0.fjxb0my.mongodb.net/snapadda?retryWrites=true&w=majority&appName=Cluster0';

async function check() {
  try {
    await mongoose.connect(MONGODB_URI);
    const props = await Property.find({}, 'title googleMapsLink location coordinates district');
    console.log(JSON.stringify(props, null, 2));
  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
  }
}

check();
