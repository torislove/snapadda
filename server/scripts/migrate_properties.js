/**
 * Migration script for SnapAdda Property Categories
 * Maps old categories to new 'Elite Local' standards.
 */
import mongoose from 'mongoose';
import Property from '../api/models/Property.js';
import dotenv from 'dotenv';
dotenv.config();

const MIGRATION_MAP = {
  'Plot': 'Residential Plot',
  'House': 'Independent House',
  'Agriculture': 'Agricultural Land',
  'Commercial': 'Commercial Space'
};

async function migrate() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to Database for Migration...');

    const properties = await Property.find();
    let count = 0;

    for (const prop of properties) {
      let changed = false;
      
      // Update Purpose if missing
      if (!prop.purpose) {
        prop.purpose = 'Sale';
        changed = true;
      }

      // Update Type based on map
      if (MIGRATION_MAP[prop.type]) {
        console.log(`Migrating ${prop.title}: ${prop.type} -> ${MIGRATION_MAP[prop.type]}`);
        prop.type = MIGRATION_MAP[prop.type];
        changed = true;
      }

      // Ensure measurement unit defaults for types
      if (prop.type === 'Agricultural Land' && prop.measurementUnit === 'Sq.Ft') {
        prop.measurementUnit = 'Acres';
        changed = true;
      }

      if (changed) {
        await prop.save();
        count++;
      }
    }

    console.log(`Migration Complete. ${count} properties updated.`);
    process.exit(0);
  } catch (error) {
    console.error('Migration Failed:', error);
    process.exit(1);
  }
}

migrate();
