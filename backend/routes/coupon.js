import express from 'express';
import { getCoupons, getActiveCoupons, getCouponById, createCoupon, updateCoupon, deleteCoupon, validateCoupon } from '../controllers/couponController.js';
import { protect, adminProtect } from '../middleware/auth.js';

const router = express.Router();

router.get('/active', getActiveCoupons);
router.post('/validate', protect, validateCoupon);
router.get('/', adminProtect, getCoupons);
router.get('/:id', adminProtect, getCouponById);
router.post('/', adminProtect, createCoupon);
router.put('/:id', adminProtect, updateCoupon);
router.delete('/:id', adminProtect, deleteCoupon);

export default router;
