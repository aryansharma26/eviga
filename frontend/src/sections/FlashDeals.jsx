import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

const FlashDeals = () => {
  const [timeLeft, setTimeLeft] = useState({
    hours: 3,
    minutes: 59,
    seconds: 59,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return { hours: 3, minutes: 59, seconds: 59 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatNumber = (num) => String(num).padStart(2, '0');

  return (
    <section className="bg-[#1a3d2a] py-4">
      <div className="container-custom">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Left: Flash Deals info */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center">
              <Zap className="w-4 h-4 text-orange-400" />
            </div>
            <div>
              <h3 className="text-white font-semibold text-sm sm:text-base">Flash Deals</h3>
              <p className="text-gray-300 text-xs sm:text-sm">Up to 50% off on essential medicines</p>
            </div>
          </div>

          {/* Center: Timer */}
          <div className="flex items-center gap-2">
            <span className="text-gray-300 text-sm hidden sm:inline">Ends in</span>
            <div className="flex items-center gap-1">
              <div className="w-9 h-9 sm:w-10 sm:h-10 bg-white/15 rounded-lg flex items-center justify-center">
                <span className="text-base sm:text-lg font-bold text-white">{formatNumber(timeLeft.hours)}</span>
              </div>
              <span className="text-white font-bold">:</span>
              <div className="w-9 h-9 sm:w-10 sm:h-10 bg-white/15 rounded-lg flex items-center justify-center">
                <span className="text-base sm:text-lg font-bold text-white">{formatNumber(timeLeft.minutes)}</span>
              </div>
              <span className="text-white font-bold">:</span>
              <div className="w-9 h-9 sm:w-10 sm:h-10 bg-white/15 rounded-lg flex items-center justify-center">
                <span className="text-base sm:text-lg font-bold text-white">{formatNumber(timeLeft.seconds)}</span>
              </div>
            </div>
          </div>

          {/* Right: Shop Now button */}
          <Link
            to="/offers"
            className="px-6 py-2 bg-[#d97a3e] hover:bg-[#c26a32] text-white text-sm font-semibold rounded-full transition-colors"
          >
            Shop Now
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FlashDeals;
