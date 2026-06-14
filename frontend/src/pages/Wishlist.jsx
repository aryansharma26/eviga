import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, ArrowRight, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { wishlistAPI } from '../api/index.js';
import { useCart } from '../contexts/CartContext.jsx';

const Wishlist = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    loadWishlist();
  }, []);

  const loadWishlist = async () => {
    try {
      setLoading(true);
      const { data } = await wishlistAPI.getWishlist();
      setItems(data.wishlist?.products || []);
    } catch (err) {
      console.error('Failed to load wishlist:', err);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const removeItem = async (productId) => {
    try {
      await wishlistAPI.removeFromWishlist(productId);
      setItems((prev) => prev.filter((p) => p._id !== productId));
    } catch (err) {
      console.error('Failed to remove item:', err);
    }
  };

  const moveToCart = async (product) => {
    try {
      await addToCart(product, 1);
      await wishlistAPI.removeFromWishlist(product._id);
      setItems((prev) => prev.filter((p) => p._id !== product._id));
    } catch (err) {
      console.error('Failed to move to cart:', err);
    }
  };

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

  if (items.length === 0) {
    return (
      <div className="container-custom py-20 text-center">
        <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">Your Wishlist is Empty</h2>
        <p className="text-gray-500 mb-6">Save items you love for later.</p>
        <Link to="/medicines" className="inline-flex items-center gap-2 px-6 py-3 bg-[#1a4d3a] hover:bg-[#143d2e] text-white font-semibold rounded-xl transition-colors">
          Start Shopping <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="container-custom py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Wishlist ({items.length} items)</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
        {items.map((product, index) => (
          <motion.div
            key={product._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="group bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-lg transition-shadow"
          >
            <Link to={`/product/${product.slug}`}>
              <div className="relative aspect-square bg-gray-50 overflow-hidden">
                <img
                  src={product.images?.[0] || 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=400&fit=crop'}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {product.discountPrice > 0 && (
                  <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-md">
                    -{Math.round(((product.price - product.discountPrice) / product.price) * 100)}%
                  </div>
                )}
              </div>
            </Link>
            <div className="p-3 lg:p-4">
              <p className="text-xs text-gray-500 font-medium mb-1">{product.brand}</p>
              <Link to={`/product/${product.slug}`}>
                <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 mb-2 min-h-[2.5rem] hover:text-[#1a4d3a]">
                  {product.name}
                </h3>
              </Link>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg font-bold text-gray-900">₹{product.discountPrice || product.price}</span>
                {product.discountPrice > 0 && (
                  <span className="text-sm text-gray-400 line-through">₹{product.price}</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => moveToCart(product)}
                  className="flex-1 py-2 bg-[#1a4d3a]/10 hover:bg-[#1a4d3a] text-[#1a4d3a] hover:text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <ShoppingCart className="w-4 h-4" /> Move to Cart
                </button>
                <button
                  onClick={() => removeItem(product._id)}
                  className="p-2 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Wishlist;
