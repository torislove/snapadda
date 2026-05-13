import mongoose from 'mongoose';
import Property from '../api/models/Property.js';
import { extractCoordsFromLink } from '../api/utils/geoUtils.js';
import dotenv from 'dotenv';
dotenv.config();

const MONGODB_URI = 'mongodb+srv://manojkadiyala8_db_user:Manoj587487@cluster0.fjxb0my.mongodb.net/snapadda?retryWrites=true&w=majority&appName=Cluster0';

async function migrate() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected.');

    const properties = await Property.find({ 
      googleMapsLink: { $exists: true, $ne: '' }
    });

    console.log(`Found ${properties.length} properties with map links.`);

    let updatedCount = 0;
    for (const prop of properties) {
      if (prop.googleMapsLink) {
        const coords = extractCoordsFromLink(prop.googleMapsLink);
        if (coords) {
          console.log(`Updating coords for: ${prop.title} -> ${coords.lat}, ${coords.lng}`);
          prop.coordinates = coords;
          await prop.save();
          updatedCount++;
        } else {
          console.log(`Could not extract coords for: ${prop.title} (Link: ${prop.googleMapsLink})`);
        }
      }
    }

    console.log(`Migration complete. Updated ${updatedCount} properties.`);
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

migrate();
