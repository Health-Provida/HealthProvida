import React, { useState } from 'react';
import { useRef } from 'react';
import { motion } from 'framer-motion';
import { Search, MapPin, Filter, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const SearchSection = () => {
  
  const [location, setLocation] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [date, setDate] = useState('');
  
  const address = useLocation();
  const searchRef = useRef(null);
    // Check if we should scroll to search on page load
  useEffect(() => {
    if (address.state?.scrollToSearch && searchRef.current) {
      // Add a small delay to ensure the page is fully rendered
      const timer = setTimeout(() => {
        searchRef.current?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
        // Focus the input after scrolling
        setTimeout(() => searchRef.current?.focus(), 500);
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [address.state]);



  return (
    <section className="py-2 sm:py-4 md:py-8 -mt-4 sm:-mt-6 md:-mt-10 relative z-20">
      <div className="container mx-auto px-2 sm:px-4">
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white rounded-lg sm:rounded-2xl shadow-lg sm:shadow-xl md:shadow-2xl p-3 sm:p-4 md:p-8 max-w-6xl mx-auto"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 md:gap-6 items-end">
            <div className="relative space-y-2">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none top-auto sm:inset-y-8">
                        <svg className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                        </svg>
              </div>
              <input
                type="text"
                ref={searchRef}
                placeholder="Search by name, specialty..."
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full p-2 sm:p-3 pl-9 sm:pl-10 text-sm sm:text-base border-2 border-secondary-light rounded-lg focus:ring-2 focus:ring-primary-dark focus:border-primary-dark transition search-input"
              />
            </div>
            
            <div className="relative">
                    <select id="sortSelect" className="w-full p-2 sm:p-3 pr-8 sm:pr-10 text-sm sm:text-base border-2 border-secondary-light rounded-lg appearance-none focus:ring-2 focus:ring-primary-dark focus:border-primary-dark transition bg-white">
                        <option value="default">Sort by...</option>
                        <option value="distance-asc">Distance: Closest</option>
                        <option value="distance-desc">Distance: Farthest</option>
                        <option value="reviews-desc">Reviews: Most</option>
                        <option value="reviews-asc">Reviews: Fewest</option>
                        <option value="name-asc">Name: A-Z</option>
                        <option value="name-desc">Name: Z-A</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 pr-2 sm:pr-3 flex items-center pointer-events-none">
                        <svg className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                    </div>
                </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default SearchSection;