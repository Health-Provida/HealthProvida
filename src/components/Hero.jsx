import React from 'react';
import { motion } from 'framer-motion';
import { Search, MapPin, Clock } from 'lucide-react';

const Hero = () => {
  return (
    <section className="hero-gradient text-white py-12 sm:py-16 md:py-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-black/20"></div>
      <div className="container mx-auto px-4 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-4xl mx-auto"
        >
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 leading-tight">
            Find Quality Healthcare
            <span className="block text-green-300">Near You</span>
          </h1>
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl mb-6 sm:mb-8 text-blue-100 max-w-2xl mx-auto px-2">
            Discover trusted medical clinics, compare services, and book appointments with ease. Your health journey starts here.
          </p>
          
          <div className="flex flex-wrap justify-center gap-3 sm:gap-4 md:gap-6 lg:gap-8 mt-8 sm:mt-10 md:mt-12">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="flex items-center space-x-2 sm:space-x-3 bg-white/10 backdrop-blur-sm rounded-lg px-4 sm:px-6 py-3 sm:py-4"
            >
              <Search className="w-5 h-5 sm:w-6 sm:h-6 text-green-300 flex-shrink-0" />
              <span className="font-medium text-sm sm:text-base">Easy Search</span>
            </motion.div>
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="flex items-center space-x-2 sm:space-x-3 bg-white/10 backdrop-blur-sm rounded-lg px-4 sm:px-6 py-3 sm:py-4"
            >
              <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-green-300 flex-shrink-0" />
              <span className="font-medium text-sm sm:text-base">Location Based</span>
            </motion.div>
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="flex items-center space-x-2 sm:space-x-3 bg-white/10 backdrop-blur-sm rounded-lg px-4 sm:px-6 py-3 sm:py-4"
            >
              <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-green-300 flex-shrink-0" />
              <span className="font-medium text-sm sm:text-base">Quick Booking</span>
            </motion.div>
          </div>
        </motion.div>
      </div>
      
      <div className="absolute bottom-0 left-0 right-0 h-12 sm:h-16 md:h-20 bg-gradient-to-t from-blue-50 to-transparent"></div>
    </section>
  );
};

export default Hero;