import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Navigation, Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';

const MapSection = () => {

  return (
    <motion.div 
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      className="sticky top-24"
    >
      <div className="bg-white rounded-xl shadow-lg overflow-hidden hide-on-small">
        <div className="p-4 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Clinic Locations</h3>
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="sm"
            >
              <Navigation className="w-4 h-4 mr-1" />
              My Location
            </Button>
            <Button 
              variant="outline" 
              size="sm"
            >
              <Layers className="w-4 h-4 mr-1" />
              Filters
            </Button>
          </div>
        </div>
        
        <div className="h-96 bg-gradient-to-br from-blue-100 via-green-100 to-teal-100 relative overflow-hidden">
          <img 
            className="w-full h-full object-cover" 
            alt="Interactive map showing clinic locations"
           src="https://images.unsplash.com/photo-1518487346609-25352f3e0c8c" />
          
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="bg-white/90 backdrop-blur-sm rounded-lg p-6 text-center cursor-pointer shadow-lg"
            >
              <MapPin className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <p className="text-gray-700 font-medium">Interactive Map</p>
              <p className="text-sm text-gray-500">Click to explore clinic locations</p>
            </motion.div>
          </div>
          
          {/* Mock map pins */}
          <div className="absolute top-1/4 left-1/3 w-6 h-6 bg-red-500 rounded-full border-2 border-white shadow-lg animate-pulse"></div>
          <div className="absolute top-1/2 right-1/4 w-6 h-6 bg-blue-500 rounded-full border-2 border-white shadow-lg animate-pulse"></div>
          <div className="absolute bottom-1/3 left-1/2 w-6 h-6 bg-green-500 rounded-full border-2 border-white shadow-lg animate-pulse"></div>
        </div>
        
        <div className="p-4 bg-gray-50">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>6 clinics in this area</span>
            <button 
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              View all on map
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default MapSection;