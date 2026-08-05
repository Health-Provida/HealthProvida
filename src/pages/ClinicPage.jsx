import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Star, MapPin, Phone, Heart, ArrowLeft, Calendar, Shield, Stethoscope, LayoutGrid, MessageSquare, ThumbsUp, Quote, X, Search, PenLine, Navigation, ClipboardCheck, Contact, CreditCard, FileText, Clock, Sparkles } from 'lucide-react';
import { fetchClinicBySlug, fetchGallery, fetchAppointmentSlots, createAppointment } from '@/utils/supabaseQueries';
import { getClinicUrl } from '@/utils/slugUtils';
import { useFavorites } from '@/context/FavoritesContext';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import BookingConfirmationModal from '@/components/BookingConfirmationModal';
import ShareModal from '@/components/ShareModal';

function LaurelWreathLeft() {
  return (
    <svg className="w-10 h-16 sm:w-14 sm:h-24 text-gray-900 flex-shrink-0" viewBox="0 0 40 80" fill="currentColor">
      <path d="M30 75 C 25 50, 25 30, 35 5" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <path d="M32 65 C 20 60, 10 65, 12 72 C 18 73, 26 70, 32 65 Z" />
      <path d="M28 52 C 15 45, 5 50, 8 58 C 15 58, 23 55, 28 52 Z" />
      <path d="M27 38 C 12 30, 3 35, 6 43 C 14 42, 21 39, 27 38 Z" />
      <path d="M29 24 C 15 15, 6 20, 10 28 C 18 26, 24 24, 29 24 Z" />
      <path d="M33 10 C 22 2, 14 6, 18 14 C 25 12, 30 11, 33 10 Z" />
    </svg>
  );
}

function LaurelWreathRight() {
  return (
    <svg className="w-10 h-16 sm:w-14 sm:h-24 text-gray-900 flex-shrink-0 transform scale-x-[-1]" viewBox="0 0 40 80" fill="currentColor">
      <path d="M30 75 C 25 50, 25 30, 35 5" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <path d="M32 65 C 20 60, 10 65, 12 72 C 18 73, 26 70, 32 65 Z" />
      <path d="M28 52 C 15 45, 5 50, 8 58 C 15 58, 23 55, 28 52 Z" />
      <path d="M27 38 C 12 30, 3 35, 6 43 C 14 42, 21 39, 27 38 Z" />
      <path d="M29 24 C 15 15, 6 20, 10 28 C 18 26, 24 24, 29 24 Z" />
      <path d="M33 10 C 22 2, 14 6, 18 14 C 25 12, 30 11, 33 10 Z" />
    </svg>
  );
}

const REVIEW_CATEGORIES = [
  { key: 'facility_cleanliness_rating', label: 'Cleanliness', icon: Shield },
  { key: 'quality_of_care_rating', label: 'Care quality', icon: Stethoscope },
  { key: 'wait_time_rating', label: 'Punctuality', icon: Clock },
  { key: 'staff_friendliness_rating', label: 'Staff friendliness', icon: Heart },
  { key: 'location_rating', label: 'Location', icon: MapPin },
  { key: 'value_rating', label: 'Value', icon: ThumbsUp },
];

function getReviewCategorySummaries(reviews = [], clinicRating = 4.9) {
  const baseScore = Number(clinicRating) || 4.9;
  return REVIEW_CATEGORIES.map((category) => {
    const ratings = reviews
      .map((review) => Number(review[category.key]))
      .filter((rating) => Number.isFinite(rating) && rating >= 1 && rating <= 5);

    const average = ratings.length
      ? ratings.reduce((total, rating) => total + rating, 0) / ratings.length
      : Math.min(5.0, Math.max(4.2, baseScore));

    return {
      ...category,
      average,
      count: ratings.length || reviews.length || 1,
    };
  });
}

function RatingStars({ rating, className = 'w-4 h-4' }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`${rating.toFixed(1)} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, index) => (
        <Star
          key={index}
          className={`${className} ${index < Math.round(rating) ? 'text-amber-400 fill-amber-400' : 'text-gray-200'}`}
        />
      ))}
    </div>
  );
}

function ReviewsDialog({ clinic, isOpen, onClose, initialScrollTarget }) {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

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
                navigate(`${getClinicUrl(clinic)}/review`);
              }}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 rounded-full transition-all shadow-sm"
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
          {(clinic.number_of_reviews ?? 0) >= 3 ? (
            <>
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
            </>
          ) : (
            <div className="text-center mb-6 py-6 px-4 bg-gray-50 rounded-2xl border border-gray-100 max-w-md mx-auto">
              <p className="text-base font-semibold text-gray-900 mb-1">
                Average rating will appear after 3 reviews
              </p>
              <p className="text-xs text-gray-500">
                This provider currently has {totalReviews === 1 ? '1 review' : `${totalReviews} reviews`}.
              </p>
            </div>
          )}

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
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-green-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-sm">
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
                            className={`w-3.5 h-3.5 ${i < review.rating
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

function HowReviewsWorkModal({ isOpen, onClose }) {
  if (!isOpen) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
            <MessageSquare className="w-5 h-5" />
          </div>
          <h3 className="text-xl font-bold text-gray-900">How reviews work</h3>
        </div>
        <div className="space-y-3 text-gray-600 text-sm leading-relaxed mb-6">
          <p>
            Reviews are written by verified patients who have booked and completed an appointment with this provider.
          </p>
          <p>
            To maintain statistical accuracy and protect provider reputations, an overall average rating and category ratings are only computed and displayed once a clinic has received <strong>3 or more reviews</strong>.
          </p>
        </div>
        <button
          onClick={onClose}
          className="w-full py-2.5 bg-gray-900 hover:bg-gray-800 text-white font-semibold rounded-xl text-sm transition shadow-sm"
        >
          Got it
        </button>
      </div>
    </div>
  );
}

export default function ClinicPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [clinic, setClinic] = useState(null);
  const [galleryData, setGalleryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [targetReviewIndex, setTargetReviewIndex] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Booking modal state
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingError, setBookingError] = useState(null);

  // Share modal state
  const [showShareModal, setShowShareModal] = useState(false);
  const [showHowReviewsWorkModal, setShowHowReviewsWorkModal] = useState(false);

  // Secondary sticky nav state
  const [isSecondaryNavVisible, setIsSecondaryNavVisible] = useState(false);
  const [showBookInNav, setShowBookInNav] = useState(false);

  useEffect(() => {
    const handleWindowScroll = () => {
      const heroEl = document.getElementById('photos');
      const reviewsEl = document.getElementById('reviews');

      if (heroEl) {
        const heroRect = heroEl.getBoundingClientRect();
        setIsSecondaryNavVisible(heroRect.bottom <= 100);
      } else {
        setIsSecondaryNavVisible(window.scrollY > 400);
      }

      if (reviewsEl) {
        const reviewsRect = reviewsEl.getBoundingClientRect();
        setShowBookInNav(reviewsRect.top <= 120);
      } else {
        setShowBookInNav(window.scrollY > 1200);
      }
    };

    window.addEventListener('scroll', handleWindowScroll, { passive: true });
    handleWindowScroll();
    return () => window.removeEventListener('scroll', handleWindowScroll);
  }, [clinic]);

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      const yOffset = -70;
      const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  const handleSecondaryBookClick = () => {
    if (selectedSlot) {
      handleBookAppointment();
    } else if (clinic?.phone) {
      window.location.href = `tel:${clinic.phone}`;
    } else {
      handleBookAppointment();
    }
  };

  const handleShowMore = (index) => {
    setTargetReviewIndex(index);
    setShowAllReviews(true);
  };
  const { toggleFavorite, isFavorite } = useFavorites();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();

  // Fetch clinic and gallery data from Supabase
  useEffect(() => {
    let cancelled = false;
    async function loadData() {
      setLoading(true);
      setError(null);
      const [clinicResult, galleryResult] = await Promise.all([
        fetchClinicBySlug(slug),
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
  }, [slug]);

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
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-xl p-6 space-y-3">
                <div className="h-6 w-48 bg-gray-200 rounded" />
                <div className="flex gap-2 flex-wrap">{[1, 2, 3, 4].map(j => <div key={j} className="h-8 w-24 bg-gray-100 rounded-lg" />)}</div>
              </div>
            ))}
          </div>
          <div className="bg-white rounded-xl p-6 h-fit space-y-4">
            <div className="h-6 w-40 bg-gray-200 rounded" />
            {[1, 2, 3].map(i => (
              <div key={i} className="space-y-2">
                <div className="h-4 w-20 bg-gray-200 rounded" />
                <div className="grid grid-cols-2 gap-2">{[1, 2, 3, 4].map(j => <div key={j} className="h-10 bg-gray-100 rounded-lg" />)}</div>
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

  const reviewCategorySummaries = getReviewCategorySummaries(clinic.reviewHighlights);
  const hasCategoryRatings = reviewCategorySummaries.some(({ count }) => count > 0);
  const reviewThemes = reviewCategorySummaries
    .filter(({ average }) => average != null && average >= 4)
    .sort((a, b) => b.average - a.average)
    .slice(0, 3);
  const mapQuery = clinic.latitude != null && clinic.longitude != null
    ? `${clinic.latitude},${clinic.longitude}`
    : clinic.address || clinic.practitioner_name;
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(mapQuery)}`;
  const mapEmbedUrl = `https://www.google.com/maps?q=${encodeURIComponent(mapQuery)}&z=15&output=embed`;

  const handleBookAppointment = () => {
    if (!selectedSlot) {
      toast({
        title: 'No slot selected',
        description: 'Please select a time slot before booking.',
        variant: 'destructive',
      });
      return;
    }

    // Auth gate: redirect to login if not authenticated
    if (!isAuthenticated) {
      navigate('/login', { state: { from: location } });
      return;
    }

    // Open booking confirmation modal
    setBookingError(null);
    setBookingSuccess(false);
    setShowBookingModal(true);
  };

  const handleConfirmBooking = async (notes) => {
    if (!selectedSlot || !user?.id) return;

    setIsBooking(true);
    setBookingError(null);

    const { data, error: bookErr } = await createAppointment(
      clinic.id,
      user.id,
      selectedSlot.date,
      selectedSlot.rawTime,
      selectedSlot.slotId,
      notes
    );

    if (bookErr) {
      setBookingError(bookErr.message || 'Failed to book appointment. Please try again.');
      setIsBooking(false);
      return;
    }

    // Success: show success state in modal
    setIsBooking(false);
    setBookingSuccess(true);
    setSelectedSlot(null);

    toast({
      title: 'Appointment booked!',
      description: `Your appointment has been submitted for ${selectedSlot.day} at ${selectedSlot.time}.`,
    });

    // Refresh slots so the booked slot disappears
    const slotsResult = await fetchAppointmentSlots(clinic.id);
    if (slotsResult.data) {
      setClinic((prev) => ({ ...prev, timeSlots: slotsResult.data }));
    }
  };

  const handleCloseBookingModal = () => {
    setShowBookingModal(false);
    setBookingError(null);
    // Only reset success if it was showing — let the auto-close handle it
    setTimeout(() => setBookingSuccess(false), 300);
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
          <button
            onClick={() => setShowShareModal(true)}
            className="w-10 h-10 rounded-full bg-white/80 backdrop-blur-md flex items-center justify-center text-gray-700 shadow-sm"
          >
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
              onClick={() => navigate(`${getClinicUrl(clinic)}/photos`)}
            >
              <img
                src={img}
                alt={`${clinic.practitioner_name} gallery ${idx + 1}`}
                className="w-full h-full object-cover"
                loading={idx === 0 ? 'eager' : 'lazy'}
                decoding="async"
                fetchPriority={idx === 0 ? 'high' : 'auto'}
              />
              <div className="absolute inset-0 bg-black opacity-0 active:opacity-10 transition-opacity"></div>
            </div>
          ))}
        </div>
        <div className="absolute bottom-10 right-4 bg-black/60 backdrop-blur-sm text-white text-xs font-medium px-2 py-1 rounded-md z-10 pointer-events-none">
          {currentImageIndex + 1} / {gallery.length}
        </div>
      </div>

      {/* Secondary Sticky Navbar (Airbnb Style) */}
      {isSecondaryNavVisible && (
        <div className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm transition-all duration-300">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Navigation tabs */}
              <nav className="flex items-center space-x-6 sm:space-x-8 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                <button
                  onClick={() => scrollToSection('photos')}
                  className="text-gray-700 hover:text-gray-900 font-semibold text-sm py-4 border-b-2 border-transparent hover:border-gray-900 whitespace-nowrap transition-colors"
                >
                  Photos
                </button>
                <button
                  onClick={() => scrollToSection('specialties')}
                  className="text-gray-700 hover:text-gray-900 font-semibold text-sm py-4 border-b-2 border-transparent hover:border-gray-900 whitespace-nowrap transition-colors"
                >
                  Specialties
                </button>
                <button
                  onClick={() => scrollToSection('reviews')}
                  className="text-gray-700 hover:text-gray-900 font-semibold text-sm py-4 border-b-2 border-transparent hover:border-gray-900 whitespace-nowrap transition-colors"
                >
                  Reviews
                </button>
                <button
                  onClick={() => scrollToSection('location')}
                  className="text-gray-700 hover:text-gray-900 font-semibold text-sm py-4 border-b-2 border-transparent hover:border-gray-900 whitespace-nowrap transition-colors"
                >
                  Location
                </button>
              </nav>

              {/* Right action area: Rating + Book button (appears when crossed into reviews section) */}
              {showBookInNav && (
                <div className="flex items-center gap-4 flex-shrink-0 animate-in fade-in duration-300">
                  <div className="hidden md:flex flex-col items-end">
                    <div className="flex items-center gap-1 font-bold text-gray-900 text-sm">
                      {(clinic.number_of_reviews ?? 0) >= 3 ? (
                        <>
                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                          <span>{clinic.rating}</span>
                          <span className="text-gray-500 font-normal text-xs">({clinic.number_of_reviews} reviews)</span>
                        </>
                      ) : (
                        <span className="text-gray-500 font-normal text-xs">
                          {clinic.number_of_reviews === 1 ? '1 review' : clinic.number_of_reviews === 2 ? '2 reviews' : 'No reviews'}
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-gray-500 font-medium truncate max-w-[180px]">{clinic.practitioner_name}</span>
                  </div>

                  <button
                    onClick={handleSecondaryBookClick}
                    className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white font-semibold px-5 py-2.5 rounded-lg text-sm transition shadow-sm hover:shadow flex items-center gap-2"
                  >
                    <Calendar className="w-4 h-4 hidden sm:block" />
                    <span>Book appointment</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Desktop Hero Section */}
      <div id="photos" className="hidden md:block bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

          {/* Clinic Header Info (Desktop) */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{clinic.practitioner_name}</h1>
              <p className="text-xl text-blue-600 font-medium mb-3">{clinic.practice_type}</p>

              <div className="flex flex-wrap items-center gap-4 text-sm">
                {(clinic.number_of_reviews ?? 0) >= 3 ? (
                  <div className="flex items-center">
                    <Star className="w-5 h-5 text-yellow-500 fill-current mr-1" />
                    <span className="font-bold text-gray-900">{clinic.rating}</span>
                    <span className="ml-1 text-gray-600 underline cursor-pointer hover:text-gray-900">({clinic.number_of_reviews} reviews)</span>
                  </div>
                ) : (
                  <div className="flex items-center text-gray-600">
                    <span className="font-medium underline cursor-pointer hover:text-gray-900">
                      {clinic.number_of_reviews === 1 ? '1 review' : clinic.number_of_reviews > 0 ? `${clinic.number_of_reviews} reviews` : 'No reviews'}
                    </span>
                  </div>
                )}
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
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition font-medium ${favorited ? 'text-red-500 bg-red-50 hover:bg-red-100' : 'text-gray-700 hover:bg-gray-100'
                  }`}
              >
                <Heart className={`w-5 h-5 ${favorited ? 'fill-red-500' : ''}`} />
                <span>{favorited ? 'Saved' : 'Save'}</span>
              </button>
              <button
                onClick={() => setShowShareModal(true)}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition font-medium"
              >
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
                onClick={() => navigate(`${getClinicUrl(clinic)}/photos`)}
              >
                <img
                  src={gallery[0]}
                  alt={`${clinic.practitioner_name} main`}
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                  loading="eager"
                  fetchPriority="high"
                  decoding="async"
                />
                <div className="absolute inset-0 bg-black opacity-0 hover:opacity-10 transition-opacity"></div>
              </div>

              {/* 4 small right images */}
              <div
                className="col-span-1 row-span-1 h-full relative cursor-pointer overflow-hidden"
                onClick={() => navigate(`${getClinicUrl(clinic)}/photos`)}
              >
                <img
                  src={gallery[1]}
                  alt="Ward 1"
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                  loading="lazy"
                  decoding="async"
                />
                <div className="absolute inset-0 bg-black opacity-0 hover:opacity-10 transition-opacity"></div>
              </div>
              <div
                className="col-span-1 row-span-1 h-full relative cursor-pointer overflow-hidden"
                onClick={() => navigate(`${getClinicUrl(clinic)}/photos`)}
              >
                <img
                  src={gallery[2]}
                  alt="Ward 2"
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                  loading="lazy"
                  decoding="async"
                />
                <div className="absolute inset-0 bg-black opacity-0 hover:opacity-10 transition-opacity"></div>
              </div>
              <div
                className="col-span-1 row-span-1 h-full relative cursor-pointer overflow-hidden"
                onClick={() => navigate(`${getClinicUrl(clinic)}/photos`)}
              >
                <img
                  src={gallery[3]}
                  alt="Ward 3"
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                  loading="lazy"
                  decoding="async"
                />
                <div className="absolute inset-0 bg-black opacity-0 hover:opacity-10 transition-opacity"></div>
              </div>
              <div
                className="col-span-1 row-span-1 h-full relative cursor-pointer overflow-hidden"
                onClick={() => navigate(`${getClinicUrl(clinic)}/photos`)}
              >
                <img
                  src={gallery[4]}
                  alt="Ward 4"
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                  loading="lazy"
                  decoding="async"
                />
                <div className="absolute inset-0 bg-black opacity-0 hover:opacity-10 transition-opacity"></div>
              </div>
            </div>

            {/* Show all photos button */}
            <button
              onClick={() => navigate(`${getClinicUrl(clinic)}/photos`)}
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
              {(clinic.number_of_reviews ?? 0) >= 3 ? (
                <>
                  <div className="flex items-center font-bold text-gray-900">
                    <Star className="w-4 h-4 text-yellow-500 fill-current mr-1" />
                    {clinic.rating}
                  </div>
                  <span className="text-xs text-gray-500 mt-1">{clinic.number_of_reviews} reviews</span>
                </>
              ) : (
                <>
                  <div className="font-bold text-gray-900">
                    {clinic.number_of_reviews === 1 ? '1 review' : clinic.number_of_reviews > 0 ? `${clinic.number_of_reviews} reviews` : 'No reviews'}
                  </div>
                  <span className="text-xs text-gray-500 mt-1">
                    {clinic.number_of_reviews > 0 ? 'New provider' : 'No reviews'}
                  </span>
                </>
              )}
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
          <div id="specialties" className="lg:col-span-2 space-y-8">
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

          {/* The booking card shares only this upper grid, then lower content uses the full page width. */}
          <section id="reviews" className="order-3 lg:col-span-3 bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-10">
            {(clinic.number_of_reviews ?? 0) >= 3 ? (
              <>
                {/* Airbnb-style Emblem Header */}
                <div className="flex flex-col items-center justify-center text-center pb-8 border-b border-gray-100 mb-8">
                  <div className="flex items-center justify-center gap-3 sm:gap-6">
                    <LaurelWreathLeft />
                    <div className="text-6xl sm:text-7xl font-extrabold tracking-tighter text-gray-900 font-serif leading-none">
                      {clinic.rating ? Number(clinic.rating).toFixed(2) : '4.91'}
                    </div>
                    <LaurelWreathRight />
                  </div>

                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mt-3 tracking-tight">
                    Patient favourite
                  </h3>
                  <p className="text-sm sm:text-base text-gray-500 max-w-md mt-1 font-normal leading-relaxed">
                    One of the most loved healthcare providers on HealthProvida, according to patient ratings & reviews
                  </p>
                </div>

                {/* 6 Category Rating Breakdown Row */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 divide-y sm:divide-y-0 md:divide-x divide-gray-200 border-b border-gray-200 pb-8 mb-10">
                  {reviewCategorySummaries.map(({ key, label, icon: Icon, average }) => (
                    <div key={key} className="flex flex-col justify-between px-3 sm:px-4 py-3 sm:py-0 first:pl-0 last:pr-0">
                      <span className="text-xs sm:text-sm font-semibold text-gray-900 truncate">{label}</span>
                      <span className="text-xl sm:text-2xl font-bold text-gray-900 my-1">{average ? average.toFixed(1) : '4.9'}</span>
                      <div className="text-gray-700">
                        <Icon className="w-5 h-5" />
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="pb-8 border-b border-gray-200 mb-8">
                <h3 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  {clinic.number_of_reviews === 1
                    ? '1 review'
                    : clinic.number_of_reviews === 2
                    ? '2 reviews'
                    : 'No reviews yet'}
                </h3>
                {clinic.number_of_reviews > 0 && (
                  <p className="text-base text-gray-600 mt-1.5 font-normal">
                    Average rating will appear after 3 reviews
                  </p>
                )}
                <button
                  onClick={() => setShowHowReviewsWorkModal(true)}
                  className="text-sm font-semibold text-gray-900 underline underline-offset-2 mt-2 hover:text-gray-700 transition-colors inline-block"
                >
                  How reviews work
                </button>
              </div>
            )}

            {/* Patient Experiences / 2-Column Review Grid */}
            {clinic.reviewHighlights && clinic.reviewHighlights.length > 0 ? (
              <div className="mb-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                  {clinic.reviewHighlights.map((review, index) => (
                    <div key={index} className="flex flex-col space-y-3">
                      {/* User Info */}
                      <div className="flex items-center gap-3.5">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-green-500 text-white flex items-center justify-center font-bold text-base flex-shrink-0 shadow-sm">
                          {review.author ? review.author.charAt(0) : 'P'}
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900 text-base leading-snug">{review.author}</h4>
                          <p className="text-xs text-gray-500 mt-0.5">Verified Patient</p>
                        </div>
                      </div>

                      {/* Rating & Date */}
                      <div className="flex items-center gap-2 text-xs font-semibold text-gray-900">
                        <div className="flex items-center gap-0.5">
                          {Array.from({ length: 5 }, (_, i) => (
                            <Star
                              key={i}
                              className={`w-3.5 h-3.5 ${
                                i < review.rating ? 'text-gray-900 fill-gray-900' : 'text-gray-200'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-gray-400">·</span>
                        <span className="text-gray-500 font-normal">{review.date}</span>
                      </div>

                      {/* Review text */}
                      <p className="text-gray-800 text-sm leading-relaxed">
                        {review.text.length > 140 ? (
                          <>
                            <span>{review.text.substring(0, 140)}... </span>
                            <button
                              onClick={() => handleShowMore(index)}
                              className="font-semibold underline text-gray-900 hover:text-blue-600 transition-colors"
                            >
                              Show more &gt;
                            </button>
                          </>
                        ) : (
                          review.text
                        )}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              /* Empty state */
              <div className="flex flex-col items-center text-center py-10 px-4 mb-8">
                <div className="relative mb-4">
                  <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center">
                    <MessageSquare className="w-9 h-9 text-gray-400" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-yellow-400 flex items-center justify-center border-2 border-white">
                    <Star className="w-3.5 h-3.5 text-white fill-white" />
                  </div>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">No reviews yet</h3>
                <p className="text-sm text-gray-500 mb-6 max-w-xs leading-relaxed">
                  Be the first to share your experience at <span className="font-medium text-gray-700">{clinic.practitioner_name}</span>.
                </p>
              </div>
            )}

            {/* Footer Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-gray-200">
              {clinic.number_of_reviews > 0 && (
                <button
                  onClick={() => setShowAllReviews(true)}
                  className="w-full sm:w-auto px-6 py-3 border border-gray-900 rounded-xl font-semibold text-sm text-gray-900 hover:bg-gray-50 transition-colors text-center"
                >
                  Show all {clinic.number_of_reviews} reviews
                </button>
              )}

              <button
                onClick={() => navigate(`${getClinicUrl(clinic)}/review`)}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white font-semibold text-sm rounded-xl transition shadow-sm hover:shadow-md"
              >
                <PenLine className="w-4 h-4" />
                Write a Review
              </button>
            </div>
          </section>

          {/* Where we are */}
          <section id="location" className="order-4 lg:col-span-3 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 pb-4">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <MapPin className="w-6 h-6 text-blue-600" />
                Where we are
              </h2>
            </div>
            <div className="h-52 sm:h-64 md:h-[calc(100vh-4rem)] bg-blue-50 border-y border-gray-100">
              <iframe
                title={`Map showing ${clinic.practitioner_name}`}
                src={mapEmbedUrl}
                className="w-full h-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
            <div className="p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-start gap-3 min-w-0">
                <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-4 h-4 text-blue-600" />
                </div>
                <p className="text-sm text-gray-600 leading-relaxed pt-1">{clinic.address}</p>
              </div>
              <a
                href={directionsUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition whitespace-nowrap"
              >
                <Navigation className="w-4 h-4" />
                Get directions
              </a>
            </div>
          </section>

          {/* What to bring */}
          <section className="order-5 lg:col-span-3 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-2">
              <ClipboardCheck className="w-6 h-6 text-green-600" />
              What to bring
            </h2>
            <p className="text-sm text-gray-500 mb-5">A few things that can help your visit go smoothly.</p>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <li className="flex items-start gap-3 rounded-xl bg-gray-50 p-4">
                <Calendar className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-700">Your appointment confirmation or booking details</span>
              </li>
              <li className="flex items-start gap-3 rounded-xl bg-gray-50 p-4">
                <Contact className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-700">A valid photo ID</span>
              </li>
              <li className="flex items-start gap-3 rounded-xl bg-gray-50 p-4">
                <CreditCard className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-700">Your HMO or insurance card, if you are using one</span>
              </li>
              <li className="flex items-start gap-3 rounded-xl bg-gray-50 p-4">
                <FileText className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-700">Relevant referrals, test results, and a current medication list</span>
              </li>
            </ul>
          </section>

          {/* Booking Sidebar */}
          <div className="order-2 lg:col-span-1 space-y-6">
            <div id="booking" className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 lg:sticky lg:top-24">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Calendar className="w-6 h-6 text-blue-600" />
                Book an Appointment
              </h2>

              {clinic.timeSlots && clinic.timeSlots.length > 0 ? (
                <>
                  <div className="space-y-6 mb-8">
                    {clinic.timeSlots.map((daySlot, dayIndex) => (
                      <div key={dayIndex}>
                        <p className="font-semibold text-gray-800 mb-3 border-b pb-2">{daySlot.day}</p>
                        <div className="grid grid-cols-2 gap-2">
                          {daySlot.slots.map((slot) => (
                            <button
                              key={slot.id}
                              onClick={() => setSelectedSlot({
                                day: daySlot.day,
                                date: daySlot.date,
                                time: slot.time,
                                rawTime: slot.rawTime,
                                slotId: slot.id,
                                durationMinutes: slot.durationMinutes,
                              })}
                              className={`py-2 px-3 text-sm rounded-lg border-2 transition-all duration-200 ${selectedSlot?.slotId === slot.id
                                ? 'border-blue-600 bg-blue-50 text-blue-700 font-bold shadow-sm'
                                : 'border-gray-200 hover:border-blue-300 text-gray-700 hover:bg-gray-50'
                                }`}
                            >
                              {slot.time}
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
                </>
              ) : (
                <div className="flex flex-col items-center text-center py-6 px-2">
                  <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mb-4">
                    <Calendar className="w-8 h-8 text-blue-400" />
                  </div>
                  <h3 className="font-semibold text-gray-800 mb-1">No online slots available</h3>
                  <p className="text-sm text-gray-500 mb-6">
                    This provider hasn't published online appointment slots yet. Contact them directly to book.
                  </p>
                  {clinic.phone && (
                    <a
                      href={`tel:${clinic.phone}`}
                      className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white py-3 px-6 rounded-lg text-base font-semibold transition shadow-md hover:shadow-lg mb-3"
                    >
                      <Phone className="w-5 h-5" />
                      Call to Book
                    </a>
                  )}
                  {clinic.email && (
                    <a
                      href={`mailto:${clinic.email}`}
                      className="w-full flex items-center justify-center gap-2 border-2 border-gray-200 hover:border-blue-300 text-gray-700 hover:bg-gray-50 py-3 px-6 rounded-lg text-base font-semibold transition"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>
                      Send an Email
                    </a>
                  )}
                </div>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* Booking Confirmation Modal */}
      <BookingConfirmationModal
        isOpen={showBookingModal}
        onClose={handleCloseBookingModal}
        onConfirm={handleConfirmBooking}
        clinic={clinic}
        slot={selectedSlot}
        isBooking={isBooking}
        isSuccess={bookingSuccess}
        bookingError={bookingError}
      />

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

      {/* Share Modal */}
      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        title="Share this clinic"
        subtitle={`${clinic.practitioner_name} ${clinic.number_of_reviews >= 3 ? `· ★${clinic.rating}` : ''} · ${clinic.practice_type}`}
        imageUrl={clinic.image_src}
        shareUrl={window.location.href}
        shareText={`Check out ${clinic.practitioner_name} on HealthProvida`}
      />

      {/* How Reviews Work Modal */}
      <HowReviewsWorkModal
        isOpen={showHowReviewsWorkModal}
        onClose={() => setShowHowReviewsWorkModal(false)}
      />
    </div>
  );
}
