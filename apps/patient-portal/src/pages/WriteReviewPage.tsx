import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, ArrowLeft, Loader2, PenLine, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { fetchClinicBySlug, fetchUserReviewForClinic } from '@/utils/supabaseQueries';
import { getClinicUrl } from '@/utils/slugUtils';
import { submitReview, updateReview } from '@/utils/submitReview';
import { toast } from '@/components/ui/use-toast';
import { runAntiSpamChecks, createTimestampTracker, HONEYPOT_FIELD_NAME, HONEYPOT_STYLES } from '@/utils/antiSpam';

const RATING_LABELS = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];
const MIN_CHARS = 20;
const MAX_CHARS = 1000;
const REVIEW_CATEGORIES = [
  { key: 'staff_friendliness_rating', label: 'Staff friendliness' },
  { key: 'wait_time_rating', label: 'Wait time' },
  { key: 'quality_of_care_rating', label: 'Quality of care' },
  { key: 'facility_cleanliness_rating', label: 'Facility cleanliness' },
];

const createEmptyCategoryRatings = () => Object.fromEntries(
  REVIEW_CATEGORIES.map(({ key }) => [key, 0])
);

function StarRating({ rating, onRate, hoverRating, onHover, onLeave, size = 'lg' }) {
  const starSize = size === 'lg' ? 'w-10 h-10 md:w-12 md:h-12' : 'w-8 h-8';

  return (
    <div
      className="flex items-center gap-1 md:gap-2"
      onMouseLeave={onLeave}
    >
      {[1, 2, 3, 4, 5].map((star) => {
        const active = star <= (hoverRating || rating);
        return (
          <button
            key={star}
            type="button"
            onClick={() => onRate(star)}
            onMouseEnter={() => onHover(star)}
            className={`
              ${starSize} rounded-full transition-all duration-200 ease-out
              ${active
                ? 'text-amber-400 scale-110 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]'
                : 'text-gray-300 hover:text-amber-300 hover:scale-105'
              }
            `}
            aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
          >
            <Star
              className={`w-full h-full transition-all duration-200 ${active ? 'fill-amber-400' : ''}`}
            />
          </button>
        );
      })}
    </div>
  );
}

function CategoryStarRating({ label, rating, onRate }) {
  return (
    <div className="flex items-center gap-1" role="radiogroup" aria-label={`${label} rating`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onRate(star)}
          className={`p-0.5 transition-transform hover:scale-110 ${star <= rating ? 'text-amber-400' : 'text-gray-200 hover:text-amber-300'}`}
          aria-label={`Rate ${label} ${star} star${star === 1 ? '' : 's'}`}
          aria-checked={star === rating}
          role="radio"
        >
          <Star className={`w-5 h-5 ${star <= rating ? 'fill-current' : ''}`} />
        </button>
      ))}
    </div>
  );
}

export default function WriteReviewPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user, profile, isAuthenticated, loading: authLoading } = useAuth();

  const [clinic, setClinic] = useState(null);
  const [existingReview, setExistingReview] = useState(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Form state
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [categoryRatings, setCategoryRatings] = useState(createEmptyCategoryRatings);
  const [reviewText, setReviewText] = useState('');
  const [formError, setFormError] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const timestampTracker = useMemo(() => createTimestampTracker(), []);

  const isEditing = !!existingReview;

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate(`/login?redirect=/clinic/${slug}/review`, { replace: true });
    }
  }, [authLoading, isAuthenticated, navigate, slug]);

  // Load clinic + existing review
  const loadData = useCallback(async () => {
    if (!user) return;
    setPageLoading(true);

    const [clinicResult, reviewResult] = await Promise.all([
      fetchClinicBySlug(slug),
      // We need the clinic ID for the review query, but we don't have it yet.
      // We'll fetch the review after we have the clinic data.
      Promise.resolve({ data: null }),
    ]);

    if (clinicResult.data) {
      setClinic(clinicResult.data);
      // Now fetch existing review using the numeric clinic ID
      const reviewResult = await fetchUserReviewForClinic(clinicResult.data.id, user.id);
      if (reviewResult.data) {
        setExistingReview(reviewResult.data);
        setRating(reviewResult.data.rating);
        setCategoryRatings(REVIEW_CATEGORIES.reduce((ratings, { key }) => {
          ratings[key] = Number(reviewResult.data[key]) || 0;
          return ratings;
        }, {}));
        setReviewText(reviewResult.data.review_text);
      }
    }

    setPageLoading(false);
  }, [slug, user]);

  useEffect(() => {
    if (user) loadData();
  }, [loadData, user]);

  // Scroll to top
  useEffect(() => {
    window.scrollTo(0, 0);
    timestampTracker.getLoadTime();
  }, [timestampTracker]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    // Anti-spam checks
    const spamResult = runAntiSpamChecks({
      honeypotValue: honeypot,
      action: 'submit-review',
      rateLimit: { maxAttempts: 3, windowMs: 300000 },
      timestampTracker,
      minSubmitTimeMs: 5000,
    });
    if (spamResult === '__silent_drop__') return;
    if (spamResult) { setFormError(spamResult); return; }

    if (rating === 0) {
      setFormError('Please select a star rating.');
      return;
    }
    if (REVIEW_CATEGORIES.some(({ key }) => categoryRatings[key] === 0)) {
      setFormError('Please rate each review category.');
      return;
    }
    if (reviewText.trim().length < MIN_CHARS) {
      setFormError(`Please write at least ${MIN_CHARS} characters.`);
      return;
    }

    setSubmitting(true);

    let result;
    if (isEditing) {
      result = await updateReview({
        reviewId: existingReview.id,
        rating,
        categoryRatings,
        reviewText: reviewText.trim(),
      });
    } else {
      result = await submitReview({
        clinicId: clinic.id,
        patientId: user.id,
        authorName: profile?.full_name || user.email?.split('@')[0] || 'Patient',
        rating,
        categoryRatings,
        reviewText: reviewText.trim(),
      });
    }

    setSubmitting(false);

    if (result.error) {
      // Handle duplicate review error from unique constraint
      if (result.error.code === '23505') {
        setFormError('You have already reviewed this clinic. Your existing review has been loaded.');
        await loadData();
        return;
      }
      setFormError(result.error.message || 'Failed to submit review. Please try again.');
      return;
    }

    setSubmitted(true);
    toast({
      title: isEditing ? 'Review Updated!' : 'Review Submitted!',
      description: isEditing
        ? 'Your review has been updated successfully.'
        : 'Thank you for sharing your experience.',
    });

    // Navigate back after brief delay
    setTimeout(() => {
      navigate(getClinicUrl(clinic), { replace: true });
    }, 1500);
  };

  // Loading state
  if (authLoading || pageLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          <p className="text-gray-500 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  // Clinic not found
  if (!clinic) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Clinic Not Found</h1>
        <p className="text-gray-600 mb-6">The clinic you're trying to review doesn't exist.</p>
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

  // Success state
  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 md:p-12 max-w-md w-full text-center"
          style={{ animation: 'fadeInUp 0.4s ease-out' }}
        >
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {isEditing ? 'Review Updated!' : 'Thank You!'}
          </h2>
          <p className="text-gray-600 mb-1">
            {isEditing
              ? 'Your review has been updated successfully.'
              : 'Your review has been submitted successfully.'
            }
          </p>
          <p className="text-gray-400 text-sm">Redirecting you back to the clinic page...</p>
        </div>
      </div>
    );
  }

  const charCount = reviewText.length;
  const charCountColor = charCount < MIN_CHARS
    ? 'text-gray-400'
    : charCount > MAX_CHARS
      ? 'text-red-500'
      : 'text-green-600';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-4">
          <button
            onClick={() => navigate(getClinicUrl(clinic))}
            className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <h1 className="text-lg font-bold text-gray-900 truncate">
            {isEditing ? 'Edit Your Review' : 'Write a Review'}
          </h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 md:py-10">
        {/* Clinic Context Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-6 mb-6 flex items-center gap-4">
          <div className="w-16 h-16 md:w-20 md:h-20 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
            <img
              src={clinic.image_src}
              alt={clinic.practitioner_name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="min-w-0">
            <h2 className="text-base md:text-lg font-bold text-gray-900 truncate">
              {clinic.practitioner_name}
            </h2>
            <p className="text-sm text-gray-500 truncate">{clinic.practice_type}</p>
            <div className="flex items-center gap-1.5 mt-1">
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
              <span className="text-sm font-semibold text-gray-900">{clinic.rating}</span>
              <span className="text-sm text-gray-400">
                ({clinic.number_of_reviews} review{clinic.number_of_reviews !== 1 ? 's' : ''})
              </span>
            </div>
          </div>
        </div>

        {/* Edit Banner */}
        {isEditing && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 flex items-start gap-3">
            <PenLine className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-blue-900">Editing your existing review</p>
              <p className="text-sm text-blue-700 mt-0.5">
                You've already reviewed this clinic. Update your rating and feedback below.
              </p>
            </div>
          </div>
        )}

        {/* Review Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Honeypot — invisible to humans, bots auto-fill it */}
          <div style={HONEYPOT_STYLES} aria-hidden="true">
            <label htmlFor={HONEYPOT_FIELD_NAME}>Leave this empty</label>
            <input
              id={`review-${HONEYPOT_FIELD_NAME}`}
              name={HONEYPOT_FIELD_NAME}
              type="text"
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
              autoComplete="off"
              tabIndex={-1}
            />
          </div>
          {/* Star Rating */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8 text-center">
            <h3 className="text-lg font-bold text-gray-900 mb-1">
              How was your experience?
            </h3>
            <p className="text-sm text-gray-500 mb-5">
              Tap a star to rate {clinic.practitioner_name}
            </p>

            <div className="flex justify-center mb-3">
              <StarRating
                rating={rating}
                onRate={setRating}
                hoverRating={hoverRating}
                onHover={setHoverRating}
                onLeave={() => setHoverRating(0)}
              />
            </div>

            {/* Rating label */}
            <div className="h-6">
              {(hoverRating || rating) > 0 && (
                <span className={`
                  inline-block text-sm font-semibold px-3 py-0.5 rounded-full transition-all duration-200
                  ${(hoverRating || rating) >= 4
                    ? 'bg-green-100 text-green-700'
                    : (hoverRating || rating) >= 3
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-red-100 text-red-700'
                  }
                `}>
                  {RATING_LABELS[hoverRating || rating]}
                </span>
              )}
            </div>
          </div>

          {/* Review Categories */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8">
            <h3 className="text-lg font-bold text-gray-900 mb-1">Rate your visit</h3>
            <p className="text-sm text-gray-500 mb-5">
              Your category ratings help patients know what to expect.
            </p>

            <div className="divide-y divide-gray-100">
              {REVIEW_CATEGORIES.map(({ key, label }) => (
                <div key={key} className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
                  <span className="text-sm font-medium text-gray-700">{label}</span>
                  <CategoryStarRating
                    label={label}
                    rating={categoryRatings[key]}
                    onRate={(value) => setCategoryRatings((ratings) => ({ ...ratings, [key]: value }))}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Review Text */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8">
            <h3 className="text-lg font-bold text-gray-900 mb-1">
              Share your experience
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Help other patients by describing your visit, the quality of care, and the staff
            </p>

            <textarea
              value={reviewText}
              onChange={(e) => {
                if (e.target.value.length <= MAX_CHARS) {
                  setReviewText(e.target.value);
                }
              }}
              placeholder="What did you like or dislike? How was the service, the facility, and the staff?"
              rows={6}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-900 placeholder:text-gray-400 text-sm leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />

            <div className="flex items-center justify-between mt-2">
              <p className={`text-xs ${charCountColor} transition-colors`}>
                {charCount < MIN_CHARS
                  ? `${MIN_CHARS - charCount} more characters needed`
                  : `${charCount}/${MAX_CHARS}`
                }
              </p>
            </div>
          </div>

          {/* Error Message */}
          {formError && (
            <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4">
              <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-700">{formError}</p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting || rating === 0 || REVIEW_CATEGORIES.some(({ key }) => categoryRatings[key] === 0) || reviewText.trim().length < MIN_CHARS}
            className={`
              w-full py-3.5 px-6 rounded-xl text-base font-semibold transition-all duration-200 flex items-center justify-center gap-2
              ${submitting || rating === 0 || REVIEW_CATEGORIES.some(({ key }) => categoryRatings[key] === 0) || reviewText.trim().length < MIN_CHARS
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white shadow-md hover:shadow-lg active:scale-[0.98]'
              }
            `}
          >
            {submitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                {isEditing ? 'Updating...' : 'Submitting...'}
              </>
            ) : (
              <>
                <PenLine className="w-5 h-5" />
                {isEditing ? 'Update Review' : 'Submit Review'}
              </>
            )}
          </button>
        </form>
      </div>

      {/* Animation keyframe */}
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
