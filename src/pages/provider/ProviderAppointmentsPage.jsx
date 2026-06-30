/**
 * ProviderAppointmentsPage.jsx
 * Manage appointments with filters, status transitions, and pagination.
 */
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar, Clock, Search, Filter, ChevronLeft, ChevronRight,
  CheckCircle, XCircle, AlertCircle, UserX, MoreHorizontal
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import {
  fetchProviderClinic,
  fetchProviderAppointments,
  updateAppointmentStatus,
} from '@/utils/providerQueries';

const STATUSES = ['all', 'pending', 'confirmed', 'completed', 'cancelled', 'no_show'];

const STATUS_STYLES = {
  pending:   { bg: 'bg-amber-50',  text: 'text-amber-700',  border: 'border-amber-200', dot: 'bg-amber-400' },
  confirmed: { bg: 'bg-blue-50',   text: 'text-blue-700',   border: 'border-blue-200',  dot: 'bg-blue-400' },
  completed: { bg: 'bg-green-50',  text: 'text-green-700',  border: 'border-green-200', dot: 'bg-green-400' },
  cancelled: { bg: 'bg-red-50',    text: 'text-red-700',    border: 'border-red-200',   dot: 'bg-red-400' },
  no_show:   { bg: 'bg-gray-50',   text: 'text-gray-700',   border: 'border-gray-200',  dot: 'bg-gray-400' },
};

const ACTIONS = {
  pending:   [{ label: 'Confirm', status: 'confirmed', icon: CheckCircle, color: 'text-blue-600' }, { label: 'Cancel', status: 'cancelled', icon: XCircle, color: 'text-red-500' }],
  confirmed: [{ label: 'Complete', status: 'completed', icon: CheckCircle, color: 'text-green-600' }, { label: 'No-Show', status: 'no_show', icon: UserX, color: 'text-gray-500' }, { label: 'Cancel', status: 'cancelled', icon: XCircle, color: 'text-red-500' }],
};

const PAGE_SIZE = 15;

export default function ProviderAppointmentsPage() {
  const [clinicId, setClinicId] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null); // appointment id being updated
  const [actionMenu, setActionMenu] = useState(null);

  const { user } = useAuth();

  useEffect(() => { if (user?.id) init(); }, [user?.id]);

  const init = async () => {
    const { data } = await fetchProviderClinic(user.id);
    if (data) {
      setClinicId(data.id);
      load(data.id, 1, 'all');
    } else {
      setLoading(false);
    }
  };

  const load = useCallback(async (cId, p, status) => {
    setLoading(true);
    const { data, count: total } = await fetchProviderAppointments(cId || clinicId, {
      status: status || statusFilter,
      page: p || page,
      pageSize: PAGE_SIZE,
    });
    setAppointments(data);
    setCount(total);
    setLoading(false);
  }, [clinicId, statusFilter, page]);

  const handleFilterChange = (status) => {
    setStatusFilter(status);
    setPage(1);
    load(clinicId, 1, status);
  };

  const handleStatusUpdate = async (apptId, newStatus) => {
    setUpdating(apptId);
    setActionMenu(null);
    await updateAppointmentStatus(apptId, newStatus);
    await load(clinicId, page, statusFilter);
    setUpdating(null);
  };

  const totalPages = Math.ceil(count / PAGE_SIZE);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Appointments</h1>
        <p className="text-gray-500 text-sm mt-1">Manage your clinic's appointments</p>
      </div>

      {/* Status filters */}
      <div className="flex flex-wrap gap-2">
        {STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => handleFilterChange(s)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
              statusFilter === s
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {s === 'all' ? 'All' : s.replace('_', ' ').replace(/^\w/, (c) => c.toUpperCase())}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-12 bg-gray-50 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : appointments.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <Calendar className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No appointments found</p>
            <p className="text-gray-400 text-sm mt-1">
              {statusFilter !== 'all' ? 'Try a different filter' : 'Appointments will appear here when patients book'}
            </p>
          </div>
        ) : (
          <>
            {/* Header row — desktop */}
            <div className="hidden md:grid grid-cols-12 gap-3 px-6 py-3 bg-gray-50/50 border-b border-gray-100 text-xs font-medium text-gray-500 uppercase tracking-wide">
              <div className="col-span-3">Patient</div>
              <div className="col-span-2">Date</div>
              <div className="col-span-2">Time</div>
              <div className="col-span-2">Status</div>
              <div className="col-span-3 text-right">Actions</div>
            </div>

            {/* Rows */}
            <div className="divide-y divide-gray-50">
              {appointments.map((appt) => {
                const style = STATUS_STYLES[appt.status] || STATUS_STYLES.pending;
                const actions = ACTIONS[appt.status] || [];
                const isUpdating = updating === appt.id;

                return (
                  <div
                    key={appt.id}
                    className={`px-6 py-4 md:grid md:grid-cols-12 md:gap-3 md:items-center hover:bg-gray-50/30 transition ${isUpdating ? 'opacity-50' : ''}`}
                  >
                    {/* Patient */}
                    <div className="col-span-3 mb-2 md:mb-0">
                      <p className="text-sm font-medium text-gray-900">{appt.profiles?.full_name || 'Patient'}</p>
                      <p className="text-xs text-gray-400 md:hidden">
                        {new Date(appt.appointment_date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                        {' · '}{appt.appointment_time?.slice(0, 5)}
                      </p>
                    </div>

                    {/* Date — desktop */}
                    <div className="col-span-2 hidden md:block text-sm text-gray-600">
                      {new Date(appt.appointment_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>

                    {/* Time — desktop */}
                    <div className="col-span-2 hidden md:block text-sm text-gray-600">
                      {appt.appointment_time?.slice(0, 5) || '—'}
                    </div>

                    {/* Status */}
                    <div className="col-span-2 mb-2 md:mb-0">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase ${style.bg} ${style.text} border ${style.border}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
                        {appt.status?.replace('_', ' ')}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="col-span-3 flex items-center justify-end gap-1.5 relative">
                      {actions.length > 0 && (
                        <>
                          {actions.slice(0, 2).map((act) => {
                            const ActIcon = act.icon;
                            return (
                              <button
                                key={act.status}
                                onClick={() => handleStatusUpdate(appt.id, act.status)}
                                disabled={isUpdating}
                                title={act.label}
                                className={`p-2 rounded-lg hover:bg-gray-100 ${act.color} transition text-xs font-medium hidden sm:flex items-center gap-1`}
                              >
                                <ActIcon className="w-4 h-4" />
                                <span className="hidden lg:inline">{act.label}</span>
                              </button>
                            );
                          })}
                          {/* Mobile: more button */}
                          <div className="relative sm:hidden">
                            <button
                              onClick={() => setActionMenu(actionMenu === appt.id ? null : appt.id)}
                              className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 transition"
                            >
                              <MoreHorizontal className="w-4 h-4" />
                            </button>
                            <AnimatePresence>
                              {actionMenu === appt.id && (
                                <motion.div
                                  initial={{ opacity: 0, scale: 0.95 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  exit={{ opacity: 0, scale: 0.95 }}
                                  className="absolute right-0 top-full mt-1 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-10 min-w-[140px]"
                                >
                                  {actions.map((act) => {
                                    const ActIcon = act.icon;
                                    return (
                                      <button
                                        key={act.status}
                                        onClick={() => handleStatusUpdate(appt.id, act.status)}
                                        className={`w-full px-4 py-2 text-left text-sm flex items-center gap-2 hover:bg-gray-50 ${act.color}`}
                                      >
                                        <ActIcon className="w-4 h-4" /> {act.label}
                                      </button>
                                    );
                                  })}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
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
              onClick={() => { setPage(page - 1); load(clinicId, page - 1, statusFilter); }}
              disabled={page <= 1}
              className="p-2 rounded-xl border border-gray-200 hover:bg-gray-50 disabled:opacity-40 transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm text-gray-600 font-medium px-2">
              {page} / {totalPages}
            </span>
            <button
              onClick={() => { setPage(page + 1); load(clinicId, page + 1, statusFilter); }}
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
