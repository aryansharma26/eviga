import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { ArrowLeft, ShoppingCart, Heart, Star, Minus, Plus, Truck, Shield, CheckCircle } from 'lucide-react';
import { productAPI, reviewAPI, wishlistAPI } from '../api/index.js';
import { useCart } from '../contexts/CartContext.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';

const ProductDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [added, setAdded] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const { register, handleSubmit, reset } = useForm();

  useEffect(() => {
    setSelectedImage(0);
    loadProduct();
  }, [slug]);

  useEffect(() => {
    if (product && isAuthenticated) {
      checkWishlist();
    }
  }, [product, isAuthenticated]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      const { data } = await productAPI.getProductBySlug(slug);
      setProduct(data.product);
      setReviews(data.reviews || []);
    } catch (err) {
      console.error('Failed to load product:', err);
    } finally {
      setLoading(false);
    }
  };

  const checkWishlist = async () => {
    try {
      const { data } = await wishlistAPI.getWishlist();
      const wishlistProductIds = data.wishlist?.products?.map((p) => p._id || p) || [];
      setIsWishlisted(wishlistProductIds.includes(product._id));
    } catch (err) {
      console.error('Failed to check wishlist:', err);
    }
  };

  const handleAddToCart = async () => {
    if (!product) return;
    await addToCart(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleToggleWishlist = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (!product) return;
    try {
      setWishlistLoading(true);
      if (isWishlisted) {
        await wishlistAPI.removeFromWishlist(product._id);
        setIsWishlisted(false);
      } else {
        await wishlistAPI.addToWishlist({ productId: product._id });
        setIsWishlisted(true);
      }
    } catch (err) {
      console.error('Failed to toggle wishlist:', err);
    } finally {
      setWishlistLoading(false);
    }
  };

  const onSubmitReview = async (data) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    try {
      await reviewAPI.createReview({ product: product._id, rating: Number(data.rating), comment: data.comment });
      reset();
      loadProduct();
    } catch (err) {
      console.error('Failed to submit review:', err);
    }
  };

  if (loading) {
    return (
      <div className="container-custom py-4">
        <div className="animate-pulse grid grid-cols-12 gap-6">
          <div className="col-span-12 lg:col-span-5 aspect-[4/3] bg-gray-200 rounded-xl" />
          <div className="col-span-12 lg:col-span-7 space-y-3">
            <div className="h-6 bg-gray-200 rounded w-3/4" />
            <div className="h-4 bg-gray-200 rounded w-1/2" />
            <div className="h-12 bg-gray-200 rounded w-1/3" />
            <div className="h-16 bg-gray-200 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container-custom py-16 text-center">
        <p className="text-gray-500">Product not found</p>
        <Link to="/" className="text-[#1a4d3a] font-medium hover:underline mt-4 inline-block">Back to Home</Link>
      </div>
    );
  }

  const discount = product.discountPrice > 0 ? Math.round(((product.price - product.discountPrice) / product.price) * 100) : 0;

  return (
    <div className="container-custom py-4">
      <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#1a4d3a] mb-3 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Products
      </Link>

      <div className="grid grid-cols-12 gap-6">
        {/* ─── Images: 45% ─── */}
        <div className="col-span-12 lg:col-span-5">
          <div className="aspect-[4/3] bg-gray-50 rounded-xl overflow-hidden">
            <img
              src={product.images[selectedImage] || 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&h=600&fit=crop'}
              alt={product.name}
              className="w-full h-full object-contain"
            />
          </div>
          {product.images.length > 1 && (
            <div className="flex gap-2 mt-2">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`w-14 h-14 rounded-lg overflow-hidden border-2 transition-colors ${selectedImage === i ? 'border-[#1a4d3a]' : 'border-gray-200'}`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ─── Info: 55% ─── */}
        <div className="col-span-12 lg:col-span-7">
          <p className="text-sm text-gray-500 font-medium">{product.brand}</p>
          <h1 className="text-xl lg:text-2xl font-bold text-gray-900 mt-0.5 leading-snug">{product.name}</h1>

          <div className="flex items-center gap-2 mt-2">
            <div className="flex items-center gap-0.5 bg-green-50 px-2 py-1 rounded">
              <span className="text-sm font-semibold text-green-700">{product.rating || 0}</span>
              <Star className="w-3.5 h-3.5 text-green-600 fill-green-600" />
            </div>
            <span className="text-sm text-gray-400">({product.numReviews || 0} reviews)</span>
          </div>

          <div className="flex items-center gap-3 mt-3">
            <span className="text-2xl font-bold text-gray-900">₹{product.discountPrice || product.price}</span>
            {product.discountPrice > 0 && (
              <>
                <span className="text-base text-gray-400 line-through">₹{product.price}</span>
                <span className="px-2 py-0.5 bg-red-100 text-red-600 text-xs font-bold rounded">{discount}% OFF</span>
              </>
            )}
          </div>

          <p className="text-sm text-gray-600 mt-3 leading-relaxed">{product.description}</p>

          {product.benefits?.length > 0 && (
            <div className="mt-3">
              <h3 className="font-semibold text-sm text-gray-900 mb-1.5">Key Benefits</h3>
              <div className="flex flex-wrap gap-2">
                {product.benefits.map((b, i) => (
                  <span key={i} className="inline-flex items-center gap-1.5 text-xs text-gray-600 bg-gray-50 px-2.5 py-1 rounded-lg">
                    <CheckCircle className="w-3.5 h-3.5 text-green-500" /> {b}
                  </span>
                ))}
              </div>
            </div>
          )}

          {(product.composition || product.dosage) && (
            <div className="mt-3 grid grid-cols-2 gap-3">
              {product.composition && (
                <div>
                  <h3 className="font-semibold text-sm text-gray-900 mb-0.5">Composition</h3>
                  <p className="text-xs text-gray-600">{product.composition}</p>
                </div>
              )}
              {product.dosage && (
                <div>
                  <h3 className="font-semibold text-sm text-gray-900 mb-0.5">Dosage</h3>
                  <p className="text-xs text-gray-600">{product.dosage}</p>
                </div>
              )}
            </div>
          )}

          <div className="flex items-center gap-3 mt-5 pt-4 border-t border-gray-100">
            <div className="flex items-center gap-1.5">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-9 h-9 border border-gray-200 rounded-lg flex items-center justify-center hover:bg-gray-50">
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-8 text-center font-semibold text-sm">{quantity}</span>
              <button onClick={() => setQuantity(quantity + 1)} className="w-9 h-9 border border-gray-200 rounded-lg flex items-center justify-center hover:bg-gray-50">
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <button
              onClick={handleAddToCart}
              className={`flex-1 py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-colors ${
                added ? 'bg-green-500 text-white' : 'bg-[#1a4d3a] hover:bg-[#143d2e] text-white'
              }`}
            >
              <ShoppingCart className="w-4 h-4" />
              {added ? 'Added!' : 'Add to Cart'}
            </button>
            <button
              onClick={handleToggleWishlist}
              disabled={wishlistLoading}
              className={`w-11 h-11 border rounded-xl flex items-center justify-center transition-colors ${isWishlisted ? 'border-red-200 bg-red-50' : 'border-gray-200 hover:bg-red-50 hover:border-red-200'}`}
            >
              <Heart className={`w-5 h-5 transition-colors ${isWishlisted ? 'text-red-500 fill-red-500' : 'text-gray-400 hover:text-red-500'}`} />
            </button>
          </div>

          <div className="flex items-center gap-5 mt-4 text-xs text-gray-500">
            <div className="flex items-center gap-1.5">
              <Truck className="w-4 h-4" />
              <span>Free delivery above ₹500</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Shield className="w-4 h-4" />
              <span>100% Genuine</span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Reviews ─── */}
      <div className="mt-8 pt-6 border-t border-gray-100">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Customer Reviews</h2>
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 lg:col-span-4">
            <div className="bg-gray-50 rounded-xl p-5">
              <h3 className="font-semibold text-sm text-gray-900 mb-3">Write a Review</h3>
              <form onSubmit={handleSubmit(onSubmitReview)} className="space-y-3">
                <div className="relative">
                  <select {...register('rating', { required: true })} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1a4d3a]/20 focus:border-[#1a4d3a] bg-white appearance-none cursor-pointer text-gray-700">
                    <option value="">Select Rating</option>
                    {[5, 4, 3, 2, 1].map((r) => (
                      <option key={r} value={r}>{r} Stars</option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
                <textarea {...register('comment', { required: true })} placeholder="Your review..." rows={3} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1a4d3a]/20" />
                <button type="submit" className="w-full py-2.5 bg-[#1a4d3a] hover:bg-[#143d2e] text-white text-sm font-medium rounded-xl transition-colors">
                  Submit Review
                </button>
              </form>
            </div>
          </div>
          <div className="col-span-12 lg:col-span-8 space-y-3">
            {reviews.length === 0 ? (
              <p className="text-sm text-gray-500">No reviews yet. Be the first to review!</p>
            ) : (
              reviews.map((review) => (
                <div key={review._id} className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 bg-[#1a4d3a]/10 rounded-full flex items-center justify-center">
                        <span className="text-[#1a4d3a] font-bold text-xs">{review.name?.[0] || 'U'}</span>
                      </div>
                      <span className="font-medium text-sm text-gray-900">{review.name}</span>
                    </div>
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={`w-3.5 h-3.5 ${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">{review.comment}</p>
                  <p className="text-xs text-gray-400 mt-1">{new Date(review.createdAt).toLocaleDateString()}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
