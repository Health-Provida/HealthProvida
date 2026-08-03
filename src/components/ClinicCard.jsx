import React from 'react';
import { motion } from 'framer-motion';
import { Star, MapPin, Phone, Clock, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';

const ClinicCard = ({ clinic }) => {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="bg-white rounded-2xl sm:rounded-3xl shadow-sm hover:shadow-md transition-all duration-300 p-3.5 sm:p-4 md:p-5 cursor-pointer border border-gray-100 flex flex-row gap-3.5 sm:gap-5 md:gap-6 items-center"
    >
      <div className="relative w-32 h-32 sm:w-44 sm:h-44 md:w-52 md:h-52 lg:w-56 lg:h-56 aspect-square rounded-xl sm:rounded-2xl md:rounded-3xl overflow-hidden flex-shrink-0 bg-gradient-to-br from-blue-100 to-green-100">
        <img
          className="w-full h-full object-cover"
          alt={`${clinic.practitioner_name} medical facility`}
          src={`${clinic.image_src}`}
        />
        {clinic.tags && clinic.tags[0] && (
          <div className="absolute top-2 left-2 sm:top-3 sm:left-3 bg-blue-50/90 backdrop-blur-sm text-blue-700 text-[10px] sm:text-xs font-semibold px-2 sm:px-3 py-0.5 sm:py-1 rounded-full shadow-xs truncate max-w-[85%]">
            {clinic.tags[0]}
          </div>
        )}
      </div>

      <div className="flex-1 space-y-1.5 sm:space-y-2.5 min-w-0 py-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h3 className="text-base sm:text-xl font-bold text-gray-900 truncate">{clinic.practitioner_name}</h3>
            <p className="text-xs sm:text-sm text-blue-600 font-medium truncate mt-0.5">{clinic.practice_type}</p>
          </div>
          <button className="p-2 rounded-full text-gray-700 hover:text-red-500 hover:bg-gray-100 transition-all flex-shrink-0">
            <Heart className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center text-xs sm:text-sm text-gray-500 min-w-0">
          <MapPin className="w-3.5 h-3.5 text-gray-400 mr-1.5 flex-shrink-0" />
          <span className="truncate">{clinic.address}</span>
        </div>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs sm:text-sm text-gray-600">
          <div className="flex items-center">
            <Phone className="w-3.5 h-3.5 text-gray-400 mr-1.5 flex-shrink-0" />
            <span className="truncate">{clinic.phone}</span>
          </div>
          <span className="hidden sm:inline text-gray-300">•</span>
          <div className="flex items-center">
            <Clock className="w-3.5 h-3.5 text-gray-400 mr-1.5 flex-shrink-0" />
            <span>Next: <span className="text-green-600 font-medium">{clinic.nextAvailable}</span></span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm pt-0.5 sm:pt-1">
          <div className="flex items-center text-gray-900 font-semibold">
            <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-yellow-400 fill-current mr-1 flex-shrink-0" />
            <span>{clinic.rating}</span>
            <span className="ml-1 text-gray-500 font-normal">({clinic.number_of_reviews} reviews)</span>
          </div>
          <span className="text-gray-300">•</span>
          <span className="text-gray-500">{clinic.distance_from_location}</span>
        </div>

        <div className="flex flex-wrap gap-1.5 pt-1">
          {clinic.tags?.slice(0, 3).map((tag, index) => (
            <span
              key={index}
              className="px-2 sm:px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-[10px] sm:text-xs font-medium whitespace-nowrap"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default ClinicCard;