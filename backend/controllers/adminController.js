import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.js';
import User from '../models/User.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import Review from '../models/Review.js';
import Contact from '../models/Contact.js';
import { generateAccessToken } from '../utils/generateToken.js';

export const adminLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const admin = await Admin.findOne({ email }).select('+password');
    if (!admin || !admin.isActive) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    admin.lastLogin = new Date();
    await admin.save();
    const token = generateAccessToken({ id: admin._id, role: admin.role, isAdmin: true });
    res.json({
      success: true,
      message: 'Admin login successful',
      admin: { id: admin._id, name: admin.name, email: admin.email, role: admin.role },
      token,
    });
  } catch (error) {
    next(error);
  }
};

export const getDashboardStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const lowStock = await Product.find({ stock: { $lt: 10, $gt: 0 } }).sort({ stock: 1 }).limit(5).select('name stock sku');
    const outOfStock = await Product.countDocuments({ stock: 0 });
    const totalProducts = await Product.countDocuments();
    const totalOrders = await Order.countDocuments();
    const totalRevenue = await Order.aggregate([{ $match: { isPaid: true } }, { $group: { _id: null, total: { $sum: '$totalPrice' } } }]);
    const pendingOrders = await Order.countDocuments({ status: 'pending' });
    const recentOrders = await Order.find().populate('user', 'name email').sort({ createdAt: -1 }).limit(5);
    const recentUsers = await User.find().select('name email createdAt').sort({ createdAt: -1 }).limit(5);
    const orderStatusCounts = await Order.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]);
    const monthlyRevenue = await Order.aggregate([
      { $match: { isPaid: true } },
      { $group: { _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } }, total: { $sum: '$totalPrice' } } },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 6 },
    ]);
    res.json({
      success: true,
      stats: {
        totalUsers,
        totalProducts,
        totalOrders,
        totalRevenue: totalRevenue[0]?.total || 0,
        pendingOrders,
        outOfStock,
        lowStock,
        orderStatusCounts: orderStatusCounts.reduce((acc, curr) => ({ ...acc, [curr._id]: curr.count }), {}),
        recentOrders,
        recentUsers,
        monthlyRevenue,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const createAdmin = async (req, res, next) => {
  try {
    const { name, email, password, role, permissions } = req.body;
    const existing = await Admin.findOne({ email });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Admin already exists' });
    }
    const hashedPassword = await bcrypt.hash(password, 12);
    const admin = await Admin.create({ name, email, password: hashedPassword, role, permissions });
    res.status(201).json({ success: true, message: 'Admin created', admin: { id: admin._id, name: admin.name, email: admin.email, role: admin.role } });
  } catch (error) {
    next(error);
  }
};

export const getAllAdmins = async (req, res, next) => {
  try {
    const admins = await Admin.find().select('-password').sort({ createdAt: -1 });
    res.json({ success: true, admins });
  } catch (error) {
    next(error);
  }
};

export const updateAdmin = async (req, res, next) => {
  try {
    const { name, role, permissions, isActive } = req.body;
    const admin = await Admin.findByIdAndUpdate(req.params.id, { name, role, permissions, isActive }, { new: true }).select('-password');
    if (!admin) {
      return res.status(404).json({ success: false, message: 'Admin not found' });
    }
    res.json({ success: true, message: 'Admin updated', admin });
  } catch (error) {
    next(error);
  }
};

export const deleteAdmin = async (req, res, next) => {
  try {
    const admin = await Admin.findByIdAndDelete(req.params.id);
    if (!admin) {
      return res.status(404).json({ success: false, message: 'Admin not found' });
    }
    res.json({ success: true, message: 'Admin deleted' });
  } catch (error) {
    next(error);
  }
};
