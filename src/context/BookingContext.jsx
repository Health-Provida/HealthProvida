/**
 * BookingContext.jsx
 * ──────────────────────────────────────────────────────────────
 * Central state management for the HealthProvida booking system.
 * Handles appointments, availability, payments, rescheduling,
 * reminders, and notifications.
 * ──────────────────────────────────────────────────────────────
 */
import React, { createContext, useContext, useState, useCallback, useEffect, useRef, useMemo } from 'react';

const BookingContext = createContext(null);

// ─── Pricing Configuration (centralised, not hard-coded in UI) ───
const PRICING = {
  gp_consultation: 10000,
  specialist_consultation: 50000,
  gp_preassessment: 10000,
  laboratory: null, // varies by test
};

// ─── Service Types ──────────────────────────────────────────────
const SERVICE_TYPES = {
  GP: 'general_practitioner',
  SPECIALIST: 'specialist',
  LABORATORY: 'laboratory',
};

// ─── Specialist List ────────────────────────────────────────────
const SPECIALISTS = [
  { id: 'cardiologist', name: 'Cardiologist', icon: '🫀', description: 'Heart and cardiovascular system' },
  { id: 'dermatologist', name: 'Dermatologist', icon: '🧴', description: 'Skin, hair, and nails' },
  { id: 'paediatrician', name: 'Paediatrician', icon: '👶', description: 'Children and adolescent health' },
  { id: 'gynaecologist', name: 'Gynaecologist', icon: '🩺', description: "Women's reproductive health" },
  { id: 'ent', name: 'ENT Specialist', icon: '👂', description: 'Ear, nose, and throat' },
  { id: 'orthopaedic', name: 'Orthopaedic Surgeon', icon: '🦴', description: 'Bones, joints, and muscles' },
  { id: 'neurologist', name: 'Neurologist', icon: '🧠', description: 'Brain and nervous system' },
  { id: 'ophthalmologist', name: 'Ophthalmologist', icon: '👁️', description: 'Eyes and vision' },
  { id: 'urologist', name: 'Urologist', icon: '🏥', description: 'Urinary tract and male reproductive system' },
  { id: 'endocrinologist', name: 'Endocrinologist', icon: '⚕️', description: 'Hormones and metabolism' },
];

// ─── Lab Tests ──────────────────────────────────────────────────
const LAB_TESTS = [
  { id: 'malaria_test', name: 'Malaria Test', price: 5000, category: 'Parasitology' },
  { id: 'full_blood_count', name: 'Full Blood Count (FBC)', price: 8000, category: 'Haematology' },
  { id: 'blood_glucose', name: 'Blood Glucose (Fasting)', price: 4000, category: 'Biochemistry' },
  { id: 'liver_function', name: 'Liver Function Test', price: 12000, category: 'Biochemistry' },
  { id: 'kidney_function', name: 'Kidney Function Test', price: 10000, category: 'Biochemistry' },
  { id: 'lipid_profile', name: 'Lipid Profile', price: 10000, category: 'Biochemistry' },
  { id: 'urinalysis', name: 'Urinalysis', price: 3000, category: 'Microbiology' },
  { id: 'hiv_test', name: 'HIV Screening', price: 5000, category: 'Serology' },
  { id: 'hepatitis_b', name: 'Hepatitis B Test', price: 6000, category: 'Serology' },
  { id: 'thyroid_function', name: 'Thyroid Function Test', price: 15000, category: 'Biochemistry' },
  { id: 'pregnancy_test', name: 'Pregnancy Test (HCG)', price: 5000, category: 'Serology' },
  { id: 'widal_test', name: 'Widal Test (Typhoid)', price: 4000, category: 'Serology' },
];

// ─── Appointment States ─────────────────────────────────────────
const APPOINTMENT_STATES = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  RESCHEDULED: 'rescheduled',
  NO_SHOW: 'no_show',
};

const PAYMENT_STATES = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  REFUNDED: 'refunded',
  FAILED: 'failed',
};

// ─── Symptom Duration Options ───────────────────────────────────
const SYMPTOM_DURATIONS = [
  { value: 'today', label: 'Just started today' },
  { value: '1-2_days', label: '1–2 days' },
  { value: '3-5_days', label: '3–5 days' },
  { value: '1_week', label: 'About 1 week' },
  { value: '2_weeks', label: 'About 2 weeks' },
  { value: '1_month', label: 'About 1 month' },
  { value: 'more_than_month', label: 'More than a month' },
  { value: 'recurring', label: 'It comes and goes' },
];

// ─── No-Show Fee Structure ──────────────────────────────────────
const NO_SHOW_FEE_STRUCTURE = {
  enabled: false, // Will be configured by business later
  feePercentage: 0, // e.g., 0.25 = 25% of original amount
  windowHours: 24, // Hours before appointment that counts as no-show period
};

// ─── Generate mock availability for a clinic ────────────────────
function generateMockAvailability(clinicId) {
  const slots = [];
  const today = new Date();
  const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  for (let d = 0; d < 14; d++) {
    const date = new Date(today);
    date.setDate(today.getDate() + d);
    const dayName = DAYS[date.getDay()];

    // Closed on Sundays
    if (dayName === 'Sunday') continue;

    // Saturday: reduced hours
    const startHour = 8;
    const endHour = dayName === 'Saturday' ? 14 : 18;

    for (let h = startHour; h < endHour; h++) {
      for (const m of [0, 30]) {
        const slotId = `${clinicId}-${date.toISOString().split('T')[0]}-${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
        slots.push({
          id: slotId,
          clinicId,
          date: date.toISOString().split('T')[0],
          dayName,
          time: `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`,
          displayTime: formatTimeDisplay(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`),
          durationMinutes: 30,
          isBooked: Math.random() < 0.3, // ~30% already booked
          doctorName: `Dr. ${['Adeyemi', 'Okonkwo', 'Ibrahim', 'Eze', 'Bello', 'Ajayi'][Math.floor(Math.random() * 6)]}`,
        });
      }
    }
  }
  return slots;
}

function formatTimeDisplay(timeStr) {
  if (!timeStr) return '';
  const [hh, mm] = timeStr.split(':');
  let hour = parseInt(hh, 10);
  const minute = mm;
  const ampm = hour >= 12 ? 'PM' : 'AM';
  if (hour === 0) hour = 12;
  else if (hour > 12) hour -= 12;
  return `${hour}:${minute} ${ampm}`;
}

function generateBookingRef() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let ref = 'HP-';
  for (let i = 0; i < 8; i++) {
    ref += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return ref;
}

// ─── Provider ───────────────────────────────────────────────────
export function BookingProvider({ children }) {
  const [appointments, setAppointments] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [availabilityCache, setAvailabilityCache] = useState({});
  const reminderTimers = useRef({});

  // ── Get availability for a clinic ──────────────────────────────
  const getAvailability = useCallback((clinicId) => {
    if (availabilityCache[clinicId]) return availabilityCache[clinicId];
    const slots = generateMockAvailability(clinicId);
    setAvailabilityCache(prev => ({ ...prev, [clinicId]: slots }));
    return slots;
  }, [availabilityCache]);

  // ── Reserve a slot (mark as booked) ────────────────────────────
  const reserveSlot = useCallback((clinicId, slotId) => {
    setAvailabilityCache(prev => {
      const updated = { ...prev };
      if (updated[clinicId]) {
        updated[clinicId] = updated[clinicId].map(s =>
          s.id === slotId ? { ...s, isBooked: true } : s
        );
      }
      return updated;
    });
  }, []);

  // ── Release a slot (mark as available) ─────────────────────────
  const releaseSlot = useCallback((clinicId, slotId) => {
    setAvailabilityCache(prev => {
      const updated = { ...prev };
      if (updated[clinicId]) {
        updated[clinicId] = updated[clinicId].map(s =>
          s.id === slotId ? { ...s, isBooked: false } : s
        );
      }
      return updated;
    });
  }, []);

  // ── Add notification ───────────────────────────────────────────
  const addNotification = useCallback((notification) => {
    const id = `notif-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setNotifications(prev => [
      { id, createdAt: new Date().toISOString(), read: false, ...notification },
      ...prev,
    ]);
    return id;
  }, []);

  // ── Schedule 30-minute reminder ────────────────────────────────
  const scheduleReminder = useCallback((appointment) => {
    const appointmentDateTime = new Date(`${appointment.appointmentDate}T${appointment.appointmentTime}`);
    const reminderTime = new Date(appointmentDateTime.getTime() - 30 * 60 * 1000);
    const now = new Date();
    const delay = reminderTime.getTime() - now.getTime();

    if (delay > 0) {
      const timer = setTimeout(() => {
        addNotification({
          type: 'reminder',
          title: 'Your appointment starts in 30 minutes',
          message: `Your appointment at ${appointment.hospitalName} is coming up at ${formatTimeDisplay(appointment.appointmentTime)}.`,
          appointmentId: appointment.appointmentId,
          actions: ['view', 'reschedule'],
        });
      }, delay);
      reminderTimers.current[appointment.appointmentId] = timer;
    } else if (delay > -30 * 60 * 1000) {
      // Appointment is within next 30 min — notify immediately
      addNotification({
        type: 'reminder',
        title: 'Your appointment starts soon',
        message: `Your appointment at ${appointment.hospitalName} is at ${formatTimeDisplay(appointment.appointmentTime)}.`,
        appointmentId: appointment.appointmentId,
        actions: ['view', 'reschedule'],
      });
    }
  }, [addNotification]);

  // ── Cancel a reminder ──────────────────────────────────────────
  const cancelReminder = useCallback((appointmentId) => {
    if (reminderTimers.current[appointmentId]) {
      clearTimeout(reminderTimers.current[appointmentId]);
      delete reminderTimers.current[appointmentId];
    }
  }, []);

  // ── Process payment (mock) ─────────────────────────────────────
  const processPayment = useCallback(async (amount, bookingDetails) => {
    // Simulate payment processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    // Mock: always succeeds. In production, integrate with Paystack/Flutterwave.
    return {
      success: true,
      transactionId: `TXN-${Date.now()}`,
      amount,
      status: PAYMENT_STATES.COMPLETED,
    };
  }, []);

  // ── Create booking ─────────────────────────────────────────────
  const createBooking = useCallback(async (bookingData) => {
    const {
      clinicId, hospitalName, hospitalImage, hospitalAddress,
      serviceType, specialistType, labTestId,
      selectedSlot, patientName, patientPhone, patientEmail,
      symptoms, symptomDuration, doctorName,
    } = bookingData;

    // Calculate pricing
    let amount = 0;
    let priceBreakdown = [];
    let requiresPreassessment = false;

    if (serviceType === SERVICE_TYPES.GP) {
      amount = PRICING.gp_consultation;
      priceBreakdown = [{ label: 'GP Consultation', amount: PRICING.gp_consultation }];
    } else if (serviceType === SERVICE_TYPES.SPECIALIST) {
      requiresPreassessment = true;
      amount = PRICING.gp_preassessment + PRICING.specialist_consultation;
      priceBreakdown = [
        { label: 'GP Preassessment', amount: PRICING.gp_preassessment },
        { label: 'Specialist Consultation', amount: PRICING.specialist_consultation },
      ];
    } else if (serviceType === SERVICE_TYPES.LABORATORY) {
      const test = LAB_TESTS.find(t => t.id === labTestId);
      amount = test?.price || 0;
      priceBreakdown = [{ label: test?.name || 'Laboratory Test', amount }];
    }

    // Process payment
    const paymentResult = await processPayment(amount, bookingData);
    if (!paymentResult.success) {
      return { success: false, error: 'Payment failed. Please try again.' };
    }

    const appointmentId = `appt-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const bookingRef = generateBookingRef();
    let preassessmentAppointmentId = null;

    // Create GP preassessment appointment if specialist
    if (requiresPreassessment) {
      preassessmentAppointmentId = `appt-pre-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const preassessmentAppt = {
        appointmentId: preassessmentAppointmentId,
        bookingRef: `${bookingRef}-GP`,
        patientId: patientEmail, // Using email as patient ID for mock
        clinicId,
        hospitalName,
        hospitalImage,
        hospitalAddress,
        serviceType: SERVICE_TYPES.GP,
        bookingType: 'gp_preassessment',
        specialistType: null,
        labTestId: null,
        appointmentDate: selectedSlot.date,
        appointmentTime: selectedSlot.time,
        displayTime: selectedSlot.displayTime,
        dayName: selectedSlot.dayName,
        slotId: selectedSlot.id,
        status: APPOINTMENT_STATES.CONFIRMED,
        paymentStatus: PAYMENT_STATES.COMPLETED,
        amount: PRICING.gp_preassessment,
        priceBreakdown: [{ label: 'GP Preassessment', amount: PRICING.gp_preassessment }],
        patientName,
        patientPhone,
        patientEmail,
        symptoms,
        symptomDuration,
        doctorName: selectedSlot.doctorName || doctorName,
        requiresPreassessment: false,
        preassessmentAppointmentId: null,
        parentAppointmentId: appointmentId,
        transactionId: paymentResult.transactionId,
        rescheduleHistory: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setAppointments(prev => [...prev, preassessmentAppt]);
      scheduleReminder(preassessmentAppt);
    }

    // Create main appointment
    const appointment = {
      appointmentId,
      bookingRef,
      patientId: patientEmail,
      clinicId,
      hospitalName,
      hospitalImage,
      hospitalAddress,
      serviceType,
      bookingType: serviceType === SERVICE_TYPES.SPECIALIST ? 'specialist' :
        serviceType === SERVICE_TYPES.LABORATORY ? 'laboratory' : 'gp',
      specialistType: specialistType || null,
      labTestId: labTestId || null,
      appointmentDate: selectedSlot.date,
      appointmentTime: selectedSlot.time,
      displayTime: selectedSlot.displayTime,
      dayName: selectedSlot.dayName,
      slotId: selectedSlot.id,
      status: APPOINTMENT_STATES.CONFIRMED,
      paymentStatus: PAYMENT_STATES.COMPLETED,
      amount,
      priceBreakdown,
      patientName,
      patientPhone,
      patientEmail,
      symptoms: symptoms || null,
      symptomDuration: symptomDuration || null,
      doctorName: selectedSlot.doctorName || doctorName,
      requiresPreassessment,
      preassessmentAppointmentId,
      transactionId: paymentResult.transactionId,
      rescheduleHistory: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Reserve the slot
    reserveSlot(clinicId, selectedSlot.id);

    setAppointments(prev => [...prev, appointment]);
    scheduleReminder(appointment);

    // Notify hospital
    addNotification({
      type: 'hospital_new_booking',
      title: 'New appointment booked',
      message: `${patientName} has booked a ${serviceType === SERVICE_TYPES.SPECIALIST ? `${specialistType} (specialist)` : serviceType === SERVICE_TYPES.LABORATORY ? 'laboratory test' : 'GP consultation'} for ${selectedSlot.dayName}, ${selectedSlot.date} at ${selectedSlot.displayTime}.`,
      appointmentId,
      clinicId,
    });

    return { success: true, appointment, bookingRef, paymentResult };
  }, [processPayment, reserveSlot, addNotification, scheduleReminder]);

  // ── Reschedule appointment ─────────────────────────────────────
  const rescheduleAppointment = useCallback((appointmentId, newSlot) => {
    setAppointments(prev => prev.map(appt => {
      if (appt.appointmentId !== appointmentId) return appt;

      const rescheduleEntry = {
        previousDate: appt.appointmentDate,
        previousTime: appt.appointmentTime,
        previousSlotId: appt.slotId,
        rescheduledAt: new Date().toISOString(),
      };

      // Calculate no-show fee if applicable
      const appointmentDateTime = new Date(`${appt.appointmentDate}T${appt.appointmentTime}`);
      const now = new Date();
      const hoursUntilAppointment = (appointmentDateTime - now) / (1000 * 60 * 60);
      let noShowFee = null;

      if (NO_SHOW_FEE_STRUCTURE.enabled && hoursUntilAppointment < NO_SHOW_FEE_STRUCTURE.windowHours) {
        noShowFee = {
          originalAmount: appt.amount,
          noShowFee: Math.round(appt.amount * NO_SHOW_FEE_STRUCTURE.feePercentage),
          amountRetained: Math.round(appt.amount * NO_SHOW_FEE_STRUCTURE.feePercentage),
          amountRefunded: 0,
          amountCredited: appt.amount - Math.round(appt.amount * NO_SHOW_FEE_STRUCTURE.feePercentage),
        };
        rescheduleEntry.noShowFee = noShowFee;
      }

      // Release old slot
      releaseSlot(appt.clinicId, appt.slotId);
      // Reserve new slot
      reserveSlot(appt.clinicId, newSlot.id);
      // Cancel old reminder
      cancelReminder(appointmentId);

      const updated = {
        ...appt,
        appointmentDate: newSlot.date,
        appointmentTime: newSlot.time,
        displayTime: newSlot.displayTime,
        dayName: newSlot.dayName,
        slotId: newSlot.id,
        doctorName: newSlot.doctorName || appt.doctorName,
        status: APPOINTMENT_STATES.CONFIRMED,
        rescheduleHistory: [...appt.rescheduleHistory, rescheduleEntry],
        updatedAt: new Date().toISOString(),
      };

      // Schedule new reminder
      scheduleReminder(updated);

      // Notify hospital
      addNotification({
        type: 'hospital_reschedule',
        title: 'Appointment rescheduled',
        message: `${appt.patientName} has rescheduled their appointment from ${appt.dayName} ${appt.appointmentDate} ${appt.displayTime} to ${newSlot.dayName} ${newSlot.date} ${newSlot.displayTime}.`,
        appointmentId,
        clinicId: appt.clinicId,
      });

      return updated;
    }));

    return { success: true };
  }, [releaseSlot, reserveSlot, cancelReminder, scheduleReminder, addNotification]);

  // ── Cancel appointment ─────────────────────────────────────────
  const cancelBooking = useCallback((appointmentId) => {
    setAppointments(prev => prev.map(appt => {
      if (appt.appointmentId !== appointmentId) return appt;
      releaseSlot(appt.clinicId, appt.slotId);
      cancelReminder(appointmentId);

      addNotification({
        type: 'hospital_cancellation',
        title: 'Appointment cancelled',
        message: `${appt.patientName} has cancelled their appointment for ${appt.dayName} ${appt.appointmentDate} at ${appt.displayTime}.`,
        appointmentId,
        clinicId: appt.clinicId,
      });

      return {
        ...appt,
        status: APPOINTMENT_STATES.CANCELLED,
        updatedAt: new Date().toISOString(),
      };
    }));
  }, [releaseSlot, cancelReminder, addNotification]);

  // ── Get appointments for patient ───────────────────────────────
  const getPatientAppointments = useCallback((patientEmail) => {
    return appointments.filter(a => a.patientId === patientEmail);
  }, [appointments]);

  // ── Get appointments for provider/clinic ───────────────────────
  const getClinicAppointments = useCallback((clinicId) => {
    return appointments.filter(a => a.clinicId === clinicId);
  }, [appointments]);

  // ── Mark notification as read ──────────────────────────────────
  const markNotificationRead = useCallback((notifId) => {
    setNotifications(prev => prev.map(n =>
      n.id === notifId ? { ...n, read: true } : n
    ));
  }, []);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      Object.values(reminderTimers.current).forEach(clearTimeout);
    };
  }, []);

  const value = useMemo(() => ({
    // State
    appointments,
    notifications,
    // Config
    PRICING,
    SERVICE_TYPES,
    SPECIALISTS,
    LAB_TESTS,
    APPOINTMENT_STATES,
    PAYMENT_STATES,
    SYMPTOM_DURATIONS,
    NO_SHOW_FEE_STRUCTURE,
    // Actions
    getAvailability,
    createBooking,
    rescheduleAppointment,
    cancelBooking,
    getPatientAppointments,
    getClinicAppointments,
    addNotification,
    markNotificationRead,
    processPayment,
    formatTimeDisplay,
  }), [
    appointments, notifications,
    getAvailability, createBooking, rescheduleAppointment, cancelBooking,
    getPatientAppointments, getClinicAppointments,
    addNotification, markNotificationRead, processPayment,
  ]);

  return (
    <BookingContext.Provider value={value}>
      {children}
    </BookingContext.Provider>
  );
}

export function useBooking() {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
}

export default BookingContext;
