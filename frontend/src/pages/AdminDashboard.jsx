import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Package, ShoppingCart, Users, MessageSquare, Star, Tag, LogOut,
  Search, Plus, Edit2, Trash2, X, ChevronLeft, ChevronRight, Eye, CheckCircle, XCircle,
  ArrowUpDown, Filter, RefreshCw, Download, Upload, Heart, Mail, Phone, MapPin,
  DollarSign, TrendingUp, AlertTriangle, Loader2
} from 'lucide-react';
import { adminAPI, categoryAPI } from '../api/index.js';

/* ─── Reusable UI primitives ─── */
const Badge = ({ children, color = 'gray' }) => {
  const map = {
    gray: 'bg-gray-100 text-gray-700',
    green: 'bg-green-100 text-green-700',
    red: 'bg-red-100 text-red-700',
    yellow: 'bg-yellow-100 text-yellow-700',
    blue: 'bg-blue-100 text-blue-700',
    purple: 'bg-purple-100 text-purple-700',
    orange: 'bg-orange-100 text-orange-700',
  };
  return <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${map[color] || map.gray}`}>{children}</span>;
};

const Button = ({ children, onClick, variant = 'primary', size = 'md', disabled, type = 'button', className = '' }) => {
  const base = 'inline-flex items-center justify-center gap-2 font-medium rounded-xl transition-all';
  const sizes = { sm: 'px-3 py-1.5 text-xs', md: 'px-4 py-2 text-sm', lg: 'px-6 py-3 text-sm' };
  const variants = {
    primary: 'bg-[#1a4d3a] hover:bg-[#143d2e] text-white disabled:opacity-50',
    secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-700 disabled:opacity-50',
    danger: 'bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 disabled:opacity-50',
    ghost: 'hover:bg-gray-100 text-gray-600 disabled:opacity-50',
  };
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}>
      {children}
    </button>
  );
};

const Input = ({ label, ...props }) => (
  <div className="space-y-1">
    {label && <label className="text-sm font-medium text-gray-700">{label}</label>}
    <input className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1a4d3a]/20 focus:border-[#1a4d3a] text-sm bg-white" {...props} />
  </div>
);

const Select = ({ label, options, ...props }) => (
  <div className="space-y-1">
    {label && <label className="text-sm font-medium text-gray-700">{label}</label>}
    <select className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1a4d3a]/20 focus:border-[#1a4d3a] text-sm bg-white" {...props}>
      {options.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  </div>
);

const Textarea = ({ label, ...props }) => (
  <div className="space-y-1">
    {label && <label className="text-sm font-medium text-gray-700">{label}</label>}
    <textarea className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1a4d3a]/20 focus:border-[#1a4d3a] text-sm bg-white" {...props} />
  </div>
);

const Modal = ({ open, onClose, title, children, maxWidth = 'max-w-lg' }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className={`relative bg-white rounded-2xl shadow-xl w-full ${maxWidth} max-h-[90vh] overflow-y-auto`}>
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-900">{title}</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg transition-colors"><X className="w-5 h-5 text-gray-500" /></button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};

const ConfirmDialog = ({ open, onClose, onConfirm, title, message, loading }) => (
  <Modal open={open} onClose={onClose} title={title} maxWidth="max-w-md">
    <p className="text-gray-600 text-sm mb-6">{message}</p>
    <div className="flex justify-end gap-3">
      <Button variant="secondary" onClick={onClose}>Cancel</Button>
      <Button variant="danger" onClick={onConfirm} disabled={loading}>
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirm'}
      </Button>
    </div>
  </Modal>
);

const EmptyState = ({ icon: Icon, title, subtitle }) => (
  <div className="text-center py-16">
    <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
      <Icon className="w-8 h-8 text-gray-400" />
    </div>
    <h3 className="text-lg font-semibold text-gray-900 mb-1">{title}</h3>
    <p className="text-sm text-gray-500">{subtitle}</p>
  </div>
);

const SkeletonRow = ({ cols }) => (
  <tr>
    {Array.from({ length: cols }).map((_, i) => (
      <td key={i} className="px-4 py-3"><div className="h-4 bg-gray-100 rounded animate-pulse" /></td>
    ))}
  </tr>
);

/* ─── Dashboard Module ─── */
const DashboardModule = ({ stats, loading }) => {
  const revenueChart = stats?.monthlyRevenue || [];
  const maxRev = Math.max(...revenueChart.map((r) => r.total), 1);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>

      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : stats ? (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'blue' },
              { label: 'Total Products', value: stats.totalProducts, icon: Package, color: 'purple' },
              { label: 'Total Orders', value: stats.totalOrders, icon: ShoppingCart, color: 'orange' },
              { label: 'Total Revenue', value: `₹${stats.totalRevenue?.toFixed(0) || 0}`, icon: DollarSign, color: 'green' },
            ].map((s) => (
              <div key={s.label} className="bg-white rounded-2xl p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-10 h-10 bg-${s.color}-50 rounded-xl flex items-center justify-center`}>
                    <s.icon className={`w-5 h-5 text-${s.color}-600`} />
                  </div>
                  <TrendingUp className="w-4 h-4 text-green-500" />
                </div>
                <p className="text-2xl font-bold text-gray-900">{s.value}</p>
                <p className="text-sm text-gray-500">{s.label}</p>
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl border border-gray-100 p-6 lg:col-span-2">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Revenue Overview</h2>
              {revenueChart.length > 0 ? (
                <div className="flex items-end gap-3 h-48">
                  {revenueChart.slice().reverse().map((r) => {
                    const monthName = new Date(r._id.year, r._id.month - 1).toLocaleString('default', { month: 'short' });
                    const height = `${(r.total / maxRev) * 100}%`;
                    return (
                      <div key={`${r._id.year}-${r._id.month}`} className="flex-1 flex flex-col items-center gap-2">
                        <div className="w-full bg-[#1a4d3a]/10 rounded-t-lg relative" style={{ height }}>
                          <div className="absolute bottom-0 left-0 right-0 bg-[#1a4d3a] rounded-t-lg" style={{ height: '100%' }} />
                        </div>
                        <span className="text-xs text-gray-500">{monthName}</span>
                        <span className="text-xs font-medium text-gray-900">₹{(r.total / 1000).toFixed(0)}k</span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No revenue data yet</p>
              )}
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Low Stock Products</h2>
              {stats.lowStock?.length > 0 ? (
                <div className="space-y-3">
                  {stats.lowStock.map((p) => (
                    <div key={p._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                      <div>
                        <p className="text-sm font-medium text-gray-900 line-clamp-1">{p.name}</p>
                        <p className="text-xs text-gray-500">SKU: {p.sku}</p>
                      </div>
                      <Badge color={p.stock < 5 ? 'red' : 'yellow'}>{p.stock} left</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">All products well stocked</p>
              )}
              {stats.outOfStock > 0 && (
                <div className="mt-4 p-3 bg-red-50 rounded-xl flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                  <p className="text-sm text-red-600">{stats.outOfStock} products out of stock</p>
                </div>
              )}
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Recent Orders</h2>
              <div className="space-y-3">
                {stats.recentOrders?.map((order) => (
                  <div key={order._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <div>
                      <p className="text-sm font-medium text-gray-900">#{order._id.slice(-8)}</p>
                      <p className="text-xs text-gray-500">{order.user?.name || 'Unknown'}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">₹{order.totalPrice}</p>
                      <Badge color={order.status === 'delivered' ? 'green' : order.status === 'cancelled' ? 'red' : 'yellow'}>{order.status}</Badge>
                    </div>
                  </div>
                )) || <p className="text-gray-500 text-sm">No recent orders</p>}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Recent Users</h2>
              <div className="space-y-3">
                {stats.recentUsers?.map((user) => (
                  <div key={user._id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <div className="w-8 h-8 bg-[#1a4d3a]/10 rounded-full flex items-center justify-center">
                      <span className="text-[#1a4d3a] font-bold text-xs">{user.name?.[0] || 'U'}</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{user.name}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                  </div>
                )) || <p className="text-gray-500 text-sm">No recent users</p>}
              </div>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
};

/* ─── Products Module ─── */
const ProductsModule = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '', category: '', brand: '', price: '', discountPrice: '', stock: '', sku: '', benefits: '', dosage: '', composition: '', isPrescriptionRequired: false, featured: false, status: 'active' });
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreview, setImagePreview] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [message, setMessage] = useState('');

  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      const params = { page, limit: 12, status: statusFilter };
      if (search) params.search = search;
      const { data } = await adminAPI.getAllProducts(params);
      setProducts(data.products || []);
      setTotalPages(data.pagination?.pages || 1);
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter]);

  const loadCategories = useCallback(async () => {
    try {
      const { data } = await categoryAPI.getCategories();
      setCategories(data.categories || []);
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  }, []);

  useEffect(() => { loadProducts(); loadCategories(); }, [loadProducts, loadCategories]);

  const openCreate = () => {
    setEditingProduct(null);
    setFormData({ name: '', description: '', category: '', brand: '', price: '', discountPrice: '', stock: '', sku: '', benefits: '', dosage: '', composition: '', isPrescriptionRequired: false, featured: false, status: 'active' });
    setImageFiles([]);
    setImagePreview([]);
    setModalOpen(true);
  };

  const openEdit = async (product) => {
    try {
      const { data } = await adminAPI.getAllProducts(); // actually we need getProductById
      // The product already has all fields from the list, but let's make sure
      setEditingProduct(product);
      setFormData({
        name: product.name || '',
        description: product.description || '',
        category: product.category?._id || product.category || '',
        brand: product.brand || '',
        price: product.price || '',
        discountPrice: product.discountPrice || '',
        stock: product.stock || '',
        sku: product.sku || '',
        benefits: (product.benefits || []).join(', '),
        dosage: product.dosage || '',
        composition: product.composition || '',
        isPrescriptionRequired: product.isPrescriptionRequired || false,
        featured: product.featured || false,
        status: product.status || 'active',
      });
      setImagePreview(product.images || []);
      setImageFiles([]);
      setModalOpen(true);
    } catch (err) {
      console.error('Failed to load product details:', err);
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImageFiles(files);
    const previews = files.map((f) => URL.createObjectURL(f));
    setImagePreview(previews);
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      const fd = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          fd.append(key, value);
        }
      });
      if (formData.benefits) {
        fd.delete('benefits');
        formData.benefits.split(',').map((b) => b.trim()).filter(Boolean).forEach((b) => fd.append('benefits', b));
      }
      imageFiles.forEach((file) => fd.append('images', file));

      if (editingProduct) {
        await adminAPI.updateProduct(editingProduct._id, fd);
        setMessage('Product updated successfully');
      } else {
        await adminAPI.createProduct(fd);
        setMessage('Product created successfully');
      }
      setModalOpen(false);
      loadProducts();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to save product');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      setDeleteLoading(true);
      await adminAPI.deleteProduct(deleteId);
      setDeleteId(null);
      loadProducts();
      setMessage('Product deleted successfully');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to delete product');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Products</h1>
        <Button onClick={openCreate}><Plus className="w-4 h-4" /> Add Product</Button>
      </div>

      {message && (
        <div className={`p-3 rounded-xl text-sm ${message.includes('success') || message.includes('created') || message.includes('updated') || message.includes('deleted') ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
          {message}
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1a4d3a]/20 focus:border-[#1a4d3a]"
          />
        </div>
        <Select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          options={[
            { value: 'all', label: 'All Statuses' },
            { value: 'active', label: 'Active' },
            { value: 'inactive', label: 'Inactive' },
            { value: 'out_of_stock', label: 'Out of Stock' },
          ]}
        />
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Product</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Price</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Stock</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Status</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Category</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <SkeletonRow cols={6} />
              ) : products.length === 0 ? (
                <tr><td colSpan={6}><EmptyState icon={Package} title="No products found" subtitle="Try adjusting your search or filters" /></td></tr>
              ) : (
                products.map((p) => (
                  <tr key={p._id} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img src={p.images?.[0] || 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=100&h=100&fit=crop'} alt="" className="w-10 h-10 rounded-lg object-cover bg-gray-100" />
                        <div>
                          <p className="font-medium text-gray-900">{p.name}</p>
                          <p className="text-xs text-gray-500">{p.brand}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">₹{p.discountPrice || p.price}</p>
                      {p.discountPrice > 0 && <p className="text-xs text-gray-400 line-through">₹{p.price}</p>}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`font-medium ${p.stock < 10 ? 'text-red-600' : 'text-gray-900'}`}>{p.stock}</span>
                    </td>
                    <td className="px-4 py-3"><Badge color={p.status === 'active' ? 'green' : p.status === 'out_of_stock' ? 'red' : 'gray'}>{p.status}</Badge></td>
                    <td className="px-4 py-3 text-gray-600">{p.category?.name || '-'}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openEdit(p)} className="p-1.5 hover:bg-blue-50 rounded-lg text-gray-400 hover:text-blue-600 transition-colors"><Edit2 className="w-4 h-4" /></button>
                        <button onClick={() => setDeleteId(p._id)} className="p-1.5 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-600 transition-colors"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 p-4 border-t border-gray-100">
            <Button variant="secondary" size="sm" onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1}><ChevronLeft className="w-4 h-4" /></Button>
            <span className="text-sm text-gray-600">Page {page} of {totalPages}</span>
            <Button variant="secondary" size="sm" onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages}><ChevronRight className="w-4 h-4" /></Button>
          </div>
        )}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingProduct ? 'Edit Product' : 'Add Product'} maxWidth="max-w-2xl">
        <div className="grid sm:grid-cols-2 gap-4">
          <Input label="Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
          <Input label="Brand" value={formData.brand} onChange={(e) => setFormData({ ...formData, brand: e.target.value })} />
          <Select label="Category" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} options={[{ value: '', label: 'Select Category' }, ...categories.map((c) => ({ value: c._id, label: c.name }))]} />
          <Select label="Status" value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} options={[{ value: 'active', label: 'Active' }, { value: 'inactive', label: 'Inactive' }, { value: 'out_of_stock', label: 'Out of Stock' }]} />
          <Input label="Price" type="number" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} />
          <Input label="Discount Price" type="number" value={formData.discountPrice} onChange={(e) => setFormData({ ...formData, discountPrice: e.target.value })} />
          <Input label="Stock" type="number" value={formData.stock} onChange={(e) => setFormData({ ...formData, stock: e.target.value })} />
          <Input label="SKU" value={formData.sku} onChange={(e) => setFormData({ ...formData, sku: e.target.value })} />
          <Textarea label="Description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="sm:col-span-2" />
          <Input label="Benefits (comma separated)" value={formData.benefits} onChange={(e) => setFormData({ ...formData, benefits: e.target.value })} className="sm:col-span-2" />
          <Input label="Dosage" value={formData.dosage} onChange={(e) => setFormData({ ...formData, dosage: e.target.value })} />
          <Input label="Composition" value={formData.composition} onChange={(e) => setFormData({ ...formData, composition: e.target.value })} />
          <div className="sm:col-span-2 flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input type="checkbox" checked={formData.isPrescriptionRequired} onChange={(e) => setFormData({ ...formData, isPrescriptionRequired: e.target.checked })} className="rounded" />
              Prescription Required
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input type="checkbox" checked={formData.featured} onChange={(e) => setFormData({ ...formData, featured: e.target.checked })} className="rounded" />
              Featured
            </label>
          </div>
          <div className="sm:col-span-2">
            <label className="text-sm font-medium text-gray-700 block mb-1">Images</label>
            <div className="flex items-center gap-3">
              <label className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm text-gray-700 cursor-pointer transition-colors">
                <Upload className="w-4 h-4 inline mr-2" /> Choose Images
                <input type="file" multiple accept="image/*" onChange={handleImageChange} className="hidden" />
              </label>
              <div className="flex gap-2">
                {imagePreview.map((src, i) => (
                  <img key={i} src={src} alt="" className="w-12 h-12 rounded-lg object-cover border border-gray-200" />
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : editingProduct ? 'Update Product' : 'Create Product'}
          </Button>
        </div>
      </Modal>

      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} title="Delete Product" message="Are you sure you want to delete this product? This action cannot be undone." loading={deleteLoading} />
    </div>
  );
};

/* ─── Orders Module ─── */
const OrdersModule = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [viewOrder, setViewOrder] = useState(null);
  const [updateId, setUpdateId] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [updateLoading, setUpdateLoading] = useState(false);
  const [message, setMessage] = useState('');

  const loadOrders = useCallback(async () => {
    try {
      setLoading(true);
      const params = { page, limit: 20 };
      if (statusFilter) params.status = statusFilter;
      const { data } = await adminAPI.getAllOrders(params);
      setOrders(data.orders || []);
      setTotalPages(data.pagination?.pages || 1);
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => { loadOrders(); }, [loadOrders]);

  const filteredOrders = search
    ? orders.filter((o) =>
        o._id.toLowerCase().includes(search.toLowerCase()) ||
        o.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
        o.user?.email?.toLowerCase().includes(search.toLowerCase())
      )
    : orders;

  const handleUpdateStatus = async () => {
    if (!updateId || !newStatus) return;
    try {
      setUpdateLoading(true);
      await adminAPI.updateOrderStatus(updateId, { status: newStatus });
      setUpdateId(null);
      loadOrders();
      setMessage('Order status updated');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to update status');
    } finally {
      setUpdateLoading(false);
    }
  };

  const statusOptions = ['pending', 'confirmed', 'packed', 'shipped', 'delivered', 'cancelled'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
      </div>

      {message && <div className={`p-3 rounded-xl text-sm ${message.includes('updated') ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>{message}</div>}

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" placeholder="Search by order ID or customer..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1a4d3a]/20 focus:border-[#1a4d3a]" />
        </div>
        <Select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} options={[{ value: '', label: 'All Statuses' }, ...statusOptions.map((s) => ({ value: s, label: s.charAt(0).toUpperCase() + s.slice(1) }))]} />
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Order ID</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Customer</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Total</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Status</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Payment</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Date</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <SkeletonRow cols={7} />
              ) : filteredOrders.length === 0 ? (
                <tr><td colSpan={7}><EmptyState icon={ShoppingCart} title="No orders found" subtitle="Try adjusting your search or filters" /></td></tr>
              ) : (
                filteredOrders.map((o) => (
                  <tr key={o._id} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="px-4 py-3 font-medium text-gray-900">#{o._id.slice(-8)}</td>
                    <td className="px-4 py-3">
                      <p className="text-gray-900">{o.user?.name || 'Unknown'}</p>
                      <p className="text-xs text-gray-500">{o.user?.email}</p>
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900">₹{o.totalPrice?.toFixed(0)}</td>
                    <td className="px-4 py-3"><Badge color={o.status === 'delivered' ? 'green' : o.status === 'cancelled' ? 'red' : 'yellow'}>{o.status}</Badge></td>
                    <td className="px-4 py-3 text-gray-600 capitalize">{o.paymentMethod === 'cod' ? 'COD' : 'Online'}</td>
                    <td className="px-4 py-3 text-gray-500">{new Date(o.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => setViewOrder(o)} className="p-1.5 hover:bg-blue-50 rounded-lg text-gray-400 hover:text-blue-600 transition-colors"><Eye className="w-4 h-4" /></button>
                        <button onClick={() => { setUpdateId(o._id); setNewStatus(o.status); }} className="p-1.5 hover:bg-green-50 rounded-lg text-gray-400 hover:text-green-600 transition-colors"><Edit2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 p-4 border-t border-gray-100">
            <Button variant="secondary" size="sm" onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1}><ChevronLeft className="w-4 h-4" /></Button>
            <span className="text-sm text-gray-600">Page {page} of {totalPages}</span>
            <Button variant="secondary" size="sm" onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages}><ChevronRight className="w-4 h-4" /></Button>
          </div>
        )}
      </div>

      <Modal open={!!viewOrder} onClose={() => setViewOrder(null)} title={`Order #${viewOrder?._id?.slice(-8)}`} maxWidth="max-w-2xl">
        {viewOrder && (
          <div className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Customer</p>
                <p className="font-medium text-gray-900">{viewOrder.user?.name || 'Unknown'}</p>
                <p className="text-sm text-gray-600">{viewOrder.user?.email}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Shipping Address</p>
                <p className="text-sm text-gray-900">{viewOrder.shippingAddress?.name}</p>
                <p className="text-sm text-gray-600">{viewOrder.shippingAddress?.addressLine1}, {viewOrder.shippingAddress?.city}, {viewOrder.shippingAddress?.state} - {viewOrder.shippingAddress?.pincode}</p>
              </div>
            </div>
            <div className="p-4 bg-gray-50 rounded-xl">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Items</p>
              <div className="space-y-2">
                {viewOrder.orderItems?.map((item, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <span className="text-gray-900">{item.name} x{item.quantity}</span>
                    <span className="font-medium text-gray-900">₹{(item.price * item.quantity).toFixed(0)}</span>
                  </div>
                ))}
              </div>
              <div className="mt-3 pt-3 border-t border-gray-200 flex justify-between font-bold text-gray-900">
                <span>Total</span>
                <span>₹{viewOrder.totalPrice?.toFixed(0)}</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="p-4 bg-gray-50 rounded-xl flex-1">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Payment</p>
                <p className="text-sm font-medium text-gray-900">{viewOrder.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment (Razorpay)'}</p>
                <p className="text-sm text-gray-600">{viewOrder.isPaid ? 'Paid' : 'Not Paid'}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl flex-1">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Status</p>
                <Badge color={viewOrder.status === 'delivered' ? 'green' : viewOrder.status === 'cancelled' ? 'red' : 'yellow'}>{viewOrder.status}</Badge>
                {viewOrder.trackingNumber && <p className="text-sm text-gray-600 mt-1">Tracking: {viewOrder.trackingNumber}</p>}
              </div>
            </div>
          </div>
        )}
      </Modal>

      <Modal open={!!updateId} onClose={() => setUpdateId(null)} title="Update Order Status" maxWidth="max-w-md">
        <Select label="New Status" value={newStatus} onChange={(e) => setNewStatus(e.target.value)} options={statusOptions.map((s) => ({ value: s, label: s.charAt(0).toUpperCase() + s.slice(1) }))} />
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="secondary" onClick={() => setUpdateId(null)}>Cancel</Button>
          <Button onClick={handleUpdateStatus} disabled={updateLoading}>
            {updateLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Update Status'}
          </Button>
        </div>
      </Modal>
    </div>
  );
};

/* ─── Users Module ─── */
const UsersModule = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [viewUser, setViewUser] = useState(null);
  const [message, setMessage] = useState('');

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await adminAPI.getAllUsers();
      setUsers(data.users || []);
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadUsers(); }, [loadUsers]);

  const filteredUsers = search
    ? users.filter((u) => u.name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase()))
    : users;

  const handleToggleStatus = async (user) => {
    try {
      await adminAPI.updateUserStatus(user._id, { isActive: !user.isActive });
      loadUsers();
      setMessage(`User ${user.isActive ? 'blocked' : 'unblocked'} successfully`);
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to update user');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Users</h1>
      </div>

      {message && <div className={`p-3 rounded-xl text-sm ${message.includes('success') ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>{message}</div>}

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input type="text" placeholder="Search users by name or email..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1a4d3a]/20 focus:border-[#1a4d3a]" />
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-600">User</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Email</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Phone</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Status</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Joined</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <SkeletonRow cols={6} />
              ) : filteredUsers.length === 0 ? (
                <tr><td colSpan={6}><EmptyState icon={Users} title="No users found" subtitle="Try adjusting your search" /></td></tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u._id} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-[#1a4d3a]/10 rounded-full flex items-center justify-center">
                          <span className="text-[#1a4d3a] font-bold text-xs">{u.name?.[0] || 'U'}</span>
                        </div>
                        <p className="font-medium text-gray-900">{u.name}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{u.email}</td>
                    <td className="px-4 py-3 text-gray-600">{u.phone || '-'}</td>
                    <td className="px-4 py-3"><Badge color={u.isActive ? 'green' : 'red'}>{u.isActive ? 'Active' : 'Blocked'}</Badge></td>
                    <td className="px-4 py-3 text-gray-500">{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => setViewUser(u)} className="p-1.5 hover:bg-blue-50 rounded-lg text-gray-400 hover:text-blue-600 transition-colors"><Eye className="w-4 h-4" /></button>
                        <button onClick={() => handleToggleStatus(u)} className={`p-1.5 rounded-lg transition-colors ${u.isActive ? 'hover:bg-red-50 text-gray-400 hover:text-red-600' : 'hover:bg-green-50 text-gray-400 hover:text-green-600'}`}>
                          {u.isActive ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={!!viewUser} onClose={() => setViewUser(null)} title="User Details" maxWidth="max-w-md">
        {viewUser && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-[#1a4d3a]/10 rounded-2xl flex items-center justify-center">
                <span className="text-[#1a4d3a] font-bold text-xl">{viewUser.name?.[0] || 'U'}</span>
              </div>
              <div>
                <p className="font-bold text-gray-900 text-lg">{viewUser.name}</p>
                <p className="text-sm text-gray-500">{viewUser.email}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-gray-50 rounded-xl">
                <p className="text-xs text-gray-500">Phone</p>
                <p className="text-sm font-medium text-gray-900">{viewUser.phone || 'N/A'}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-xl">
                <p className="text-xs text-gray-500">Status</p>
                <Badge color={viewUser.isActive ? 'green' : 'red'}>{viewUser.isActive ? 'Active' : 'Blocked'}</Badge>
              </div>
              <div className="p-3 bg-gray-50 rounded-xl">
                <p className="text-xs text-gray-500">Joined</p>
                <p className="text-sm font-medium text-gray-900">{new Date(viewUser.createdAt).toLocaleDateString()}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-xl">
                <p className="text-xs text-gray-500">Role</p>
                <p className="text-sm font-medium text-gray-900 capitalize">{viewUser.role}</p>
              </div>
            </div>
            {viewUser.addresses?.length > 0 && (
              <div>
                <p className="text-sm font-medium text-gray-900 mb-2">Saved Addresses</p>
                <div className="space-y-2">
                  {viewUser.addresses.map((addr) => (
                    <div key={addr._id} className="p-3 bg-gray-50 rounded-xl text-sm">
                      <p className="font-medium text-gray-900">{addr.name} {addr.isDefault && <span className="text-xs text-[#1a4d3a]">(Default)</span>}</p>
                      <p className="text-gray-600">{addr.addressLine1}, {addr.city}, {addr.state} - {addr.pincode}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

/* ─── Reviews Module ─── */
const ReviewsModule = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [message, setMessage] = useState('');
  const [deleteId, setDeleteId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const loadReviews = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await adminAPI.getAllReviews();
      setReviews(data.reviews || []);
    } catch (err) {
      console.error('Failed to load reviews:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadReviews(); }, [loadReviews]);

  const filteredReviews = search
    ? reviews.filter((r) =>
        r.product?.name?.toLowerCase().includes(search.toLowerCase()) ||
        r.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
        r.comment?.toLowerCase().includes(search.toLowerCase())
      )
    : reviews;

  const handleToggleApproval = async (review) => {
    try {
      await adminAPI.toggleReviewApproval(review._id);
      loadReviews();
      setMessage('Review approval updated');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to update review');
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      setDeleteLoading(true);
      await adminAPI.deleteReview(deleteId);
      setDeleteId(null);
      loadReviews();
      setMessage('Review deleted');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to delete review');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Reviews</h1>
      </div>

      {message && <div className={`p-3 rounded-xl text-sm ${message.includes('updated') || message.includes('deleted') ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>{message}</div>}

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input type="text" placeholder="Search by product, user, or comment..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1a4d3a]/20 focus:border-[#1a4d3a]" />
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Product</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">User</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Rating</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Comment</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Status</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <SkeletonRow cols={6} />
              ) : filteredReviews.length === 0 ? (
                <tr><td colSpan={6}><EmptyState icon={Star} title="No reviews found" subtitle="Try adjusting your search" /></td></tr>
              ) : (
                filteredReviews.map((r) => (
                  <tr key={r._id} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900 line-clamp-1">{r.product?.name || 'Unknown'}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-gray-900">{r.user?.name || r.name || 'Unknown'}</p>
                      <p className="text-xs text-gray-500">{r.user?.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className={`w-3.5 h-3.5 ${i < r.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600 max-w-xs line-clamp-2">{r.comment}</td>
                    <td className="px-4 py-3"><Badge color={r.isApproved ? 'green' : 'yellow'}>{r.isApproved ? 'Approved' : 'Pending'}</Badge></td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => handleToggleApproval(r)} className="p-1.5 hover:bg-green-50 rounded-lg text-gray-400 hover:text-green-600 transition-colors" title={r.isApproved ? 'Reject' : 'Approve'}>
                          {r.isApproved ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                        </button>
                        <button onClick={() => setDeleteId(r._id)} className="p-1.5 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-600 transition-colors"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} title="Delete Review" message="Are you sure you want to delete this review?" loading={deleteLoading} />
    </div>
  );
};

/* ─── Coupons Module ─── */
const CouponsModule = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [formData, setFormData] = useState({ code: '', description: '', discountType: 'percentage', discountValue: '', minOrderAmount: '', maxDiscountAmount: '', startDate: '', endDate: '', usageLimit: '', isActive: true });
  const [submitting, setSubmitting] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [message, setMessage] = useState('');

  const loadCoupons = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await adminAPI.getCoupons();
      setCoupons(data.coupons || []);
    } catch (err) {
      console.error('Failed to load coupons:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadCoupons(); }, [loadCoupons]);

  const openCreate = () => {
    setEditingCoupon(null);
    setFormData({ code: '', description: '', discountType: 'percentage', discountValue: '', minOrderAmount: '', maxDiscountAmount: '', startDate: '', endDate: '', usageLimit: '', isActive: true });
    setModalOpen(true);
  };

  const openEdit = (coupon) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code || '',
      description: coupon.description || '',
      discountType: coupon.discountType || 'percentage',
      discountValue: coupon.discountValue || '',
      minOrderAmount: coupon.minOrderAmount || '',
      maxDiscountAmount: coupon.maxDiscountAmount || '',
      startDate: coupon.startDate ? new Date(coupon.startDate).toISOString().slice(0, 10) : '',
      endDate: coupon.endDate ? new Date(coupon.endDate).toISOString().slice(0, 10) : '',
      usageLimit: coupon.usageLimit || '',
      isActive: coupon.isActive ?? true,
    });
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      const data = {
        ...formData,
        discountValue: Number(formData.discountValue),
        minOrderAmount: Number(formData.minOrderAmount) || 0,
        maxDiscountAmount: formData.maxDiscountAmount ? Number(formData.maxDiscountAmount) : null,
        usageLimit: formData.usageLimit ? Number(formData.usageLimit) : null,
      };
      if (editingCoupon) {
        await adminAPI.updateCoupon(editingCoupon._id, data);
        setMessage('Coupon updated successfully');
      } else {
        await adminAPI.createCoupon(data);
        setMessage('Coupon created successfully');
      }
      setModalOpen(false);
      loadCoupons();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to save coupon');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      setDeleteLoading(true);
      await adminAPI.deleteCoupon(deleteId);
      setDeleteId(null);
      loadCoupons();
      setMessage('Coupon deleted successfully');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to delete coupon');
    } finally {
      setDeleteLoading(false);
    }
  };

  const isExpired = (coupon) => new Date(coupon.endDate) < new Date();
  const isActive = (coupon) => coupon.isActive && !isExpired(coupon) && (!coupon.usageLimit || coupon.usageCount < coupon.usageLimit);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Coupons</h1>
        <Button onClick={openCreate}><Plus className="w-4 h-4" /> Add Coupon</Button>
      </div>

      {message && <div className={`p-3 rounded-xl text-sm ${message.includes('success') || message.includes('created') || message.includes('updated') || message.includes('deleted') ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>{message}</div>}

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Code</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Discount</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Usage</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Valid Until</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Status</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <SkeletonRow cols={6} />
              ) : coupons.length === 0 ? (
                <tr><td colSpan={6}><EmptyState icon={Tag} title="No coupons found" subtitle="Create your first coupon" /></td></tr>
              ) : (
                coupons.map((c) => (
                  <tr key={c._id} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="px-4 py-3">
                      <p className="font-mono font-medium text-gray-900">{c.code}</p>
                      <p className="text-xs text-gray-500">{c.description}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-gray-900">
                        {c.discountType === 'percentage' ? `${c.discountValue}%` : `₹${c.discountValue}`}
                        {c.maxDiscountAmount ? ` (max ₹${c.maxDiscountAmount})` : ''}
                      </p>
                      <p className="text-xs text-gray-500">Min order: ₹{c.minOrderAmount}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-900">{c.usageCount} / {c.usageLimit || '∞'}</td>
                    <td className="px-4 py-3 text-gray-600">{new Date(c.endDate).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <Badge color={isActive(c) ? 'green' : 'red'}>{isActive(c) ? 'Active' : isExpired(c) ? 'Expired' : 'Inactive'}</Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openEdit(c)} className="p-1.5 hover:bg-blue-50 rounded-lg text-gray-400 hover:text-blue-600 transition-colors"><Edit2 className="w-4 h-4" /></button>
                        <button onClick={() => setDeleteId(c._id)} className="p-1.5 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-600 transition-colors"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingCoupon ? 'Edit Coupon' : 'Add Coupon'} maxWidth="max-w-lg">
        <div className="grid sm:grid-cols-2 gap-4">
          <Input label="Code" value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })} />
          <Select label="Discount Type" value={formData.discountType} onChange={(e) => setFormData({ ...formData, discountType: e.target.value })} options={[{ value: 'percentage', label: 'Percentage' }, { value: 'fixed', label: 'Fixed Amount' }]} />
          <Input label="Discount Value" type="number" value={formData.discountValue} onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })} />
          <Input label="Min Order Amount" type="number" value={formData.minOrderAmount} onChange={(e) => setFormData({ ...formData, minOrderAmount: e.target.value })} />
          <Input label="Max Discount Amount" type="number" value={formData.maxDiscountAmount} onChange={(e) => setFormData({ ...formData, maxDiscountAmount: e.target.value })} />
          <Input label="Usage Limit" type="number" value={formData.usageLimit} onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })} />
          <Input label="Start Date" type="date" value={formData.startDate} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} />
          <Input label="End Date" type="date" value={formData.endDate} onChange={(e) => setFormData({ ...formData, endDate: e.target.value })} />
          <Textarea label="Description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="sm:col-span-2" />
          <div className="sm:col-span-2 flex items-center gap-2">
            <input type="checkbox" checked={formData.isActive} onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })} className="rounded" />
            <span className="text-sm text-gray-700">Active</span>
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : editingCoupon ? 'Update Coupon' : 'Create Coupon'}
          </Button>
        </div>
      </Modal>

      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} title="Delete Coupon" message="Are you sure you want to delete this coupon?" loading={deleteLoading} />
    </div>
  );
};

/* ─── Contacts Module ─── */
const ContactsModule = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [viewContact, setViewContact] = useState(null);
  const [message, setMessage] = useState('');
  const [deleteId, setDeleteId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const loadContacts = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter) params.isRead = statusFilter;
      const { data } = await adminAPI.getContacts(params);
      setContacts(data.contacts || []);
    } catch (err) {
      console.error('Failed to load contacts:', err);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => { loadContacts(); }, [loadContacts]);

  const filteredContacts = search
    ? contacts.filter((c) =>
        c.name?.toLowerCase().includes(search.toLowerCase()) ||
        c.email?.toLowerCase().includes(search.toLowerCase()) ||
        c.subject?.toLowerCase().includes(search.toLowerCase()) ||
        c.message?.toLowerCase().includes(search.toLowerCase())
      )
    : contacts;

  const handleToggleRead = async (contact) => {
    try {
      await adminAPI.toggleContactRead(contact._id);
      loadContacts();
      setMessage('Contact status updated');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to update contact');
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      setDeleteLoading(true);
      await adminAPI.deleteContact(deleteId);
      setDeleteId(null);
      loadContacts();
      setMessage('Contact deleted');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to delete contact');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Contact Inquiries</h1>
      </div>

      {message && <div className={`p-3 rounded-xl text-sm ${message.includes('updated') || message.includes('deleted') ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>{message}</div>}

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" placeholder="Search inquiries..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1a4d3a]/20 focus:border-[#1a4d3a]" />
        </div>
        <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} options={[{ value: '', label: 'All' }, { value: 'false', label: 'Unread' }, { value: 'true', label: 'Read' }]} />
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Name</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Email</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Subject</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Message</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Status</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Date</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <SkeletonRow cols={7} />
              ) : filteredContacts.length === 0 ? (
                <tr><td colSpan={7}><EmptyState icon={MessageSquare} title="No inquiries found" subtitle="Try adjusting your search or filters" /></td></tr>
              ) : (
                filteredContacts.map((c) => (
                  <tr key={c._id} className={`border-b border-gray-50 hover:bg-gray-50/50 ${!c.isRead ? 'bg-blue-50/30' : ''}`}>
                    <td className="px-4 py-3 font-medium text-gray-900">{c.name}</td>
                    <td className="px-4 py-3 text-gray-600">{c.email}</td>
                    <td className="px-4 py-3 text-gray-900">{c.subject}</td>
                    <td className="px-4 py-3 text-gray-600 max-w-xs line-clamp-1">{c.message}</td>
                    <td className="px-4 py-3"><Badge color={c.isRead ? 'green' : 'blue'}>{c.isRead ? 'Read' : 'New'}</Badge></td>
                    <td className="px-4 py-3 text-gray-500">{new Date(c.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => setViewContact(c)} className="p-1.5 hover:bg-blue-50 rounded-lg text-gray-400 hover:text-blue-600 transition-colors"><Eye className="w-4 h-4" /></button>
                        <button onClick={() => handleToggleRead(c)} className="p-1.5 hover:bg-green-50 rounded-lg text-gray-400 hover:text-green-600 transition-colors" title={c.isRead ? 'Mark Unread' : 'Mark Read'}>
                          <CheckCircle className="w-4 h-4" />
                        </button>
                        <button onClick={() => setDeleteId(c._id)} className="p-1.5 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-600 transition-colors"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={!!viewContact} onClose={() => setViewContact(null)} title="Inquiry Details" maxWidth="max-w-lg">
        {viewContact && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-gray-50 rounded-xl">
                <p className="text-xs text-gray-500">Name</p>
                <p className="text-sm font-medium text-gray-900">{viewContact.name}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-xl">
                <p className="text-xs text-gray-500">Email</p>
                <p className="text-sm font-medium text-gray-900">{viewContact.email}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-xl">
                <p className="text-xs text-gray-500">Phone</p>
                <p className="text-sm font-medium text-gray-900">{viewContact.phone || 'N/A'}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-xl">
                <p className="text-xs text-gray-500">Date</p>
                <p className="text-sm font-medium text-gray-900">{new Date(viewContact.createdAt).toLocaleString()}</p>
              </div>
            </div>
            <div className="p-4 bg-gray-50 rounded-xl">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Subject</p>
              <p className="text-sm font-medium text-gray-900">{viewContact.subject}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-xl">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Message</p>
              <p className="text-sm text-gray-700 leading-relaxed">{viewContact.message}</p>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} title="Delete Inquiry" message="Are you sure you want to delete this inquiry?" loading={deleteLoading} />
    </div>
  );
};

/* ─── Main Admin Dashboard ─── */
const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/admin/login');
      return;
    }
    loadDashboard();
  }, [navigate]);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const { data } = await adminAPI.getDashboard();
      setStats(data.stats);
    } catch {
      localStorage.removeItem('adminToken');
      navigate('/admin/login');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/admin/login');
  };

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'orders', label: 'Orders', icon: ShoppingCart },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'reviews', label: 'Reviews', icon: Star },
    { id: 'coupons', label: 'Coupons', icon: Tag },
    { id: 'contacts', label: 'Contacts', icon: MessageSquare },
  ];

  const renderTab = () => {
    switch (activeTab) {
      case 'dashboard': return <DashboardModule stats={stats} loading={loading} />;
      case 'products': return <ProductsModule />;
      case 'orders': return <OrdersModule />;
      case 'users': return <UsersModule />;
      case 'reviews': return <ReviewsModule />;
      case 'coupons': return <CouponsModule />;
      case 'contacts': return <ContactsModule />;
      default: return <DashboardModule stats={stats} loading={loading} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className="w-64 bg-[#1a1a1a] text-white fixed h-full overflow-y-auto z-40">
        <div className="p-6">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#1a4d3a] rounded-lg flex items-center justify-center">
              <span className="font-bold text-sm">E</span>
            </div>
            <span className="font-bold">Eviga Admin</span>
          </Link>
        </div>
        <nav className="px-3 pb-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors mb-1 ${
                activeTab === tab.id ? 'bg-[#1a4d3a] text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors mt-4"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </nav>
      </aside>

      <main className="flex-1 ml-64 p-8 min-w-0">
        {renderTab()}
      </main>
    </div>
  );
};

export default AdminDashboard;
