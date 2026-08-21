/**
 * ProviderAppointmentsPage.jsx
 * ──────────────────────────────────────────────────────────────
 * Manage appointments with filters, status transitions, patient
 * details, symptoms, and booking information. Integrates with
 * both Supabase and BookingContext.
 * ──────────────────────────────────────────────────────────────
 */
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar, Clock, Search, Filter, ChevronLeft, ChevronRight,
  CheckCircle, XCircle, AlertCircle, UserX, MoreHorizontal,
  User, Phone, Mail, Activity, FileText, CreditCard, Building2,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useBooking } from '@/context/BookingContext';
import {
  fetchProviderClinic,
  fetchProviderAppointments,
  updateAppointmentStatus,
} from '@/utils/providerQueries';

const STATUSES = ['all', 'pending', 'confirmed', 'completed', 'cancelled', 'rescheduled', 'no_show'];

const STATUS_STYLES = {
  pending:      { bg: 'bg-amber-50',   text: 'text-amber-700',   border: 'border-amber-200',  dot: 'bg-amber-400' },
  confirmed:    { bg: 'bg-blue-50',    text: 'text-blue-700',    border: 'border-blue-200',   dot: 'bg-blue-400' },
  completed:    { bg: 'bg-green-50',   text: 'text-green-700',   border: 'border-green-200',  dot: 'bg-green-400' },
  cancelled:    { bg: 'bg-red-50',     text: 'text-red-700',     border: 'border-red-200',    dot: 'bg-red-400' },
  rescheduled:  { bg: 'bg-indigo-50',  text: 'text-indigo-700',  border: 'border-indigo-200', dot: 'bg-indigo-400' },
  no_show:      { bg: 'bg-gray-50',    text: 'text-gray-700',    border: 'border-gray-200',   dot: 'bg-gray-400' },
};

const ACTIONS = {
  pending:   [{ label: 'Confirm', status: 'confirmed', icon: CheckCircle, color: 'text-blue-600' }, { label: 'Cancel', status: 'cancelled', icon: XCircle, color: 'text-red-500' }],
  confirmed: [{ label: 'Complete', status: 'completed', icon: CheckCircle, color: 'text-green-600' }, { label: 'No-Show', status: 'no_show', icon: UserX, color: 'text-gray-500' }, { label: 'Cancel', status: 'cancelled', icon: XCircle, color: 'text-red-500' }],
};

const PAGE_SIZE = 15;

function formatNaira(amount) {
  return `₦${amount?.toLocaleString() || '0'}`;
}

// ─── Appointment Detail Drawer ──────────────────────────────────────────────
function AppointmentDetailDrawer({ appointment, isOpen, onClose }) {
  if (!isOpen || !appointment) return null;

  const style = STATUS_STYLES[appointment.status] || STATUS_STYLES.pending;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end" onClick={onClose}>
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="relative bg-white w-full max-w-md h-full shadow-2xl overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900">Appointment Details</h3>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 transition">
            <XCircle className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Status */}
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold uppercase ${style.bg} ${style.text} border ${style.border}`}>
              <span className={`w-2 h-2 rounded-full ${style.dot}`} />
              {appointment.status?.replace('_', ' ')}
            </span>
            {appointment.bookingRef && (
              <span className="text-xs font-mono text-gray-400">Ref: {appointment.bookingRef}</span>
            )}
          </div>

          {/* Patient */}
          <div className="bg-gray-50 rounded-xl p-4 space-y-2.5">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Patient</p>
            <div className="flex items-center gap-2 text-sm">
              <User className="w-4 h-4 text-gray-400" />
              <span className="font-semibold text-gray-900">
                {appointment.patientName || appointment.profiles?.full_name || 'Patient'}
              </span>
            </div>
            {(appointment.patientPhone || appointment.profiles?.phone) && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Phone className="w-4 h-4 text-gray-400" />
                {appointment.patientPhone || appointment.profiles?.phone}
              </div>
            )}
            {(appointment.patientEmail || appointment.profiles?.email) && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Mail className="w-4 h-4 text-gray-400" />
                {appointment.patientEmail || appointment.profiles?.email}
              </div>
            )}
          </div>

          {/* Appointment details */}
          <div className="space-y-3">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Appointment</p>
            <div className="flex items-center gap-2 text-sm">
              <Building2 className="w-4 h-4 text-blue-500" />
              <span className="text-gray-700">
                {appointment.serviceLabel || appointment.bookingType || 'Consultation'}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4 text-blue-500" />
              <span className="text-gray-700">
                {appointment.dayName && `${appointment.dayName}, `}
                {appointment.appointmentDate || appointment.appointment_date
                  ? new Date((appointment.appointmentDate || appointment.appointment_date) + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
                  : '—'}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4 text-blue-500" />
              <span className="text-gray-700">{appointment.displayTime || appointment.appointment_time?.slice(0, 5) || '—'}</span>
            </div>
            {appointment.doctorName && (
              <div className="flex items-center gap-2 text-sm">
                <User className="w-4 h-4 text-teal-500" />
                <span className="text-gray-700">{appointment.doctorName}</span>
              </div>
            )}
          </div>

          {/* Symptoms */}
          {appointment.symptoms && (
            <div className="bg-rose-50 rounded-xl p-4 space-y-2">
              <p className="text-xs font-bold text-rose-600 uppercase tracking-wider flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5" />
                Symptoms
              </p>
              <p className="text-sm text-gray-800 leading-relaxed">{appointment.symptoms}</p>
              {appointment.symptomDuration && (
                <p className="text-xs text-rose-600">
                  Duration: {appointment.symptomDuration.replace(/_/g, ' ').replace(/^\w/, c => c.toUpperCase())}
                </p>
              )}
            </div>
          )}

          {/* Payment */}
          {appointment.amount > 0 && (
            <div className="bg-emerald-50 rounded-xl p-4 space-y-2">
              <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5" />
                Payment
              </p>
              {appointment.priceBreakdown?.map((item, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className="text-gray-700">{item.label}</span>
                  <span className="font-semibold text-gray-900">{formatNaira(item.amount)}</span>
                </div>
              ))}
              <div className="border-t border-emerald-200 pt-2 mt-1 flex justify-between">
                <span className="text-sm font-bold text-gray-900">Total</span>
                <span className="text-sm font-bold text-emerald-700">{formatNaira(appointment.amount)}</span>
              </div>
              <p className="text-xs text-emerald-600 font-medium">
                Payment: {appointment.paymentStatus === 'completed' ? '✓ Paid' : appointment.paymentStatus || 'Pending'}
              </p>
            </div>
          )}

          {/* Reschedule history */}
          {appointment.rescheduleHistory?.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Reschedule History</p>
              {appointment.rescheduleHistory.map((entry, i) => (
                <div key={i} className="text-xs text-gray-500 bg-gray-50 rounded-lg p-2.5">
                  Moved from {entry.previousDate} {entry.previousTime} on {new Date(entry.rescheduledAt).toLocaleDateString()}
                </div>
              ))}
            </div>
          )}

          {/* Notes */}
          {(appointment.notes && !appointment.symptoms) && (
            <div className="space-y-2">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" />
                Notes
              </p>
              <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3">{appointment.notes}</p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

export default function ProviderAppointmentsPage() {
  const [clinicId, setClinicId] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const [actionMenu, setActionMenu] = useState(null);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  const { user } = useAuth();
  const booking = useBooking();

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

    // Also get local booking context appointments for this clinic
    const localAppts = booking.getClinicAppointments(cId || clinicId);

    // Merge: local appointments + supabase appointments
    const mergedData = [
      ...localAppts.map(a => ({
        ...a,
        id: a.appointmentId,
        appointment_date: a.appointmentDate,
        appointment_time: a.appointmentTime,
        status: a.status,
        notes: a.symptoms || a.notes,
        profiles: {
          full_name: a.patientName,
          email: a.patientEmail,
          phone: a.patientPhone,
        },
        isLocal: true,
      })),
      ...(data || []).map(a => ({ ...a, isLocal: false })),
    ];

    // Filter by status if needed
    let filtered = mergedData;
    if (status && status !== 'all') {
      filtered = mergedData.filter(a => a.status === status);
    }

    setAppointments(filtered);
    setCount((total || 0) + localAppts.length);
    setLoading(false);
  }, [clinicId, statusFilter, page, booking]);

  const handleFilterChange = (status) => {
    setStatusFilter(status);
    setPage(1);
    load(clinicId, 1, status);
  };

  const handleStatusUpdate = async (apptId, newStatus) => {
    setUpdating(apptId);
    setActionMenu(null);

    // Check if local
    const localAppt = appointments.find(a => a.id === apptId && a.isLocal);
    if (localAppt) {
      if (newStatus === 'cancelled') {
        booking.cancelBooking(apptId);
      }
      // For other status changes, we'd need more logic but for now just reload
      await load(clinicId, page, statusFilter);
      setUpdating(null);
      return;
    }

    await updateAppointmentStatus(apptId, newStatus);
    await load(clinicId, page, statusFilter);
    setUpdating(null);
  };

  const totalPages = Math.ceil(count / PAGE_SIZE);

  // Separate today's appointments
  const todayStr = new Date().toISOString().split('T')[0];
  const todayAppointments = appointments.filter(a =>
    (a.appointment_date || a.appointmentDate) === todayStr &&
    ['pending', 'confirmed'].includes(a.status)
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Appointments</h1>
        <p className="text-gray-500 text-sm mt-1">Manage your clinic's appointments</p>
      </div>

      {/* Today's appointments highlight */}
      {todayAppointments.length > 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-teal-50 border border-blue-100 rounded-2xl p-5">
          <h3 className="text-sm font-bold text-blue-800 mb-3 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Today's Appointments ({todayAppointments.length})
          </h3>
          <div className="space-y-2">
            {todayAppointments.map((appt) => (
              <div
                key={appt.id}
                className="bg-white rounded-xl p-3 flex items-center justify-between cursor-pointer hover:shadow-sm transition"
                onClick={() => setSelectedAppointment(appt)}
              >
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    {appt.patientName || appt.profiles?.full_name || 'Patient'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {appt.displayTime || appt.appointment_time?.slice(0, 5) || '—'}
                    {appt.symptoms && ` · ${appt.symptoms.slice(0, 40)}${appt.symptoms.length > 40 ? '...' : ''}`}
                  </p>
                </div>
                <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full ${
                  STATUS_STYLES[appt.status]?.bg || 'bg-gray-50'
                } ${STATUS_STYLES[appt.status]?.text || 'text-gray-600'}`}>
                  {appt.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Booking notifications for this clinic */}
      {booking.notifications
        .filter(n => (n.type === 'hospital_new_booking' || n.type === 'hospital_reschedule' || n.type === 'hospital_cancellation') && n.clinicId === clinicId && !n.read)
        .slice(0, 3)
        .map((notif) => (
          <motion.div
            key={notif.id}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3"
          >
            <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-amber-800">{notif.title}</p>
              <p className="text-xs text-amber-700 mt-0.5">{notif.message}</p>
            </div>
            <button
              onClick={() => booking.markNotificationRead(notif.id)}
              className="text-xs text-amber-600 hover:text-amber-800 font-medium"
            >
              Dismiss
            </button>
          </motion.div>
        ))
      }

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
              <div className="col-span-2">Service</div>
              <div className="col-span-2">Date & Time</div>
              <div className="col-span-2">Status</div>
              <div className="col-span-3 text-right">Actions</div>
            </div>

            {/* Rows */}
            <div className="divide-y divide-gray-50">
              {appointments.map((appt) => {
                const style = STATUS_STYLES[appt.status] || STATUS_STYLES.pending;
                const actions = ACTIONS[appt.status] || [];
                const isUpdating = updating === appt.id;
                const patientName = appt.patientName || appt.profiles?.full_name || 'Patient';
                const serviceLabel = appt.serviceLabel || appt.bookingType || 'Consultation';

                return (
                  <div
                    key={appt.id}
                    className={`px-6 py-4 md:grid md:grid-cols-12 md:gap-3 md:items-center hover:bg-gray-50/30 transition cursor-pointer ${isUpdating ? 'opacity-50' : ''}`}
                    onClick={() => setSelectedAppointment(appt)}
                  >
                    {/* Patient */}
                    <div className="col-span-3 mb-2 md:mb-0">
                      <p className="text-sm font-medium text-gray-900">{patientName}</p>
                      {appt.symptoms && (
                        <p className="text-[10px] text-gray-400 mt-0.5 line-clamp-1 flex items-center gap-1">
                          <Activity className="w-2.5 h-2.5" />
                          {appt.symptoms.slice(0, 50)}{appt.symptoms.length > 50 ? '...' : ''}
                        </p>
                      )}
                      <p className="text-xs text-gray-400 md:hidden">
                        {new Date((appt.appointment_date || appt.appointmentDate) + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                        {' · '}{appt.displayTime || appt.appointment_time?.slice(0, 5)}
                      </p>
                    </div>

                    {/* Service — desktop */}
                    <div className="col-span-2 hidden md:block">
                      <p className="text-xs text-gray-600 font-medium">{serviceLabel}</p>
                      {appt.symptomDuration && (
                        <p className="text-[10px] text-gray-400 mt-0.5">
                          {appt.symptomDuration.replace(/_/g, ' ')}
                        </p>
                      )}
                    </div>

                    {/* Date & Time — desktop */}
                    <div className="col-span-2 hidden md:block">
                      <p className="text-sm text-gray-600">
                        {new Date((appt.appointment_date || appt.appointmentDate) + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </p>
                      <p className="text-xs text-gray-400">
                        {appt.displayTime || appt.appointment_time?.slice(0, 5) || '—'}
                      </p>
                    </div>

                    {/* Status */}
                    <div className="col-span-2 mb-2 md:mb-0">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase ${style.bg} ${style.text} border ${style.border}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
                        {appt.status?.replace('_', ' ')}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="col-span-3 flex items-center justify-end gap-1.5 relative" onClick={(e) => e.stopPropagation()}>
                      {actions.length > 0 && (
                        <>
                          {actions.slice(0, 2).map((act) => {
                            const ActIcon = act.icon;
                            return (
                              <button
                                key={act.status}
                                onClick={(e) => { e.stopPropagation(); handleStatusUpdate(appt.id, act.status); }}
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
                              onClick={(e) => { e.stopPropagation(); setActionMenu(actionMenu === appt.id ? null : appt.id); }}
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
                                        onClick={(e) => { e.stopPropagation(); handleStatusUpdate(appt.id, act.status); }}
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

      {/* Detail drawer */}
      <AnimatePresence>
        {selectedAppointment && (
          <AppointmentDetailDrawer
            appointment={selectedAppointment}
            isOpen={!!selectedAppointment}
            onClose={() => setSelectedAppointment(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
