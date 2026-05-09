import mongoose from 'mongoose';

const contactSchema = new mongoose.Schema({
  name:    { type: String, required: true },
  phone:   { type: String, required: true },
  email:   { type: String, default: '' },
  type:    { type: String, enum: ['Realtor', 'Client'], required: true },
  company: { type: String, default: '' },
  location:{ type: String, default: '' },
  district:{ type: String, default: '' },

  // Notes thread (append-only activity log)
  notes: [{
    text:    { type: String, required: true },
    addedBy: { type: String, default: 'Admin' },
    addedAt: { type: Date,   default: Date.now }
  }],

  isStarred: { type: Boolean, default: false },
  tags:      { type: [String], default: [] },
  source:    { type: String, enum: ['Manual', 'Excel', 'Website'], default: 'Manual' },

  // Realtor-specific fields
  realtorCode:       { type: String, default: '' },  // custom agent ID / RERA
  licenseNo:         { type: String, default: '' },  // RERA Agent License
  photo:             { type: String, default: '' },  // Cloudinary profile photo URL
  propertyCount:     { type: Number, default: 0 },   // properties linked via CRM

  // Engagement tracking
  whatsappSent: {
    count:    { type: Number, default: 0 },
    lastSent: { type: Date }
  },
  lastContactedAt: { type: Date },

  // Property interests (for clients)
  propertyInterests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Property' }],

  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

contactSchema.index({ name: 'text', phone: 'text', company: 'text' });
contactSchema.index({ isStarred: 1 });
contactSchema.index({ type: 1 });
contactSchema.index({ district: 1 });

export default mongoose.model('Contact', contactSchema);
