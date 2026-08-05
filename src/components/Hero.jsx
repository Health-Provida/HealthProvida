import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import RotatingText from './RotatingText';

// Words that rotate in the hero heading. Edit this list to change the cycle.
const ROTATING_WORDS = ['Healthcare', 'Hospitals', 'Clinics', 'Pharmacies', 'Practitioners'];

const Hero = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = () => {
    const trimmed = searchQuery.trim();
    if (trimmed) {
      navigate(`/search?q=${encodeURIComponent(trimmed)}`);
    } else {
      navigate('/search');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <section className="hero-gradient text-white min-h-[65vh] md:min-h-[calc(100vh-60px)] py-12 md:py-20 flex items-center relative overflow-hidden">
      <div className="absolute inset-0 bg-black/20"></div>
      <div className="container mx-auto px-4 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-4xl mx-auto"
        >
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold mb-4 sm:mb-6 leading-tight">
            {/* "healthcare" is replaced by a rotating word sequence.
                RotatingText reserves width for the longest phrase so the
                heading never reflows between transitions. */}
            Find Quality{' '}
            <RotatingText
              words={ROTATING_WORDS}
              interval={2800}
              initialDelay={5000}
            />
            <span className="block text-green-300">Near You</span>
          </h1>
          <p className="text-base sm:text-lg md:text-2xl mb-6 sm:mb-8 text-blue-100 max-w-2xl mx-auto px-2 sm:px-0">
            Discover trusted medical clinics, compare services, and book appointments with ease.
          </p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-6 sm:mt-10 max-w-2xl mx-auto w-full px-1 sm:px-0"
          >
            {/* Search container obeys the Law of Internal Radius:
                Outer Radius (24px / rounded-3xl) = Inner Radius (16px / rounded-2xl) + Container Padding (8px / p-2) */}
            <div className="flex items-center bg-white/15 backdrop-blur-md border border-white/30 rounded-3xl p-2 shadow-2xl focus-within:border-green-300 transition-all duration-300">
              <div className="flex items-center flex-1 min-w-0 pl-3 sm:pl-4 pr-2">
                <Search className="w-5 h-5 sm:w-6 sm:h-6 text-green-300 flex-shrink-0 mr-2.5 sm:mr-3" />
                <input
                  type="text"
                  placeholder="Search clinics, hospitals, pharmacies..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="w-full bg-transparent text-white placeholder-blue-200 outline-none text-base sm:text-lg font-medium"
                />
              </div>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleSearch}
                className="bg-green-400 hover:bg-green-300 text-gray-950 font-bold px-6 sm:px-8 py-3 sm:py-3.5 rounded-2xl text-base sm:text-lg transition-all duration-200 flex-shrink-0 shadow-md hover:shadow-green-400/20 cursor-pointer flex items-center justify-center"
              >
                Search
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      </div>
      
      {/* <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-blue-50 to-transparent"></div> */}
    </section>
  );
};

export default Hero;