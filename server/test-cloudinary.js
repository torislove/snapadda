import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

console.log('Testing Cloudinary Connection...');
cloudinary.api.ping()
  .then(res => {
    console.log('SUCCESS: Cloudinary is reachable and credentials are valid.');
    console.log(res);
    process.exit(0);
  })
  .catch(err => {
    console.error('FAILURE: Cloudinary connection failed.');
    console.error(err);
    process.exit(1);
  });
