import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { User, Mail, Phone, MapPin, Plus, Trash2, Edit2, LogOut, Package, Heart, Star, ChevronRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { userAPI, orderAPI } from '../api/index.js';

const Profile = () => {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [orders, setOrders] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [editingAddressId, setEditingAddressId] = useState(null);
  const { register, handleSubmit, reset } = useForm();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    loadData();
  }, [user, navigate]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [profileRes, ordersRes] = await Promise.all([
        userAPI.getProfile(),
        orderAPI.getMyOrders(),
      ]);
      setAddresses(profileRes.data.user.addresses || []);
      setOrders(ordersRes.data.orders || []);
    } catch (err) {
      console.error('Failed to load profile data:', err);
    } finally {
      setLoading(false);
    }
  };

  const onUpdateProfile = async (data) => {
    try {
      setMessage('');
      const { data: res } = await userAPI.updateProfile(data);
      updateUser(res.user);
      setMessage('Profile updated successfully');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Update failed');
    }
  };

  const onAddAddress = async (data) => {
    try {
      setMessage('');
      if (editingAddressId) {
        const { data: res } = await userAPI.updateAddress(editingAddressId, data);
        setAddresses(res.addresses);
        setEditingAddressId(null);
      } else {
        const { data: res } = await userAPI.addAddress(data);
        setAddresses(res.addresses);
      }
      reset();
      setMessage(editingAddressId ? 'Address updated successfully' : 'Address added successfully');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to save address');
    }
  };

  const onDeleteAddress = async (id) => {
    try {
      const { data: res } = await userAPI.deleteAddress(id);
      setAddresses(res.addresses);
    } catch (err) {
      console.error('Failed to delete address:', err);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'orders', label: 'Orders', icon: Package },
    { id: 'addresses', label: 'Addresses', icon: MapPin },
  ];

  if (!user) return null;

  return (
    <div className="container-custom py-8">
      <div className="grid lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-[#1a4d3a]/10 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-[#1a4d3a]" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">{user.name}</p>
                <p className="text-sm text-gray-500">{user.email}</p>
              </div>
            </div>
            <nav className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    activeTab === tab.id ? 'bg-[#1a4d3a]/10 text-[#1a4d3a]' : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          {message && (
            <div className={`mb-4 p-3 rounded-lg text-sm ${message.includes('success') ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
              {message}
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Profile Information</h2>
              <form onSubmit={handleSubmit(onUpdateProfile)} className="space-y-4 max-w-md">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    {...register('name')}
                    defaultValue={user.name}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1a4d3a]/20 focus:border-[#1a4d3a]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    defaultValue={user.email}
                    disabled
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 text-gray-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    {...register('phone')}
                    defaultValue={user.phone || ''}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1a4d3a]/20 focus:border-[#1a4d3a]"
                  />
                </div>
                <button type="submit" className="px-6 py-2.5 bg-[#1a4d3a] hover:bg-[#143d2e] text-white font-medium rounded-xl transition-colors">
                  Save Changes
                </button>
              </form>
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">My Orders</h2>
              {orders.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No orders yet</p>
                  <Link to="/medicines" className="text-[#1a4d3a] font-medium hover:underline mt-2 inline-block">Start Shopping</Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div key={order._id} className="border border-gray-100 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="text-sm font-medium text-gray-900">Order #{order._id.slice(-8)}</p>
                          <p className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${
                          order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                          order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {order.status}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-600">{order.orderItems.length} items</p>
                        <p className="font-semibold text-gray-900">₹{order.totalPrice}</p>
                      </div>
                      <Link to={`/orders/${order._id}`} className="inline-flex items-center gap-1 text-sm text-[#1a4d3a] font-medium mt-3 hover:underline">
                        View Details <ChevronRight className="w-4 h-4" />
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'addresses' && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">{editingAddressId ? 'Edit Address' : 'Add New Address'}</h2>
                <form onSubmit={handleSubmit(onAddAddress)} className="grid sm:grid-cols-2 gap-4">
                  <input {...register('name', { required: true })} placeholder="Full Name" className="px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1a4d3a]/20 focus:border-[#1a4d3a]" />
                  <input {...register('phone', { required: true })} placeholder="Phone" className="px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1a4d3a]/20 focus:border-[#1a4d3a]" />
                  <input {...register('addressLine1', { required: true })} placeholder="Address Line 1" className="sm:col-span-2 px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1a4d3a]/20 focus:border-[#1a4d3a]" />
                  <input {...register('addressLine2')} placeholder="Address Line 2 (Optional)" className="sm:col-span-2 px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1a4d3a]/20 focus:border-[#1a4d3a]" />
                  <input {...register('city', { required: true })} placeholder="City" className="px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1a4d3a]/20 focus:border-[#1a4d3a]" />
                  <input {...register('state', { required: true })} placeholder="State" className="px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1a4d3a]/20 focus:border-[#1a4d3a]" />
                  <input {...register('pincode', { required: true })} placeholder="Pincode" className="px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1a4d3a]/20 focus:border-[#1a4d3a]" />
                  <label className="flex items-center gap-2 sm:col-span-2">
                    <input {...register('isDefault')} type="checkbox" className="rounded" />
                    <span className="text-sm text-gray-600">Set as default address</span>
                  </label>
                  <div className="flex gap-3 sm:col-span-2">
                    <button type="submit" className="px-6 py-2.5 bg-[#1a4d3a] hover:bg-[#143d2e] text-white font-medium rounded-xl transition-colors">
                      {editingAddressId ? 'Update Address' : 'Add Address'}
                    </button>
                    {editingAddressId && (
                      <button type="button" onClick={() => { setEditingAddressId(null); reset(); }} className="px-6 py-2.5 border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl transition-colors">
                        Cancel
                      </button>
                    )}
                  </div>
                </form>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Saved Addresses</h2>
                {addresses.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No addresses saved yet</p>
                ) : (
                  <div className="grid sm:grid-cols-2 gap-4">
                    {addresses.map((addr) => (
                      <div key={addr._id} className={`border rounded-xl p-4 ${addr.isDefault ? 'border-[#1a4d3a] bg-[#1a4d3a]/5' : 'border-gray-100'}`}>
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium text-gray-900">{addr.name}</p>
                            <p className="text-sm text-gray-500">{addr.phone}</p>
                          </div>
                          <div className="flex items-center gap-1">
                            <button onClick={() => { setEditingAddressId(addr._id); reset(addr); }} className="p-1 hover:bg-blue-50 rounded text-gray-400 hover:text-blue-500 transition-colors">
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button onClick={() => onDeleteAddress(addr._id)} className="p-1 hover:bg-red-50 rounded text-gray-400 hover:text-red-500 transition-colors">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mt-2">{addr.addressLine1}{addr.addressLine2 ? `, ${addr.addressLine2}` : ''}</p>
                        <p className="text-sm text-gray-600">{addr.city}, {addr.state} - {addr.pincode}</p>
                        {addr.isDefault && (
                          <span className="inline-block mt-2 text-xs font-medium text-[#1a4d3a] bg-[#1a4d3a]/10 px-2 py-0.5 rounded">Default</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
