import mongoose from 'mongoose';

const promotionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['festival', 'ad', 'update', 'institutional', 'offer'],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  subtitle: {
    type: String,
    default: ''
  },
  actionText: {
    type: String,
    default: ''
  },
  actionUrl: {
    type: String,
    default: ''
  },
  image: {
    type: String,
    default: ''
  },
  countdownActive: {
    type: Boolean,
    default: false
  },
  size: {
    type: String,
    enum: ['1x1', '2x1', '2x2'],
    default: '1x1'
  },
  displayOrder: {
    type: Number,
    default: 0
  },
  cardColor: {
    type: String,
    default: 'glass-dark'
  },
  priority: {
    type: Number,
    default: 0
  },
  targetLocation: {
    type: String,
    default: 'All'
  },
  startDate: {
    type: Date
  },
  endDate: {
    type: Date
  },
  isActive: {
    type: Boolean,
    default: true
  },
  displaySegment: {
    type: String,
    enum: ['hero', 'floating', 'both'],
    default: 'both'
  },
  linkedPropertyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property',
    default: null
  },
  clickUrl: {
    type: String,
    default: ''
  },
  stats: {
    views: { type: Number, default: 0 },
    clicks: { type: Number, default: 0 }
  },
  mediaSettings: [{
    url: { type: String },
    objectFit: { type: String, enum: ['cover', 'contain'], default: 'cover' }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('Promotion', promotionSchema);
