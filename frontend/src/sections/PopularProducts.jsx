import { useState, useEffect } from 'react';
import { Star, ArrowRight, ShoppingCart, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { productAPI } from '../api/index.js';
import { useCart } from '../contexts/CartContext.jsx';

const PopularProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { addToCart } = useCart();

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await productAPI.getProducts({ limit: 8 });
      console.log('[PopularProducts] API response:', data);
      const prods = data?.products || [];
      console.log('[PopularProducts] Products count:', prods.length);
      setProducts(prods);
    } catch (err) {
      console.error('[PopularProducts] Failed to load products:', err);
      setError(err?.response?.data?.message || err.message || 'Failed to load products');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="py-12 lg:py-16 bg-white">
        <div className="container-custom">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-8 animate-pulse" />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white border border-gray-100 rounded-2xl p-4 animate-pulse">
                <div className="aspect-square bg-gray-200 rounded-xl mb-3" />
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                <div className="h-4 bg-gray-200 rounded w-1/2" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-12 lg:py-16 bg-white">
        <div className="container-custom text-center">
          <p className="text-red-500 mb-2">{error}</p>
          <button
            onClick={loadProducts}
            className="px-4 py-2 bg-[#1a4d3a] text-white rounded-lg text-sm hover:bg-[#143d2e] transition-colors"
          >
            Retry
          </button>
        </div>
      </section>
    );
  }

  if (products.length === 0) {
    return (
      <section className="py-12 lg:py-16 bg-white">
        <div className="container-custom text-center">
          <p className="text-gray-500">No products available.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 lg:py-16 bg-white">
      <div className="container-custom">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">Popular Products</h2>
            <p className="text-sm text-gray-500 mt-1">Most trusted by our customers</p>
          </div>
          <Link to="/medicines" className="hidden sm:flex items-center gap-1 text-[#1a4d3a] font-medium text-sm hover:underline">
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
          {products.map((product) => (
            <div
              key={product._id}
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
                  <button className="absolute top-3 right-3 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50">
                    <Heart className="w-4 h-4 text-gray-600 hover:text-red-500" />
                  </button>
                </div>
              </Link>

              <div className="p-3 lg:p-4">
                <p className="text-xs text-gray-500 font-medium mb-1">{product.brand}</p>
                <Link to={`/product/${product.slug}`}>
                  <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 mb-2 min-h-[2.5rem] hover:text-[#1a4d3a]">
                    {product.name}
                  </h3>
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
                    <span className="text-lg font-bold text-gray-900">₹{product.discountPrice || product.price}</span>
                    {product.discountPrice > 0 && (
                      <span className="text-sm text-gray-400 line-through">₹{product.price}</span>
                    )}
                  </div>
                  <button
                    onClick={() => addToCart(product, 1)}
                    className="w-8 h-8 bg-[#1a4d3a]/10 hover:bg-[#1a4d3a] rounded-full flex items-center justify-center transition-colors group/btn"
                  >
                    <ShoppingCart className="w-4 h-4 text-[#1a4d3a] group-hover/btn:text-white transition-colors" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="sm:hidden mt-6 text-center">
          <Link to="/medicines" className="inline-flex items-center gap-1 text-[#1a4d3a] font-medium text-sm">
            View All Products <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default PopularProducts;
