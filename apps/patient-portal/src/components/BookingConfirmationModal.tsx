/**
 * BookingConfirmationModal.jsx
 * ──────────────────────────────────────────────────────────────
 * Animated modal for confirming an appointment booking.
 * 2-step layout: Booking Summary → Payment Placeholder.
 * States: default → loading → success / error.
 * ──────────────────────────────────────────────────────────────
 */
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  X, Calendar, Clock, MapPin, FileText,
  CheckCircle, AlertCircle, Loader2, CreditCard,
} from 'lucide-react';

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

const modalVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring', damping: 25, stiffness: 350 } },
  exit: { opacity: 0, scale: 0.95, y: 20, transition: { duration: 0.2 } },
};

const successVariants = {
  hidden: { scale: 0 },
  visible: { scale: 1, transition: { type: 'spring', damping: 15, stiffness: 200, delay: 0.1 } },
};

/**
 * @param {Object} props
 * @param {boolean} props.isOpen
 * @param {() => void} props.onClose
 * @param {(notes: string) => Promise<void>} props.onConfirm
 * @param {Object} props.clinic - { practitioner_name, image_src, address }
 * @param {Object} props.slot - { day, date, time, rawTime, slotId, durationMinutes }
 * @param {boolean} props.isBooking - loading state
 * @param {boolean} props.isSuccess - success state after booking
 * @param {string|null} props.bookingError - error message if booking failed
 */
export default function BookingConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  clinic,
  slot,
  isBooking = false,
  isSuccess = false,
  bookingError = null,
}) {
  const [notes, setNotes] = useState('');

  // Reset notes when modal closes
  useEffect(() => {
    if (!isOpen) setNotes('');
  }, [isOpen]);

  // Auto-close after success
  useEffect(() => {
    if (isSuccess) {
      const timer = setTimeout(() => onClose(), 4000);
      return () => clearTimeout(timer);
    }
  }, [isSuccess, onClose]);

  // Format the date for display
  const formattedDate = slot?.date
    ? new Date(slot.date + 'T00:00:00').toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : slot?.day ?? '';

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          variants={overlayVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={!isBooking ? onClose : undefined}
          />

          {/* Modal */}
          <motion.div
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {/* ── Success State ────────────────────────────────── */}
            {isSuccess ? (
              <div className="p-8 text-center">
                <motion.div
                  className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-5"
                  variants={successVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <CheckCircle className="w-10 h-10 text-green-500" />
                </motion.div>
                <motion.h3
                  className="text-xl font-bold text-gray-900 mb-2"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  Booking Confirmed!
                </motion.h3>
                <motion.p
                  className="text-sm text-gray-500 mb-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  Your appointment at <strong>{clinic?.practitioner_name}</strong> on{' '}
                  <strong>{slot?.day} at {slot?.time}</strong> has been submitted.
                  The clinic will confirm shortly.
                </motion.p>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <Link
                    to="/profile"
                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white text-sm font-semibold rounded-xl transition shadow-md"
                    onClick={onClose}
                  >
                    <Calendar className="w-4 h-4" />
                    View My Appointments
                  </Link>
                </motion.div>
              </div>
            ) : (
              /* ── Booking Summary (Step 1) ──────────────────── */
              <>
                {/* Header */}
                <div className="relative">
                  {/* Clinic image banner */}
                  <div className="h-32 bg-gradient-to-br from-blue-600 to-green-600 overflow-hidden">
                    {clinic?.image_src && (
                      <img
                        src={clinic.image_src}
                        alt={clinic.practitioner_name}
                        className="w-full h-full object-cover opacity-40"
                      />
                    )}
                  </div>
                  <div className="absolute top-3 right-3">
                    <button
                      onClick={onClose}
                      disabled={isBooking}
                      className="p-2 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white transition disabled:opacity-50"
                    >
                      <X className="w-4 h-4 text-gray-700" />
                    </button>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-black/60 to-transparent">
                    <h3 className="text-lg font-bold text-white">{clinic?.practitioner_name}</h3>
                    <p className="text-sm text-white/80 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3.5 h-3.5" />
                      {clinic?.address}
                    </p>
                  </div>
                </div>

                {/* Body */}
                <div className="p-6 space-y-5">
                  {/* Appointment details card */}
                  <div className="bg-blue-50/60 border border-blue-100 rounded-xl p-4">
                    <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-3">Appointment Details</p>
                    <div className="space-y-2.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm">
                          <Calendar className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Date</p>
                          <p className="text-sm font-semibold text-gray-900">{formattedDate}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm">
                          <Clock className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Time</p>
                          <p className="text-sm font-semibold text-gray-900">
                            {slot?.time}
                            {slot?.durationMinutes && (
                              <span className="text-gray-400 font-normal ml-1">({slot.durationMinutes} min)</span>
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Payment placeholder */}
                  <div className="flex items-start gap-3 p-3.5 rounded-xl bg-amber-50 border border-amber-100">
                    <CreditCard className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-amber-800">Payment integration coming soon</p>
                      <p className="text-xs text-amber-600 mt-0.5">Your booking will be confirmed directly for now — no payment required.</p>
                    </div>
                  </div>

                  {/* Notes textarea */}
                  <div>
                    <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-2">
                      <FileText className="w-4 h-4 text-gray-400" />
                      Notes for the clinic
                      <span className="text-gray-400 font-normal">(optional)</span>
                    </label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      disabled={isBooking}
                      placeholder="E.g. specific symptoms, referral info, special requests..."
                      className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition disabled:opacity-50 disabled:bg-gray-50"
                      rows={3}
                      maxLength={500}
                    />
                    <p className="text-xs text-gray-400 text-right mt-1">{notes.length}/500</p>
                  </div>

                  {/* Error message */}
                  {bookingError && (
                    <div className="flex items-start gap-2.5 p-3 rounded-xl bg-red-50 border border-red-100">
                      <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-red-700">{bookingError}</p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => onConfirm(notes)}
                      disabled={isBooking}
                      className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white py-3 px-6 rounded-xl text-sm font-semibold transition shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {isBooking ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Booking...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4" />
                          Confirm Booking
                        </>
                      )}
                    </button>
                    <button
                      onClick={onClose}
                      disabled={isBooking}
                      className="w-full py-2.5 text-sm font-medium text-gray-500 hover:text-gray-700 transition disabled:opacity-50"
                    >
                      Cancel
                    </button>
                  </div>

                  <p className="text-center text-xs text-gray-400">
                    No payment required to book
                  </p>
                </div>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
