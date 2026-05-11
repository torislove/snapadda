import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const userSchema = new mongoose.Schema({
  email: String,
  role: String,
  name: String
});

const User = mongoose.model('User', userSchema);

async function checkAdmins() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const admins = await User.find({ role: 'admin' });
    console.log(`Total admins found in User collection: ${admins.length}`);
    admins.forEach(a => console.log(`- ${a.email} (${a.name})`));
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkAdmins();
