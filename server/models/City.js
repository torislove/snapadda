import mongoose from 'mongoose';

const citySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true }, // e.g., Amaravati, Guntur
  description: String,
  image: String, // Cloudinary URL
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('City', citySchema);
