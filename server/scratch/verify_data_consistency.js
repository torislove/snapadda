import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const verifyData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB...");

    const allProperties = await mongoose.connection.db.collection('properties').find({}).toArray();
    console.log(`Total properties in collection: ${allProperties.length}`);

    if (allProperties.length > 0) {
      const stats = {};
      allProperties.forEach(p => {
        const key = `${p.status || 'NoStatus'} | ${p.type || 'NoType'}`;
        stats[key] = (stats[key] || 0) + 1;
      });
      console.log("Property Stats (Status | Type):");
      console.table(stats);
      
      console.log("\nSample Property Names:");
      allProperties.slice(0, 10).forEach(p => console.log(`- ${p.title} (${p._id})`));
    }

    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log("\nCollections in database:");
    collections.forEach(c => console.log(`- ${c.name}`));

    await mongoose.disconnect();
  } catch (err) {
    console.error("Error:", err);
  }
};

verifyData();
