import mongoose from 'mongoose';

const adminSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, select: false },
  role: { type: String, enum: ['superadmin', 'admin', 'manager'], default: 'admin' },
  permissions: [{ type: String }],
  isActive: { type: Boolean, default: true },
  lastLogin: Date,
}, { timestamps: true });

const Admin = mongoose.model('Admin', adminSchema);
export default Admin;
