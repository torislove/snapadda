import mongoose from 'mongoose';

const leadSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  email: String,
  propertyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Property' },
  message: String,
  status: { type: String, enum: ['New', 'Contacted', 'Qualified', 'Lost', 'Closed'], default: 'New' },
  franchiseId: { type: String, default: null }
}, {
  timestamps: true
});

export default mongoose.model('Lead', leadSchema);
