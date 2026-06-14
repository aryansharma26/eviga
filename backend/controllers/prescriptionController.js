import Prescription from '../models/Prescription.js';
import fs from 'fs';
import path from 'path';

/* ─── User upload ─── */
export const uploadPrescription = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }
    const prescription = await Prescription.create({
      user: req.user._id,
      fileName: req.file.filename,
      filePath: req.file.path,
      fileType: req.file.mimetype,
      originalFileName: req.file.originalname,
      fileSize: req.file.size,
      status: 'pending',
    });
    res.status(201).json({ success: true, message: 'Prescription uploaded successfully', prescription });
  } catch (error) {
    next(error);
  }
};

/* ─── User list ─── */
export const getMyPrescriptions = async (req, res, next) => {
  try {
    const prescriptions = await Prescription.find({ user: req.user._id }).sort({ uploadedAt: -1 });
    res.json({ success: true, prescriptions });
  } catch (error) {
    next(error);
  }
};

/* ─── Admin list ─── */
export const getAllPrescriptions = async (req, res, next) => {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;
    const query = {};
    if (status) query.status = status;
    if (search) {
      const User = (await import('../models/User.js')).default;
      const users = await User.find({ name: { $regex: search, $options: 'i' } }).select('_id');
      const userIds = users.map((u) => u._id.toString());
      query.user = { $in: userIds };
    }
    const skip = (Number(page) - 1) * Number(limit);
    const prescriptions = await Prescription.find(query)
      .populate('user', 'name email')
      .sort({ uploadedAt: -1 })
      .skip(skip)
      .limit(Number(limit));
    const total = await Prescription.countDocuments(query);
    res.json({ success: true, prescriptions, pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) } });
  } catch (error) {
    next(error);
  }
};

/* ─── Admin stats ─── */
export const getPrescriptionStats = async (req, res, next) => {
  try {
    const total = await Prescription.countDocuments();
    const pending = await Prescription.countDocuments({ status: 'pending' });
    const approved = await Prescription.countDocuments({ status: 'approved' });
    const rejected = await Prescription.countDocuments({ status: 'rejected' });
    res.json({ success: true, stats: { total, pending, approved, rejected } });
  } catch (error) {
    next(error);
  }
};

/* ─── Admin view/download ─── */
export const getPrescriptionById = async (req, res, next) => {
  try {
    const prescription = await Prescription.findById(req.params.id).populate('user', 'name email');
    if (!prescription) {
      return res.status(404).json({ success: false, message: 'Prescription not found' });
    }
    res.json({ success: true, prescription });
  } catch (error) {
    next(error);
  }
};

export const downloadPrescription = async (req, res, next) => {
  try {
    const prescription = await Prescription.findById(req.params.id);
    if (!prescription) {
      return res.status(404).json({ success: false, message: 'Prescription not found' });
    }
    const filePath = prescription.filePath;
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, message: 'File not found' });
    }
    res.download(filePath, prescription.originalFileName);
  } catch (error) {
    next(error);
  }
};

/* ─── Admin review ─── */
export const reviewPrescription = async (req, res, next) => {
  try {
    const { status, adminNotes } = req.body;
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }
    const prescription = await Prescription.findByIdAndUpdate(
      req.params.id,
      { status, adminNotes, reviewedAt: new Date() },
      { new: true }
    ).populate('user', 'name email');
    if (!prescription) {
      return res.status(404).json({ success: false, message: 'Prescription not found' });
    }
    res.json({ success: true, message: `Prescription ${status}`, prescription });
  } catch (error) {
    next(error);
  }
};

/* ─── Delete prescription ─── */
export const deletePrescription = async (req, res, next) => {
  try {
    const prescription = await Prescription.findById(req.params.id);
    if (!prescription) {
      return res.status(404).json({ success: false, message: 'Prescription not found' });
    }
    if (prescription.filePath && fs.existsSync(prescription.filePath)) {
      fs.unlinkSync(prescription.filePath);
    }
    await Prescription.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Prescription deleted' });
  } catch (error) {
    next(error);
  }
};
