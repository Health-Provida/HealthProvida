/**
 * AuditLogPage.jsx
 * Chronological log of all admin actions.
 */
import React, { useState, useEffect, useCallback } from 'react';
import { ClipboardList, User, Clock } from 'lucide-react';
import DataTable from '@/components/admin/DataTable';
import SearchFilter from '@/components/admin/SearchFilter';
import { fetchAuditLog } from '@/utils/adminQueries';

const ACTION_LABELS = {
  approve_application: { label: 'Approved application', color: 'text-emerald-600 bg-emerald-50' },
  reject_application:  { label: 'Rejected application', color: 'text-red-600 bg-red-50' },
  change_role:         { label: 'Changed user role',    color: 'text-blue-600 bg-blue-50' },
  toggle_is_active:    { label: 'Toggled clinic active', color: 'text-amber-600 bg-amber-50' },
  toggle_is_verified:  { label: 'Toggled clinic verified', color: 'text-blue-600 bg-blue-50' },
  delete_clinic:       { label: 'Deleted clinic',       color: 'text-red-600 bg-red-50' },
  delete_review:       { label: 'Deleted review',       color: 'text-red-600 bg-red-50' },
  create_hmo:          { label: 'Created HMO',          color: 'text-teal-600 bg-teal-50' },
  delete_hmo:          { label: 'Deleted HMO',          color: 'text-red-600 bg-red-50' },
  update_appointment_status: { label: 'Updated appointment', color: 'text-purple-600 bg-purple-50' },
};

function getActionInfo(action) {
  return ACTION_LABELS[action] || { label: action.replace(/_/g, ' '), color: 'text-gray-600 bg-gray-50' };
}

export default function AuditLogPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [actionFilter, setActionFilter] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    const { data, count } = await fetchAuditLog({ action: actionFilter || undefined });
    setLogs(data || []);
    setTotalCount(count || 0);
    setLoading(false);
  }, [actionFilter]);

  useEffect(() => { load(); }, [load]);

  const columns = [
    {
      key: 'created_at',
      label: 'Time',
      render: (val) => (
        <div className="flex items-center gap-2">
          <Clock className="w-3.5 h-3.5 text-gray-400" />
          <span className="text-sm text-gray-600">
            {new Date(val).toLocaleDateString('en-US', {
              month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
            })}
          </span>
        </div>
      ),
    },
    {
      key: 'admin_name',
      label: 'Admin',
      render: (val, row) => (
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-green-500 flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
            {val?.charAt(0)?.toUpperCase() || 'A'}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">{val}</p>
            <p className="text-[10px] text-gray-400">{row.admin_email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'action',
      label: 'Action',
      render: (val) => {
        const info = getActionInfo(val);
        return (
          <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${info.color}`}>
            {info.label}
          </span>
        );
      },
    },
    {
      key: 'target_type',
      label: 'Target',
      render: (val, row) => (
        <span className="text-sm text-gray-600">
          {val?.replace(/_/g, ' ')} <span className="text-gray-400 font-mono text-xs">#{row.target_id?.slice(0, 8)}</span>
        </span>
      ),
    },
    {
      key: 'details',
      label: 'Details',
      sortable: false,
      render: (val) => {
        if (!val) return <span className="text-gray-300">—</span>;
        const entries = typeof val === 'string' ? JSON.parse(val) : val;
        return (
          <div className="text-xs text-gray-500 max-w-xs truncate">
            {Object.entries(entries).map(([k, v]) => `${k}: ${v}`).join(', ')}
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
          <ClipboardList className="w-7 h-7 text-blue-600" />
          Audit Log
        </h1>
        <p className="text-gray-500 text-sm mt-1">{totalCount} logged actions</p>
      </div>

      <SearchFilter
        filters={[{
          key: 'action', label: 'All actions', value: actionFilter,
          options: Object.entries(ACTION_LABELS).map(([val, info]) => ({ value: val, label: info.label })),
        }]}
        onFilterChange={(_, val) => setActionFilter(val)}
        onClearAll={() => setActionFilter('')}
      />

      <DataTable columns={columns} data={logs} loading={loading} emptyMessage="No audit entries yet" rowKey="id" pageSize={30} />
    </div>
  );
}
