import mongoose from 'mongoose';

const aiDiagnosticSchema = new mongoose.Schema({
  errorMessage: { type: String, required: true },
  stackTrace: { type: String },
  context: { type: String }, // e.g., route, user, system state
  diagnosis: { type: String },
  rootCause: { type: String },
  recommendedFix: { type: String },
  severity: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
  status: { type: String, enum: ['Open', 'Resolved', 'Ignored'], default: 'Open' },
  timestamp: { type: Date, default: Date.now },
  resolvedAt: { type: Date },
  resolvedBy: { type: String },
});

const AIDiagnostic = mongoose.model('AIDiagnostic', aiDiagnosticSchema);

export default AIDiagnostic;
