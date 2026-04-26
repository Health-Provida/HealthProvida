import React, { useState } from 'react';
import { Star, MapPin, Phone, Clock, Heart, X, Calendar, Shield, Stethoscope, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// This component wraps around your existing ClinicGrid
// You'll need to export clinicsData from your ClinicGrid.jsx file

// Import your images
import imageone from '../components/ui/imageone.png'
import imagetwo from '../components/ui/imagetwo.png'
import imagethree from '../components/ui/imagethree.png'
import imagefour from '../components/ui/imagefour.png'
import imagefive from '../components/ui/imagefive.png'
import imagesix from '../components/ui/imagesix.png'
import imageseven from '../components/ui/imageseven.png'
import imageeight from '../components/ui/imageeight.png'
import imagenine from '../components/ui/imagenine.png'

import imgGeneralWard from '../assets/gallery/general_patient_ward_1777236735231.png';
import imgIcuWard from '../assets/gallery/hospital_icu_ward_1777237063443.png';
import imgMaternity from '../assets/gallery/maternity_delivery_room_1777237046917.png';
import imgReception from '../assets/gallery/modern_hospital_reception_1777236657236.png';
import imgOperatingTheater from '../assets/gallery/modern_operating_theater_1777236986447.png';
import imgPrivateRoom from '../assets/gallery/private_patient_room_1777236673043.png';

export const commonGallery = [
  imgReception,
  imgPrivateRoom,
  imgGeneralWard,
  imgOperatingTheater,
  imgMaternity,
  imgIcuWard
];

// Clinic data (copied from your original file)
export const clinicsData = [
  {
    id: 1,
    image_src: imageone,
    practitioner_name: "Wellington Clinics",
    practice_type: "Multi-specialty Clinic / General Practice",
    address: "Plot 321 Gidan Fulani Street, Lifecamp, Abuja 900108, Federal Capital Territory, Nigeria.",
    rating: 4.8,
    number_of_reviews: 245,
    distance_from_location: "10 km",
    phone: "+234 901 234 5678",
    tags: ["General Practice", "Family Medicine", "Diagnostic Services", "Preventative Care", "Telehealth Available", "Walk-in Clinic"],
    nextAvailable: "Tomorrow 10:00 AM",
    specialties: ["Family Medicine", "Pediatrics", "Women's Health", "Vaccinations", "Health Screenings"],
    supportedHMOs: ["Hygeia HMO", "Avon Healthcare", "Reliance HMO", "AXA Mansard"],
    equipment: ["X-Ray Machine", "Ultrasound", "ECG Monitor", "Laboratory", "Pharmacy"],
    timeSlots: [
      { day: "Today", slots: ["2:00 PM", "4:30 PM"] },
      { day: "Tomorrow", slots: ["9:00 AM", "10:00 AM", "2:00 PM", "4:00 PM"] },
      { day: "Wednesday", slots: ["9:00 AM", "11:00 AM", "1:00 PM", "3:00 PM"] },
    ],
    gallery: [imageone, ...commonGallery]
  },
  {
    id: 2,
    image_src: imagetwo,
    practitioner_name: "Alliance Hospital",
    practice_type: "General Hospital / Specialist Care",
    address: "No. 5 Malumfashi Close, Off Emeka Anyaoku Street, Area 11, Garki, F.C.T, Abuja.",
    rating: 4.8,
    number_of_reviews: 310,
    distance_from_location: "5 km",
    phone: "+234 902 345 6789",
    tags: ["General Surgery", "Cardiology", "Orthopedics", "Emergency Services", "Intensive Care", "Specialist Consultations"],
    nextAvailable: "Today 2:30 PM",
    specialties: ["Cardiology", "Orthopedics", "Surgery", "Emergency Medicine", "Radiology"],
    supportedHMOs: ["Hygeia HMO", "MetroHealth HMO", "Apex Healthcare", "Total Health Trust"],
    equipment: ["CT Scan", "MRI Machine", "Digital X-Ray", "ICU Facilities", "Operating Theaters"],
    timeSlots: [
      { day: "Today", slots: ["3:00 PM", "5:00 PM"] },
      { day: "Tomorrow", slots: ["8:00 AM", "10:30 AM", "1:00 PM", "3:30 PM"] },
      { day: "Wednesday", slots: ["8:00 AM", "10:00 AM", "12:00 PM", "2:00 PM"] },
    ],
    gallery: [imagetwo, ...commonGallery]
  },
  {
    id: 3,
    image_src: imagethree,
    practitioner_name: "National Hospital Abuja",
    practice_type: "Tertiary Care Hospital / National Referral Center",
    address: "PMB 425 Ali Muhammad Zarah Street, Central Business Dis, Abuja 900103, Federal Capital Territory, Nigeria.",
    rating: 4.8,
    number_of_reviews: 550,
    distance_from_location: "3 km",
    phone: "+234 903 456 7890",
    nextAvailable: "Today 2:30 PM",
    tags: ["Tertiary Care", "Research Hospital", "Specialized Surgery", "Pediatrics", "Oncology", "Public Health"],
    specialties: ["Dermatology", "Cosmetic Procedures", "Acne Treatment", "Skin Cancer Screening"],
    supportedHMOs: ["Avon Healthcare", "AXA Mansard", "Hygeia HMO"],
    equipment: ["Laser Equipment", "Dermatoscope", "Cryotherapy Unit", "Phototherapy"],
    timeSlots: [
      { day: "Today", slots: ["4:00 PM"] },
      { day: "Tomorrow", slots: ["9:30 AM", "11:30 AM", "2:30 PM"] },
      { day: "Wednesday", slots: ["9:00 AM", "11:00 AM", "2:00 PM", "4:00 PM"] },
    ]
  },
  {
    id: 4,
    image_src: imagefour,
    practitioner_name: "Abuja Clinics",
    practice_type: "Private Multi-specialty Clinic",
    address: "22 Amazon St, Maitama, Abuja 904101, Federal Capital Territory, Nigeria.",
    rating: 4.8,
    number_of_reviews: 240,
    distance_from_location: "10 km",
    phone: "+234 904 567 8901",
    nextAvailable: "Today 2:30 PM",
    tags: ["Premium Healthcare", "Executive Check-ups", "Diagnostic Imaging", "Family Health", "Women's Health", "Urgent Care"],
    specialties: ["Dermatology", "Cosmetic Procedures", "Acne Treatment", "Skin Cancer Screening"],
    supportedHMOs: ["Avon Healthcare", "AXA Mansard", "Hygeia HMO"],
    equipment: ["Laser Equipment", "Dermatoscope", "Cryotherapy Unit", "Phototherapy"],
    timeSlots: [
      { day: "Today", slots: ["4:00 PM"] },
      { day: "Tomorrow", slots: ["9:30 AM", "11:30 AM", "2:30 PM"] },
      { day: "Wednesday", slots: ["9:00 AM", "11:00 AM", "2:00 PM", "4:00 PM"] },
    ]
  },
  {
    id: 5,
    image_src: imagefive,
    practitioner_name: "Aquila Clinic and Fertility",
    practice_type: "Fertility & Reproductive Health Clinic",
    address: "Zone A, Apo Legislative Quarters, 21 Tatari Ali Cl, Garki, Abuja 900110, Federal Capital Territory, Nigeria.",
    rating: 4.8,
    number_of_reviews: 120,
    distance_from_location: "8 km",
    phone: "+234 905 678 9012",
    nextAvailable: "Today 2:30 PM",
    tags: ["IVF", "Reproductive Medicine", "Gynecological Services", "Male Fertility", "Counseling Services", "Women's Health"],
    specialties: ["Dermatology", "Cosmetic Procedures", "Acne Treatment", "Skin Cancer Screening"],
    supportedHMOs: ["Avon Healthcare", "AXA Mansard", "Hygeia HMO"],
    equipment: ["Laser Equipment", "Dermatoscope", "Cryotherapy Unit", "Phototherapy"],
    timeSlots: [
      { day: "Today", slots: ["4:00 PM"] },
      { day: "Tomorrow", slots: ["9:30 AM", "11:30 AM", "2:30 PM"] },
      { day: "Wednesday", slots: ["9:00 AM", "11:00 AM", "2:00 PM", "4:00 PM"] },
    ]
  },
  {
   id: 6,
    image_src: imagesix,
    practitioner_name: "Marie Stopes Medical Centre, Abuja",
    practice_type: "Reproductive Health & Family Planning Clinic",
    address: "Plot 45, Wuse II District, Abuja F.C.T, Nigeria.",
    rating: 4.8,
    number_of_reviews: 95,
    distance_from_location: "6 km",
    phone: "+234 906 789 0123",
    nextAvailable: "Today 2:30 PM",
    tags: ["Family Planning", "Contraception", "Women's Health", "Maternal Health", "Sexual Health", "Counseling Services"],
    specialties: ["Dermatology", "Cosmetic Procedures", "Acne Treatment", "Skin Cancer Screening"],
    supportedHMOs: ["Avon Healthcare", "AXA Mansard", "Hygeia HMO"],
    equipment: ["Laser Equipment", "Dermatoscope", "Cryotherapy Unit", "Phototherapy"],
    timeSlots: [
      { day: "Today", slots: ["4:00 PM"] },
      { day: "Tomorrow", slots: ["9:30 AM", "11:30 AM", "2:30 PM"] },
      { day: "Wednesday", slots: ["9:00 AM", "11:00 AM", "2:00 PM", "4:00 PM"] },
    ]
  },
  {
    id: 7,
    image_src: imageseven,
    practitioner_name: "Garki Hospital Abuja",
    practice_type: "General Private Hospital",
    address: "Tafawa Balewa Way, Garki, Abuja.",
    rating: 4.8,
    number_of_reviews: 280,
    distance_from_location: "4 km",
    phone: "+234 907 890 1234",
    nextAvailable: "Today 2:30 PM",
    tags: ["General Medicine", "Pediatrics", "Surgery", "Diagnostics", "Pharmacy Services", "Emergency Department"],
    specialties: ["Dermatology", "Cosmetic Procedures", "Acne Treatment", "Skin Cancer Screening"],
    supportedHMOs: ["Avon Healthcare", "AXA Mansard", "Hygeia HMO"],
    equipment: ["Laser Equipment", "Dermatoscope", "Cryotherapy Unit", "Phototherapy"],
    timeSlots: [
      { day: "Today", slots: ["4:00 PM"] },
      { day: "Tomorrow", slots: ["9:30 AM", "11:30 AM", "2:30 PM"] },
      { day: "Wednesday", slots: ["9:00 AM", "11:00 AM", "2:00 PM", "4:00 PM"] },
    ]
  },
  {
    id: 8,
    image_src: imageeight,
    practitioner_name: "Nizamiye Hospital (Life Camp)",
    practice_type: "Private General Hospital",
    address: "Plot 101, Life Camp Junction, Abuja F.C.T, Nigeria.",
    rating: 4.8,
    number_of_reviews: 150,
    distance_from_location: "11 km",
    phone: "+234 908 901 2345",
    nextAvailable: "Today 2:30 PM",
    tags: ["International Healthcare", "Advanced Diagnostics", "Cardiology", "Neurosurgery", "Orthopedic Surgery", "Patient-Centric Care"],
    specialties: ["Dermatology", "Cosmetic Procedures", "Acne Treatment", "Skin Cancer Screening"],
    supportedHMOs: ["Avon Healthcare", "AXA Mansard", "Hygeia HMO"],
    equipment: ["Laser Equipment", "Dermatoscope", "Cryotherapy Unit", "Phototherapy"],
    timeSlots: [
      { day: "Today", slots: ["4:00 PM"] },
      { day: "Tomorrow", slots: ["9:30 AM", "11:30 AM", "2:30 PM"] },
      { day: "Wednesday", slots: ["9:00 AM", "11:00 AM", "2:00 PM", "4:00 PM"] },
    ]
  },
  {
    id: 9,
    image_src: imagenine,
    practitioner_name: "Kelina Hospital (Gwarimpa)",
    practice_type: "Specialist Surgical Hospital",
    address: "Road 69, Gwarimpa Estate, Abuja F.C.T, Nigeria.",
    rating: 4.8,
    number_of_reviews: 110,
    distance_from_location: "15 km",
    phone: "+234 909 012 3456",
    nextAvailable: "Today 2:30 PM",
    tags: ["General Surgery", "Urology", "Laparoscopic Surgery", "Endoscopy", "Critical Care", "Post-operative Rehabilitation"],
    specialties: ["Dermatology", "Cosmetic Procedures", "Acne Treatment", "Skin Cancer Screening"],
    supportedHMOs: ["Avon Healthcare", "AXA Mansard", "Hygeia HMO"],
    equipment: ["Laser Equipment", "Dermatoscope", "Cryotherapy Unit", "Phototherapy"],
    timeSlots: [
      { day: "Today", slots: ["4:00 PM"] },
      { day: "Tomorrow", slots: ["9:30 AM", "11:30 AM", "2:30 PM"] },
      { day: "Wednesday", slots: ["9:00 AM", "11:00 AM", "2:00 PM", "4:00 PM"] },
    ]
  }
];

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

        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 overflow-y-auto flex-1">
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
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('distance');
  const [filteredClinics, setFilteredClinics] = useState(clinicsData);

  const handleSearch = () => {
    let results = [...clinicsData];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      results = results.filter(clinic => {
        const nameMatch = clinic.practitioner_name?.toLowerCase().includes(query);
        const specialtyMatch = clinic.specialties?.some(specialty => 
          specialty.toLowerCase().includes(query)
        );
        const tagsMatch = clinic.tags?.some(tag => 
          tag.toLowerCase().includes(query)
        );
        const practiceTypeMatch = clinic.practice_type?.toLowerCase().includes(query);
        
        return nameMatch || specialtyMatch || tagsMatch || practiceTypeMatch;
      });
    }

    results.sort((a, b) => {
      switch (sortBy) {
        case 'distance':
          const distanceA = parseFloat(a.distance_from_location) || 0;
          const distanceB = parseFloat(b.distance_from_location) || 0;
          return distanceA - distanceB;
        
        case 'review':
          return (b.rating || 0) - (a.rating || 0);
        
        case 'tags':
          const tagA = a.tags?.[0] || '';
          const tagB = b.tags?.[0] || '';
          return tagA.localeCompare(tagB);
        
        default:
          return 0;
      }
    });

    setFilteredClinics(results);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const navigateToClinic = (clinicId) => {
    navigate(`/clinic/${clinicId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8 no-padding-on-small">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2 small-font-on-small p-4">Find Healthcare Providers</h1>
          <p className="text-gray-600 p-4">Verified providers across Sub-Saharan Africa ready to serve you</p>
        </div>

        {/* Search Section */}
        <div className="w-full mb-6 bg-white rounded-lg shadow-md p-6">
          <div className="space-y-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search by clinic name, specialty, or tag..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700 placeholder-gray-400"
              />
              <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
            </div>

            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <div className="flex items-center gap-3 flex-1">
                <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
                  Sort by:
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="flex-1 sm:flex-initial px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-700 cursor-pointer"
                >
                  <option value="distance">Distance (Nearest First)</option>
                  <option value="review">Rating (Highest First)</option>
                  <option value="tags">Tags (Alphabetical)</option>
                </select>
              </div>

              <button
                onClick={handleSearch}
                className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white font-semibold py-2.5 px-8 rounded-lg transition duration-200 ease-in-out transform hover:scale-[1.02] active:scale-[0.98] shadow-md"
              >
                Search
              </button>
            </div>

            <div className="text-sm text-gray-600 pt-2 border-t border-gray-100">
              {searchQuery && (
                <span className="mr-4">
                  <span className="font-medium">Search term:</span> "{searchQuery}"
                </span>
              )}
              <span className="font-medium">
                Showing {filteredClinics.length} of {clinicsData.length} clinics
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {filteredClinics.length > 0 ? (
            filteredClinics.map((clinic) => (
              <ClinicCard 
                key={clinic.id} 
                clinic={clinic} 
                onClick={() => navigateToClinic(clinic.id)}
              />
            ))
          ) : (
            <div className="text-center py-12 bg-white rounded-lg shadow-md">
              <p className="text-gray-600 text-lg">No clinics found matching your search criteria.</p>
              <p className="text-gray-500 mt-2">Try adjusting your search terms or filters.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}