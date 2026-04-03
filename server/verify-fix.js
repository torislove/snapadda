import router from './api/routes/mediaRoutes.js';
import { v2 as cloudinary } from 'cloudinary';

console.log('--- Media Routes Verification ---');
const config = cloudinary.config();
console.log('Cloudinary Cloud Name:', config.cloud_name);

if (config.cloud_name) {
  console.log('SUCCESS: Cloudinary is configured upon import of mediaRoutes');
} else {
  console.log('FAILURE: Cloudinary is NOT configured upon import');
  process.exit(1);
}
