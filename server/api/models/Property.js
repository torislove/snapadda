import mongoose from 'mongoose';

const propertySchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  price: { type: Number, required: true },
  priceDisplay: { type: String }, // "₹ 85,00,000" or "₹ 1.2 Crore"
  pricePerUnit: { type: Number }, // For agriculture — price per acre/cent
  location: { type: String, required: true },
  district: { type: String, default: '' }, // AP district
  cityId: { type: mongoose.Schema.Types.ObjectId, ref: 'City' },
  
  type: { 
    type: String, 
    enum: ['Agriculture', 'Flat', 'Apartment', 'Villa', 'Plot', 'House', 'Commercial', 'Farmhouse'], 
    required: true 
  },
  subType: { type: String, default: '' }, // e.g., "Open Plot", "Gated Community", "Independent House"
  condition: { type: String, enum: ['1st Hand', '2nd Hand', 'Ready to Move', 'Under Construction', 'N/A'], default: 'N/A' },
  
  // Andhra Specific
  facing: { type: String, enum: ['East', 'West', 'North', 'South', 'North-East', 'North-West', 'South-East', 'South-West', 'Any'], default: 'Any' },
  approvalAuthority: { type: String, enum: ['AP CRDA', 'AP RERA', 'VMRDA', 'DTCP', 'Panchayat', 'Municipal', 'Pending', 'N/A'], default: 'N/A' },
  measurementUnit: { type: String, enum: ['SqFt', 'SqYards', 'Cents', 'Acres', 'Guntas'], required: true, default: 'SqFt' },
  areaSize: { type: Number, required: true },
  
  beds: { type: Number, default: 0 },
  baths: { type: Number, default: 0 },
  amenities: [{ type: String }],
  bhk: { type: Number, default: 0 }, // 1, 2, 3, 4+ BHK
  furnishing: { type: String, enum: ['Furnished', 'Semi-Furnished', 'Unfurnished', 'N/A'], default: 'N/A' },
  constructionStatus: { type: String, enum: ['Ready to Move', 'Under Construction', 'New Launch', 'N/A'], default: 'N/A' },
  
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
