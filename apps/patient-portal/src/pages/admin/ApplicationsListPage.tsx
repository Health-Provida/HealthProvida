/**
 * ApplicationsListPage.jsx
 * Filterable, sortable table of all provider applications.
 */
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Eye } from 'lucide-react';
import DataTable from '@/components/admin/DataTable';
import StatusBadge from '@/components/admin/StatusBadge';
import SearchFilter from '@/components/admin/SearchFilter';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import { fetchApplications, approveApplication, rejectApplication } from '@/utils/adminQueries';
import { useAuth } from '@/context/AuthContext';

export default function ApplicationsListPage() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [approveDialog, setApproveDialog] = useState({ open: false, id: null });
  const [rejectDialog, setRejectDialog] = useState({ open: false, id: null });
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState(null);

  const { hasAdminWrite } = useAuth();
  const navigate = useNavigate();

  const loadApplications = useCallback(async () => {
    setLoading(true);
    const { data, count, error } = await fetchApplications({
      status: statusFilter || undefined,
      search: search || undefined,
    });
    if (!error) {
      setApplications(data);
      setTotalCount(count);
    }
    setLoading(false);
  }, [statusFilter, search]);

  useEffect(() => {
    loadApplications();
  }, [loadApplications]);

  const handleApprove = async (notes) => {
    setActionLoading(true);
    setActionError(null);
    const { error } = await approveApplication(approveDialog.id, notes);
    setActionLoading(false);
    if (!error) {
      setApproveDialog({ open: false, id: null });
      loadApplications();
    } else {
      setActionError(error.message || 'Failed to approve application. Please try again.');
    }
  };

  const handleReject = async (reason) => {
    setActionLoading(true);
    setActionError(null);
    const { error } = await rejectApplication(rejectDialog.id, reason);
    setActionLoading(false);
    if (!error) {
      setRejectDialog({ open: false, id: null });
      loadApplications();
    } else {
      setActionError(error.message || 'Failed to reject application. Please try again.');
    }
  };

  const columns = [
    {
      key: 'practitioner_name',
      label: 'Practitioner',
      render: (val, row) => (
        <div>
          <p className="font-medium text-gray-900">{val}</p>
          <p className="text-xs text-gray-500">{row.email}</p>
        </div>
      ),
    },
    {
      key: 'practitioner_type',
      label: 'Type',
      render: (val) => (
        <span className="text-sm text-gray-600">{val}</span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (val) => <StatusBadge status={val} showDot />,
    },
    {
      key: 'created_at',
      label: 'Submitted',
      render: (val) => (
        <span className="text-sm text-gray-500">
          {new Date(val).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      sortable: false,
      render: (_, row) => (
        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => navigate(`/admin/applications/${row.id}`)}
            className="p-2 rounded-lg hover:bg-blue-50 text-gray-500 hover:text-blue-600 transition"
            title="View details"
          >
            <Eye className="w-4 h-4" />
          </button>
          {hasAdminWrite && row.status === 'pending' && (
            <>
              <button
                onClick={() => setApproveDialog({ open: true, id: row.id })}
                className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition"
              >
                Approve
              </button>
              <button
                onClick={() => setRejectDialog({ open: true, id: row.id })}
                className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-red-50 text-red-700 hover:bg-red-100 transition"
              >
                Reject
              </button>
            </>
          )}
        </div>
      ),
    },
  ];

  const pendingCount = applications.filter(a => a.status === 'pending').length;

  return (
    <div className="space-y-6">
      {/* Action Error Banner */}
      {actionError && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700">
          <span className="text-sm font-medium flex-1">{actionError}</span>
          <button
            onClick={() => setActionError(null)}
            className="text-red-400 hover:text-red-600 transition text-lg leading-none"
            aria-label="Dismiss error"
          >
            ×
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <FileText className="w-7 h-7 text-blue-600" />
            Provider Applications
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {totalCount} total · {pendingCount > 0 && (
              <span className="text-amber-600 font-medium">{pendingCount} pending review</span>
            )}
          </p>
        </div>
      </div>

      {/* Filters */}
      <SearchFilter
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by name or email..."
        filters={[
          {
            key: 'status',
            label: 'All statuses',
            value: statusFilter,
            options: [
              { value: 'pending', label: 'Pending' },
              { value: 'approved', label: 'Approved' },
              { value: 'rejected', label: 'Rejected' },
            ],
          },
        ]}
        onFilterChange={(key, val) => setStatusFilter(val)}
        onClearAll={() => { setSearch(''); setStatusFilter(''); }}
      />

      {/* Table */}
      <DataTable
        columns={columns}
        data={applications}
        loading={loading}
        emptyMessage="No applications found"
        onRowClick={(row) => navigate(`/admin/applications/${row.id}`)}
        rowKey="id"
      />

      {/* Approve Dialog */}
      <ConfirmDialog
        open={approveDialog.open}
        onOpenChange={(v) => !v && setApproveDialog({ open: false, id: null })}
        title="Approve Application"
        description="This will create a new clinic from the application data and promote the applicant to a provider role."
        confirmLabel="Approve & Create Clinic"
        showTextarea
        textareaLabel="Admin Notes (optional)"
        textareaPlaceholder="Any notes about this approval..."
        onConfirm={handleApprove}
        loading={actionLoading}
      />

      {/* Reject Dialog */}
      <ConfirmDialog
        open={rejectDialog.open}
        onOpenChange={(v) => !v && setRejectDialog({ open: false, id: null })}
        title="Reject Application"
        description="Please provide a reason for the rejection. This will be stored in the admin notes."
        confirmLabel="Reject Application"
        cancelLabel="Cancel"
        variant="danger"
        showTextarea
        textareaLabel="Rejection Reason"
        textareaPlaceholder="Explain why this application is being rejected..."
        textareaRequired
        onConfirm={handleReject}
        loading={actionLoading}
      />
    </div>
  );
}
