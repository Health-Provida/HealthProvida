import React, { useState } from 'react';
import { Star, MapPin, Phone, Clock, Heart, X, Calendar, Shield, Stethoscope } from 'lucide-react';
import { useClinics } from '@/context/ClinicsContext';

function ClinicDialog({ clinic, isOpen, onClose }) {
  const [selectedSlot, setSelectedSlot] = useState(null);

  if (!isOpen) return null;

  const handleBookAppointment = () => {
    if (!selectedSlot) {
      alert("Please select a time slot");
      return;
    }
    alert(`Appointment booked for ${selectedSlot.day} at ${selectedSlot.time}`);
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black bg-opacity-50"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-4 sm:p-6 flex items-start justify-between gap-3 flex-shrink-0">
          <div className="flex gap-3 sm:gap-4 flex-1 min-w-0">
            <img 
              src={clinic.image_src}
              alt={clinic.practitioner_name}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg object-cover flex-shrink-0"
            />
            <div className="min-w-0 flex-1">
              <h2 className="text-lg sm:text-2xl font-bold text-gray-900 truncate">{clinic.practitioner_name}</h2>
              <p className="text-sm sm:text-base text-blue-600 font-medium truncate">{clinic.practice_type}</p>
              <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-2 text-xs sm:text-sm">
                <div className="flex items-center">
                  <Star className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400 fill-current mr-1" />
                  <span className="font-medium">{clinic.rating}</span>
                  <span className="ml-1 text-gray-600">({clinic.number_of_reviews})</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <MapPin className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                  <span>{clinic.distance_from_location}</span>
                </div>
              </div>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition flex-shrink-0 p-1"
          >
            <X size={20} className="sm:w-6 sm:h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 overflow-y-auto flex-1">
          {/* Location & Contact */}
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-3 flex items-center gap-2">
              <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
              Location & Contact
            </h3>
            <div className="space-y-2 text-sm sm:text-base text-gray-600">
              <p className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-1 text-gray-400 flex-shrink-0" />
                <span>{clinic.address}</span>
              </p>
              <p className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <a href={`tel:${clinic.phone}`} className="hover:text-blue-600">{clinic.phone}</a>
              </p>
            </div>
          </div>

          {/* Specialties */}
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-3 flex items-center gap-2">
              <Stethoscope className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
              Specialties
            </h3>
            <div className="flex flex-wrap gap-2">
              {clinic.specialties.map((specialty, index) => (
                <span 
                  key={index}
                  className="px-2 sm:px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs sm:text-sm font-medium"
                >
                  {specialty}
                </span>
              ))}
            </div>
          </div>

          {/* Supported HMOs */}
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-3 flex items-center gap-2">
              <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
              Supported HMOs
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {clinic.supportedHMOs.map((hmo, index) => (
                <div 
                  key={index}
                  className="flex items-center gap-2 p-2 bg-green-50 rounded-lg text-xs sm:text-sm text-gray-700"
                >
                  <Shield className="w-3 h-3 sm:w-4 sm:h-4 text-green-600 flex-shrink-0" />
                  <span>{hmo}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Equipment & Facilities */}
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-3 flex items-center gap-2">
              <Stethoscope className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
              Available Equipment & Facilities
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {clinic.equipment.map((item, index) => (
                <div 
                  key={index}
                  className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg text-xs sm:text-sm text-gray-700"
                >
                  <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0"></div>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Available Time Slots */}
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
              Available Time Slots
            </h3>
            <div className="space-y-3 sm:space-y-4">
              {clinic.timeSlots.map((daySlot, dayIndex) => (
                <div key={dayIndex}>
                  <p className="font-medium text-sm sm:text-base text-gray-700 mb-2">{daySlot.day}</p>
                  <div className="flex flex-wrap gap-2">
                    {daySlot.slots.map((time, timeIndex) => (
                      <button
                        key={timeIndex}
                        onClick={() => setSelectedSlot({ day: daySlot.day, time })}
                        className={`px-3 sm:px-4 py-2 text-xs sm:text-sm rounded-lg border-2 transition ${
                          selectedSlot?.day === daySlot.day && selectedSlot?.time === time
                            ? 'border-blue-600 bg-blue-50 text-blue-700 font-medium'
                            : 'border-gray-200 hover:border-blue-300 text-gray-700'
                        }`}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
            <button
              onClick={handleBookAppointment}
              className="flex-1 bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg text-sm sm:text-base font-medium transition"
            >
              Book Appointment
            </button>
            <button
              onClick={onClose}
              className="px-4 sm:px-6 py-2.5 sm:py-3 border-2 border-gray-300 text-gray-700 rounded-lg text-sm sm:text-base font-medium hover:bg-gray-50 transition"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ClinicCard({ clinic, onClick }) {
  return (
    <div 
      onClick={onClick}
      className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 p-6 cursor-pointer"
    >
      <div className="flex flex-col md:flex-row gap-6">
        <div className="md:w-64 h-48 md:h-40 rounded-lg overflow-hidden bg-gradient-to-br from-blue-100 to-green-100">
          <img 
            className="w-full h-full object-cover" 
            alt={`${clinic.practitioner_name} medical facility`}
            src={clinic.image_src}
          />
        </div>
        
        <div className="flex-1 space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">{clinic.practitioner_name}</h3>
              <p className="text-blue-600 font-medium">{clinic.practice_type}</p>
            </div>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                alert('Added to favorites!');
              }}
              className="text-gray-400 hover:text-red-500 transition p-2"
            >
              <Heart className="w-5 h-5" />
            </button>
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
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onClick();
              }}
              className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white py-2 px-4 rounded-lg font-medium transition"
            >
              Book Appointment
            </button>
            <button 
              onClick={(e) => e.stopPropagation()}
              className="border-2 border-gray-300 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-50 transition flex items-center gap-2"
            >
              <Phone className="w-4 h-4" />
              Call Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ClinicCardsApp() {
  const { clinics, loading } = useClinics();
  const [selectedClinic, setSelectedClinic] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const openDialog = (clinic) => {
    setSelectedClinic(clinic);
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setSelectedClinic(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8 no-padding-on-small">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2 small-font-on-small p-4">Find Healthcare Providers</h1>
          <p className="text-gray-600 p-4">Verified providers across Sub-Saharan Africa ready to serve you</p>
        </div>

        <div className="space-y-6">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="md:w-64 h-48 md:h-40 rounded-lg bg-gray-200" />
                  <div className="flex-1 space-y-4">
                    <div className="h-6 w-48 bg-gray-200 rounded" />
                    <div className="h-4 w-32 bg-gray-200 rounded" />
                    <div className="flex gap-2">
                      {[1,2,3].map(j => <div key={j} className="h-6 w-20 bg-gray-100 rounded-full" />)}
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            clinics.map((clinic) => (
              <ClinicCard 
                key={clinic.id} 
                clinic={clinic} 
                onClick={() => openDialog(clinic)}
              />
            ))
          )}
        </div>

        {selectedClinic && (
          <ClinicDialog 
            clinic={selectedClinic}
            isOpen={isDialogOpen}
            onClose={closeDialog}
          />
        )}-=------0=-=-p0-=-[p09--09-=-[0-=-p09---=-09-=-0-=09-=p09-p09-=-0-=-p090--0-=-0-=-p09--p0-=-0-=-09-=-0-]]
      </div>
    </div>
  );
}
