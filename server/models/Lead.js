import mongoose from 'mongoose';

const leadSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  email: String,
  propertyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Property' },
  message: String,
  status: { type: String, enum: ['New', 'Contacted', 'Qualified', 'Lost'], default: 'New' },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Lead', leadSchema);
