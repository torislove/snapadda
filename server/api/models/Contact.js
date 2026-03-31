import mongoose from 'mongoose';

const contactSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, default: '' },
  type: { type: String, enum: ['Realtor', 'Client'], required: true },
  company: { type: String, default: '' },
  location: { type: String, default: '' },
  district: { type: String, default: '' },
  notes: { type: String, default: '' },
  isStarred: { type: Boolean, default: false },
  tags: { type: [String], default: [] },
  propertyInterests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Property' }],
  source: { type: String, enum: ['Manual', 'Excel', 'Website'], default: 'Manual' },
  whatsappSent: {
    count: { type: Number, default: 0 },
    lastSent: { type: Date }
  },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

// Index for fast searches
contactSchema.index({ name: 'text', phone: 'text', company: 'text' });
contactSchema.index({ isStarred: 1 });
contactSchema.index({ type: 1 });

export default mongoose.model('Contact', contactSchema);
