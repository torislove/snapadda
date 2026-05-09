import mongoose from 'mongoose';

const leadSchema = new mongoose.Schema({
  // Core contact info
  name:    { type: String, required: true },
  phone:   { type: String, required: true },
  email:   { type: String, default: '' },
  message: { type: String, default: '' },

  // Property context
  propertyId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Property' },
  propertyCode: { type: String, default: '' },  // e.g. "SNA-A7F2K"
  propertyTitle:{ type: String, default: '' },  // denormalised for fast admin lookup

  // Routing
  district:    { type: String, default: '' },
  franchiseId: { type: String, default: null },
  assignedTo:  { type: String, default: 'Super Admin' },

  // Status pipeline (extended)
  status: {
    type: String,
    enum: ['New', 'Contacted', 'Follow Up', 'Qualified', 'Lost', 'Closed'],
    default: 'New'
  },

  // Lead intelligence
  source: {
    type: String,
    enum: ['Website', 'WhatsApp', 'Phone', 'PropertyCard', 'CallbackRequest', 'Other'],
    default: 'Website'
  },
  priority: {
    type: String,
    enum: ['Normal', 'High', 'Urgent'],
    default: 'Normal'
  },
  followUpFlag: { type: Boolean, default: false },
  followUpDate: { type: Date, default: null },

  // Admin notes thread
  notes: [{
    text:    { type: String, required: true },
    addedBy: { type: String, default: 'Admin' },
    addedAt: { type: Date,   default: Date.now }
  }],

  // Legacy intent profile (AI hook)
  intentProfile: [{
    type:      String,
    payload:   Object,
    timestamp: { type: Date, default: Date.now }
  }],

}, { timestamps: true });

// Index for admin dashboard queries
leadSchema.index({ status: 1, createdAt: -1 });
leadSchema.index({ district: 1 });
leadSchema.index({ franchiseId: 1 });
leadSchema.index({ priority: 1, followUpFlag: 1 });

export default mongoose.model('Lead', leadSchema);
