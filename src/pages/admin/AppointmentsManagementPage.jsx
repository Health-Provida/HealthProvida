/**
 * AppointmentsManagementPage.jsx
 * View and manage all appointments across clinics.
 */
import React, { useState, useEffect, useCallback } from 'react';
import { Calendar } from 'lucide-react';
import DataTable from '@/components/admin/DataTable';
import StatusBadge from '@/components/admin/StatusBadge';
import SearchFilter from '@/components/admin/SearchFilter';
import { fetchAllAppointments, updateAppointmentStatus } from '@/utils/adminQueries';

export default function AppointmentsManagementPage() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [statusFilter, setStatusFilter] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    const { data, count } = await fetchAllAppointments({ status: statusFilter || undefined });
    setAppointments(data || []);
    setTotalCount(count || 0);
    setLoading(false);
  }, [statusFilter]);

  useEffect(() => { load(); }, [load]);

  const handleStatusChange = async (id, newStatus) => {
    await updateAppointmentStatus(id, newStatus);
    load();
  };

  const columns = [
    {
      key: 'patient_name',
      label: 'Patient',
      render: (val, row) => (
        <div>
          <p className="font-medium text-gray-900">{val}</p>
          <p className="text-xs text-gray-500">{row.patient_email}</p>
        </div>
      ),
    },
    { key: 'clinic_name', label: 'Clinic' },
    {
      key: 'appointment_date',
      label: 'Date',
      render: (val) => <span className="text-sm">{new Date(val + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>,
    },
    {
      key: 'appointment_time',
      label: 'Time',
      render: (val) => <span className="text-sm">{val?.slice(0, 5)}</span>,
    },
    {
      key: 'status',
      label: 'Status',
      render: (val) => <StatusBadge status={val} showDot />,
    },
    {
      key: 'actions',
      label: 'Update',
      sortable: false,
      render: (_, row) => (
        <select
          value={row.status}
          onClick={(e) => e.stopPropagation()}
          onChange={(e) => handleStatusChange(row.id, e.target.value)}
          className="px-2 py-1.5 rounded-lg border border-gray-200 text-xs bg-white cursor-pointer outline-none"
        >
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="cancelled">Cancelled</option>
          <option value="completed">Completed</option>
          <option value="no_show">No Show</option>
        </select>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
          <Calendar className="w-7 h-7 text-blue-600" />
          Appointments
        </h1>
        <p className="text-gray-500 text-sm mt-1">{totalCount} appointments total</p>
      </div>

      <SearchFilter
        filters={[{
          key: 'status', label: 'All statuses', value: statusFilter,
          options: [
            { value: 'pending', label: 'Pending' },
            { value: 'confirmed', label: 'Confirmed' },
            { value: 'cancelled', label: 'Cancelled' },
            { value: 'completed', label: 'Completed' },
            { value: 'no_show', label: 'No Show' },
          ],
        }]}
        onFilterChange={(_, val) => setStatusFilter(val)}
        onClearAll={() => setStatusFilter('')}
      />

      <DataTable columns={columns} data={appointments} loading={loading} emptyMessage="No appointments found" rowKey="id" />
    </div>
  );
}
