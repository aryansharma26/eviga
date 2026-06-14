import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Admin from './models/Admin.js';

dotenv.config();

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/evigapharma');
    console.log('MongoDB Connected');

    const existing = await Admin.findOne({ email: 'admin@evigapharma.com' });
    if (existing) {
      console.log('Default admin already exists');
      console.log('Email: admin@evigapharma.com');
      console.log('Password: admin123');
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash('admin123', 12);
    const admin = await Admin.create({
      name: 'Super Admin',
      email: 'admin@evigapharma.com',
      password: hashedPassword,
      role: 'superadmin',
      permissions: ['all'],
      isActive: true,
    });

    console.log('Default admin created successfully!');
    console.log('Email: admin@evigapharma.com');
    console.log('Password: admin123');
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error.message);
    process.exit(1);
  }
};

seedAdmin();
