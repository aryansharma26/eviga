import express from 'express';
import { protect, adminProtect } from '../middleware/auth.js';
import { uploadPrescription } from '../middleware/uploadPrescription.js';
import {
  uploadPrescription as upload,
  getMyPrescriptions,
  getAllPrescriptions,
  getPrescriptionStats,
  getPrescriptionById,
  downloadPrescription,
  reviewPrescription,
  deletePrescription,
} from '../controllers/prescriptionController.js';

const router = express.Router();

// User routes
router.post('/upload', protect, uploadPrescription, upload);
router.get('/my-prescriptions', protect, getMyPrescriptions);

// Admin routes
router.get('/admin', adminProtect, getAllPrescriptions);
router.get('/admin/stats', adminProtect, getPrescriptionStats);
router.get('/admin/:id', adminProtect, getPrescriptionById);
router.get('/admin/:id/download', adminProtect, downloadPrescription);
router.put('/admin/:id/review', adminProtect, reviewPrescription);
router.delete('/admin/:id', adminProtect, deletePrescription);

export default router;
