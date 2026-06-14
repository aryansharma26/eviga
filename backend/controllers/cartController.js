import Cart from '../models/Cart.js';
import Product from '../models/Product.js';

export const getCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id }).populate('items.product').populate('coupon');
    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }
    res.json({ success: true, cart });
  } catch (error) {
    next(error);
  }
};

export const addToCart = async (req, res, next) => {
  try {
    const { productId, quantity = 1 } = req.body;
    const product = await Product.findById(productId);
    if (!product || product.status !== 'active') {
      return res.status(404).json({ success: false, message: 'Product not found or unavailable' });
    }
    if (product.stock < quantity) {
      return res.status(400).json({ success: false, message: 'Insufficient stock' });
    }
    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = new Cart({ user: req.user._id, items: [] });
    }
    const itemIndex = cart.items.findIndex((item) => item.product.toString() === productId);
    const price = product.discountPrice > 0 ? product.discountPrice : product.price;
    if (itemIndex > -1) {
      cart.items[itemIndex].quantity += Number(quantity);
    } else {
      cart.items.push({ product: productId, quantity: Number(quantity), price });
    }
    await cart.save();
    cart = await Cart.findOne({ user: req.user._id }).populate('items.product').populate('coupon');
    res.json({ success: true, message: 'Added to cart', cart });
  } catch (error) {
    next(error);
  }
};

export const updateCartItem = async (req, res, next) => {
  try {
    const { productId, quantity } = req.body;
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }
    const itemIndex = cart.items.findIndex((item) => item.product.toString() === productId);
    if (itemIndex === -1) {
      return res.status(404).json({ success: false, message: 'Item not found in cart' });
    }
    if (quantity <= 0) {
      cart.items.splice(itemIndex, 1);
    } else {
      cart.items[itemIndex].quantity = Number(quantity);
    }
    await cart.save();
    const updatedCart = await Cart.findOne({ user: req.user._id }).populate('items.product').populate('coupon');
    res.json({ success: true, message: 'Cart updated', cart: updatedCart });
  } catch (error) {
    next(error);
  }
};

export const removeFromCart = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }
    cart.items = cart.items.filter((item) => item.product.toString() !== productId);
    await cart.save();
    const updatedCart = await Cart.findOne({ user: req.user._id }).populate('items.product').populate('coupon');
    res.json({ success: true, message: 'Item removed', cart: updatedCart });
  } catch (error) {
    next(error);
  }
};

export const clearCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOneAndUpdate(
      { user: req.user._id },
      { items: [], coupon: null, couponDiscount: 0 },
      { new: true }
    ).populate('items.product').populate('coupon');
    res.json({ success: true, message: 'Cart cleared', cart });
  } catch (error) {
    next(error);
  }
};

export const applyCoupon = async (req, res, next) => {
  try {
    const { code } = req.body;
    const Coupon = (await import('../models/Coupon.js')).default;
    const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });
    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Invalid coupon code' });
    }
    if (coupon.endDate < new Date()) {
      return res.status(400).json({ success: false, message: 'Coupon has expired' });
    }
    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
      return res.status(400).json({ success: false, message: 'Coupon usage limit reached' });
    }
    const cart = await Cart.findOne({ user: req.user._id }).populate('items.product').populate('coupon');
    const subtotal = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    if (subtotal < coupon.minOrderAmount) {
      return res.status(400).json({ success: false, message: `Minimum order amount is ₹${coupon.minOrderAmount}` });
    }
    let discount = 0;
    if (coupon.discountType === 'percentage') {
      discount = (subtotal * coupon.discountValue) / 100;
      if (coupon.maxDiscountAmount && discount > coupon.maxDiscountAmount) {
        discount = coupon.maxDiscountAmount;
      }
    } else {
      discount = coupon.discountValue;
    }
    cart.coupon = coupon._id;
    cart.couponDiscount = discount;
    await cart.save();
    res.json({ success: true, message: 'Coupon applied', cart, discount });
  } catch (error) {
    next(error);
  }
};

export const removeCoupon = async (req, res, next) => {
  try {
    const cart = await Cart.findOneAndUpdate(
      { user: req.user._id },
      { coupon: null, couponDiscount: 0 },
      { new: true }
    ).populate('items.product').populate('coupon');
    res.json({ success: true, message: 'Coupon removed', cart });
  } catch (error) {
    next(error);
  }
};
