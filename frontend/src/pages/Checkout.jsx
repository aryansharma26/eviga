import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { CreditCard, Truck, MapPin, CheckCircle, ArrowLeft } from 'lucide-react';
import { useCart } from '../contexts/CartContext.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';
import { userAPI, orderAPI } from '../api/index.js';

const Checkout = () => {
  const { cart, subtotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { register, handleSubmit } = useForm();

  useEffect(() => {
    if (!user) {
      navigate('/login?redirect=/checkout');
      return;
    }
    loadAddresses();
  }, [user, navigate]);

  const loadAddresses = async () => {
    try {
      const { data } = await userAPI.getProfile();
      setAddresses(data.user.addresses || []);
      const defaultAddr = data.user.addresses?.find((a) => a.isDefault);
      if (defaultAddr) setSelectedAddress(defaultAddr._id);
    } catch {
      // ignore
    }
  };

  const shipping = subtotal >= 500 ? 0 : 50;
  const tax = Math.round(subtotal * 0.05);
  const discount = cart.couponDiscount || 0;
  const total = subtotal + shipping + tax - discount;

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      setError('');
      const address = addresses.find((a) => a._id === selectedAddress);
      if (!address) {
        setError('Please select a delivery address');
        setLoading(false);
        return;
      }
      const orderData = {
        shippingAddress: address,
        paymentMethod,
        couponCode: cart.coupon?.code || undefined,
      };
      const { data: res } = await orderAPI.createOrder(orderData);

      if (paymentMethod === 'razorpay' && res.razorpayOrder) {
        const options = {
          key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_placeholder',
          amount: res.razorpayOrder.amount,
          currency: res.razorpayOrder.currency,
          name: 'Eviga Pharma',
          description: 'Order Payment',
          order_id: res.razorpayOrder.id,
          handler: async (response) => {
            await orderAPI.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderId: res.order._id,
            });
            await clearCart();
            navigate(`/orders/${res.order._id}?success=true`);
          },
          prefill: { name: user.name, email: user.email },
          theme: { color: '#1a4d3a' },
        };
        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        await clearCart();
        navigate(`/orders/${res.order._id}?success=true`);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Order placement failed');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="container-custom py-8">
      <button onClick={() => navigate('/cart')} className="inline-flex items-center gap-2 text-gray-600 hover:text-[#1a4d3a] mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Cart
      </button>

      <h1 className="text-2xl font-bold text-gray-900 mb-6">Checkout</h1>

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg">{error}</div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Delivery Address */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="w-5 h-5 text-[#1a4d3a]" />
              <h2 className="text-lg font-bold text-gray-900">Delivery Address</h2>
            </div>
            {addresses.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-gray-500 mb-3">No saved addresses</p>
                <button
                  type="button"
                  onClick={() => navigate('/profile?tab=addresses')}
                  className="px-4 py-2 bg-[#1a4d3a] text-white rounded-lg text-sm font-medium"
                >
                  Add Address
                </button>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-3">
                {addresses.map((addr) => (
                  <label
                    key={addr._id}
                    className={`border rounded-xl p-4 cursor-pointer transition-colors ${
                      selectedAddress === addr._id ? 'border-[#1a4d3a] bg-[#1a4d3a]/5' : 'border-gray-100 hover:border-gray-200'
                    }`}
                  >
                    <input
                      type="radio"
                      name="address"
                      value={addr._id}
                      checked={selectedAddress === addr._id}
                      onChange={() => setSelectedAddress(addr._id)}
                      className="sr-only"
                    />
                    <p className="font-medium text-gray-900">{addr.name}</p>
                    <p className="text-sm text-gray-500">{addr.phone}</p>
                    <p className="text-sm text-gray-600 mt-1">{addr.addressLine1}</p>
                    <p className="text-sm text-gray-600">{addr.city}, {addr.state} - {addr.pincode}</p>
                    {addr.isDefault && (
                      <span className="inline-block mt-2 text-xs font-medium text-[#1a4d3a] bg-[#1a4d3a]/10 px-2 py-0.5 rounded">Default</span>
                    )}
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Payment Method */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <CreditCard className="w-5 h-5 text-[#1a4d3a]" />
              <h2 className="text-lg font-bold text-gray-900">Payment Method</h2>
            </div>
            <div className="space-y-3">
              <label className={`flex items-center gap-3 p-4 border rounded-xl cursor-pointer transition-colors ${paymentMethod === 'cod' ? 'border-[#1a4d3a] bg-[#1a4d3a]/5' : 'border-gray-100'}`}>
                <input type="radio" name="payment" value="cod" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} className="w-4 h-4 text-[#1a4d3a]" />
                <div>
                  <p className="font-medium text-gray-900">Cash on Delivery</p>
                  <p className="text-sm text-gray-500">Pay when you receive</p>
                </div>
              </label>
              <label className={`flex items-center gap-3 p-4 border rounded-xl cursor-pointer transition-colors ${paymentMethod === 'razorpay' ? 'border-[#1a4d3a] bg-[#1a4d3a]/5' : 'border-gray-100'}`}>
                <input type="radio" name="payment" value="razorpay" checked={paymentMethod === 'razorpay'} onChange={() => setPaymentMethod('razorpay')} className="w-4 h-4 text-[#1a4d3a]" />
                <div>
                  <p className="font-medium text-gray-900">Online Payment (Razorpay)</p>
                  <p className="text-sm text-gray-500">Pay securely with card/UPI</p>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-gray-100 rounded-2xl p-6 sticky top-32">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h2>
            <div className="space-y-2 text-sm mb-4">
              {cart.items?.map((item) => (
                <div key={item.product?._id} className="flex justify-between text-gray-600">
                  <span className="line-clamp-1">{item.product?.name} x{item.quantity}</span>
                  <span>₹{(item.price * item.quantity).toFixed(0)}</span>
                </div>
              ))}
            </div>
            <div className="space-y-2 text-sm pt-4 border-t border-gray-100">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>₹{subtotal.toFixed(0)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span>{shipping === 0 ? 'Free' : `₹${shipping}`}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Tax</span>
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
              type="submit"
              disabled={loading || addresses.length === 0}
              className="w-full mt-6 py-3 bg-[#1a4d3a] hover:bg-[#143d2e] text-white font-semibold rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? 'Placing Order...' : `Place Order • ₹${total.toFixed(0)}`}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Checkout;
