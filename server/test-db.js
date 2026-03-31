import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

console.log("Connecting to:", process.env.MONGODB_URI?.substring(0, 30) + "...");
mongoose.connect(process.env.MONGODB_URI)
  .then(() => { console.log("✅ Managed to connect!"); process.exit(0); })
  .catch(err => { console.error("❌ Connection failed:", err); process.exit(1); });
