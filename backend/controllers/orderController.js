import Order from '../models/Order.js';
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import Coupon from '../models/Coupon.js';
import razorpay from '../utils/razorpay.js';
import { sendEmail, getOrderConfirmationTemplate } from '../utils/sendEmail.js';

const TAX_RATE = 0.05;
const SHIPPING_THRESHOLD = 500;
const SHIPPING_COST = 50;

export const createOrder = async (req, res, next) => {
  try {
    const { shippingAddress, paymentMethod, couponCode } = req.body;
    const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ success: false, message: 'Cart is empty' });
    }
    const orderItems = cart.items.map((item) => ({
      product: item.product._id,
      name: item.product.name,
      image: item.product.images[0] || '',
      price: item.price,
      quantity: item.quantity,
    }));
    const itemsPrice = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    let couponDiscount = 0;
    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), isActive: true });
      if (coupon && coupon.endDate > new Date() && (!coupon.usageLimit || coupon.usageCount < coupon.usageLimit)) {
        if (itemsPrice >= coupon.minOrderAmount) {
          if (coupon.discountType === 'percentage') {
            couponDiscount = (itemsPrice * coupon.discountValue) / 100;
            if (coupon.maxDiscountAmount) couponDiscount = Math.min(couponDiscount, coupon.maxDiscountAmount);
          } else {
            couponDiscount = coupon.discountValue;
          }
          coupon.usageCount += 1;
          await coupon.save();
        }
      }
    }
    const taxPrice = itemsPrice * TAX_RATE;
    const shippingPrice = itemsPrice >= SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
    const totalPrice = itemsPrice + taxPrice + shippingPrice - couponDiscount;
    const order = await Order.create({
      user: req.user._id,
      orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      couponDiscount,
      totalPrice,
    });
    // Validate stock before deducting
    for (const item of cart.items) {
      const product = await Product.findById(item.product._id);
      if (!product || product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product?.name || 'a product'}. Only ${product?.stock || 0} left.`,
        });
      }
    }
    // Atomically deduct stock
    for (const item of cart.items) {
      const updated = await Product.findOneAndUpdate(
        { _id: item.product._id, stock: { $gte: item.quantity } },
        { $inc: { stock: -item.quantity } }
      );
      if (!updated) {
        return res.status(400).json({
          success: false,
          message: 'Stock changed during checkout. Please review your cart and try again.',
        });
      }
    }
    await Cart.findOneAndUpdate({ user: req.user._id }, { items: [], coupon: null, couponDiscount: 0 });
    if (paymentMethod === 'razorpay') {
      const razorpayOrder = await razorpay.orders.create({
        amount: Math.round(totalPrice * 100),
        currency: 'INR',
        receipt: order._id.toString(),
      });
      order.paymentResult = { id: razorpayOrder.id, status: 'created' };
      await order.save();
      return res.status(201).json({
        success: true,
        message: 'Order created',
        order,
        razorpayOrder: { id: razorpayOrder.id, amount: razorpayOrder.amount, currency: razorpayOrder.currency },
      });
    }
    await sendEmail({
      to: req.user.email,
      subject: `Order Confirmed - ${order._id}`,
      html: getOrderConfirmationTemplate(order),
    });
    res.status(201).json({ success: true, message: 'Order placed successfully', order });
  } catch (error) {
    next(error);
  }
};

export const verifyPayment = async (req, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;
    const crypto = await import('crypto');
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET).update(body).digest('hex');
    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Invalid payment signature' });
    }
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    order.isPaid = true;
    order.paidAt = new Date();
    order.paymentResult = { id: razorpay_payment_id, status: 'completed', update_time: new Date().toISOString() };
    order.status = 'confirmed';
    await order.save();
    await sendEmail({
      to: req.user.email,
      subject: `Payment Received - Order ${order._id}`,
      html: getOrderConfirmationTemplate(order),
    });
    res.json({ success: true, message: 'Payment verified', order });
  } catch (error) {
    next(error);
  }
};

export const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .populate('orderItems.product', 'name images slug');
    res.json({ success: true, count: orders.length, orders });
  } catch (error) {
    next(error);
  }
};

export const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, user: req.user._id })
      .populate('orderItems.product', 'name images slug');
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    res.json({ success: true, order });
  } catch (error) {
    next(error);
  }
};

export const getAllOrders = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = {};
    if (status) query.status = status;
    const skip = (Number(page) - 1) * Number(limit);
    const orders = await Order.find(query)
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));
    const total = await Order.countDocuments(query);
    res.json({ success: true, orders, pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) } });
  } catch (error) {
    next(error);
  }
};

export const updateOrderStatus = async (req, res, next) => {
  try {
    const { status, trackingNumber, notes } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    order.status = status;
    if (trackingNumber) order.trackingNumber = trackingNumber;
    if (notes) order.notes = notes;
    if (status === 'delivered') {
      order.isDelivered = true;
      order.deliveredAt = new Date();
    }
    await order.save();
    res.json({ success: true, message: 'Order status updated', order });
  } catch (error) {
    next(error);
  }
};

export const cancelOrder = async (req, res, next) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, user: req.user._id });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    if (['shipped', 'delivered'].includes(order.status)) {
      return res.status(400).json({ success: false, message: 'Cannot cancel shipped or delivered order' });
    }
    order.status = 'cancelled';
    await order.save();
    for (const item of order.orderItems) {
      await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity } });
    }
    res.json({ success: true, message: 'Order cancelled', order });
  } catch (error) {
    next(error);
  }
};

export const getOrderStats = async (req, res, next) => {
  try {
    const totalOrders = await Order.countDocuments();
    const totalRevenue = await Order.aggregate([{ $match: { isPaid: true } }, { $group: { _id: null, total: { $sum: '$totalPrice' } } }]);
    const statusCounts = await Order.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]);
    res.json({
      success: true,
      stats: {
        totalOrders,
        totalRevenue: totalRevenue[0]?.total || 0,
        statusCounts: statusCounts.reduce((acc, curr) => ({ ...acc, [curr._id]: curr.count }), {}),
      },
    });
  } catch (error) {
    next(error);
  }
};
