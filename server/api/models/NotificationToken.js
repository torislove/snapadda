import mongoose from 'mongoose';

const NotificationTokenSchema = new mongoose.Schema({
  token: {
    type: String,
    required: true,
    unique: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  deviceInfo: {
    type: String,
    default: 'unknown'
  },
  lastUsed: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

export default mongoose.model('NotificationToken', NotificationTokenSchema);
