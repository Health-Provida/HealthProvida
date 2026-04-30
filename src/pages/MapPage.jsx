import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, ArrowLeft, Star, Navigation, ExternalLink, X, Phone, Clock } from 'lucide-react';
import { clinicsData } from '../components/ClinicGrid';

// Mock coordinates for the 9 clinics spread across the map (% based)
const clinicPins = [
  { clinicId: 1, x: 28, y: 22 },   // Wellington Clinics – Life Camp
  { clinicId: 2, x: 55, y: 38 },   // Alliance Hospital – Garki / Area 11
  { clinicId: 3, x: 50, y: 52 },   // National Hospital – CBD
  { clinicId: 4, x: 68, y: 25 },   // Abuja Clinics – Maitama
  { clinicId: 5, x: 42, y: 68 },   // Aquila Clinic – Apo / Garki
  { clinicId: 6, x: 72, y: 48 },   // Marie Stopes – Wuse II
  { clinicId: 7, x: 60, y: 62 },   // Garki Hospital – Garki
  { clinicId: 8, x: 20, y: 45 },   // Nizamiye Hospital – Life Camp
  { clinicId: 9, x: 15, y: 72 },   // Kelina Hospital – Gwarimpa
];

// Mock road network for the map background
function MapBackground() {
  return (
    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1000 700" preserveAspectRatio="none">
      {/* Background gradient */}
      <defs>
        <linearGradient id="mapGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#e8f4f8" />
          <stop offset="50%" stopColor="#f0f9f4" />
          <stop offset="100%" stopColor="#e8f0f8" />
        </linearGradient>
        <filter id="roadShadow">
          <feDropShadow dx="0" dy="1" stdDeviation="1" floodOpacity="0.08" />
        </filter>
      </defs>
      <rect width="1000" height="700" fill="url(#mapGrad)" />

      {/* Water body (mock reservoir) */}
      <ellipse cx="850" cy="120" rx="140" ry="80" fill="#bde4f4" opacity="0.5" />
      <ellipse cx="120" cy="600" rx="100" ry="60" fill="#bde4f4" opacity="0.4" />

      {/* Green areas (parks) */}
      <rect x="380" y="280" width="60" height="60" rx="8" fill="#c8e6c9" opacity="0.6" />
      <rect x="700" y="500" width="80" height="50" rx="8" fill="#c8e6c9" opacity="0.5" />
      <rect x="150" y="150" width="50" height="40" rx="6" fill="#c8e6c9" opacity="0.5" />

      {/* Main roads */}
      <g stroke="#d1d5db" strokeWidth="6" fill="none" filter="url(#roadShadow)" strokeLinecap="round">
        {/* Horizontal major roads */}
        <line x1="0" y1="200" x2="1000" y2="200" />
        <line x1="0" y1="400" x2="1000" y2="400" />
        <line x1="0" y1="550" x2="1000" y2="550" />

        {/* Vertical major roads */}
        <line x1="200" y1="0" x2="200" y2="700" />
        <line x1="500" y1="0" x2="500" y2="700" />
        <line x1="750" y1="0" x2="750" y2="700" />

        {/* Diagonal / expressway */}
        <path d="M100,0 Q350,350 900,700" strokeWidth="8" stroke="#c4c9cf" />
        <path d="M0,350 Q500,300 1000,450" strokeWidth="5" stroke="#d6dae0" />
      </g>

      {/* Minor roads */}
      <g stroke="#e5e7eb" strokeWidth="2" fill="none" strokeLinecap="round">
        <line x1="350" y1="0" x2="350" y2="700" />
        <line x1="650" y1="0" x2="650" y2="700" />
        <line x1="0" y1="300" x2="1000" y2="300" />
        <line x1="0" y1="500" x2="1000" y2="500" />
        <line x1="0" y1="100" x2="1000" y2="100" />
        <line x1="0" y1="620" x2="1000" y2="620" />
        <line x1="100" y1="0" x2="100" y2="700" />
        <line x1="900" y1="0" x2="900" y2="700" />
      </g>

      {/* Area labels */}
      <text x="180" y="160" fill="#9ca3af" fontSize="14" fontFamily="Inter, sans-serif" fontWeight="500">Life Camp</text>
      <text x="550" y="230" fill="#9ca3af" fontSize="14" fontFamily="Inter, sans-serif" fontWeight="500">Maitama</text>
      <text x="480" y="370" fill="#9ca3af" fontSize="14" fontFamily="Inter, sans-serif" fontWeight="500">Central Business District</text>
      <text x="680" y="430" fill="#9ca3af" fontSize="14" fontFamily="Inter, sans-serif" fontWeight="500">Wuse II</text>
      <text x="530" y="530" fill="#9ca3af" fontSize="14" fontFamily="Inter, sans-serif" fontWeight="500">Garki</text>
      <text x="340" y="630" fill="#9ca3af" fontSize="14" fontFamily="Inter, sans-serif" fontWeight="500">Apo</text>
      <text x="100" y="530" fill="#9ca3af" fontSize="14" fontFamily="Inter, sans-serif" fontWeight="500">Gwarimpa</text>
    </svg>
  );
}

function PinMarker({ pin, clinic, isActive, onClick }) {
  return (
    <motion.button
      initial={{ scale: 0, y: 20 }}
      animate={{ scale: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 260, damping: 20, delay: pin.clinicId * 0.06 }}
      onClick={onClick}
      className="absolute z-10 group"
      style={{ left: `${pin.x}%`, top: `${pin.y}%`, transform: 'translate(-50%, -100%)' }}
      aria-label={`View ${clinic.practitioner_name} on map`}
    >
      {/* Pin stem + head */}
      <div className="relative flex flex-col items-center">
        {/* Pulse ring */}
        <span
          className={`absolute -top-1 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full ${
            isActive ? 'bg-blue-400/30 animate-ping' : 'bg-blue-400/0'
          }`}
        />

        {/* Pin body */}
        <div
          className={`relative w-10 h-10 rounded-full flex items-center justify-center shadow-lg border-[3px] transition-all duration-300 ${
            isActive
              ? 'bg-blue-600 border-white scale-125 shadow-blue-400/50'
              : 'bg-white border-blue-500 group-hover:bg-blue-50 group-hover:scale-110 group-hover:shadow-xl'
          }`}
        >
          <MapPin
            className={`w-5 h-5 transition-colors ${
              isActive ? 'text-white' : 'text-blue-600 group-hover:text-blue-700'
            }`}
          />
        </div>

        {/* Pin tail triangle */}
        <div
          className={`w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] -mt-[2px] transition-colors duration-300 ${
            isActive ? 'border-t-blue-600' : 'border-t-white'
          }`}
        />

        {/* Shadow ellipse on map */}
        <div className="w-4 h-1.5 bg-black/15 rounded-full mt-0.5 blur-[1px]" />

        {/* Hover label */}
        <div
          className={`absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs font-semibold px-2.5 py-1 rounded-md whitespace-nowrap shadow-lg transition-all pointer-events-none ${
            isActive ? 'opacity-0' : 'opacity-0 group-hover:opacity-100 group-hover:-top-12'
          }`}
        >
          {clinic.practitioner_name}
          <span className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-l-transparent border-r-4 border-r-transparent border-t-4 border-t-gray-900" />
        </div>
      </div>
    </motion.button>
  );
}

function ClinicPopup({ clinic, onClose, onNavigate }) {
  const popupRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (popupRef.current && !popupRef.current.contains(e.target)) {
        onClose();
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  return (
    <motion.div
      ref={popupRef}
      initial={{ opacity: 0, y: 16, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className="absolute left-1/2 -translate-x-1/2 bottom-full mb-4 z-50 w-[300px]"
    >
      <div className="bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden">
        {/* Image banner */}
        <div className="relative h-28 overflow-hidden">
          <img
            src={clinic.image_src}
            alt={clinic.practitioner_name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          <button
            onClick={(e) => { e.stopPropagation(); onClose(); }}
            className="absolute top-2 right-2 w-7 h-7 bg-black/40 hover:bg-black/60 rounded-full flex items-center justify-center text-white transition backdrop-blur-sm"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="absolute bottom-2 left-3 flex items-center gap-1.5">
            <Star className="w-4 h-4 text-yellow-400 fill-current" />
            <span className="text-white text-sm font-bold">{clinic.rating}</span>
            <span className="text-white/80 text-xs">({clinic.number_of_reviews})</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="text-base font-bold text-gray-900 mb-0.5 leading-tight">
            {clinic.practitioner_name}
          </h3>
          <p className="text-xs text-blue-600 font-medium mb-2">{clinic.practice_type}</p>

          <div className="space-y-1.5 mb-3">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-gray-400" />
              <span className="line-clamp-1">{clinic.address}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Phone className="w-3.5 h-3.5 flex-shrink-0 text-gray-400" />
              <span>{clinic.phone}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Clock className="w-3.5 h-3.5 flex-shrink-0 text-gray-400" />
              <span>
                Next: <span className="text-green-600 font-semibold">{clinic.nextAvailable}</span>
              </span>
            </div>
          </div>

          <button
            onClick={() => onNavigate(clinic.id)}
            className="w-full bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white text-sm font-semibold py-2.5 rounded-lg transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
          >
            <ExternalLink className="w-4 h-4" />
            View Clinic Page
          </button>
        </div>
      </div>

      {/* Popup tail pointing down */}
      <div className="flex justify-center -mt-[1px]">
        <div className="w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent border-t-8 border-t-white drop-shadow-sm" />
      </div>
    </motion.div>
  );
}

export default function MapPage() {
  const navigate = useNavigate();
  const [activeClinicId, setActiveClinicId] = useState(null);
  const mapContainerRef = useRef(null);

  const handlePinClick = (clinicId) => {
    setActiveClinicId((prev) => (prev === clinicId ? null : clinicId));
  };

  const handleNavigateToClinic = (clinicId) => {
    navigate(`/clinic/${clinicId}`);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Top bar */}
      <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition font-medium text-sm"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="hidden sm:inline">Back</span>
            </button>
            <div className="h-6 w-px bg-gray-200" />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-green-600 rounded-lg flex items-center justify-center">
                <Navigation className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="text-base font-bold text-gray-900 leading-tight">Clinic Map</h1>
                <p className="text-xs text-gray-500 hidden sm:block">
                  {clinicsData.length} providers in Abuja
                </p>
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="hidden md:flex items-center gap-4 text-xs text-gray-500">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-white border-2 border-blue-500" />
              <span>Clinic</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-blue-600 border-2 border-white shadow" />
              <span>Selected</span>
            </div>
          </div>
        </div>
      </div>

      {/* Map container */}
      <div className="flex-1 relative overflow-hidden" ref={mapContainerRef}>
        {/* Map background */}
        <MapBackground />

        {/* Pins */}
        {clinicPins.map((pin) => {
          const clinic = clinicsData.find((c) => c.id === pin.clinicId);
          if (!clinic) return null;
          const isActive = activeClinicId === pin.clinicId;

          return (
            <div
              key={pin.clinicId}
              className="absolute"
              style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
            >
              {/* Popup (rendered above the pin) */}
              <AnimatePresence>
                {isActive && (
                  <ClinicPopup
                    clinic={clinic}
                    onClose={() => setActiveClinicId(null)}
                    onNavigate={handleNavigateToClinic}
                  />
                )}
              </AnimatePresence>

              {/* Pin marker */}
              <PinMarker
                pin={{ ...pin, x: 0, y: 0 }}
                clinic={clinic}
                isActive={isActive}
                onClick={() => handlePinClick(pin.clinicId)}
              />
            </div>
          );
        })}
      </div>

      {/* Bottom clinic list strip */}
      <div className="bg-white border-t border-gray-200 shadow-up">
        <div className="max-w-[1600px] mx-auto px-4 py-3">
          <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
            {clinicsData.map((clinic) => (
              <button
                key={clinic.id}
                onClick={() => setActiveClinicId(clinic.id)}
                className={`flex-shrink-0 flex items-center gap-3 px-3 py-2 rounded-lg border-2 transition-all duration-200 ${
                  activeClinicId === clinic.id
                    ? 'border-blue-500 bg-blue-50 shadow-md'
                    : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <img
                  src={clinic.image_src}
                  alt={clinic.practitioner_name}
                  className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                />
                <div className="text-left min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate max-w-[140px]">
                    {clinic.practitioner_name}
                  </p>
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Star className="w-3 h-3 text-yellow-400 fill-current" />
                    <span>{clinic.rating}</span>
                    <span className="mx-0.5">•</span>
                    <span>{clinic.distance_from_location}</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
