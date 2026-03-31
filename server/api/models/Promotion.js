import mongoose from 'mongoose';

const promotionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['festival', 'ad', 'update'],
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
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('Promotion', promotionSchema);
