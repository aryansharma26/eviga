import express from 'express';
import { adminLogin, getDashboardStats, createAdmin, getAllAdmins, updateAdmin, deleteAdmin } from '../controllers/adminController.js';
import { adminProtect } from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

router.post('/login', authLimiter, adminLogin);
router.get('/dashboard', adminProtect, getDashboardStats);
router.get('/admins', adminProtect, getAllAdmins);
router.post('/admins', adminProtect, createAdmin);
router.put('/admins/:id', adminProtect, updateAdmin);
router.delete('/admins/:id', adminProtect, deleteAdmin);

export default router;
