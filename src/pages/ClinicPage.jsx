import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, MapPin, Phone, Heart, ArrowLeft, Calendar, Shield, Stethoscope, LayoutGrid, MessageSquare, ThumbsUp, Quote, X, Search, PenLine } from 'lucide-react';
import { fetchClinicById, fetchGallery } from '@/utils/supabaseQueries';
import { useFavorites } from '@/context/FavoritesContext';
import { useAuth } from '@/context/AuthContext';

function ReviewsDialog({ clinic, isOpen, onClose, initialScrollTarget }) {
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (isOpen && initialScrollTarget !== null) {
      setTimeout(() => {
        const el = document.getElementById(`dialog-review-${initialScrollTarget}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          el.classList.add('bg-blue-50', 'transition-colors', 'duration-1000');
          setTimeout(() => el.classList.remove('bg-blue-50'), 2000);
        }
      }, 100);
    }
  }, [isOpen, initialScrollTarget]);

  if (!isOpen || !clinic?.reviewHighlights) return null;

  const filteredReviews = searchQuery.trim()
    ? clinic.reviewHighlights.filter(r =>
        r.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.author.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : clinic.reviewHighlights;

  // Calculate rating breakdown
  const ratingCounts = [0, 0, 0, 0, 0];
  clinic.reviewHighlights.forEach(r => {
    if (r.rating >= 1 && r.rating <= 5) ratingCounts[r.rating - 1]++;
  });
  const totalReviews = clinic.reviewHighlights.length;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-in"
        onClick={(e) => e.stopPropagation()}
        style={{ animation: 'fadeInUp 0.3s ease-out' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
          <h2 className="text-xl font-bold text-gray-900">
            {clinic.number_of_reviews} reviews
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                window.location.href = `/clinic/${clinic.id}/review`;
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
            >
              <PenLine className="w-4 h-4" />
              Write a review
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Scrollable content */}
        <div className="overflow-y-auto flex-1 p-6">
          {/* Overall Rating */}
          <div className="text-center mb-6">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Star className="w-7 h-7 text-yellow-400 fill-yellow-400" />
              <span className="text-5xl font-bold text-gray-900">{clinic.rating}</span>
            </div>
            <p className="text-gray-500 text-sm">Overall rating</p>
          </div>

          {/* Rating Breakdown Bars */}
          <div className="space-y-2 mb-8 max-w-xs mx-auto">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = ratingCounts[star - 1];
              const pct = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
              return (
                <div key={star} className="flex items-center gap-3 text-sm">
                  <span className="w-4 text-right text-gray-600 font-medium">{star}</span>
                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gray-900 rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Search */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search reviews..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Reviews List */}
          <div className="space-y-6">
            {filteredReviews.length > 0 ? (
              filteredReviews.map((review, index) => {
                const originalIndex = clinic.reviewHighlights.indexOf(review);
                return (
                <div key={index} id={`dialog-review-${originalIndex}`} className="pb-6 border-b border-gray-100 last:border-0 last:pb-0 rounded-lg p-2 -mx-2">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-green-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                      {review.author.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{review.author}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: 5 }, (_, i) => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${
                            i < review.rating
                              ? 'text-gray-900 fill-gray-900'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-gray-500 text-xs">· {review.date}</span>
                  </div>
                  <p className="text-gray-700 text-sm leading-relaxed">{review.text}</p>
                </div>
                );
              })
            ) : (
              <p className="text-center text-gray-500 py-8">No reviews match your search.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ClinicPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [clinic, setClinic] = useState(null);
  const [galleryData, setGalleryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [targetReviewIndex, setTargetReviewIndex] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const handleShowMore = (index) => {
    setTargetReviewIndex(index);
    setShowAllReviews(true);
  };
  const { toggleFavorite, isFavorite } = useFavorites();

  // Fetch clinic and gallery data from Supabase
  useEffect(() => {
    let cancelled = false;
    async function loadData() {
      setLoading(true);
      setError(null);
      const [clinicResult, galleryResult] = await Promise.all([
        fetchClinicById(id),
        fetchGallery(),
      ]);
      if (cancelled) return;
      if (clinicResult.error) {
        setError(clinicResult.error.message || 'Failed to load clinic');
      } else {
        setClinic(clinicResult.data);
      }
      if (galleryResult.data) {
        setGalleryData(galleryResult.data);
      }
      setLoading(false);
    }
    loadData();
    return () => { cancelled = true; };
  }, [id]);

  const favorited = clinic ? isFavorite(clinic.id) : false;

  // Flatten gallery images for the hero section
  const flattenedGalleryImages = galleryData.flatMap(ward => ward.images);
  const gallery = [clinic?.image_src, ...flattenedGalleryImages].filter(Boolean);

  const handleScroll = (e) => {
    const scrollPosition = e.target.scrollLeft;
    const imageWidth = e.target.clientWidth;
    const newIndex = Math.round(scrollPosition / imageWidth);
    setCurrentImageIndex(newIndex);
  };

  // Scroll to top when page loads
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Loading skeleton
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 animate-pulse">
        <div className="hidden md:block bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="h-5 w-32 bg-gray-200 rounded mb-6" />
            <div className="h-8 w-96 bg-gray-200 rounded mb-3" />
            <div className="h-5 w-64 bg-gray-200 rounded mb-6" />
            <div className="rounded-2xl h-[350px] bg-gray-200" />
          </div>
        </div>
        <div className="md:hidden h-[350px] bg-gray-200" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {[1,2,3].map(i => (
              <div key={i} className="bg-white rounded-xl p-6 space-y-3">
                <div className="h-6 w-48 bg-gray-200 rounded" />
                <div className="flex gap-2 flex-wrap">{[1,2,3,4].map(j => <div key={j} className="h-8 w-24 bg-gray-100 rounded-lg" />)}</div>
              </div>
            ))}
          </div>
          <div className="bg-white rounded-xl p-6 h-fit space-y-4">
            <div className="h-6 w-40 bg-gray-200 rounded" />
            {[1,2,3].map(i => (
              <div key={i} className="space-y-2">
                <div className="h-4 w-20 bg-gray-200 rounded" />
                <div className="grid grid-cols-2 gap-2">{[1,2,3,4].map(j => <div key={j} className="h-10 bg-gray-100 rounded-lg" />)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Error or not-found state
  if (error || !clinic) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center bg-gray-50 p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          {error ? 'Unable to Load Clinic' : 'Clinic Not Found'}
        </h1>
        <p className="text-gray-600 mb-6">
          {error || 'The healthcare provider you are looking for does not exist or has been removed.'}
        </p>
        <button
          onClick={() => navigate('/')}
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
    <div className="min-h-screen bg-gray-50 md:pb-16">
      {/* Mobile Top Navigation - Overlaid on image */}
      <div className="md:hidden absolute top-0 left-0 right-0 z-20 flex justify-between items-center p-4">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full bg-white/80 backdrop-blur-md flex items-center justify-center text-gray-700 shadow-sm"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex gap-2">
          <button className="w-10 h-10 rounded-full bg-white/80 backdrop-blur-md flex items-center justify-center text-gray-700 shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" /><polyline points="16 6 12 2 8 6" /><line x1="12" x2="12" y1="2" y2="15" /></svg>
          </button>
          <button 
            onClick={() => toggleFavorite(clinic.id)}
            className="w-10 h-10 rounded-full bg-white/80 backdrop-blur-md flex items-center justify-center text-gray-700 shadow-sm"
          >
            <Heart className={`w-5 h-5 ${favorited ? 'fill-red-500 text-red-500' : ''}`} />
          </button>
        </div>
      </div>

      {/* Mobile Swipeable Photo Gallery (Moved to top) */}
      <div className="md:hidden relative h-[350px] w-full group">
        <div 
          className="flex h-full overflow-x-auto snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
          onScroll={handleScroll}
        >
          {gallery.map((img, idx) => (
            <div
              key={idx}
              className="w-full h-full flex-shrink-0 snap-center relative cursor-pointer"
              onClick={() => navigate(`/clinic/${clinic.id}/photos`)}
            >
              <img
                src={img}
                alt={`${clinic.practitioner_name} gallery ${idx + 1}`}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black opacity-0 active:opacity-10 transition-opacity"></div>
            </div>
          ))}
        </div>
        <div className="absolute bottom-10 right-4 bg-black/60 backdrop-blur-sm text-white text-xs font-medium px-2 py-1 rounded-md z-10 pointer-events-none">
          {currentImageIndex + 1} / {gallery.length}
        </div>
      </div>

      {/* Desktop Hero Section */}
      <div className="hidden md:block bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-500 hover:text-blue-600 transition mb-4 font-medium"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Search
          </button>

          {/* Clinic Header Info (Desktop) */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{clinic.practitioner_name}</h1>
              <p className="text-xl text-blue-600 font-medium mb-3">{clinic.practice_type}</p>

              <div className="flex flex-wrap items-center gap-4 text-sm">
                <div className="flex items-center">
                  <Star className="w-5 h-5 text-yellow-500 fill-current mr-1" />
                  <span className="font-bold text-gray-900">{clinic.rating}</span>
                  <span className="ml-1 text-gray-600 underline cursor-pointer hover:text-gray-900">({clinic.number_of_reviews} reviews)</span>
                </div>
                <span className="text-gray-300">•</span>
                <div className="flex items-center text-gray-600">
                  <MapPin className="w-4 h-4 mr-1" />
                  <span className="font-medium underline cursor-pointer hover:text-gray-900">{clinic.address}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => toggleFavorite(clinic.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition font-medium ${
                  favorited ? 'text-red-500 bg-red-50 hover:bg-red-100' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Heart className={`w-5 h-5 ${favorited ? 'fill-red-500' : ''}`} />
                <span>{favorited ? 'Saved' : 'Save'}</span>
              </button>
              <button className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition font-medium">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" /><polyline points="16 6 12 2 8 6" /><line x1="12" x2="12" y1="2" y2="15" /></svg>
                <span>Share</span>
              </button>
            </div>
          </div>

          {/* Desktop Airbnb-style Photo Grid */}
          <div className="relative rounded-2xl overflow-hidden h-[350px] group">
            <div className="grid grid-cols-4 grid-rows-2 gap-2 h-full">
              {/* Large left image */}
              <div
                className="col-span-2 row-span-2 h-full relative cursor-pointer overflow-hidden"
                onClick={() => navigate(`/clinic/${clinic.id}/photos`)}
              >
                <img
                  src={gallery[0]}
                  alt={`${clinic.practitioner_name} main`}
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                />
                <div className="absolute inset-0 bg-black opacity-0 hover:opacity-10 transition-opacity"></div>
              </div>

              {/* 4 small right images */}
              <div
                className="col-span-1 row-span-1 h-full relative cursor-pointer overflow-hidden"
                onClick={() => navigate(`/clinic/${clinic.id}/photos`)}
              >
                <img
                  src={gallery[1]}
                  alt="Ward 1"
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-105" />
                <div className="absolute inset-0 bg-black opacity-0 hover:opacity-10 transition-opacity"></div>
              </div>
              <div
                className="col-span-1 row-span-1 h-full relative cursor-pointer overflow-hidden"
                onClick={() => navigate(`/clinic/${clinic.id}/photos`)}
              >
                <img src={gallery[2]} alt="Ward 2" className="w-full h-full object-cover transition-transform duration-500 hover:scale-105" />
                <div className="absolute inset-0 bg-black opacity-0 hover:opacity-10 transition-opacity"></div>
              </div>
              <div
                className="col-span-1 row-span-1 h-full relative cursor-pointer overflow-hidden"
                onClick={() => navigate(`/clinic/${clinic.id}/photos`)}
              >
                <img src={gallery[3]} alt="Ward 3" className="w-full h-full object-cover transition-transform duration-500 hover:scale-105" />
                <div className="absolute inset-0 bg-black opacity-0 hover:opacity-10 transition-opacity"></div>
              </div>
              <div
                className="col-span-1 row-span-1 h-full relative cursor-pointer overflow-hidden"
                onClick={() => navigate(`/clinic/${clinic.id}/photos`)}
              >
                <img src={gallery[4]} alt="Ward 4" className="w-full h-full object-cover transition-transform duration-500 hover:scale-105" />
                <div className="absolute inset-0 bg-black opacity-0 hover:opacity-10 transition-opacity"></div>
              </div>
            </div>

            {/* Show all photos button */}
            <button
              onClick={() => navigate(`/clinic/${clinic.id}/photos`)}
              className="absolute bottom-4 right-4 bg-white text-gray-900 font-semibold py-1.5 px-4 rounded-lg border border-gray-900 hover:bg-gray-100 flex items-center gap-2 transition shadow-sm z-10"
            >
              <LayoutGrid className="w-4 h-4" />
              Show all photos
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto md:px-6 lg:px-8 bg-white md:bg-transparent rounded-t-[2rem] md:rounded-none -mt-6 md:mt-0 relative z-10 md:py-8 pt-6 pb-16 px-4">
        {/* Mobile Clinic Header Info */}
        <div className="md:hidden mb-8 text-center sm:text-left">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">{clinic.practitioner_name}</h1>
          <p className="text-sm text-gray-500 mb-4">{clinic.address}</p>
          
          <div className="flex items-center justify-center sm:justify-start gap-4 text-sm divide-x divide-gray-200 border-y border-gray-100 py-3">
            <div className="flex flex-col items-center px-4">
              <div className="flex items-center font-bold text-gray-900">
                <Star className="w-4 h-4 text-yellow-500 fill-current mr-1" />
                {clinic.rating}
              </div>
              <span className="text-xs text-gray-500 mt-1">{clinic.number_of_reviews} reviews</span>
            </div>
            <div className="flex flex-col items-center px-4">
              <div className="flex items-center font-bold text-gray-900">
                <Shield className="w-4 h-4 text-green-500 mr-1" />
                Verified
              </div>
              <span className="text-xs text-gray-500 mt-1">Provider</span>
            </div>
          </div>
        </div>
        
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

            {/* Review Highlights */}
            {clinic.reviewHighlights && clinic.reviewHighlights.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                  <MessageSquare className="w-6 h-6 text-blue-600" />
                  Review Highlights
                </h2>
                <p className="text-sm text-gray-500 mb-6">What patients are saying about {clinic.practitioner_name}</p>

                <div className="flex overflow-x-auto gap-4 pb-4 -mx-6 px-6 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] md:mx-0 md:px-0 md:flex-col md:gap-0 md:space-y-5 md:overflow-visible">
                  {clinic.reviewHighlights.map((review, index) => (
                    <div
                      key={index}
                      className="bg-gradient-to-br from-gray-50 to-blue-50/30 rounded-xl p-5 border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all duration-300 w-[85vw] max-w-[320px] md:w-auto md:max-w-none md:min-w-0 snap-start shrink-0"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-green-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                          {review.author.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 text-sm">{review.author}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <div className="flex items-center gap-0.5">
                              {Array.from({ length: 5 }, (_, i) => (
                                <Star
                                  key={i}
                                  className={`w-3.5 h-3.5 ${
                                    i < review.rating
                                      ? 'text-yellow-400 fill-yellow-400'
                                      : 'text-gray-200'
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-xs text-gray-400">·</span>
                            <p className="text-xs text-gray-500">{review.date}</p>
                          </div>
                        </div>
                      </div>
                      <p className="text-gray-700 text-sm leading-relaxed pl-[52px]">
                        {review.text.length > 120 ? (
                          <>
                            <span>{review.text.substring(0, 120)}...</span>
                            <br />
                            <button onClick={() => handleShowMore(index)} className="font-semibold underline text-gray-900 mt-1 hover:text-blue-600 transition-colors">Show more</button>
                          </>
                        ) : (
                          review.text
                        )}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
                  <button
                    onClick={() => navigate(`/clinic/${clinic.id}/review`)}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white text-sm font-semibold rounded-lg transition shadow-sm hover:shadow-md"
                  >
                    <PenLine className="w-4 h-4" />
                    Write a Review
                  </button>
                  <button
                    onClick={() => setShowAllReviews(true)}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
                  >
                    See all reviews →
                  </button>
                </div>
              </div>
            )}
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
                          className={`py-2 px-3 text-sm rounded-lg border-2 transition-all duration-200 ${selectedSlot?.day === daySlot.day && selectedSlot?.time === time
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

      {/* Reviews Dialog */}
      <ReviewsDialog
        clinic={clinic}
        isOpen={showAllReviews}
        onClose={() => {
          setShowAllReviews(false);
          setTargetReviewIndex(null);
        }}
        initialScrollTarget={targetReviewIndex}
      />
    </div>
  );
}
