import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, MapPin, Phone, Heart, ArrowLeft, Calendar, Shield, Stethoscope } from 'lucide-react';
import { clinicsData } from '../components/ClinicGrid';

export default function ClinicPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [selectedSlot, setSelectedSlot] = useState(null);
  
  const clinic = clinicsData.find(c => c.id === parseInt(id));

  // Scroll to top when page loads
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (!clinic) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center bg-gray-50 p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Clinic Not Found</h1>
        <p className="text-gray-600 mb-6">The healthcare provider you are looking for does not exist or has been removed.</p>
        <button 
          onClick={() => navigate('/services')}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-6 rounded-lg transition flex items-center gap-2"
        >
          <ArrowLeft size={20} />
          Back to Providers
        </button>
      </div>
    );
  }

  const handleBookAppointment = () => {
    if (!selectedSlot) {
      alert("Please select a time slot");
      return;
    }
    alert(`Appointment booked for ${selectedSlot.day} at ${selectedSlot.time}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      {/* Hero Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-500 hover:text-blue-600 transition mb-6 font-medium"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Search
          </button>
          
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <img 
              src={clinic.image_src}
              alt={clinic.practitioner_name}
              className="w-full md:w-1/3 lg:w-1/4 h-64 md:h-auto object-cover rounded-xl shadow-md"
            />
            
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">{clinic.practitioner_name}</h1>
                  <p className="text-xl text-blue-600 font-medium mb-4">{clinic.practice_type}</p>
                </div>
                <button 
                  onClick={() => alert('Added to favorites!')}
                  className="p-3 bg-red-50 text-red-500 rounded-full hover:bg-red-100 transition"
                  title="Add to Favorites"
                >
                  <Heart className="w-6 h-6" />
                </button>
              </div>
              
              <div className="flex flex-wrap items-center gap-4 md:gap-6 mb-6">
                <div className="flex items-center bg-yellow-50 px-3 py-1.5 rounded-full">
                  <Star className="w-5 h-5 text-yellow-500 fill-current mr-1.5" />
                  <span className="font-bold text-yellow-700">{clinic.rating}</span>
                  <span className="ml-1 text-yellow-600 text-sm">({clinic.number_of_reviews} reviews)</span>
                </div>
                <div className="flex items-center text-gray-600 bg-gray-100 px-3 py-1.5 rounded-full">
                  <MapPin className="w-5 h-5 mr-1.5" />
                  <span className="text-sm font-medium">{clinic.distance_from_location} away</span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 mt-0.5 text-gray-400 flex-shrink-0" />
                  <span className="text-gray-700">{clinic.address}</span>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  <a href={`tel:${clinic.phone}`} className="text-blue-600 hover:text-blue-800 font-medium">{clinic.phone}</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Specialties */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Stethoscope className="w-6 h-6 text-blue-600" />
                Specialties & Services
              </h2>
              <div className="flex flex-wrap gap-2">
                {clinic.specialties.map((specialty, index) => (
                  <span 
                    key={index}
                    className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium"
                  >
                    {specialty}
                  </span>
                ))}
              </div>
            </div>

            {/* Equipment */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Stethoscope className="w-6 h-6 text-blue-600" />
                Available Equipment & Facilities
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {clinic.equipment.map((item, index) => (
                  <div 
                    key={index}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg text-gray-700"
                  >
                    <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0"></div>
                    <span className="font-medium">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Supported HMOs */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Shield className="w-6 h-6 text-green-600" />
                Supported HMOs
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {clinic.supportedHMOs.map((hmo, index) => (
                  <div 
                    key={index}
                    className="flex items-center gap-3 p-3 bg-green-50 rounded-lg text-gray-800"
                  >
                    <Shield className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span className="font-medium">{hmo}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Booking Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 sticky top-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Calendar className="w-6 h-6 text-blue-600" />
                Book an Appointment
              </h2>
              
              <div className="space-y-6 mb-8">
                {clinic.timeSlots.map((daySlot, dayIndex) => (
                  <div key={dayIndex}>
                    <p className="font-semibold text-gray-800 mb-3 border-b pb-2">{daySlot.day}</p>
                    <div className="grid grid-cols-2 gap-2">
                      {daySlot.slots.map((time, timeIndex) => (
                        <button
                          key={timeIndex}
                          onClick={() => setSelectedSlot({ day: daySlot.day, time })}
                          className={`py-2 px-3 text-sm rounded-lg border-2 transition-all duration-200 ${
                            selectedSlot?.day === daySlot.day && selectedSlot?.time === time
                              ? 'border-blue-600 bg-blue-50 text-blue-700 font-bold shadow-sm'
                              : 'border-gray-200 hover:border-blue-300 text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-gray-200">
                {selectedSlot && (
                  <div className="mb-4 p-3 bg-blue-50 rounded-lg text-sm text-blue-800">
                    <span className="block font-semibold mb-1">Selected Time:</span>
                    {selectedSlot.day} at {selectedSlot.time}
                  </div>
                )}
                <button
                  onClick={handleBookAppointment}
                  className="w-full bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white py-3 px-6 rounded-lg text-lg font-semibold transition shadow-md hover:shadow-lg"
                >
                  Confirm Booking
                </button>
                <p className="text-center text-gray-500 text-xs mt-3">
                  No payment required to book
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
