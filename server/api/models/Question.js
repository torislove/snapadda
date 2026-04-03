import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  propertyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Optional for guests, required for tracker
  authType: { type: String, enum: ['Google', 'Guest', 'Email', 'Other'], default: 'Other' },
  clientName: { type: String, required: true },
  clientContact: { type: String, required: true },
  question: { type: String, required: true },
  answer: { type: String, default: '' },
  status: { 
    type: String, 
    enum: ['Pending', 'Answered', 'Rejected'], 
    default: 'Pending' 
  },
  createdAt: { type: Date, default: Date.now },
  answeredAt: { type: Date }
});

export default mongoose.model('Question', questionSchema);
