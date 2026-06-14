import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, Tag, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { useCart } from '../contexts/CartContext.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';

const Cart = () => {
  const { cart, itemCount, subtotal, updateQuantity, removeItem, applyCoupon, removeCoupon, loading } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [couponCode, setCouponCode] = useState('');
  const [couponError, setCouponError] = useState('');

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    try {
      setCouponError('');
      await applyCoupon(couponCode);
    } catch (err) {
      setCouponError(err.response?.data?.message || 'Invalid coupon');
    }
  };

  const shipping = subtotal >= 500 ? 0 : 50;
  const tax = Math.round(subtotal * 0.05);
  const discount = cart.couponDiscount || 0;
  const total = subtotal + shipping + tax - discount;

  if (loading) {
    return (
      <div className="container-custom py-12">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4" />
          <div className="h-32 bg-gray-200 rounded" />
          <div className="h-32 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  if (!cart.items || cart.items.length === 0) {
    return (
      <div className="container-custom py-20 text-center">
        <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">Your Cart is Empty</h2>
        <p className="text-gray-500 mb-6">Looks like you haven't added anything yet.</p>
        <Link to="/medicines" className="inline-flex items-center gap-2 px-6 py-3 bg-[#1a4d3a] hover:bg-[#143d2e] text-white font-semibold rounded-xl transition-colors">
          Continue Shopping <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="container-custom py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Shopping Cart ({itemCount} items)</h1>
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cart.items.map((item, index) => (
            <motion.div
              key={item.product?._id || index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white border border-gray-100 rounded-2xl p-4 flex gap-4"
            >
              <div className="w-24 h-24 bg-gray-50 rounded-xl overflow-hidden shrink-0">
                <img
                  src={item.product?.images?.[0] || 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=200&h=200&fit=crop'}
                  alt={item.product?.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-xs text-gray-500">{item.product?.brand}</p>
                    <Link to={`/product/${item.product?.slug}`} className="font-semibold text-gray-900 text-sm hover:text-[#1a4d3a] transition-colors line-clamp-1">
                      {item.product?.name}
                    </Link>
                  </div>
                  <button onClick={() => removeItem(item.product?._id)} className="p-1 hover:bg-red-50 rounded text-gray-400 hover:text-red-500 transition-colors shrink-0">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center gap-2">
                    <button onClick={() => updateQuantity(item.product?._id, item.quantity - 1)} className="w-8 h-8 border border-gray-200 rounded-lg flex items-center justify-center hover:bg-gray-50">
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-8 text-center font-semibold text-sm">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.product?._id, item.quantity + 1)} className="w-8 h-8 border border-gray-200 rounded-lg flex items-center justify-center hover:bg-gray-50">
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                  <p className="font-bold text-gray-900">₹{(item.price * item.quantity).toFixed(0)}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-gray-100 rounded-2xl p-6 sticky top-32">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h2>

            {/* Coupon */}
            <div className="mb-4">
              {cart.coupon ? (
                <div className="flex items-center justify-between bg-green-50 rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium text-green-700">{cart.coupon.code}</span>
                  </div>
                  <button onClick={removeCoupon} className="text-gray-400 hover:text-red-500">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="Enter coupon code"
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a4d3a]/20"
                  />
                  <button onClick={handleApplyCoupon} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg transition-colors">
                    Apply
                  </button>
                </div>
              )}
              {couponError && <p className="text-red-500 text-xs mt-1">{couponError}</p>}
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>₹{subtotal.toFixed(0)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span>{shipping === 0 ? 'Free' : `₹${shipping}`}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Tax (5%)</span>
                <span>₹{tax}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>-₹{discount.toFixed(0)}</span>
                </div>
              )}
              <div className="pt-3 border-t border-gray-100 flex justify-between font-bold text-gray-900 text-base">
                <span>Total</span>
                <span>₹{total.toFixed(0)}</span>
              </div>
            </div>

            <button
              onClick={() => {
                if (!isAuthenticated) {
                  navigate('/login?redirect=/checkout');
                  return;
                }
                navigate('/checkout');
              }}
              className="w-full mt-6 py-3 bg-[#1a4d3a] hover:bg-[#143d2e] text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              Proceed to Checkout <ArrowRight className="w-4 h-4" />
            </button>

            <p className="text-xs text-gray-400 text-center mt-3">
              Free shipping on orders above ₹500
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
