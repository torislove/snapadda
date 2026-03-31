import mongoose from 'mongoose';

const testimonialSchema = new mongoose.Schema({
  name: { type: String, required: true },
  location: String,
  text: { type: String, required: true },
  rating: { type: Number, default: 5 },
  image: String,
  color: { type: String, default: '#6b4226' },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Testimonial', testimonialSchema);
