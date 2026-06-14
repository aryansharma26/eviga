import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Tag, ShoppingCart, Star, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { productAPI } from '../api/index.js';
import { useCart } from '../contexts/CartContext.jsx';

const Offers = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const { data } = await productAPI.getProducts({ limit: 24 });
      // Filter products with discount
      const discounted = (data.products || []).filter((p) => p.discountPrice > 0);
      setProducts(discounted);
    } catch (err) {
      console.error('Failed to load offers:', err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-custom py-8">
      <Link to="/" className="inline-flex items-center gap-2 text-gray-600 hover:text-[#1a4d3a] mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Home
      </Link>

      {/* Flash banner */}
      <div className="bg-gradient-to-r from-[#1a3d2a] to-[#1a4d3a] rounded-2xl p-6 mb-8 text-white">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold mb-1">Special Offers</h1>
            <p className="text-white/80">Up to 50% off on essential medicines and healthcare products</p>
          </div>
          <div className="flex items-center gap-2 bg-white/15 rounded-lg px-4 py-2">
            <Clock className="w-4 h-4" />
            <span className="text-sm font-medium">Limited time only</span>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="bg-white border border-gray-100 rounded-2xl p-4 animate-pulse">
              <div className="aspect-square bg-gray-200 rounded-xl mb-3" />
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
              <div className="h-4 bg-gray-200 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20">
          <Tag className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No active offers at the moment</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
          {products.map((product, index) => (
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
                  <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-md">
                    -{Math.round(((product.price - product.discountPrice) / product.price) * 100)}%
                  </div>
                </div>
              </Link>
              <div className="p-3 lg:p-4">
                <p className="text-xs text-gray-500 font-medium mb-1">{product.brand}</p>
                <Link to={`/product/${product.slug}`}>
                  <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 mb-2 min-h-[2.5rem] hover:text-[#1a4d3a]">{product.name}</h3>
                </Link>
                <div className="flex items-center gap-1 mb-2">
                  <div className="flex items-center gap-0.5 bg-green-50 px-1.5 py-0.5 rounded">
                    <span className="text-xs font-semibold text-green-700">{product.rating || 0}</span>
                    <Star className="w-3 h-3 text-green-600 fill-green-600" />
                  </div>
                  <span className="text-xs text-gray-400">({product.numReviews || 0})</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-gray-900">₹{product.discountPrice}</span>
                    <span className="text-sm text-gray-400 line-through">₹{product.price}</span>
                  </div>
                  <button
                    onClick={() => addToCart(product, 1)}
                    className="w-8 h-8 bg-[#1a4d3a]/10 hover:bg-[#1a4d3a] rounded-full flex items-center justify-center transition-colors group/btn"
                  >
                    <ShoppingCart className="w-4 h-4 text-[#1a4d3a] group-hover/btn:text-white transition-colors" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Offers;
