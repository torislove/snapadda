import mongoose from 'mongoose';

const propertySchema = new mongoose.Schema({
  title: { type: String, default: '' },
  description: String,
  price: { type: Number, default: 0 },
  location: { type: String, default: '' },
  address: { type: String, default: '' },
  district: { type: String, default: '' }, // AP district
  mandal: { type: String, default: '' },
  village: { type: String, default: '' },
  pincode: { type: String, default: '' },
  state: { type: String, default: 'Andhra Pradesh' },
  cityId: { type: mongoose.Schema.Types.ObjectId, ref: 'City' },

  googleMapsLink: { type: String, default: '' },
  coordinates: {
    lat: Number,
    lng: Number
  },
  
  type: { 
    type: String, 
    default: 'Apartment'
  },
  purpose: {
    type: String,
    default: 'Sale',
  },
  subType: { type: String, default: '' }, // e.g., "Gated Community", "Open Plot"
  condition: { type: String, default: 'N/A' },
  
  // Andhra Specific
  facing: { type: String, default: 'Any' },
  approvalAuthority: { type: String, default: 'N/A' },
  measurementUnit: { type: String, default: 'SqFt' },
  areaSize: { type: Number, default: 0 },
  surveyNo: { type: String, default: '' },       // Survey number for agri/plot land
  roadType: { type: String, default: 'N/A' },    // e.g., "Tar Road", "CC Road"
  roadWidth: { type: Number, default: 0 },       // Road width in feet
  
  beds: { type: Number, default: 0 },
  baths: { type: Number, default: 0 },
  amenities: [{ type: String }],
  bhk: { type: Number, default: 0 }, 
  furnishing: { type: String, default: 'N/A' },
  constructionStatus: { type: String, default: 'N/A' },
  
  // Advanced Spatial & Structural
  totalFloors: { type: Number, default: 0 },
  floorNo: { type: Number, default: 0 },
  propertyAge: { type: String, default: 'N/A' },
  transactionType: { type: String, default: 'N/A' },
  
  // Utilities & Legal
  parking: { type: String, default: 'N/A' },
  waterSupply: { type: String, default: 'N/A' },
  electricityStatus: { type: String, default: 'N/A' },
  ownershipType: { type: String, default: 'N/A' },
  vastuCompliant: { type: Boolean, default: false },
  reraId: { type: String, default: '' },
  
  // Specifics
  cornerProperty: { type: Boolean, default: false },
  boundaryWall: { type: Boolean, default: false }, 
  overlooking: { type: String, default: 'N/A' },
  powerKVA: { type: Number, default: 0 },
  
  image: { type: String, default: '' },
  images: [{ type: String }],
  gallery: [{ type: String }],   // extra gallery images
  videos: [{ type: String }],
  videoUrl: { type: String }, 
  
  status: { type: String, default: 'Active' },
  verificationStatus: { type: String, default: 'Draft' },
  isVerified: { type: Boolean, default: false },
  isFeatured: { type: Boolean, default: false },
  propertyCode: { type: String, unique: true, sparse: true, default: '' },
  franchiseId: { type: String, default: null },
  
  listerType: { type: String, default: 'Individual Owner' },

  // Realtor / Source Agent (who submitted this property to SnapAdda)
  realtor: {
    name:      { type: String, default: '' },
    phone:     { type: String, default: '' },
    email:     { type: String, default: '' },
    agency:    { type: String, default: '' },   // Company / Firm name
    photo:     { type: String, default: '' },   // Cloudinary avatar URL
    licenseNo: { type: String, default: '' },   // RERA License / Agent ID
    contactId: { type: String, default: '' },   // CRM Contact._id (optional link)
  },

  customFeatures: [{
    label: String,
    value: String
  }],
  
  // Analytics
  viewCount: { type: Number, default: 0 },       // Server-side view tracking

  // Engagement Tracking
  shareCount: { type: Number, default: 0 },
  shareLogs: [{
    userId: { type: String }, // String to support both ObjectId & Google UID
    platform: String,
    timestamp: { type: Date, default: Date.now }
  }],
  likeCount: { type: Number, default: 0 },
  likeLogs: [{
    userId: { type: String },                    // String to support both ObjectId & Google UID
    timestamp: { type: Date, default: Date.now }
  }],

  createdAt: { type: Date, default: Date.now },

  // Tracking for client-submitted properties
  submittedBy: { type: String, default: null }, // Stores userId (MongoDB _id or Google UID)
}, { timestamps: true });

// Auto-generate SNA property code and calculate unit prices before first save
propertySchema.pre('save', function(next) {
  if (!this.propertyCode && this._id) {
    this.propertyCode = 'SNA-' + this._id.toString().slice(-5).toUpperCase();
  }
  next();
});

// Performance Indexes - Aggressive Compound Indexing for Real Estate Filters
propertySchema.index({ status: 1, createdAt: -1 });
propertySchema.index({ status: 1, type: 1, location: 1, price: 1 }); // Core multi-filter index
propertySchema.index({ price: 1, bhk: 1 }); // Native budget sorting
propertySchema.index({ isVerified: -1, createdAt: -1 });
propertySchema.index({ isFeatured: -1, createdAt: -1 });
propertySchema.index({ district: 1, location: 1, type: 1 }); // Locational filtering
propertySchema.index({ areaSize: 1 }); // Unified Area Index

// Text search index
propertySchema.index({ title: 'text', location: 'text', district: 'text' });

export default mongoose.model('Property', propertySchema);
