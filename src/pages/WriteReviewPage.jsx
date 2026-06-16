import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, ArrowLeft, Loader2, PenLine, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { fetchClinicById, fetchUserReviewForClinic } from '@/utils/supabaseQueries';
import { submitReview, updateReview } from '@/utils/submitReview';
import { toast } from '@/components/ui/use-toast';

const RATING_LABELS = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];
const MIN_CHARS = 20;
const MAX_CHARS = 1000;

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

export default function WriteReviewPage() {
  const { id } = useParams();
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
  const [reviewText, setReviewText] = useState('');
  const [formError, setFormError] = useState('');

  const isEditing = !!existingReview;

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate(`/login?redirect=/clinic/${id}/review`, { replace: true });
    }
  }, [authLoading, isAuthenticated, navigate, id]);

  // Load clinic + existing review
  const loadData = useCallback(async () => {
    if (!user) return;
    setPageLoading(true);

    const [clinicResult, reviewResult] = await Promise.all([
      fetchClinicById(id),
      fetchUserReviewForClinic(id, user.id),
    ]);

    if (clinicResult.data) {
      setClinic(clinicResult.data);
    }

    if (reviewResult.data) {
      setExistingReview(reviewResult.data);
      setRating(reviewResult.data.rating);
      setReviewText(reviewResult.data.review_text);
    }

    setPageLoading(false);
  }, [id, user]);

  useEffect(() => {
    if (user) loadData();
  }, [loadData, user]);

  // Scroll to top
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (rating === 0) {
      setFormError('Please select a star rating.');
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
        reviewText: reviewText.trim(),
      });
    } else {
      result = await submitReview({
        clinicId: Number(id),
        patientId: user.id,
        authorName: profile?.full_name || user.email?.split('@')[0] || 'Patient',
        rating,
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
      navigate(`/clinic/${id}`, { replace: true });
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
            onClick={() => navigate(`/clinic/${id}`)}
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
            disabled={submitting || rating === 0 || reviewText.trim().length < MIN_CHARS}
            className={`
              w-full py-3.5 px-6 rounded-xl text-base font-semibold transition-all duration-200 flex items-center justify-center gap-2
              ${submitting || rating === 0 || reviewText.trim().length < MIN_CHARS
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
