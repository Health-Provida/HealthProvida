import React from 'react';
import { motion } from 'framer-motion';
import { Search, MapPin, Clock } from 'lucide-react';

const Hero = () => {
  return (
    <section className="hero-gradient text-white py-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-black/20"></div>
      <div className="container mx-auto px-4 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-4xl mx-auto"
        >
          <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
            Find Quality Healthcare
            <span className="block text-green-300">Near You</span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-2xl mx-auto">
            Discover trusted medical clinics, compare services, and book appointments with ease. Your health journey starts here.
          </p>
          
          <div className="flex flex-wrap justify-center gap-8 mt-12">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="flex items-center space-x-3 bg-white/10 backdrop-blur-sm rounded-lg px-6 py-4 w-50"
            >
              <Search className="w-6 h-6 text-green-300" />
              <span className="font-medium">Easy Search</span>
            </motion.div>
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="flex items-center space-x-3 bg-white/10 backdrop-blur-sm rounded-lg px-6 py-4 w-49"
            >
              <MapPin className="w-6 h-6 text-green-300" />
              <span className="font-medium">Location Based</span>
            </motion.div>
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="flex items-center space-x-3 bg-white/10 backdrop-blur-sm rounded-lg px-6 py-4 w-59.999"
            >
              <Clock className="w-6 h-6 text-green-300" />
              <span className="font-medium">Quick Booking</span>
            </motion.div>
          </div>
        </motion.div>
      </div>
      
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-blue-50 to-transparent"></div>
    </section>
  );
};

export default Hero;