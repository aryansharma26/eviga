import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { categoryAPI } from '../api/index.js';

const QUICK_TAG_NAMES = [
  'Cancer Care',
  'Consult Doctors',   // special — goes to /consult, not a category
  'Vitamins',
  'Personal Care',
  'Diabetes',
];

const Hero = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [catLoading, setCatLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await categoryAPI.getCategories();
        setCategories(data.categories || []);
      } catch (err) {
        console.error('[Hero] Failed to load categories:', err);
        setCategories([]);
      } finally {
        setCatLoading(false);
      }
    };
    load();
  }, []);

  const getTagUrl = (name) => {
    if (name === 'Consult Doctors') return '/consult';
    const cat = categories.find((c) => c.name === name);
    if (cat) return `/healthcare?category=${cat._id}`;
    return '/healthcare';
  };

  return (
    <section className="bg-[#f5f5f0] pt-8 pb-12 lg:pt-12 lg:pb-16">
      <div className="container-custom">
        <div className="max-w-3xl mx-auto text-center">
          {/* Heading */}
          <h1 className="text-4xl sm:text-5xl lg:text-[56px] font-bold text-[#1a1a1a] leading-tight tracking-tight">
            Your Health, Delivered to Your Doorstep
          </h1>

          {/* Subtitle */}
          <p className="mt-5 text-base sm:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Genuine medicines and healthcare products. Upload prescriptions, consult doctors, and track your wellness — all in one place.
          </p>

          {/* Search bar */}
          <div className="mt-8 max-w-2xl mx-auto">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const query = e.target.search.value.trim();
                if (query) {
                  navigate(`/medicines?search=${encodeURIComponent(query)}`);
                }
              }}
              className="relative flex items-center bg-white rounded-full border border-gray-200 shadow-sm overflow-hidden"
            >
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 shrink-0" />
              <input
                name="search"
                type="text"
                placeholder="Search for medicines, brands, or health products..."
                className="w-full pl-12 pr-32 py-3.5 sm:py-4 text-sm sm:text-base text-gray-700 placeholder-gray-400 focus:outline-none"
              />
              <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 px-5 sm:px-6 py-2 sm:py-2.5 bg-[#1a4d3a] hover:bg-[#143d2e] text-white text-sm font-medium rounded-full transition-colors">
                Search
              </button>
            </form>
          </div>

          {/* Quick tags */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2.5 sm:gap-3">
            {catLoading ? (
              [1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="w-24 h-9 bg-gray-200 rounded-full animate-pulse" />
              ))
            ) : (
              QUICK_TAG_NAMES.map((name) => (
                <Link
                  key={name}
                  to={getTagUrl(name)}
                  className="px-4 py-2 bg-white border border-gray-200 rounded-full text-sm text-[#1a4d3a] hover:border-[#1a4d3a] hover:bg-[#1a4d3a]/5 transition-colors"
                >
                  {name}
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
