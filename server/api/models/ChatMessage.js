import mongoose from 'mongoose';

const chatMessageSchema = new mongoose.Schema({
  number: {
    type: String,
    required: true,
    index: true
  },
  body: {
    type: String,
    required: true
  },
  fromMe: {
    type: Boolean,
    default: false
  },
  senderName: {
    type: String
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['sent', 'delivered', 'read'],
    default: 'sent'
  }
}, { timestamps: true });

// Ensure we pick up the number in a consistent format for querying
chatMessageSchema.pre('save', function(next) {
  if (this.number) {
    this.number = this.number.replace(/\D/g, '');
  }
  next();
});

export default mongoose.model('ChatMessage', chatMessageSchema);
