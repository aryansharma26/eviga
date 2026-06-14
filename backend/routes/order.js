import express from 'express';
import { body } from 'express-validator';
import { createOrder, verifyPayment, getMyOrders, getOrderById, getAllOrders, updateOrderStatus, cancelOrder, getOrderStats } from '../controllers/orderController.js';
import { protect, adminProtect } from '../middleware/auth.js';
import { validate } from '../middleware/validation.js';

const router = express.Router();

router.post('/', protect, [
  body('shippingAddress').isObject().withMessage('Shipping address is required'),
  body('shippingAddress.name').trim().notEmpty().withMessage('Address name is required'),
  body('shippingAddress.phone').trim().notEmpty().withMessage('Address phone is required'),
  body('shippingAddress.addressLine1').trim().notEmpty().withMessage('Address line 1 is required'),
  body('shippingAddress.city').trim().notEmpty().withMessage('City is required'),
  body('shippingAddress.state').trim().notEmpty().withMessage('State is required'),
  body('shippingAddress.pincode').trim().notEmpty().withMessage('Pincode is required'),
  body('paymentMethod').isIn(['razorpay', 'cod']).withMessage('Payment method must be razorpay or cod'),
], validate, createOrder);
router.post('/verify-payment', protect, [
  body('razorpay_order_id').trim().notEmpty().withMessage('Razorpay order ID is required'),
  body('razorpay_payment_id').trim().notEmpty().withMessage('Razorpay payment ID is required'),
  body('razorpay_signature').trim().notEmpty().withMessage('Razorpay signature is required'),
  body('orderId').isMongoId().withMessage('Valid order ID is required'),
], validate, verifyPayment);
router.get('/my-orders', protect, getMyOrders);
router.get('/stats', adminProtect, getOrderStats);
router.get('/:id', protect, getOrderById);
router.get('/', adminProtect, getAllOrders);
router.put('/:id/status', adminProtect, [
  body('status').isIn(['pending', 'confirmed', 'packed', 'shipped', 'delivered', 'cancelled']).withMessage('Invalid status value'),
], validate, updateOrderStatus);
router.put('/:id/cancel', protect, cancelOrder);

export default router;
