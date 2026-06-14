import { Link } from 'react-router-dom';
import { Facebook, X, Instagram, Youtube, Linkedin, Mail, Phone, MapPin, CreditCard, Shield, Truck, Heart } from 'lucide-react';

const Footer = () => {
  const footerLinks = {
    'Company': ['About Us', 'Careers', 'Blog', 'Press', 'Partners'],
    'Support': ['Contact Us', 'FAQs', 'Shipping Info', 'Returns', 'Order Tracking'],
    'Policies': ['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'Refund Policy', 'Disclaimer'],
    'Services': ['Doctor Consultation', 'Lab Tests', 'Health Articles', 'Insurance', 'Corporate Wellness'],
  };

  return (
    <footer className="bg-[#1a1a1a] text-gray-300">
      {/* Features bar */}
      <div className="border-b border-gray-800">
        <div className="container-custom py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#1a4d3a]/30 rounded-full flex items-center justify-center shrink-0">
                <Shield className="w-5 h-5 text-[#4ade80]" />
              </div>
              <div>
                <p className="text-white font-medium text-sm">100% Genuine</p>
                <p className="text-xs text-gray-500">Certified products only</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#1a4d3a]/30 rounded-full flex items-center justify-center shrink-0">
                <Truck className="w-5 h-5 text-[#4ade80]" />
              </div>
              <div>
                <p className="text-white font-medium text-sm">Free Shipping</p>
                <p className="text-xs text-gray-500">On orders above ₹500</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#1a4d3a]/30 rounded-full flex items-center justify-center shrink-0">
                <CreditCard className="w-5 h-5 text-[#4ade80]" />
              </div>
              <div>
                <p className="text-white font-medium text-sm">Secure Payment</p>
                <p className="text-xs text-gray-500">Encrypted transactions</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#1a4d3a]/30 rounded-full flex items-center justify-center shrink-0">
                <Heart className="w-5 h-5 text-[#4ade80]" />
              </div>
              <div>
                <p className="text-white font-medium text-sm">24/7 Support</p>
                <p className="text-xs text-gray-500">Always here to help</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main footer */}
      <div className="container-custom py-12">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
          {/* Brand column */}
          <div className="col-span-2 md:col-span-3 lg:col-span-2">
            <Link to="/" className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 bg-[#1a4d3a] rounded-lg flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2v20M2 12h20" />
                  <circle cx="12" cy="12" r="10" strokeWidth="1.5" />
                </svg>
              </div>
              <span className="text-lg font-bold text-white">Eviga Pharma</span>
            </Link>
            <p className="text-sm text-gray-400 mb-4 max-w-xs">
              Your trusted online pharmacy for genuine medicines, healthcare products, and wellness solutions delivered to your doorstep.
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Phone className="w-4 h-4 text-[#4ade80]" />
                <span>1800-123-4567 (Toll Free)</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Mail className="w-4 h-4 text-[#4ade80]" />
                <span>support@evigapharma.com</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <MapPin className="w-4 h-4 text-[#4ade80]" />
                <span>Las Piñas, Philippines</span>
              </div>
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="text-white font-semibold text-sm mb-4">{title}</h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link}>
                    <Link
                      to="#"
                      className="text-sm text-gray-400 hover:text-[#4ade80] transition-colors"
                    >
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-800">
        <div className="container-custom py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-500">
              © {new Date().getFullYear()} Eviga Pharma. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500">Follow us:</span>
              <div className="flex items-center gap-3">
                <a href="#" target="_blank" rel="noopener noreferrer" className="w-8 h-8 bg-gray-800 hover:bg-[#1a4d3a] rounded-full flex items-center justify-center transition-colors">
                  <Facebook className="w-4 h-4 text-white" />
                </a>
                <a href="#" target="_blank" rel="noopener noreferrer" className="w-8 h-8 bg-gray-800 hover:bg-[#1a4d3a] rounded-full flex items-center justify-center transition-colors">
                  <X className="w-4 h-4 text-white" />
                </a>
                <a href="https://www.instagram.com/eviga_pharma/" target="_blank" rel="noopener noreferrer" className="w-8 h-8 bg-gray-800 hover:bg-[#1a4d3a] rounded-full flex items-center justify-center transition-colors">
                  <Instagram className="w-4 h-4 text-white" />
                </a>
                <a href="https://www.youtube.com/@EvigaPharma" target="_blank" rel="noopener noreferrer" className="w-8 h-8 bg-gray-800 hover:bg-[#1a4d3a] rounded-full flex items-center justify-center transition-colors">
                  <Youtube className="w-4 h-4 text-white" />
                </a>
                <a href="https://linkedin.com/in/eviga-pharma-961547413/" target="_blank" rel="noopener noreferrer" className="w-8 h-8 bg-gray-800 hover:bg-[#1a4d3a] rounded-full flex items-center justify-center transition-colors">
                  <Linkedin className="w-4 h-4 text-white" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
