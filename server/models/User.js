import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  googleId: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String, // Only required for Admin auth via DB
    required: false
  },
  name: {
    type: String,
    required: true
  },
  avatar: {
    type: String,
    default: ''
  },
  role: {
    type: String,
    enum: ['client', 'admin'],
    default: 'client'
  },
  onboardingCompleted: {
    type: Boolean,
    default: false
  },
  preferences: {
    propertyType: {
      type: String,
      default: '' // e.g. "Apartment", "Villa", "Agriculture", "Any"
    },
    budget: {
      type: String,
      default: '' // e.g. "50L - 1Cr", "1Cr - 5Cr"
    },
    locations: {
      type: [String],
      default: [] // e.g. ["Amaravati", "Guntur"]
    },
    purpose: {
      type: String,
      enum: ['Investment', 'Personal Use', 'Agriculture', ''],
      default: ''
    },
    additionalNotes: {
      type: String,
      default: ''
    }
  },
  favorites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property'
  }]
}, { timestamps: true });

export default mongoose.model('User', userSchema);
