import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { categoryAPI, productAPI } from '../api/index.js';

/* ─── Curated homepage category images ─── */
const CATEGORY_IMAGES = {
  'Cancer Care': 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=400&h=400&fit=crop',
  'Skin Care': 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&h=400&fit=crop',
  'Dental Care': 'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=400&h=400&fit=crop',
  'Wellness': 'https://images.unsplash.com/photo-1559757175-5700dde675bc?w=400&h=400&fit=crop',
  'Reproductive Care': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop',
  'Heart Care': 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=400&h=400&fit=crop',
  'Nutrition': 'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=400&h=400&fit=crop',
  'Fitness': 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400&h=400&fit=crop',
  'Diabetes': 'https://images.unsplash.com/photo-1581594693702-fbdc51b2763b?w=400&h=400&fit=crop',
  'Pet Care': 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400&h=400&fit=crop',
};

const ShopByCategory = () => {
  const [categories, setCategories] = useState([]);
  const [productCounts, setProductCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [catRes, prodRes] = await Promise.all([
        categoryAPI.getCategories(),
        productAPI.getProducts({ limit: 500, status: 'all' }),
      ]);

      const allCats = catRes.data?.categories || [];
      const allProducts = prodRes.data?.products || [];

      console.log('[ShopByCategory] Categories:', allCats.length);
      console.log('[ShopByCategory] Products:', allProducts.length);

      // Only parent categories (no parent field → null or missing)
      const parentCats = allCats.filter((c) => !c.parent);
      console.log('[ShopByCategory] Parent categories:', parentCats.length);

      // Count products per category (include subcategories for parent counts)
      const counts = {};
      parentCats.forEach((cat) => {
        const subIds = allCats
          .filter((c) => String(c.parent) === String(cat._id))
          .map((c) => String(c._id));
        const allIds = [String(cat._id), ...subIds];
        counts[cat._id] = allProducts.filter((p) => {
          const prodCatId = String(p.category?._id || p.category);
          return allIds.includes(prodCatId);
        }).length;
      });
      setProductCounts(counts);
      setCategories(parentCats);
    } catch (err) {
      console.error('[ShopByCategory] Failed to load:', err);
      setError(err?.response?.data?.message || err.message || 'Failed to load data');
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="py-12 lg:py-16 bg-white">
        <div className="container-custom">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-8 animate-pulse" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[4/5] bg-gray-200 rounded-2xl mb-3" />
                <div className="h-4 bg-gray-200 rounded w-2/3 mx-auto mb-1" />
                <div className="h-3 bg-gray-200 rounded w-1/2 mx-auto" />
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
            onClick={loadData}
            className="px-4 py-2 bg-[#1a4d3a] text-white rounded-lg text-sm hover:bg-[#143d2e] transition-colors"
          >
            Retry
          </button>
        </div>
      </section>
    );
  }

  if (categories.length === 0) {
    return (
      <section className="py-12 lg:py-16 bg-white">
        <div className="container-custom text-center">
          <p className="text-gray-500">No categories available.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 lg:py-16 bg-white">
      <div className="container-custom">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">Shop by Category</h2>
            <p className="text-sm text-gray-500 mt-1">Browse our wide range of health categories</p>
          </div>
          <Link
            to="/healthcare"
            className="hidden sm:flex items-center gap-1 text-[#1a4d3a] font-semibold text-sm hover:underline"
          >
            View All
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5">
          {categories.map((category) => {
            const count = productCounts[category._id] || 0;
            const image =
              category.image || CATEGORY_IMAGES[category.name] ||
              'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=400&fit=crop';

            return (
              <div key={category._id}>
                <Link
                  to={`/healthcare?category=${category._id}`}
                  className="group block text-center"
                >
                  <div className="relative aspect-[4/5] rounded-2xl overflow-hidden mb-3 bg-gray-100 shadow-sm hover:shadow-lg transition-shadow duration-300">
                    <img
                      src={image}
                      alt={category.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-3">
                      <h3 className="text-sm font-bold text-white drop-shadow-md">
                        {category.name}
                      </h3>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 font-medium">
                    {count} {count === 1 ? 'Product' : 'Products'}
                  </p>
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ShopByCategory;
