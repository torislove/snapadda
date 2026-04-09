import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config({ path: './server/.env' });

const verify = async () => {
  console.log('--- DB_VERIFICATION_LOG ---');
  console.log('Attempting to connect to:', process.env.MONGODB_URI?.split('@')[1] || 'Unknown');
  
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connection Successful!');
    
    // Check Properties
    const PropertySchema = new mongoose.Schema({ title: String }, { strict: false });
    const Property = mongoose.model('Property', PropertySchema);
    
    const count = await Property.countDocuments();
    console.log(`📊 Property Count: ${count}`);
    
    if (count > 0) {
      const ps = await Property.find();
      ps.forEach(p => {
        console.log(`- [${p.isVerified ? 'VERIFIED' : 'UNVERIFIED'}] [Status: ${p.status || 'Active'}] ${p.title} (${p.type} for ${p.purpose || p.intent})`);
      });
    } else {
      console.log('⚠️ WARNING: No properties found in this database!');
    }

    // Check Cities
    const CitySchema = new mongoose.Schema({ name: String }, { strict: false });
    const City = mongoose.model('City', CitySchema);
    const cityCount = await City.countDocuments();
    console.log(`🌆 City Count: ${cityCount}`);

    process.exit(0);
  } catch (err) {
    console.error('❌ DB_CONNECTION_ERROR:', err.message);
    process.exit(1);
  }
};

verify();
