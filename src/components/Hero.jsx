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
    <section className="hero-gradient text-white min-h-[calc(100vh-60px)] flex items-center relative overflow-hidden">
      <div className="absolute inset-0 bg-black/20"></div>
      <div className="container mx-auto px-4 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-4xl mx-auto"
        >
          <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
            {/* "healthcare" is replaced by a rotating word sequence.
                RotatingText reserves width for the longest phrase so the
                heading never reflows between transitions. */}
            Find Quality{' '}
            <RotatingText
              words={ROTATING_WORDS}
              interval={2800}
              initialDelay={3000}
              // className="text-green-300"
              className="inline"
            />
            <span className="block text-green-300">Near You</span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-2xl mx-auto">
            Discover trusted medical clinics, compare services, and book appointments with ease. Your health journey starts here.
          </p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-10 max-w-2xl mx-auto"
          >
            <div className="flex items-center bg-white/15 backdrop-blur-md border border-white/30 rounded-2xl px-4 py-3 shadow-2xl focus-within:border-green-300 transition-all duration-300">
              <Search className="w-5 h-5 text-green-300 flex-shrink-0 mr-3" />
              <input
                type="text"
                placeholder="Search clinics, hospitals, pharmacies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1 bg-transparent text-white placeholder-blue-200 outline-none text-base font-medium"
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleSearch}
                className="ml-3 bg-green-400 hover:bg-green-300 text-white hover:text-gray-900 font-semibold px-5 py-2 rounded-xl transition-colors duration-200 flex-shrink-0"
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