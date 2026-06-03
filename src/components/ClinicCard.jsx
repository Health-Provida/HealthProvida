import React from 'react';
import { motion } from 'framer-motion';
import { Star, MapPin, Phone, Clock, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';

const ClinicCard = ({ clinic }) => {
  
  return (
    <motion.div 
      whileHover={{ y: -2 }}
      className="clinic-card p-3 sm:p-4 md:p-6"
    >
      <div className="flex flex-col gap-4 sm:gap-6">
        <div className="w-full h-40 sm:h-48 md:h-40 rounded-lg overflow-hidden bg-gradient-to-br from-blue-100 to-green-100 flex items-center justify-center flex-shrink-0">
          <img 
            className="w-full h-full object-cover" 
            alt={`${clinic.practitioner_name} medical facility`}
           src={`${clinic.image_src}`} />
        </div>
        
        <div className="flex-1 space-y-3 sm:space-y-4">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1 break-words">{clinic.practitioner_name}</h3>
              <p className="text-blue-600 font-medium text-sm sm:text-base truncate">{clinic.practice_type}</p>
            </div>
            <Button 
              variant="ghost" 
              size="icon"
              className="text-gray-400 hover:text-red-500 flex-shrink-0"
            >
              <Heart className="w-5 h-5" />
            </Button>
          </div>
          
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600">
            <div className="flex items-center">
              <Star className="w-4 h-4 text-yellow-400 fill-current mr-1 flex-shrink-0" />
              <span className="font-medium">{clinic.rating}</span>
              <span className="ml-1">({clinic.number_of_reviews})</span>
            </div>
            <div className="flex items-center">
              <MapPin className="w-4 h-4 text-gray-400 mr-1 flex-shrink-0" />
              <span>{clinic.distance_from_location}</span>
            </div>
          </div>
          
          <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm text-gray-600">
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
              <span className="line-clamp-2">{clinic.address}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <span>{clinic.phone}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <span>Next: <span className="text-green-600 font-medium">{clinic.nextAvailable}</span></span>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-1 sm:gap-2">
            {clinic.tags.slice(0, 3).map((tag, index) => (
              <span 
                key={index}
                className="px-2 sm:px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium"
              >
                {tag}
              </span>
            ))}
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-2">
            <Button 
              className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-sm sm:text-base flex-1 sm:flex-auto"
            >
              Book Appointment
            </Button>
            <Button 
              variant="outline"
              className="text-sm sm:text-base flex-1 sm:flex-auto"
            >
              <Phone className="w-4 h-4 mr-2" />
              Call Now
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ClinicCard;