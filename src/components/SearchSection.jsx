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
    <section className="py-8 -mt-10 relative z-20">
      <div className="container mx-auto px-4">
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white rounded-2xl shadow-2xl p-6 md:p-8 max-w-6xl mx-auto"
        >
          <div className="grid md:grid-cols-2 gap-4 items-end">
            <div className="relative space-y-2">
              {/* <label className="text-sm font-medium text-gray-700 flex items-center">
                <MapPin className="w-4 h-4 mr-1 text-blue-600" />
                Location
              </label> */}
              <div className="absolute inset-y-8 left-0 pl-3 flex items-center pointer-events-none">
                        <svg class="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" />
                        </svg>
              </div>
              <input
                type="text"
                ref={searchRef}
                placeholder="Search by name, specialty, or tag..."
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full p-3 pl-10 border-2 border-secondary-light rounded-lg focus:ring-2 focus:ring-primary-dark focus:border-primary-dark transition search-input"
              />
            </div>
            
            {/* <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center">
                <Search className="w-4 h-4 mr-1 text-green-600" />
                Specialty
              </label>
              <select
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
                className="search-input"
              >
                <option value="">All Specialties</option>
                <option value="general">General Practice</option>
                <option value="cardiology">Cardiology</option>
                <option value="dermatology">Dermatology</option>
                <option value="orthopedics">Orthopedics</option>
                <option value="pediatrics">Pediatrics</option>
              </select>
            </div> */}
            
            {/* <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center">
                <Calendar className="w-4 h-4 mr-1 text-teal-600" />
                Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="search-input"
              />
            </div> */}
            
            <div class="relative">
                    <select id="sortSelect" class="w-full p-3 pr-10 border-2 border-secondary-light rounded-lg appearance-none focus:ring-2 focus:ring-primary-dark focus:border-primary-dark transition bg-white">
                        <option value="default">Sort by...</option>
                        <option value="distance-asc">Distance: Closest</option>
                        <option value="distance-desc">Distance: Farthest</option>
                        <option value="reviews-desc">Reviews: Most</option>
                        <option value="reviews-asc">Reviews: Fewest</option>
                        <option value="name-asc">Name: A-Z</option>
                        <option value="name-desc">Name: Z-A</option>
                    </select>
                    <div class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <svg class="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
                        </svg>
                    </div>
                </div>
            {/* <div className="flex space-x-2">
              <Button 
                onClick={handleSearch}
                className="flex-1 bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 h-12"
              >
                <Search className="w-4 h-4 mr-2" />
                Search
              </Button>
              <Button 
                variant="outline" 
                size="icon"
                onClick={handleFilter}
                className="h-12 w-12"
              >
                <Filter className="w-4 h-4" />
              </Button>
            </div> */}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default SearchSection;