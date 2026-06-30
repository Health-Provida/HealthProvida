/**
 * ProviderReviewsPage.jsx
 * View and filter clinic reviews (read-only — providers can't delete).
 */
import React, { useState, useEffect, useCallback } from 'react';
import { Star, ChevronLeft, ChevronRight, MessageSquare } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { fetchProviderClinic, fetchProviderReviews } from '@/utils/providerQueries';

const RATING_FILTERS = [0, 5, 4, 3, 2, 1]; // 0 = all
const PAGE_SIZE = 10;

export default function ProviderReviewsPage() {
  const [clinicId, setClinicId] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const [ratingFilter, setRatingFilter] = useState(0);
  const [loading, setLoading] = useState(true);

  const { user } = useAuth();

  useEffect(() => { if (user?.id) init(); }, [user?.id]);

  const init = async () => {
    const { data } = await fetchProviderClinic(user.id);
    if (data) {
      setClinicId(data.id);
      load(data.id, 1, 0);
    } else {
      setLoading(false);
    }
  };

  const load = useCallback(async (cId, p, rating) => {
    setLoading(true);
    const { data, count: total } = await fetchProviderReviews(cId || clinicId, {
      rating: rating || ratingFilter || undefined,
      page: p || page,
      pageSize: PAGE_SIZE,
    });
    setReviews(data);
    setCount(total);
    setLoading(false);
  }, [clinicId, ratingFilter, page]);

  const handleFilterChange = (rating) => {
    setRatingFilter(rating);
    setPage(1);
    load(clinicId, 1, rating || undefined);
  };

  const totalPages = Math.ceil(count / PAGE_SIZE);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Reviews</h1>
        <p className="text-gray-500 text-sm mt-1">See what patients are saying about your clinic</p>
      </div>

      {/* Rating filters */}
      <div className="flex flex-wrap gap-2">
        {RATING_FILTERS.map((r) => (
          <button
            key={r}
            onClick={() => handleFilterChange(r)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition ${
              ratingFilter === r
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {r === 0 ? (
              'All'
            ) : (
              <>
                {r}
                <Star className={`w-3.5 h-3.5 ${ratingFilter === r ? 'text-amber-300 fill-amber-300' : 'text-amber-400 fill-amber-400'}`} />
              </>
            )}
          </button>
        ))}
      </div>

      {/* Reviews list */}
      <div className="space-y-4">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6 animate-pulse space-y-3">
              <div className="h-4 bg-gray-100 rounded w-32" />
              <div className="h-3 bg-gray-100 rounded w-full" />
              <div className="h-3 bg-gray-100 rounded w-3/4" />
            </div>
          ))
        ) : reviews.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 px-6 py-12 text-center">
            <MessageSquare className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No reviews found</p>
            <p className="text-gray-400 text-sm mt-1">
              {ratingFilter > 0 ? `No ${ratingFilter}-star reviews yet` : 'Reviews will appear here when patients leave feedback'}
            </p>
          </div>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-sm font-semibold text-gray-900">{review.author_name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {new Date(review.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${i < review.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200'}`}
                    />
                  ))}
                </div>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">{review.review_text}</p>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-sm text-gray-500">
            Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, count)} of {count}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => { setPage(page - 1); load(clinicId, page - 1, ratingFilter || undefined); }}
              disabled={page <= 1}
              className="p-2 rounded-xl border border-gray-200 hover:bg-gray-50 disabled:opacity-40 transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm text-gray-600 font-medium px-2">{page} / {totalPages}</span>
            <button
              onClick={() => { setPage(page + 1); load(clinicId, page + 1, ratingFilter || undefined); }}
              disabled={page >= totalPages}
              className="p-2 rounded-xl border border-gray-200 hover:bg-gray-50 disabled:opacity-40 transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
