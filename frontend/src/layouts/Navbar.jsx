import { useState, useEffect, useMemo, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Menu, X, Search, Heart, ShoppingCart, User, MapPin, ChevronDown, LogOut
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useCart } from '../contexts/CartContext.jsx';
import { categoryAPI } from '../api/index.js';

/* ─── Fallback categories (visible when API returns empty) ─── */
const FALLBACK_CATEGORIES = [
  // Cancer Care
  { _id: 'cancer-care', name: 'Cancer Care', order: 1 },
  { _id: 'breast-cancer', name: 'Breast Cancer', order: 1, parent: 'cancer-care' },
  { _id: 'blood-cancer', name: 'Blood Cancer', order: 2, parent: 'cancer-care' },
  { _id: 'colon-cancer', name: 'Colon Cancer', order: 3, parent: 'cancer-care' },
  { _id: 'prostate-cancer', name: 'Prostate Cancer', order: 4, parent: 'cancer-care' },
  { _id: 'lung-cancer', name: 'Lung Cancer', order: 5, parent: 'cancer-care' },
  { _id: 'multiple-myeloma', name: 'Multiple Myeloma', order: 6, parent: 'cancer-care' },
  { _id: 'kidney-cancer', name: 'Kidney Cancer', order: 7, parent: 'cancer-care' },
  { _id: 'cervical-cancer', name: 'Cervical Cancer', order: 8, parent: 'cancer-care' },
  { _id: 'liver-cancer', name: 'Liver Cancer', order: 9, parent: 'cancer-care' },
  { _id: 'ovarian-cancer', name: 'Ovarian Cancer', order: 10, parent: 'cancer-care' },
  { _id: 'pancreatic-cancer', name: 'Pancreatic Cancer', order: 11, parent: 'cancer-care' },
  { _id: 'thyroid-cancer', name: 'Thyroid Cancer', order: 12, parent: 'cancer-care' },

  // Skin Care
  { _id: 'skin-care', name: 'Skin Care', order: 2 },
  { _id: 'acne-care', name: 'Acne Care', order: 1, parent: 'skin-care' },
  { _id: 'anti-aging', name: 'Anti-Aging', order: 2, parent: 'skin-care' },
  { _id: 'moisturizers', name: 'Moisturizers', order: 3, parent: 'skin-care' },
  { _id: 'sunscreen', name: 'Sunscreen', order: 4, parent: 'skin-care' },
  { _id: 'cleansers', name: 'Cleansers', order: 5, parent: 'skin-care' },
  { _id: 'face-masks', name: 'Face Masks', order: 6, parent: 'skin-care' },
  { _id: 'serums', name: 'Serums', order: 7, parent: 'skin-care' },
  { _id: 'body-care', name: 'Body Care', order: 8, parent: 'skin-care' },

  // Dental Care
  { _id: 'dental-care', name: 'Dental Care', order: 3 },
  { _id: 'toothpaste', name: 'Toothpaste', order: 1, parent: 'dental-care' },
  { _id: 'mouthwash', name: 'Mouthwash', order: 2, parent: 'dental-care' },
  { _id: 'toothbrushes', name: 'Toothbrushes', order: 3, parent: 'dental-care' },
  { _id: 'dental-floss', name: 'Dental Floss', order: 4, parent: 'dental-care' },
  { _id: 'teeth-whitening', name: 'Teeth Whitening', order: 5, parent: 'dental-care' },
  { _id: 'gum-care', name: 'Gum Care', order: 6, parent: 'dental-care' },
  { _id: 'oral-care-kits', name: 'Oral Care Kits', order: 7, parent: 'dental-care' },

  // Wellness
  { _id: 'wellness', name: 'Wellness', order: 4 },
  { _id: 'immunity-boosters', name: 'Immunity Boosters', order: 1, parent: 'wellness' },
  { _id: 'stress-relief', name: 'Stress Relief', order: 2, parent: 'wellness' },
  { _id: 'sleep-aids', name: 'Sleep Aids', order: 3, parent: 'wellness' },
  { _id: 'detox', name: 'Detox', order: 4, parent: 'wellness' },
  { _id: 'energy-boosters', name: 'Energy Boosters', order: 5, parent: 'wellness' },
  { _id: 'herbal-remedies', name: 'Herbal Remedies', order: 6, parent: 'wellness' },
  { _id: 'aromatherapy', name: 'Aromatherapy', order: 7, parent: 'wellness' },

  // Reproductive Care
  { _id: 'reproductive-care', name: 'Reproductive Care', order: 5 },
  { _id: 'pregnancy-care', name: 'Pregnancy Care', order: 1, parent: 'reproductive-care' },
  { _id: 'fertility', name: 'Fertility', order: 2, parent: 'reproductive-care' },
  { _id: 'menstrual-health', name: 'Menstrual Health', order: 3, parent: 'reproductive-care' },
  { _id: 'menopause', name: 'Menopause', order: 4, parent: 'reproductive-care' },
  { _id: 'sexual-wellness', name: 'Sexual Wellness', order: 5, parent: 'reproductive-care' },
  { _id: 'contraceptives', name: 'Contraceptives', order: 6, parent: 'reproductive-care' },
  { _id: 'postpartum', name: 'Postpartum', order: 7, parent: 'reproductive-care' },

  // Heart Care
  { _id: 'heart-care', name: 'Heart Care', order: 6 },
  { _id: 'blood-pressure', name: 'Blood Pressure', order: 1, parent: 'heart-care' },
  { _id: 'cholesterol', name: 'Cholesterol', order: 2, parent: 'heart-care' },
  { _id: 'heart-supplements', name: 'Heart Supplements', order: 3, parent: 'heart-care' },
  { _id: 'cardiac-devices', name: 'Cardiac Devices', order: 4, parent: 'heart-care' },
  { _id: 'stroke-prevention', name: 'Stroke Prevention', order: 5, parent: 'heart-care' },
  { _id: 'heart-health-kits', name: 'Heart Health Kits', order: 6, parent: 'heart-care' },

  // Nutrition
  { _id: 'nutrition', name: 'Nutrition', order: 7 },
  { _id: 'protein-supplements', name: 'Protein Supplements', order: 1, parent: 'nutrition' },
  { _id: 'vitamins', name: 'Vitamins', order: 2, parent: 'nutrition' },
  { _id: 'minerals', name: 'Minerals', order: 3, parent: 'nutrition' },
  { _id: 'weight-management', name: 'Weight Management', order: 4, parent: 'nutrition' },
  { _id: 'meal-replacements', name: 'Meal Replacements', order: 5, parent: 'nutrition' },
  { _id: 'digestive-health', name: 'Digestive Health', order: 6, parent: 'nutrition' },
  { _id: 'superfoods', name: 'Superfoods', order: 7, parent: 'nutrition' },

  // Fitness
  { _id: 'fitness', name: 'Fitness', order: 8 },
  { _id: 'protein-powders', name: 'Protein Powders', order: 1, parent: 'fitness' },
  { _id: 'pre-workout', name: 'Pre-Workout', order: 2, parent: 'fitness' },
  { _id: 'post-workout', name: 'Post-Workout', order: 3, parent: 'fitness' },
  { _id: 'energy-drinks', name: 'Energy Drinks', order: 4, parent: 'fitness' },
  { _id: 'sports-nutrition', name: 'Sports Nutrition', order: 5, parent: 'fitness' },
  { _id: 'recovery-aids', name: 'Recovery Aids', order: 6, parent: 'fitness' },
  { _id: 'gym-accessories', name: 'Gym Accessories', order: 7, parent: 'fitness' },

  // Diabetes
  { _id: 'diabetes', name: 'Diabetes', order: 9 },
  { _id: 'blood-sugar-monitors', name: 'Blood Sugar Monitors', order: 1, parent: 'diabetes' },
  { _id: 'insulin', name: 'Insulin', order: 2, parent: 'diabetes' },
  { _id: 'diabetic-foot-care', name: 'Diabetic Foot Care', order: 3, parent: 'diabetes' },
  { _id: 'diabetic-supplements', name: 'Diabetic Supplements', order: 4, parent: 'diabetes' },
  { _id: 'test-strips', name: 'Test Strips', order: 5, parent: 'diabetes' },
  { _id: 'lancets', name: 'Lancets', order: 6, parent: 'diabetes' },
  { _id: 'diabetic-socks', name: 'Diabetic Socks', order: 7, parent: 'diabetes' },

  // Pet Care
  { _id: 'pet-care', name: 'Pet Care', order: 10 },
  { _id: 'pet-food', name: 'Pet Food', order: 1, parent: 'pet-care' },
  { _id: 'pet-supplements', name: 'Pet Supplements', order: 2, parent: 'pet-care' },
  { _id: 'pet-grooming', name: 'Pet Grooming', order: 3, parent: 'pet-care' },
  { _id: 'pet-medicines', name: 'Pet Medicines', order: 4, parent: 'pet-care' },
  { _id: 'pet-accessories', name: 'Pet Accessories', order: 5, parent: 'pet-care' },
  { _id: 'pet-dental-care', name: 'Pet Dental Care', order: 6, parent: 'pet-care' },
  { _id: 'pet-flea-tick', name: 'Pet Flea & Tick', order: 7, parent: 'pet-care' },
];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState([]);
  const [catLoading, setCatLoading] = useState(true);
  const dropdownTimeoutRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const { itemCount } = useCart();

  const openDropdown = (id) => {
    if (dropdownTimeoutRef.current) {
      clearTimeout(dropdownTimeoutRef.current);
      dropdownTimeoutRef.current = null;
    }
    setActiveDropdown(id);
  };

  const closeDropdown = () => {
    dropdownTimeoutRef.current = setTimeout(() => {
      setActiveDropdown(null);
    }, 200);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/medicines?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
    setActiveDropdown(null);
  }, [location]);

  useEffect(() => {
    return () => {
      if (dropdownTimeoutRef.current) {
        clearTimeout(dropdownTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        setCatLoading(true);
        const { data } = await categoryAPI.getCategories();
        console.log('[Navbar] API response:', data);
        const cats = data?.categories || [];
        console.log('[Navbar] Categories count:', cats.length, 'First:', cats[0]);
        setCategories(cats);
      } catch (err) {
        console.error('[Navbar] Failed to load categories:', err);
        setCategories([]);
      } finally {
        setCatLoading(false);
      }
    };
    loadCategories();
  }, []);

  const { parentCategories, childMap } = useMemo(() => {
    const effectiveCategories = categories.length > 0 ? categories : FALLBACK_CATEGORIES;
    const parents = effectiveCategories.filter((c) => !c.parent).sort((a, b) => (a.order || 0) - (b.order || 0));
    const children = {};
    parents.forEach((p) => {
      children[p._id] = effectiveCategories.filter((c) => c.parent === p._id || c.parent?._id === p._id).sort((a, b) => (a.order || 0) - (b.order || 0));
    });
    return { parentCategories: parents, childMap: children };
  }, [categories]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const CategoryLink = ({ cat, className, onClick }) => (
    <Link
      to={`/healthcare?category=${cat._id}`}
      className={className}
      onClick={onClick}
    >
      {cat.name}
    </Link>
  );

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 bg-white transition-shadow duration-300 ${scrolled ? 'shadow-sm' : ''}`}>
      <div className="container-custom">
        <div className="flex items-center justify-between h-16 lg:h-[72px]">
          <Link to="/" className="flex items-center gap-2.5 shrink-0">
            <div className="w-9 h-9 bg-[#1a4d3a] rounded-lg flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2v20M2 12h20" />
                <circle cx="12" cy="12" r="10" strokeWidth="1.5" />
              </svg>
            </div>
            <span className="text-xl font-bold text-[#1a4d3a]">Eviga Pharma</span>
          </Link>

          <form onSubmit={handleSearch} className="hidden lg:flex flex-1 max-w-xl mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for medicines, brands..."
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#1a4d3a]/20 focus:border-[#1a4d3a] transition-all"
              />
            </div>
          </form>

          <div className="flex items-center gap-1 sm:gap-3">
            <button className="hidden md:flex items-center gap-1.5 px-2 py-1.5 hover:bg-gray-50 rounded-lg transition-colors">
              <MapPin className="w-4 h-4 text-gray-600" />
              <span className="text-sm text-gray-700">Las Piñas</span>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
            </button>

            <Link to="/wishlist" className="p-2 hover:bg-gray-50 rounded-full transition-colors">
              <Heart className="w-5 h-5 text-gray-600" />
            </Link>
            <Link to="/cart" className="relative p-2 hover:bg-gray-50 rounded-full transition-colors">
              <ShoppingCart className="w-5 h-5 text-gray-600" />
              {itemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-[#1a4d3a] text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
                  {itemCount > 99 ? '99+' : itemCount}
                </span>
              )}
            </Link>

            {isAuthenticated ? (
              <div className="relative group">
                <button className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded-full transition-colors">
                  <div className="w-8 h-8 bg-[#1a4d3a]/10 rounded-full flex items-center justify-center">
                    <span className="text-[#1a4d3a] font-bold text-xs">{user?.name?.[0] || 'U'}</span>
                  </div>
                </button>
                <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                  <Link to="/profile" className="block px-4 py-2 text-sm text-gray-600 hover:text-[#1a4d3a] hover:bg-gray-50">My Profile</Link>
                  <Link to="/orders" className="block px-4 py-2 text-sm text-gray-600 hover:text-[#1a4d3a] hover:bg-gray-50">My Orders</Link>
                  <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50">Logout</button>
                </div>
              </div>
            ) : (
              <Link to="/login" className="p-2 hover:bg-gray-50 rounded-full transition-colors">
                <User className="w-5 h-5 text-gray-600" />
              </Link>
            )}

            <button onClick={() => setIsOpen(!isOpen)} className="lg:hidden p-2 hover:bg-gray-50 rounded-full transition-colors">
              {isOpen ? <X className="w-5 h-5 text-gray-600" /> : <Menu className="w-5 h-5 text-gray-600" />}
            </button>
          </div>
        </div>
      </div>

      {/* ─── Desktop category bar with simple vertical dropdowns ─── */}
      <div className="hidden lg:block border-t border-gray-100">
        <div className="container-custom">
          {catLoading ? (
            <div className="flex items-center gap-1 h-11">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="px-3 py-2 h-8 w-24 bg-gray-100 rounded-md animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-0.5 h-11">
              {parentCategories.map((cat) => {
                const children = childMap[cat._id] || [];
                const hasChildren = children.length > 0;
                return (
                  <div
                    key={cat._id}
                    className="relative"
                    onMouseEnter={() => hasChildren && openDropdown(cat._id)}
                    onMouseLeave={closeDropdown}
                  >
                    <button
                      className={`flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
                        activeDropdown === cat._id
                          ? 'text-[#1a4d3a] bg-[#1a4d3a]/10'
                          : 'text-gray-700 hover:text-[#1a4d3a] hover:bg-gray-50'
                      }`}
                    >
                      {cat.name}
                      {hasChildren && (
                        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${activeDropdown === cat._id ? 'rotate-180' : ''}`} />
                      )}
                    </button>

                    {hasChildren && activeDropdown === cat._id && (
                      <div className="absolute top-full left-0 w-52 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-50">
                        {children.map((child) => (
                          <Link
                            key={child._id}
                            to={`/healthcare?category=${child._id}`}
                            className="block px-4 py-2 text-sm text-gray-700 hover:text-[#1a4d3a] hover:bg-gray-50 transition-colors"
                            onClick={() => setActiveDropdown(null)}
                          >
                            {child.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ─── Mobile menu ─── */}
      {isOpen && (
        <div className="lg:hidden bg-white border-t border-gray-100 shadow-lg max-h-[80vh] overflow-y-auto">
          <div className="container-custom py-4 space-y-1">
            <form onSubmit={handleSearch} className="relative mb-4">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for medicines, brands..."
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#1a4d3a]/20 focus:border-[#1a4d3a]"
              />
            </form>
            <button className="flex items-center gap-2 w-full px-4 py-3 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
              <MapPin className="w-4 h-4" /> Las Piñas <ChevronDown className="w-3.5 h-3.5 ml-auto" />
            </button>
            {isAuthenticated && (
              <>
                <Link to="/profile" className="flex items-center gap-2 w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                  <User className="w-4 h-4" /> My Profile
                </Link>
                <Link to="/orders" className="flex items-center gap-2 w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                  <ShoppingCart className="w-4 h-4" /> My Orders
                </Link>
                <button onClick={handleLogout} className="flex items-center gap-2 w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                  <LogOut className="w-4 h-4" /> Logout
                </button>
              </>
            )}
            {!isAuthenticated && (
              <Link to="/login" className="flex items-center gap-2 w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                <User className="w-4 h-4" /> Sign In
              </Link>
            )}
            <div className="pt-2 border-t border-gray-100 mt-2">
              <p className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Categories</p>
              {catLoading ? (
                [1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="px-4 py-3 h-8 bg-gray-100 rounded-lg animate-pulse mb-1" />
                ))
              ) : (
                parentCategories.map((cat) => (
                  <div key={cat._id}>
                    <CategoryLink
                      cat={cat}
                      className="block px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                    />
                    {(childMap[cat._id] || []).map((child) => (
                      <CategoryLink
                        key={child._id}
                        cat={child}
                        className="block px-4 py-2 text-sm text-gray-500 hover:text-[#1a4d3a] hover:bg-gray-50 rounded-lg transition-colors pl-8"
                      />
                    ))}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
