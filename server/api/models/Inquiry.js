import mongoose from 'mongoose';

const inquirySchema = new mongoose.Schema({
  propertyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', required: true },
  clientName: { type: String, required: true },
  clientContact: { type: String, required: true },
  question: { type: String, required: true },
  answer: { type: String, default: '' },
  status: { type: String, enum: ['Pending', 'Answered', 'Archived'], default: 'Pending' },
  createdAt: { type: Date, default: Date.now },
  answeredAt: { type: Date }
});

export default mongoose.model('Inquiry', inquirySchema);
