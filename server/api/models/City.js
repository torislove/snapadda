import mongoose from 'mongoose';

const citySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  image: String,
  emoji: { type: String, default: '🏙️' },
  color: { type: String, default: '#c9a84c' },
  tagline: String,
  description: String,
  propertyCount: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('City', citySchema);
