/**
 * ReviewsModerationPage.jsx
 * Moderate reviews — toggle verified, delete.
 */
import React, { useState, useEffect, useCallback } from 'react';
import { Star, CheckCircle, XCircle, Trash2 } from 'lucide-react';
import DataTable from '@/components/admin/DataTable';
import SearchFilter from '@/components/admin/SearchFilter';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import { fetchAllReviews, toggleReviewVerified, deleteReview } from '@/utils/adminQueries';

export default function ReviewsModerationPage() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [ratingFilter, setRatingFilter] = useState('');
  const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null });
  const [actionLoading, setActionLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, count } = await fetchAllReviews({ rating: ratingFilter || undefined });
    setReviews(data || []);
    setTotalCount(count || 0);
    setLoading(false);
  }, [ratingFilter]);

  useEffect(() => { load(); }, [load]);

  const handleToggleVerified = async (id, currentVal) => {
    await toggleReviewVerified(id, !currentVal);
    load();
  };

  const handleDelete = async () => {
    setActionLoading(true);
    await deleteReview(deleteDialog.id);
    setActionLoading(false);
    setDeleteDialog({ open: false, id: null });
    load();
  };

  const columns = [
    { key: 'clinic_name', label: 'Clinic' },
    { key: 'author_name', label: 'Author' },
    {
      key: 'rating',
      label: 'Rating',
      render: (val) => (
        <div className="flex items-center gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} className={`w-3.5 h-3.5 ${i < val ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`} />
          ))}
        </div>
      ),
    },
    {
      key: 'review_text',
      label: 'Review',
      render: (val) => <p className="text-sm text-gray-600 max-w-xs truncate">{val}</p>,
    },
    {
      key: 'is_verified',
      label: 'Verified',
      sortable: false,
      render: (val, row) => (
        <button onClick={(e) => { e.stopPropagation(); handleToggleVerified(row.id, val); }}>
          {val ? <CheckCircle className="w-5 h-5 text-blue-600" /> : <XCircle className="w-5 h-5 text-gray-300" />}
        </button>
      ),
    },
    {
      key: 'created_at',
      label: 'Date',
      render: (val) => <span className="text-xs text-gray-500">{new Date(val).toLocaleDateString()}</span>,
    },
    {
      key: 'actions',
      label: '',
      sortable: false,
      className: 'w-12',
      render: (_, row) => (
        <button
          onClick={(e) => { e.stopPropagation(); setDeleteDialog({ open: true, id: row.id }); }}
          className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
          <Star className="w-7 h-7 text-amber-500" />
          Reviews Moderation
        </h1>
        <p className="text-gray-500 text-sm mt-1">{totalCount} reviews total</p>
      </div>

      <SearchFilter
        filters={[{
          key: 'rating', label: 'All ratings', value: ratingFilter,
          options: [1,2,3,4,5].map(r => ({ value: String(r), label: `${r} star${r > 1 ? 's' : ''}` })),
        }]}
        onFilterChange={(_, val) => setRatingFilter(val)}
        onClearAll={() => setRatingFilter('')}
      />

      <DataTable columns={columns} data={reviews} loading={loading} emptyMessage="No reviews found" rowKey="id" />

      <ConfirmDialog
        open={deleteDialog.open}
        onOpenChange={(v) => !v && setDeleteDialog({ open: false, id: null })}
        title="Delete Review"
        description="Are you sure you want to permanently delete this review?"
        confirmLabel="Delete"
        variant="danger"
        onConfirm={handleDelete}
        loading={actionLoading}
      />
    </div>
  );
}
