import mongoose from 'mongoose';

const propertySchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  price: { type: Number, default: 0 },
  priceDisplay: { type: String, default: '' }, // "₹ 85,00,000" or "₹ 1.2 Crore"
  pricePerUnit: { type: Number, default: 0 }, // For agriculture — price per acre/cent
  pricePerAcre: { type: Number, default: 0 },
  totalAcres: { type: Number, default: 0 },
  location: { type: String, default: '' },
  address: { type: String, default: '' },
  district: { type: String, default: '' }, // AP district
  cityId: { type: mongoose.Schema.Types.ObjectId, ref: 'City' },
  googleMapsLink: { type: String, default: '' },
  
  type: { 
    type: String, 
    default: 'Apartment'
  },
  purpose: {
    type: String,
    default: 'Sale',
  },
  subType: { type: String, default: '' }, // e.g., "Gated Community", "Open Plot"
  condition: { type: String, enum: ['1st Hand', '2nd Hand', 'Ready to Move', 'Under Construction', 'N/A'], default: 'N/A' },
  
  // Andhra Specific
  facing: { type: String, default: 'Any' },
  approvalAuthority: { type: String, default: 'N/A' },
  measurementUnit: { type: String, default: 'SqFt' },
  areaSize: { type: Number, default: 0 },
  
  beds: { type: Number, default: 0 },
  baths: { type: Number, default: 0 },
  amenities: [{ type: String }],
  bhk: { type: Number, default: 0 }, // 1, 2, 3, 4+ BHK
  furnishing: { type: String, enum: ['Furnished', 'Semi-Furnished', 'Unfurnished', 'N/A'], default: 'N/A' },
  constructionStatus: { type: String, enum: ['Ready to Move', 'Under Construction', 'New Launch', 'N/A'], default: 'N/A' },
  
  // Advanced Spatial & Structural
  carpetArea: { type: Number, default: 0 },
  superBuiltupArea: { type: Number, default: 0 },
  totalFloors: { type: Number, default: 0 },
  floorNo: { type: Number, default: 0 },
  propertyAge: { type: String, enum: ['0-1 yrs', '1-5 yrs', '5-10 yrs', '10+ yrs', 'N/A'], default: 'N/A' },
  transactionType: { type: String, enum: ['New Property', 'Resale', 'N/A'], default: 'N/A' },
  
  // Utilities & Legal
  parking: { type: String, enum: ['1 Covered', '2 Covered', '1 Open', '2 Open', 'None', 'N/A'], default: 'N/A' },
  waterSupply: { type: String, enum: ['24 Hours Available', 'Municipal', 'Borewell', 'N/A'], default: 'N/A' },
  electricityStatus: { type: String, enum: ['No/Rare Powercut', 'Frequent Powercut', 'N/A'], default: 'N/A' },
  ownershipType: { type: String, enum: ['Freehold', 'Leasehold', 'Co-operative Society', 'Power of Attorney', 'N/A'], default: 'N/A' },
  vastuCompliant: { type: Boolean, default: false },
  reraId: { type: String, default: '' },
  
  // Specifics
  cornerProperty: { type: Boolean, default: false },
  boundaryWall: { type: Boolean, default: false }, // Useful for plots
  overlooking: { type: String, enum: ['Park/Garden', 'Main Road', 'Club', 'Pool', 'N/A'], default: 'N/A' },
  
  images: [{ type: String }],
  videos: [{ type: String }],
  videoUrl: { type: String }, // Primary walkthrough video
  
  status: { type: String, enum: ['Active', 'Pending', 'Sold', 'Rented'], default: 'Active' },
  isVerified: { type: Boolean, default: false },
  isFeatured: { type: Boolean, default: false },
  franchiseId: { type: String, default: null },
  
  listerType: { type: String, default: 'Individual Owner' },
  customFeatures: [{
    label: String,
    value: String
  }],
  
  // Engagement Tracking
  shareCount: { type: Number, default: 0 },
  shareLogs: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    platform: String,
    timestamp: { type: Date, default: Date.now }
  }],
  likeCount: { type: Number, default: 0 },
  likeLogs: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    timestamp: { type: Date, default: Date.now }
  }],

  createdAt: { type: Date, default: Date.now }
});

// Text search index
propertySchema.index({ title: 'text', location: 'text', district: 'text' });

export default mongoose.model('Property', propertySchema);
