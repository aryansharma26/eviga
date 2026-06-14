import express from 'express';
import { body } from 'express-validator';
import { register, login, logout, refresh, forgotPassword, resetPassword, getMe } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimiter.js';
import { validate } from '../middleware/validation.js';

const router = express.Router();

router.post('/register', authLimiter, [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 50 }).withMessage('Name cannot exceed 50 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('phone').optional().trim(),
], validate, register);

router.post('/login', authLimiter, [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
], validate, login);

router.post('/logout', protect, logout);
router.post('/refresh', refresh);
router.post('/forgot-password', authLimiter, [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
], validate, forgotPassword);
router.put('/reset-password/:token', authLimiter, [
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
], validate, resetPassword);
router.get('/me', protect, getMe);

export default router;
