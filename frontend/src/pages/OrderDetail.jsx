import { useState, useEffect } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Package, Truck, MapPin, CreditCard, CheckCircle, XCircle, Clock } from 'lucide-react';
import { orderAPI } from '../api/index.js';

const OrderDetail = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const success = searchParams.get('success');

  useEffect(() => {
    loadOrder();
  }, [id]);

  const loadOrder = async () => {
    try {
      setLoading(true);
      const { data } = await orderAPI.getOrderById(id);
      setOrder(data.order);
    } catch (err) {
      console.error('Failed to load order:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    try {
      setCancelling(true);
      await orderAPI.cancelOrder(id);
      loadOrder();
    } catch (err) {
      console.error('Failed to cancel order:', err);
      alert(err.response?.data?.message || 'Failed to cancel order');
    } finally {
      setCancelling(false);
    }
  };

  const statusSteps = ['pending', 'confirmed', 'packed', 'shipped', 'delivered'];
  const statusConfig = {
    pending: { label: 'Pending', icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-50' },
    confirmed: { label: 'Confirmed', icon: CheckCircle, color: 'text-blue-600', bg: 'bg-blue-50' },
    packed: { label: 'Packed', icon: Package, color: 'text-purple-600', bg: 'bg-purple-50' },
    shipped: { label: 'Shipped', icon: Truck, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    delivered: { label: 'Delivered', icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
    cancelled: { label: 'Cancelled', icon: XCircle, color: 'text-red-600', bg: 'bg-red-50' },
  };

  if (loading) {
    return (
      <div className="container-custom py-12">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3" />
          <div className="h-40 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container-custom py-20 text-center">
        <p className="text-gray-500">Order not found</p>
        <Link to="/profile" className="text-[#1a4d3a] font-medium hover:underline mt-4 inline-block">Back to Profile</Link>
      </div>
    );
  }

  const currentStatus = order.status;
  const currentStepIndex = statusSteps.indexOf(currentStatus);

  return (
    <div className="container-custom py-8">
      <Link to="/profile" className="inline-flex items-center gap-2 text-gray-600 hover:text-[#1a4d3a] mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Orders
      </Link>

      {success && (
        <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-xl flex items-center gap-3">
          <CheckCircle className="w-5 h-5" />
          <span className="font-medium">Order placed successfully!</span>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Status Tracker */}
          {currentStatus !== 'cancelled' && (
            <div className="bg-white border border-gray-100 rounded-2xl p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Order Status</h2>
              <div className="flex items-center">
                {statusSteps.map((step, index) => {
                  const config = statusConfig[step];
                  const isActive = index <= currentStepIndex;
                  const isCurrent = index === currentStepIndex;
                  const isLast = index === statusSteps.length - 1;
                  return (
                    <div key={step} className="flex items-center flex-1">
                      <div className="flex flex-col items-center">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isActive ? config.bg : 'bg-gray-100'}`}>
                          <config.icon className={`w-5 h-5 ${isActive ? config.color : 'text-gray-400'}`} />
                        </div>
                        <span className={`text-xs mt-2 font-medium text-center ${isCurrent ? config.color : isActive ? 'text-gray-700' : 'text-gray-400'}`}>
                          {config.label}
                        </span>
                      </div>
                      {!isLast && (
                        <div className={`flex-1 h-0.5 mx-1 sm:mx-2 ${isActive && index < currentStepIndex ? 'bg-green-500' : 'bg-gray-200'}`} />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {currentStatus === 'cancelled' && (
            <div className="bg-red-50 border border-red-100 rounded-2xl p-6">
              <div className="flex items-center gap-3">
                <XCircle className="w-6 h-6 text-red-600" />
                <div>
                  <h2 className="font-bold text-red-700">Order Cancelled</h2>
                  <p className="text-sm text-red-600">This order has been cancelled.</p>
                </div>
              </div>
            </div>
          )}

          {/* Order Items */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Order Items</h2>
            <div className="space-y-4">
              {order.orderItems.map((item, index) => (
                <div key={index} className="flex gap-4">
                  <div className="w-20 h-20 bg-gray-50 rounded-xl overflow-hidden shrink-0">
                    <img src={item.image || 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=200&h=200&fit=crop'} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{item.name}</p>
                    <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                    <p className="font-semibold text-gray-900 mt-1">₹{item.price * item.quantity}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Order Info */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white border border-gray-100 rounded-2xl p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Order Details</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Order ID</span>
                <span className="font-medium">#{order._id.slice(-8)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Date</span>
                <span className="font-medium">{new Date(order.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Status</span>
                <span className={`font-medium capitalize ${statusConfig[currentStatus]?.color || 'text-gray-600'}`}>{currentStatus}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Payment</span>
                <span className="font-medium capitalize">{order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'}</span>
              </div>
              {order.trackingNumber && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Tracking</span>
                  <span className="font-medium">{order.trackingNumber}</span>
                </div>
              )}
            </div>
            {currentStatus !== 'cancelled' && currentStatus !== 'delivered' && currentStatus !== 'shipped' && (
              <button
                onClick={handleCancel}
                disabled={cancelling}
                className="w-full mt-4 py-2.5 border border-red-200 text-red-600 hover:bg-red-50 font-medium rounded-xl transition-colors disabled:opacity-50"
              >
                {cancelling ? 'Cancelling...' : 'Cancel Order'}
              </button>
            )}
          </div>

          <div className="bg-white border border-gray-100 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="w-5 h-5 text-[#1a4d3a]" />
              <h2 className="text-lg font-bold text-gray-900">Shipping Address</h2>
            </div>
            <div className="text-sm">
              <p className="font-medium text-gray-900">{order.shippingAddress.name}</p>
              <p className="text-gray-500">{order.shippingAddress.phone}</p>
              <p className="text-gray-600 mt-1">{order.shippingAddress.addressLine1}</p>
              {order.shippingAddress.addressLine2 && <p className="text-gray-600">{order.shippingAddress.addressLine2}</p>}
              <p className="text-gray-600">{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}</p>
            </div>
          </div>

          <div className="bg-white border border-gray-100 rounded-2xl p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Payment Summary</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Items</span>
                <span>₹{order.itemsPrice.toFixed(0)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span>{order.shippingPrice === 0 ? 'Free' : `₹${order.shippingPrice}`}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Tax</span>
                <span>₹{order.taxPrice.toFixed(0)}</span>
              </div>
              {order.couponDiscount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>-₹{order.couponDiscount.toFixed(0)}</span>
                </div>
              )}
              <div className="pt-3 border-t border-gray-100 flex justify-between font-bold text-gray-900 text-base">
                <span>Total</span>
                <span>₹{order.totalPrice.toFixed(0)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
