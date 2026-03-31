import mongoose from 'mongoose';

const franchiseAdminSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String, default: '' },
  regions: { type: [String], default: [] }, // Multiple districts/cities
  permissions: {
    type: [String],
    default: ['properties', 'contacts'],
    enum: ['properties', 'contacts', 'leads', 'inquiries', 'settings']
  },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.model('FranchiseAdmin', franchiseAdminSchema);
