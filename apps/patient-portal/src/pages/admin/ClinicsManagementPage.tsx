/**
 * ClinicsManagementPage.jsx
 * Manage all clinics — toggle active/verified, search, filter, delete.
 */
import React, { useState, useEffect, useCallback } from 'react';
import { Building2, Eye, ToggleLeft, ToggleRight, CheckCircle, XCircle, Trash2 } from 'lucide-react';
import DataTable from '@/components/admin/DataTable';
import StatusBadge from '@/components/admin/StatusBadge';
import SearchFilter from '@/components/admin/SearchFilter';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import { fetchAllClinics, toggleClinicField, deleteClinic } from '@/utils/adminQueries';
import { useAuth } from '@/context/AuthContext';

export default function ClinicsManagementPage() {
  const [clinics, setClinics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [activeFilter, setActiveFilter] = useState('');
  const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null, name: '' });
  const [actionLoading, setActionLoading] = useState(false);
  const { hasAdminWrite } = useAuth();

  const loadClinics = useCallback(async () => {
    setLoading(true);
    const { data, count, error } = await fetchAllClinics({
      search: search || undefined,
      category: categoryFilter || undefined,
      active: activeFilter || undefined,
    });
    if (!error) {
      setClinics(data);
      setTotalCount(count);
    }
    setLoading(false);
  }, [search, categoryFilter, activeFilter]);

  useEffect(() => {
    loadClinics();
  }, [loadClinics]);

  const handleToggle = async (clinicId, field, currentValue) => {
    await toggleClinicField(clinicId, field, !currentValue);
    loadClinics();
  };

  const handleDelete = async () => {
    setActionLoading(true);
    await deleteClinic(deleteDialog.id);
    setActionLoading(false);
    setDeleteDialog({ open: false, id: null, name: '' });
    loadClinics();
  };

  const columns = [
    {
      key: 'id',
      label: 'ID',
      className: 'w-16',
      render: (val) => <span className="text-xs text-gray-400 font-mono">#{val}</span>,
    },
    {
      key: 'practitioner_name',
      label: 'Clinic Name',
      render: (val, row) => (
        <div>
          <p className="font-medium text-gray-900">{val}</p>
          <p className="text-xs text-gray-500">{row.practitioner_category}</p>
        </div>
      ),
    },
    {
      key: 'rating',
      label: 'Rating',
      render: (val, row) => (
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-medium text-gray-900">{parseFloat(val).toFixed(1)}</span>
          <span className="text-xs text-gray-400">({row.number_of_reviews})</span>
        </div>
      ),
    },
    {
      key: 'is_active',
      label: 'Active',
      sortable: false,
      render: (val, row) => (
        <button
          onClick={(e) => { e.stopPropagation(); hasAdminWrite && handleToggle(row.id, 'is_active', val); }}
          disabled={!hasAdminWrite}
          className={`flex items-center gap-1 transition ${val ? 'text-emerald-600' : 'text-gray-400'} ${hasAdminWrite ? 'cursor-pointer hover:opacity-80' : 'cursor-default'}`}
        >
          {val ? <ToggleRight className="w-6 h-6" /> : <ToggleLeft className="w-6 h-6" />}
        </button>
      ),
    },
    {
      key: 'is_verified',
      label: 'Verified',
      sortable: false,
      render: (val, row) => (
        <button
          onClick={(e) => { e.stopPropagation(); hasAdminWrite && handleToggle(row.id, 'is_verified', val); }}
          disabled={!hasAdminWrite}
          className={`transition ${hasAdminWrite ? 'cursor-pointer hover:opacity-80' : 'cursor-default'}`}
        >
          {val
            ? <CheckCircle className="w-5 h-5 text-blue-600" />
            : <XCircle className="w-5 h-5 text-gray-300" />
          }
        </button>
      ),
    },
    {
      key: 'actions',
      label: '',
      sortable: false,
      className: 'w-12',
      render: (_, row) => (
        hasAdminWrite && (
          <button
            onClick={(e) => { e.stopPropagation(); setDeleteDialog({ open: true, id: row.id, name: row.practitioner_name }); }}
            className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition"
            title="Delete clinic"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
          <Building2 className="w-7 h-7 text-blue-600" />
          Clinics Management
        </h1>
        <p className="text-gray-500 text-sm mt-1">{totalCount} clinics total</p>
      </div>

      <SearchFilter
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search clinics..."
        filters={[
          {
            key: 'category',
            label: 'All categories',
            value: categoryFilter,
            options: [
              { value: 'Hospital', label: 'Hospital' },
              { value: 'Clinic', label: 'Clinic' },
              { value: 'Diagnostic Center', label: 'Diagnostic Center' },
              { value: 'Pharmacy', label: 'Pharmacy' },
              { value: 'Dental Clinic', label: 'Dental Clinic' },
              { value: 'Specialist Center', label: 'Specialist Center' },
            ],
          },
          {
            key: 'active',
            label: 'All status',
            value: activeFilter,
            options: [
              { value: 'true', label: 'Active' },
              { value: 'false', label: 'Inactive' },
            ],
          },
        ]}
        onFilterChange={(key, val) => {
          if (key === 'category') setCategoryFilter(val);
          if (key === 'active') setActiveFilter(val);
        }}
        onClearAll={() => { setSearch(''); setCategoryFilter(''); setActiveFilter(''); }}
      />

      <DataTable
        columns={columns}
        data={clinics}
        loading={loading}
        emptyMessage="No clinics found"
        rowKey="id"
      />

      <ConfirmDialog
        open={deleteDialog.open}
        onOpenChange={(v) => !v && setDeleteDialog({ open: false, id: null, name: '' })}
        title="Delete Clinic"
        description={`Are you sure you want to permanently delete "${deleteDialog.name}"? This action cannot be undone.`}
        confirmLabel="Delete Permanently"
        variant="danger"
        onConfirm={handleDelete}
        loading={actionLoading}
      />
    </div>
  );
}
