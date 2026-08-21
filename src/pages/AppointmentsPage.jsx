/**
 * AppointmentsPage.jsx
 * ──────────────────────────────────────────────────────────────
 * Dedicated page for managing patient appointments.
 * Integrates with both Supabase (legacy) and BookingContext
 * (new booking system). Features filter tabs, search, status
 * badges, cancel/reschedule actions, and responsive design.
 * ──────────────────────────────────────────────────────────────
 */
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CalendarCheck, Clock, Search, PlusCircle, Stethoscope,
  MapPin, FileText, ChevronRight, Filter, ArrowRight,
  X, AlertCircle, Calendar, CheckCircle2, RefreshCw,
  Activity, CreditCard, Building2, Copy, Check,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useBooking } from '@/context/BookingContext';
import { useToast } from '@/components/ui/use-toast';
import { fetchPatientAppointments, cancelAppointment } from '@/utils/supabaseQueries';
import { getClinicUrl } from '@/utils/slugUtils';

// ─── Status badge styles ─────────────────────────────────────────────────────
const STATUS_STYLES = {
  pending:      { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-400', border: 'border-amber-100', label: 'Pending', icon: Clock },
  confirmed:    { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-400', border: 'border-blue-100', label: 'Confirmed', icon: CheckCircle2 },
  completed:    { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500', border: 'border-emerald-100', label: 'Completed', icon: CheckCircle2 },
  cancelled:    { bg: 'bg-red-50', text: 'text-red-600', dot: 'bg-red-400', border: 'border-red-100', label: 'Cancelled', icon: X },
  rescheduled:  { bg: 'bg-indigo-50', text: 'text-indigo-700', dot: 'bg-indigo-400', border: 'border-indigo-100', label: 'Rescheduled', icon: RefreshCw },
  no_show:      { bg: 'bg-gray-50', text: 'text-gray-600', dot: 'bg-gray-400', border: 'border-gray-200', label: 'No Show', icon: AlertCircle },
};

// ─── Filter tabs ──────────────────────────────────────────────────────────────
const TABS = [
  { id: 'all', label: 'All' },
  { id: 'upcoming', label: 'Upcoming' },
  { id: 'past', label: 'Past' },
  { id: 'cancelled', label: 'Cancelled' },
];

function formatNaira(amount) {
  return `₦${amount.toLocaleString()}`;
}

// ─── Reschedule Modal ─────────────────────────────────────────────────────────
function RescheduleModal({ appointment, isOpen, onClose, onReschedule }) {
  const booking = useBooking();
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);

  if (!isOpen || !appointment) return null;

  const availability = booking.getAvailability(appointment.clinicId);
  const availableSlots = availability.filter(s => !s.isBooked && s.id !== appointment.slotId);

  // Group by date
  const slotsByDate = {};
  availableSlots.forEach(slot => {
    if (!slotsByDate[slot.date]) {
      slotsByDate[slot.date] = { date: slot.date, dayName: slot.dayName, slots: [] };
    }
    slotsByDate[slot.date].slots.push(slot);
  });
  const dateGroups = Object.values(slotsByDate).sort((a, b) => a.date.localeCompare(b.date));

  const selectedDaySlots = selectedDate
    ? dateGroups.find(d => d.date === selectedDate)?.slots || []
    : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[85vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Reschedule Appointment</h3>
            <p className="text-xs text-gray-500 mt-0.5">Select a new date and time</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 transition">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Current appointment info */}
        <div className="px-5 pt-4 pb-2">
          <div className="bg-gray-50 rounded-xl p-3 text-sm">
            <p className="text-xs text-gray-500 font-medium mb-1">Current appointment</p>
            <p className="font-semibold text-gray-800">
              {appointment.dayName || ''}, {appointment.date} at {appointment.displayTime || appointment.time}
            </p>
          </div>
        </div>

        {/* Date selector */}
        <div className="px-5 pt-3 pb-2">
          <p className="text-sm font-semibold text-gray-700 mb-2">New date</p>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {dateGroups.slice(0, 10).map((day) => {
              const dateObj = new Date(day.date + 'T00:00:00');
              const isSelected = day.date === selectedDate;
              return (
                <button
                  key={day.date}
                  onClick={() => { setSelectedDate(day.date); setSelectedSlot(null); }}
                  className={`flex-shrink-0 flex flex-col items-center w-16 py-2.5 rounded-xl transition-all ${
                    isSelected
                      ? 'bg-blue-500 text-white shadow-md'
                      : 'bg-gray-50 text-gray-700 hover:bg-blue-50'
                  }`}
                >
                  <span className={`text-[10px] font-bold uppercase ${isSelected ? 'text-blue-100' : 'text-gray-400'}`}>
                    {day.dayName.slice(0, 3)}
                  </span>
                  <span className={`text-base font-bold ${isSelected ? 'text-white' : 'text-gray-900'}`}>
                    {dateObj.getDate()}
                  </span>
                  <span className={`text-[9px] ${isSelected ? 'text-blue-200' : 'text-emerald-500'}`}>
                    {day.slots.length} slots
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Time slots */}
        <div className="flex-1 overflow-y-auto px-5 pb-4">
          {selectedDate && (
            <>
              <p className="text-sm font-semibold text-gray-700 mb-2">New time</p>
              <div className="grid grid-cols-3 gap-2">
                {selectedDaySlots.map((slot) => (
                  <button
                    key={slot.id}
                    onClick={() => setSelectedSlot(slot)}
                    className={`py-2.5 rounded-xl text-xs font-medium transition-all ${
                      selectedSlot?.id === slot.id
                        ? 'bg-blue-500 text-white shadow-md'
                        : 'bg-gray-50 text-gray-700 hover:bg-blue-50'
                    }`}
                  >
                    {slot.displayTime}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Actions */}
        <div className="p-5 border-t border-gray-100 flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl border-2 border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-50 transition">
            Cancel
          </button>
          <button
            onClick={() => selectedSlot && onReschedule(appointment.appointmentId, selectedSlot)}
            disabled={!selectedSlot}
            className="flex-1 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-teal-500 text-white font-semibold text-sm shadow-md hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Confirm Reschedule
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Appointment card ─────────────────────────────────────────────────────────
function AppointmentCard({ appointment, onCancel, onReschedule, isCancelling, isLocal }) {
  const s = STATUS_STYLES[appointment.status] || STATUS_STYLES.pending;
  const StatusIcon = s.icon;
  const canCancel = ['pending', 'confirmed'].includes(appointment.status);
  const canReschedule = isLocal && ['confirmed'].includes(appointment.status);

  const formattedDate = appointment.date
    ? new Date(appointment.date + 'T00:00:00').toLocaleDateString('en-US', {
        weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
      })
    : '';

  const isUpcoming = appointment.date && new Date(appointment.date + 'T23:59:59') >= new Date();

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8, scale: 0.96 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className={`bg-white rounded-2xl border ${s.border} shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group`}
    >
      <div className="p-5">
        <div className="flex items-start gap-4">
          {/* Clinic image */}
          <div className="w-16 h-16 rounded-xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-50 flex-shrink-0 ring-1 ring-gray-100">
            <img
              src={appointment.clinicImage}
              alt={appointment.clinicName}
              className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="font-bold text-gray-900 text-sm truncate block">
                  {appointment.clinicName}
                </p>
                <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                  <Stethoscope className="w-3 h-3" />
                  {appointment.clinicType || appointment.serviceLabel || 'Consultation'}
                </p>
              </div>
              {/* Status badge */}
              <span className={`inline-flex items-center gap-1.5 text-[11px] font-bold uppercase px-2.5 py-1 rounded-full ${s.bg} ${s.text} flex-shrink-0`}>
                <StatusIcon className="w-3 h-3" />
                {s.label}
              </span>
            </div>

            {/* Date & time */}
            <div className="flex items-center gap-4 mt-3">
              <span className="flex items-center gap-1.5 text-xs text-gray-600 font-medium bg-gray-50 px-2.5 py-1.5 rounded-lg">
                <Calendar className="w-3.5 h-3.5 text-blue-500" />
                {formattedDate}
              </span>
              <span className="flex items-center gap-1.5 text-xs text-gray-600 font-medium bg-gray-50 px-2.5 py-1.5 rounded-lg">
                <Clock className="w-3.5 h-3.5 text-green-500" />
                {appointment.displayTime || appointment.time}
              </span>
            </div>

            {/* Booking ref */}
            {appointment.bookingRef && (
              <p className="text-[10px] text-gray-400 mt-2 font-mono">
                Ref: {appointment.bookingRef}
              </p>
            )}

            {/* Symptoms preview */}
            {appointment.symptoms && (
              <div className="mt-2.5 flex items-start gap-1.5 text-xs text-gray-400">
                <Activity className="w-3 h-3 flex-shrink-0 mt-0.5" />
                <span className="italic line-clamp-1">{appointment.symptoms}</span>
              </div>
            )}

            {/* Price */}
            {appointment.amount > 0 && (
              <div className="mt-2 flex items-center gap-1.5 text-xs text-gray-500">
                <CreditCard className="w-3 h-3" />
                <span className="font-semibold text-gray-700">{formatNaira(appointment.amount)}</span>
                {appointment.paymentStatus === 'completed' && (
                  <span className="text-emerald-600 font-bold">• Paid</span>
                )}
              </div>
            )}

            {/* Address */}
            {(appointment.clinicAddress || appointment.hospitalAddress) && (
              <p className="text-xs text-gray-400 mt-2 flex items-center gap-1 truncate">
                <MapPin className="w-3 h-3 flex-shrink-0" />
                {appointment.clinicAddress || appointment.hospitalAddress}
              </p>
            )}

            {/* Notes */}
            {appointment.notes && !appointment.symptoms && (
              <div className="mt-2.5 flex items-start gap-1.5 text-xs text-gray-400">
                <FileText className="w-3 h-3 flex-shrink-0 mt-0.5" />
                <span className="italic line-clamp-2">{appointment.notes}</span>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        {(canCancel || canReschedule) && (
          <div className="mt-4 pt-3 border-t border-gray-50 flex items-center justify-between">
            {isUpcoming && (
              <span className="text-[10px] uppercase tracking-wider font-bold text-blue-500 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                Upcoming
              </span>
            )}
            <div className="ml-auto flex items-center gap-2">
              {canReschedule && (
                <button
                  onClick={() => onReschedule(appointment)}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  Reschedule
                </button>
              )}
              {canCancel && (
                <button
                  onClick={() => onCancel(appointment.id || appointment.appointmentId)}
                  disabled={isCancelling}
                  className="text-xs font-semibold text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-lg transition disabled:opacity-50"
                >
                  {isCancelling ? (
                    <span className="flex items-center gap-1.5">
                      <span className="w-3 h-3 border-2 border-red-300 border-t-transparent rounded-full animate-spin" />
                      Cancelling…
                    </span>
                  ) : (
                    'Cancel'
                  )}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ─── Loading skeleton ─────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 animate-pulse">
      <div className="flex items-start gap-4">
        <div className="w-16 h-16 rounded-xl bg-gray-200 flex-shrink-0" />
        <div className="flex-1 space-y-2.5">
          <div className="flex justify-between gap-4">
            <div className="h-4 w-40 bg-gray-200 rounded-lg" />
            <div className="h-5 w-20 bg-gray-100 rounded-full" />
          </div>
          <div className="h-3 w-28 bg-gray-100 rounded" />
          <div className="flex gap-3">
            <div className="h-7 w-32 bg-gray-100 rounded-lg" />
            <div className="h-7 w-20 bg-gray-100 rounded-lg" />
          </div>
          <div className="h-3 w-52 bg-gray-100 rounded" />
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AppointmentsPage() {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const booking = useBooking();

  const [supabaseAppointments, setSupabaseAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [rescheduleTarget, setRescheduleTarget] = useState(null);

  // ── Load Supabase appointments ─────────────────────────────────────────────
  const loadAppointments = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    const { data } = await fetchPatientAppointments(user.id);
    setSupabaseAppointments(data || []);
    setLoading(false);
  }, [user?.id]);

  useEffect(() => {
    loadAppointments();
  }, [loadAppointments]);

  // ── Get local BookingContext appointments ───────────────────────────────────
  const localAppointments = useMemo(() => {
    const email = profile?.email || user?.email;
    if (!email) return [];
    return booking.getPatientAppointments(email).map(appt => ({
      ...appt,
      id: appt.appointmentId,
      clinicId: appt.clinicId,
      clinicName: appt.hospitalName,
      clinicType: appt.bookingType === 'laboratory' ? 'Laboratory' :
        appt.bookingType === 'specialist' ? `Specialist (${appt.specialistType || ''})` :
        appt.bookingType === 'gp_preassessment' ? 'GP Preassessment' : 'General Practitioner',
      serviceLabel: appt.bookingType === 'laboratory' ? 'Laboratory Test' :
        appt.bookingType === 'specialist' ? 'Specialist Consultation' :
        appt.bookingType === 'gp_preassessment' ? 'GP Preassessment' : 'GP Consultation',
      clinicAddress: appt.hospitalAddress,
      clinicImage: appt.hospitalImage,
      date: appt.appointmentDate,
      time: appt.displayTime || appt.appointmentTime,
      displayTime: appt.displayTime,
      rawTime: appt.appointmentTime,
      status: appt.status,
      notes: appt.symptoms,
      symptoms: appt.symptoms,
      amount: appt.amount,
      bookingRef: appt.bookingRef,
      paymentStatus: appt.paymentStatus,
      isLocal: true,
    }));
  }, [booking, profile, user]);

  // ── Merge all appointments ─────────────────────────────────────────────────
  const appointments = useMemo(() => {
    const all = [
      ...localAppointments,
      ...supabaseAppointments.map(a => ({ ...a, isLocal: false })),
    ];
    // Sort by date descending
    return all.sort((a, b) => {
      const dateA = a.date || a.appointmentDate || '';
      const dateB = b.date || b.appointmentDate || '';
      return dateB.localeCompare(dateA);
    });
  }, [localAppointments, supabaseAppointments]);

  // ── Cancel ────────────────────────────────────────────────────────────────
  const handleCancel = async (appointmentId) => {
    setCancellingId(appointmentId);

    // Check if it's a local appointment
    const localAppt = localAppointments.find(a => a.id === appointmentId);
    if (localAppt) {
      booking.cancelBooking(appointmentId);
      toast({ title: 'Appointment cancelled', description: 'Your appointment has been cancelled and the slot released.' });
      setCancellingId(null);
      return;
    }

    // Supabase appointment
    const { error } = await cancelAppointment(appointmentId);
    if (error) {
      toast({ title: 'Error', description: error.message || 'Failed to cancel appointment.', variant: 'destructive' });
    } else {
      toast({ title: 'Appointment cancelled', description: 'Your appointment has been cancelled and the slot released.' });
      await loadAppointments();
    }
    setCancellingId(null);
  };

  // ── Reschedule ────────────────────────────────────────────────────────────
  const handleReschedule = (appointmentId, newSlot) => {
    booking.rescheduleAppointment(appointmentId, newSlot);
    toast({
      title: 'Appointment rescheduled',
      description: `Your appointment has been moved to ${newSlot.dayName}, ${newSlot.date} at ${newSlot.displayTime}.`,
    });
    setRescheduleTarget(null);
  };

  // ── Filter & search ─────────────────────────────────────────────────────
  const filteredAppointments = useMemo(() => {
    const now = new Date();
    let filtered = appointments;

    switch (activeFilter) {
      case 'upcoming':
        filtered = appointments.filter(
          (a) => ['pending', 'confirmed'].includes(a.status) && new Date(a.date + 'T23:59:59') >= now
        );
        break;
      case 'past':
        filtered = appointments.filter(
          (a) => a.status === 'completed' || (a.status !== 'cancelled' && new Date(a.date + 'T23:59:59') < now)
        );
        break;
      case 'cancelled':
        filtered = appointments.filter((a) => a.status === 'cancelled');
        break;
      default:
        break;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (a) =>
          a.clinicName?.toLowerCase().includes(q) ||
          a.clinicType?.toLowerCase().includes(q) ||
          a.clinicAddress?.toLowerCase().includes(q) ||
          a.bookingRef?.toLowerCase().includes(q) ||
          a.symptoms?.toLowerCase().includes(q)
      );
    }

    return filtered;
  }, [appointments, activeFilter, searchQuery]);

  // ── Stats ────────────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const now = new Date();
    return {
      total: appointments.length,
      upcoming: appointments.filter(
        (a) => ['pending', 'confirmed'].includes(a.status) && new Date(a.date + 'T23:59:59') >= now
      ).length,
      completed: appointments.filter((a) => a.status === 'completed').length,
    };
  }, [appointments]);

  return (
    <>
      <Helmet>
        <title>My Appointments | HealthProvida</title>
        <meta name="description" content="View and manage your healthcare appointments on HealthProvida." />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-blue-50/60 via-white to-teal-50/40">
        <div className="container mx-auto px-4 py-8 max-w-4xl">

          {/* ── Header ──────────────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8"
          >
            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
                My Appointments
              </h1>
              <p className="text-gray-500 mt-1.5 text-sm">
                Manage and track all your clinic visits in one place
              </p>
            </div>
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-teal-600 text-white text-sm font-semibold hover:from-blue-700 hover:to-teal-700 transition shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 flex-shrink-0"
            >
              <PlusCircle className="w-4 h-4" />
              Book Appointment
            </Link>
          </motion.div>

          {/* ── Notifications ─────────────────────────────────────────── */}
          {booking.notifications.filter(n => n.type === 'reminder' && !n.read).length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 space-y-2"
            >
              {booking.notifications
                .filter(n => n.type === 'reminder' && !n.read)
                .slice(0, 3)
                .map((notif) => (
                  <div key={notif.id} className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
                      <Clock className="w-4 h-4 text-amber-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-amber-800">{notif.title}</p>
                      <p className="text-xs text-amber-700 mt-0.5">{notif.message}</p>
                    </div>
                    <button
                      onClick={() => booking.markNotificationRead(notif.id)}
                      className="text-xs text-amber-600 hover:text-amber-800 font-medium flex-shrink-0"
                    >
                      Dismiss
                    </button>
                  </div>
                ))
              }
            </motion.div>
          )}

          {/* ── Stats row ───────────────────────────────────────────────── */}
          {!loading && appointments.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.1 }}
              className="grid grid-cols-3 gap-3 mb-8"
            >
              {[
                { label: 'Total', value: stats.total, color: 'from-blue-500 to-blue-600', icon: CalendarCheck },
                { label: 'Upcoming', value: stats.upcoming, color: 'from-teal-500 to-green-500', icon: Clock },
                { label: 'Completed', value: stats.completed, color: 'from-emerald-500 to-green-600', icon: CheckCircle2 },
              ].map(({ label, value, color, icon: Icon }) => (
                <div key={label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center flex-shrink-0 shadow-sm`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-extrabold text-gray-900 leading-none">{value}</p>
                    <p className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mt-0.5">{label}</p>
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          {/* ── Search + Filters ─────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.15 }}
            className="mb-6 space-y-4"
          >
            {/* Search bar */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by clinic name, type, address, or reference…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none text-sm transition shadow-sm"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition"
                >
                  <X className="w-3 h-3 text-gray-500" />
                </button>
              )}
            </div>

            {/* Filter tabs */}
            <div className="flex gap-1.5 bg-gray-100/80 p-1 rounded-xl">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveFilter(tab.id)}
                  className={`relative flex-1 py-2 text-xs font-semibold rounded-lg transition-all duration-200 ${
                    activeFilter === tab.id
                      ? 'text-blue-700'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {activeFilter === tab.id && (
                    <motion.div
                      layoutId="appointment-tab-pill"
                      className="absolute inset-0 bg-white rounded-lg shadow-sm"
                      transition={{ type: 'spring', bounce: 0.15, duration: 0.5 }}
                    />
                  )}
                  <span className="relative z-10">{tab.label}</span>
                </button>
              ))}
            </div>
          </motion.div>

          {/* ── Content ──────────────────────────────────────────────────── */}
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : filteredAppointments.length > 0 ? (
            <AnimatePresence mode="popLayout">
              <div className="space-y-4">
                {filteredAppointments.map((appt) => (
                  <AppointmentCard
                    key={appt.id}
                    appointment={appt}
                    onCancel={handleCancel}
                    onReschedule={(apt) => setRescheduleTarget(apt)}
                    isCancelling={cancellingId === appt.id}
                    isLocal={appt.isLocal}
                  />
                ))}
              </div>
            </AnimatePresence>
          ) : appointments.length > 0 ? (
            /* No results for current filter */
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-4">
                <Filter className="w-8 h-8 text-gray-300" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">No matching appointments</h3>
              <p className="text-sm text-gray-500 mb-5 max-w-xs mx-auto leading-relaxed">
                {searchQuery
                  ? `No appointments found matching "${searchQuery}".`
                  : `No ${activeFilter} appointments to display.`}
              </p>
              <button
                onClick={() => { setActiveFilter('all'); setSearchQuery(''); }}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition"
              >
                Clear Filters
              </button>
            </motion.div>
          ) : (
            /* No appointments at all */
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center"
            >
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-50 to-teal-50 flex items-center justify-center mx-auto mb-5">
                <CalendarCheck className="w-10 h-10 text-blue-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No Appointments Yet</h3>
              <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto leading-relaxed">
                Browse thousands of trusted clinics and book your first appointment in seconds.
              </p>
              <Link
                to="/"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-teal-600 text-white text-sm font-semibold hover:from-blue-700 hover:to-teal-700 transition shadow-lg shadow-blue-500/20"
              >
                <Stethoscope className="w-4 h-4" />
                Find a Clinic
                <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          )}

          {/* ── Book next visit CTA ────────────────────────────────────── */}
          {!loading && appointments.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mt-8 bg-gradient-to-r from-blue-600 to-teal-600 rounded-2xl p-6 sm:p-8 text-center shadow-lg shadow-blue-500/15"
            >
              <h3 className="text-lg sm:text-xl font-bold text-white mb-2">Book Your Next Visit</h3>
              <p className="text-sm text-blue-100 mb-5 max-w-md mx-auto leading-relaxed">
                Stay on top of your health. Browse clinics and schedule your next appointment.
              </p>
              <Link
                to="/"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-blue-700 text-sm font-bold hover:bg-blue-50 transition shadow-md"
              >
                <Stethoscope className="w-4 h-4" />
                Browse Clinics
                <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          )}
        </div>
      </div>

      {/* Reschedule modal */}
      <AnimatePresence>
        {rescheduleTarget && (
          <RescheduleModal
            appointment={rescheduleTarget}
            isOpen={!!rescheduleTarget}
            onClose={() => setRescheduleTarget(null)}
            onReschedule={handleReschedule}
          />
        )}
      </AnimatePresence>
    </>
  );
}
