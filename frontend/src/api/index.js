import API from './axios.js';

export const authAPI = {
  register: (data) => API.post('/auth/register', data),
  login: (data) => API.post('/auth/login', data),
  logout: () => API.post('/auth/logout'),
  getMe: () => API.get('/auth/me'),
  forgotPassword: (data) => API.post('/auth/forgot-password', data),
  resetPassword: (token, data) => API.put(`/auth/reset-password/${token}`, data),
};

export const userAPI = {
  getProfile: () => API.get('/users/profile'),
  updateProfile: (data) => API.put('/users/profile', data),
  changePassword: (data) => API.put('/users/password', data),
  addAddress: (data) => API.post('/users/address', data),
  updateAddress: (id, data) => API.put(`/users/address/${id}`, data),
  deleteAddress: (id) => API.delete(`/users/address/${id}`),
};

export const productAPI = {
  getProducts: (params) => API.get('/products', { params }),
  getProductBySlug: (slug) => API.get(`/products/slug/${slug}`),
  getProductById: (id) => API.get(`/products/${id}`),
  getFeatured: () => API.get('/products/featured'),
  getBrands: () => API.get('/products/brands'),
};

export const categoryAPI = {
  getCategories: () => API.get('/categories'),
};

export const cartAPI = {
  getCart: () => API.get('/cart'),
  addToCart: (data) => API.post('/cart/add', data),
  updateItem: (data) => API.put('/cart/update', data),
  removeItem: (productId) => API.delete(`/cart/remove/${productId}`),
  clearCart: () => API.delete('/cart/clear'),
  applyCoupon: (data) => API.post('/cart/coupon', data),
  removeCoupon: () => API.delete('/cart/coupon'),
};

export const wishlistAPI = {
  getWishlist: () => API.get('/wishlist'),
  addToWishlist: (data) => API.post('/wishlist/add', data),
  removeFromWishlist: (productId) => API.delete(`/wishlist/remove/${productId}`),
};

export const orderAPI = {
  createOrder: (data) => API.post('/orders', data),
  verifyPayment: (data) => API.post('/orders/verify-payment', data),
  getMyOrders: () => API.get('/orders/my-orders'),
  getOrderById: (id) => API.get(`/orders/${id}`),
  cancelOrder: (id) => API.put(`/orders/${id}/cancel`),
};

export const reviewAPI = {
  createReview: (data) => API.post('/reviews', data),
  getProductReviews: (productId) => API.get(`/reviews/product/${productId}`),
  getMyReviews: () => API.get('/reviews/my-reviews'),
};

export const adminAPI = {
  login: (data) => API.post('/admin/login', data),
  getDashboard: () => API.get('/admin/dashboard'),
  getAdmins: () => API.get('/admin/admins'),
  createAdmin: (data) => API.post('/admin/admins', data),
  updateAdmin: (id, data) => API.put(`/admin/admins/${id}`, data),
  deleteAdmin: (id) => API.delete(`/admin/admins/${id}`),
  // Products
  getAllProducts: (params) => API.get('/products', { params, _admin: true }),
  createProduct: (formData) => API.post('/products', formData, { headers: { 'Content-Type': undefined }, _admin: true }),
  updateProduct: (id, formData) => API.put(`/products/${id}`, formData, { headers: { 'Content-Type': undefined }, _admin: true }),
  deleteProduct: (id) => API.delete(`/products/${id}`, { _admin: true }),
  // Orders
  getAllOrders: (params) => API.get('/orders', { params, _admin: true }),
  updateOrderStatus: (id, data) => API.put(`/orders/${id}/status`, data, { _admin: true }),
  getOrderStats: () => API.get('/orders/stats', { _admin: true }),
  // Users
  getAllUsers: () => API.get('/users', { _admin: true }),
  getUserById: (id) => API.get(`/users/${id}`, { _admin: true }),
  updateUserStatus: (id, data) => API.put(`/users/${id}/status`, data, { _admin: true }),
  // Reviews
  getAllReviews: () => API.get('/reviews', { _admin: true }),
  toggleReviewApproval: (id) => API.put(`/reviews/${id}/approve`, null, { _admin: true }),
  deleteReview: (id) => API.delete(`/reviews/${id}/admin`, { _admin: true }),
  // Coupons
  getCoupons: () => API.get('/coupons', { _admin: true }),
  getCouponById: (id) => API.get(`/coupons/${id}`, { _admin: true }),
  createCoupon: (data) => API.post('/coupons', data, { _admin: true }),
  updateCoupon: (id, data) => API.put(`/coupons/${id}`, data, { _admin: true }),
  deleteCoupon: (id) => API.delete(`/coupons/${id}`, { _admin: true }),
  // Contacts
  getContacts: (params) => API.get('/contact', { params, _admin: true }),
  getContactById: (id) => API.get(`/contact/${id}`, { _admin: true }),
  toggleContactRead: (id) => API.put(`/contact/${id}/read`, null, { _admin: true }),
  deleteContact: (id) => API.delete(`/contact/${id}`, { _admin: true }),
};
