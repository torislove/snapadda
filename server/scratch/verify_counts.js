import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const verifyUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB...");

    const userCount = await mongoose.connection.db.collection('users').countDocuments();
    console.log(`Total users: ${userCount}`);

    const adminCount = await mongoose.connection.db.collection('admins').countDocuments();
    console.log(`Total admins: ${adminCount}`);

    const cityCount = await mongoose.connection.db.collection('cities').countDocuments();
    console.log(`Total cities: ${cityCount}`);

    await mongoose.disconnect();
  } catch (err) {
    console.error("Error:", err);
  }
};

verifyUsers();
