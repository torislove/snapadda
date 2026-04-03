import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

console.log('Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME);
console.log('API Key:', process.env.CLOUDINARY_API_KEY ? 'Present' : 'Missing');
console.log('API Secret:', process.env.CLOUDINARY_API_SECRET ? 'Present' : 'Missing');

async function testConnection() {
  try {
    const result = await cloudinary.api.ping();
    console.log('Cloudinary Ping Result:', result);
  } catch (error) {
    console.error('Cloudinary Ping Error:', error);
  }
}

testConnection();
