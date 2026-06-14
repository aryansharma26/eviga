import express from 'express';
import { body } from 'express-validator';
import { getProfile, updateProfile, updateAvatar, changePassword, addAddress, updateAddress, deleteAddress, getAllUsers, getUserById, updateUserStatus } from '../controllers/userController.js';
import { protect, adminProtect } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import { validate } from '../middleware/validation.js';

const router = express.Router();

router.get('/profile', protect, getProfile);
router.put('/profile', protect, [
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
  body('phone').optional().trim(),
], validate, updateProfile);
router.put('/avatar', protect, upload.single('avatar'), updateAvatar);
router.put('/password', protect, [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
], validate, changePassword);
router.post('/address', protect, [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('phone').trim().notEmpty().withMessage('Phone is required'),
  body('addressLine1').trim().notEmpty().withMessage('Address is required'),
  body('city').trim().notEmpty().withMessage('City is required'),
  body('state').trim().notEmpty().withMessage('State is required'),
  body('pincode').trim().notEmpty().withMessage('Pincode is required'),
], validate, addAddress);
router.put('/address/:addressId', protect, [
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
  body('phone').optional().trim().notEmpty().withMessage('Phone cannot be empty'),
  body('addressLine1').optional().trim().notEmpty().withMessage('Address cannot be empty'),
  body('city').optional().trim().notEmpty().withMessage('City cannot be empty'),
  body('state').optional().trim().notEmpty().withMessage('State cannot be empty'),
  body('pincode').optional().trim().notEmpty().withMessage('Pincode cannot be empty'),
], validate, updateAddress);
router.delete('/address/:addressId', protect, deleteAddress);
router.get('/', adminProtect, getAllUsers);
router.get('/:id', adminProtect, getUserById);
router.put('/:id/status', adminProtect, [
  body('isActive').isBoolean().withMessage('isActive must be a boolean'),
], validate, updateUserStatus);

export default router;
