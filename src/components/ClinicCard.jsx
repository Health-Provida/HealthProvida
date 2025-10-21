import React from 'react';
import { motion } from 'framer-motion';
import { Star, MapPin, Phone, Clock, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';

const ClinicCard = ({ clinic }) => {
  
  return (
    <motion.div 
      whileHover={{ y: -2 }}
      className="clinic-card p-6"
    >
      <div className="flex flex-col md:flex-row gap-6">
        <div className="md:w-64 h-48 md:h-40 rounded-lg overflow-hidden bg-gradient-to-br from-blue-100 to-green-100 flex items-center justify-center">
          <img 
            className="w-full h-full object-cover" 
            alt={`${clinic.practitioner_name} medical facility`}
           src={`${clinic.image_src}`} />
        </div>
        
        <div className="flex-1 space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">{clinic.practitioner_name}</h3>
              <p className="text-blue-600 font-medium">{clinic.practice_type}</p>
            </div>
            <Button 
              variant="ghost" 
              size="icon"
              className="text-gray-400 hover:text-red-500"
            >
              <Heart className="w-5 h-5" />
            </Button>
          </div>
          
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <div className="flex items-center">
              <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
              <span className="font-medium">{clinic.rating}</span>
              <span className="ml-1">({clinic.number_of_reviews} reviews)</span>
            </div>
            <div className="flex items-center">
              <MapPin className="w-4 h-4 text-gray-400 mr-1" />
              <span>{clinic.distance_from_location}</span>
            </div>
          </div>
          
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex items-center">
              <MapPin className="w-4 h-4 text-gray-400 mr-2" />
              <span>{clinic.address}</span>
            </div>
            <div className="flex items-center">
              <Phone className="w-4 h-4 text-gray-400 mr-2" />
              <span>{clinic.phone}</span>
            </div>
            <div className="flex items-center">
              <Clock className="w-4 h-4 text-gray-400 mr-2" />
              <span>Next available: <span className="text-green-600 font-medium">{clinic.nextAvailable}</span></span>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {clinic.tags.slice(0, 3).map((tag, index) => (
              <span 
                key={index}
                className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium"
              >
                {tag}
              </span>
            ))}
          </div>
          
          <div className="flex space-x-3 pt-2">
            <Button 
              className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700"
            >
              Book Appointment
            </Button>
            <Button 
              variant="outline"
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