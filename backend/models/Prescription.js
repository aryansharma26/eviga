import mongoose from 'mongoose';

const prescriptionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  fileName: { type: String, required: true },
  filePath: { type: String, required: true },
  fileType: { type: String, required: true },
  originalFileName: { type: String, required: true },
  fileSize: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  adminNotes: { type: String, default: '' },
  uploadedAt: { type: Date, default: Date.now },
  reviewedAt: { type: Date },
}, { timestamps: true });

prescriptionSchema.index({ user: 1, status: 1 });
prescriptionSchema.index({ status: 1 });

const Prescription = mongoose.model('Prescription', prescriptionSchema);
export default Prescription;
