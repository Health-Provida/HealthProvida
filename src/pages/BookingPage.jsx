/**
 * BookingPage.jsx
 * ──────────────────────────────────────────────────────────────
 * Full multi-step booking flow for HealthProvida.
 *
 * Steps:
 *  1. Patient Details
 *  2. Symptoms & Duration
 *  3. Care Recommendation (GP default vs Specialist)
 *  4. Appointment Selection (date/time)
 *  5. Booking Summary & Payment
 *  6. Confirmation
 * ──────────────────────────────────────────────────────────────
 */
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, ArrowRight, User, Phone, Mail, Stethoscope,
  Calendar, Clock, MapPin, CheckCircle, AlertCircle, Loader2,
  Heart, Shield, ChevronDown, ChevronRight, CreditCard,
  FileText, Star, Sparkles, Activity, FlaskConical, Search,
  Building2, Info, X, RefreshCw, Copy, Check,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useBooking } from '@/context/BookingContext';
import { useToast } from '@/components/ui/use-toast';
import { fetchClinicBySlug } from '@/utils/supabaseQueries';

// ─── Step indicator ─────────────────────────────────────────────
function StepIndicator({ steps, currentStep }) {
  return (
    <div className="flex items-center justify-center gap-1 sm:gap-2 mb-8">
      {steps.map((step, idx) => (
        <React.Fragment key={step.id}>
          <div className="flex items-center gap-1.5">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
              idx < currentStep
                ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-md shadow-green-200'
                : idx === currentStep
                  ? 'bg-gradient-to-r from-blue-600 to-teal-500 text-white shadow-lg shadow-blue-200 scale-110'
                  : 'bg-gray-100 text-gray-400'
            }`}>
              {idx < currentStep ? <Check className="w-4 h-4" /> : idx + 1}
            </div>
            <span className={`text-xs font-medium hidden sm:block ${
              idx === currentStep ? 'text-blue-700' : idx < currentStep ? 'text-emerald-600' : 'text-gray-400'
            }`}>
              {step.label}
            </span>
          </div>
          {idx < steps.length - 1 && (
            <div className={`w-6 sm:w-10 h-0.5 rounded-full transition-all duration-300 ${
              idx < currentStep ? 'bg-emerald-400' : 'bg-gray-200'
            }`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

// ─── Format currency ────────────────────────────────────────────
function formatNaira(amount) {
  return `₦${amount.toLocaleString()}`;
}

// ─── Step 1: Patient Details ────────────────────────────────────
function PatientDetailsStep({ data, onChange }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-teal-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-200">
          <User className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Patient Details</h2>
        <p className="text-gray-500 mt-1 text-sm">Please confirm your information</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
            <User className="w-4 h-4 text-blue-500" />
            Full Name <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={data.fullName}
            onChange={(e) => onChange({ fullName: e.target.value })}
            placeholder="Enter your full name"
            className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-white focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none text-sm transition-all"
          />
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
            <Phone className="w-4 h-4 text-blue-500" />
            Phone Number <span className="text-red-400">*</span>
          </label>
          <input
            type="tel"
            value={data.phone}
            onChange={(e) => onChange({ phone: e.target.value })}
            placeholder="e.g. 08012345678"
            className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-white focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none text-sm transition-all"
          />
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
            <Mail className="w-4 h-4 text-blue-500" />
            Email Address <span className="text-red-400">*</span>
          </label>
          <input
            type="email"
            value={data.email}
            onChange={(e) => onChange({ email: e.target.value })}
            placeholder="you@example.com"
            className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-white focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none text-sm transition-all"
          />
        </div>
      </div>
    </motion.div>
  );
}

// ─── Step 2: Symptoms ───────────────────────────────────────────
function SymptomsStep({ data, onChange, durations, isLab }) {
  if (isLab) {
    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="space-y-6"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-purple-200">
            <FlaskConical className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Lab Test Details</h2>
          <p className="text-gray-500 mt-1 text-sm">Provide any additional information</p>
        </div>
        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
            <FileText className="w-4 h-4 text-purple-500" />
            Additional notes <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <textarea
            value={data.symptoms}
            onChange={(e) => onChange({ symptoms: e.target.value })}
            placeholder="e.g. Doctor referred me for this test, fasting since last night..."
            rows={3}
            maxLength={500}
            className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-white focus:bg-white focus:border-purple-400 focus:ring-2 focus:ring-purple-100 outline-none text-sm transition-all resize-none"
          />
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-rose-200">
          <Activity className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">How are you feeling?</h2>
        <p className="text-gray-500 mt-1 text-sm">Tell us what you're experiencing so we can help you better</p>
      </div>

      <div>
        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
          <Heart className="w-4 h-4 text-rose-500" />
          Describe your symptoms
        </label>
        <textarea
          value={data.symptoms}
          onChange={(e) => onChange({ symptoms: e.target.value })}
          placeholder="e.g. I've had a headache and fever for three days, along with body aches..."
          rows={4}
          maxLength={1000}
          className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-white focus:bg-white focus:border-rose-400 focus:ring-2 focus:ring-rose-100 outline-none text-sm transition-all resize-none"
        />
        <p className="text-xs text-gray-400 text-right mt-1">{(data.symptoms || '').length}/1000</p>
      </div>

      <div>
        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
          <Clock className="w-4 h-4 text-rose-500" />
          How long have you had these symptoms?
        </label>
        <div className="grid grid-cols-2 gap-2">
          {durations.map((d) => (
            <button
              key={d.value}
              onClick={() => onChange({ symptomDuration: d.value })}
              className={`px-4 py-3 rounded-xl text-sm font-medium transition-all text-left ${
                data.symptomDuration === d.value
                  ? 'bg-rose-50 border-2 border-rose-400 text-rose-700 shadow-sm'
                  : 'bg-gray-50 border-2 border-transparent text-gray-600 hover:bg-gray-100 hover:border-gray-200'
              }`}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-blue-50/60 border border-blue-100 rounded-xl p-4 flex items-start gap-3">
        <Shield className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-blue-800">This is not a diagnosis</p>
          <p className="text-xs text-blue-600 mt-0.5">
            This information helps your doctor prepare for your visit and provide better care. It does not replace a medical consultation.
          </p>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Step 3: Care Recommendation ────────────────────────────────
function CareRecommendationStep({ data, onChange, specialists, isLab, labTests, labSearchQuery, onLabSearchChange }) {
  const [showSpecialists, setShowSpecialists] = useState(data.serviceType === 'specialist');

  if (isLab) {
    const filteredTests = labSearchQuery.trim()
      ? labTests.filter(t =>
          t.name.toLowerCase().includes(labSearchQuery.toLowerCase()) ||
          t.category.toLowerCase().includes(labSearchQuery.toLowerCase())
        )
      : labTests;

    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="space-y-6"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-purple-200">
            <FlaskConical className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Select a Test</h2>
          <p className="text-gray-500 mt-1 text-sm">Choose the laboratory test you need</p>
        </div>

        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={labSearchQuery}
            onChange={(e) => onLabSearchChange(e.target.value)}
            placeholder="Search tests... e.g. Malaria test"
            className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-gray-200 bg-white focus:border-purple-400 focus:ring-2 focus:ring-purple-100 outline-none text-sm transition-all"
          />
        </div>

        <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
          {filteredTests.map((test) => (
            <button
              key={test.id}
              onClick={() => onChange({ labTestId: test.id })}
              className={`w-full flex items-center justify-between p-4 rounded-xl text-left transition-all ${
                data.labTestId === test.id
                  ? 'bg-purple-50 border-2 border-purple-400 shadow-sm'
                  : 'bg-white border-2 border-gray-100 hover:border-purple-200 hover:bg-purple-50/30'
              }`}
            >
              <div>
                <p className={`text-sm font-semibold ${data.labTestId === test.id ? 'text-purple-800' : 'text-gray-800'}`}>
                  {test.name}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">{test.category}</p>
              </div>
              <span className={`text-sm font-bold ${data.labTestId === test.id ? 'text-purple-700' : 'text-gray-700'}`}>
                {formatNaira(test.price)}
              </span>
            </button>
          ))}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-200">
          <Stethoscope className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Care Recommendation</h2>
        <p className="text-gray-500 mt-1 text-sm">Choose your consultation type</p>
      </div>

      {/* GP Recommendation Card */}
      <div className={`relative p-5 rounded-2xl transition-all cursor-pointer ${
        data.serviceType === 'general_practitioner'
          ? 'bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-400 shadow-md shadow-emerald-100'
          : 'bg-white border-2 border-gray-100 hover:border-emerald-200'
      }`}
        onClick={() => {
          onChange({ serviceType: 'general_practitioner', specialistType: null });
          setShowSpecialists(false);
        }}
      >
        {data.serviceType === 'general_practitioner' && (
          <div className="absolute top-3 right-3">
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500 text-white text-[10px] font-bold uppercase tracking-wider">
              <Sparkles className="w-3 h-3" /> Recommended
            </div>
          </div>
        )}
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
            <Stethoscope className="w-6 h-6 text-emerald-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-gray-900">General Practitioner</h3>
            <p className="text-sm text-gray-600 mt-1 leading-relaxed">
              We recommend starting with a General Practitioner. A GP can perform an initial assessment and determine the appropriate next step for your care.
            </p>
            <div className="mt-3 flex items-center gap-2">
              <span className="text-lg font-bold text-emerald-700">{formatNaira(10000)}</span>
              <span className="text-xs text-gray-500">per consultation</span>
            </div>
          </div>
        </div>
      </div>

      {/* Specialist Option */}
      <div className={`relative p-5 rounded-2xl transition-all cursor-pointer ${
        data.serviceType === 'specialist'
          ? 'bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-400 shadow-md shadow-amber-100'
          : 'bg-white border-2 border-gray-100 hover:border-amber-200'
      }`}
        onClick={() => {
          onChange({ serviceType: 'specialist' });
          setShowSpecialists(true);
        }}
      >
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
            <Star className="w-6 h-6 text-amber-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-gray-900">See a Specialist</h3>
            <p className="text-sm text-gray-600 mt-1 leading-relaxed">
              Choose a specific specialist for your consultation. A mandatory GP preassessment is included.
            </p>
            <div className="mt-3 flex items-center gap-2">
              <span className="text-lg font-bold text-amber-700">{formatNaira(60000)}</span>
              <span className="text-xs text-gray-500">includes GP preassessment</span>
            </div>
          </div>
        </div>

        {/* GP Preassessment notice */}
        {data.serviceType === 'specialist' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-4 p-3.5 bg-amber-100/60 rounded-xl border border-amber-200"
          >
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-amber-800">GP preassessment required</p>
                <p className="text-xs text-amber-700 mt-0.5">
                  Specialist appointments include an initial General Practitioner assessment to ensure the specialist consultation is appropriate for your needs.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Specialist grid */}
      <AnimatePresence>
        {showSpecialists && data.serviceType === 'specialist' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-3"
          >
            <p className="text-sm font-semibold text-gray-700">Choose your specialist:</p>
            <div className="grid grid-cols-2 gap-2">
              {specialists.map((spec) => (
                <button
                  key={spec.id}
                  onClick={() => onChange({ specialistType: spec.id })}
                  className={`p-3 rounded-xl text-left transition-all ${
                    data.specialistType === spec.id
                      ? 'bg-amber-50 border-2 border-amber-400 shadow-sm'
                      : 'bg-white border-2 border-gray-100 hover:border-amber-200 hover:bg-amber-50/30'
                  }`}
                >
                  <span className="text-lg">{spec.icon}</span>
                  <p className={`text-xs font-semibold mt-1 ${data.specialistType === spec.id ? 'text-amber-800' : 'text-gray-800'}`}>
                    {spec.name}
                  </p>
                  <p className="text-[10px] text-gray-500 mt-0.5 line-clamp-1">{spec.description}</p>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Step 4: Appointment Selection ──────────────────────────────
function AppointmentSelectionStep({ data, onChange, availability }) {
  const [selectedDate, setSelectedDate] = useState(null);

  // Group slots by date
  const slotsByDate = useMemo(() => {
    const groups = {};
    const availableSlots = availability.filter(s => !s.isBooked);
    availableSlots.forEach(slot => {
      if (!groups[slot.date]) {
        groups[slot.date] = {
          date: slot.date,
          dayName: slot.dayName,
          slots: [],
        };
      }
      groups[slot.date].slots.push(slot);
    });
    return Object.values(groups).sort((a, b) => a.date.localeCompare(b.date));
  }, [availability]);

  useEffect(() => {
    if (slotsByDate.length > 0 && !selectedDate) {
      setSelectedDate(slotsByDate[0].date);
    }
  }, [slotsByDate, selectedDate]);

  const selectedDaySlots = selectedDate
    ? slotsByDate.find(d => d.date === selectedDate)?.slots || []
    : [];

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-200">
          <Calendar className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Select Date & Time</h2>
        <p className="text-gray-500 mt-1 text-sm">Choose an available consultation slot</p>
      </div>

      {/* Date selector */}
      <div>
        <p className="text-sm font-semibold text-gray-700 mb-3">Available dates</p>
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {slotsByDate.slice(0, 10).map((day) => {
            const dateObj = new Date(day.date + 'T00:00:00');
            const isSelected = day.date === selectedDate;
            return (
              <button
                key={day.date}
                onClick={() => setSelectedDate(day.date)}
                className={`flex-shrink-0 flex flex-col items-center w-[72px] py-3 rounded-xl transition-all ${
                  isSelected
                    ? 'bg-gradient-to-b from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-200'
                    : 'bg-white border-2 border-gray-100 text-gray-700 hover:border-blue-200 hover:bg-blue-50/30'
                }`}
              >
                <span className={`text-[10px] font-bold uppercase tracking-wider ${isSelected ? 'text-blue-100' : 'text-gray-400'}`}>
                  {day.dayName.slice(0, 3)}
                </span>
                <span className={`text-lg font-bold mt-0.5 ${isSelected ? 'text-white' : 'text-gray-900'}`}>
                  {dateObj.getDate()}
                </span>
                <span className={`text-[10px] ${isSelected ? 'text-blue-100' : 'text-gray-400'}`}>
                  {dateObj.toLocaleDateString('en-US', { month: 'short' })}
                </span>
                <span className={`text-[9px] mt-1 font-medium ${isSelected ? 'text-blue-200' : 'text-emerald-500'}`}>
                  {day.slots.length} slots
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Time slots */}
      {selectedDate && (
        <div>
          <p className="text-sm font-semibold text-gray-700 mb-3">
            Available times — {slotsByDate.find(d => d.date === selectedDate)?.dayName}
          </p>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-[300px] overflow-y-auto pr-1">
            {selectedDaySlots.map((slot) => (
              <button
                key={slot.id}
                onClick={() => onChange({ selectedSlot: slot })}
                className={`py-3 px-2 rounded-xl text-sm font-medium transition-all ${
                  data.selectedSlot?.id === slot.id
                    ? 'bg-blue-500 text-white shadow-md shadow-blue-200 ring-2 ring-blue-300 ring-offset-1'
                    : 'bg-gray-50 text-gray-700 hover:bg-blue-50 hover:text-blue-700 border border-gray-100'
                }`}
              >
                {slot.displayTime}
              </button>
            ))}
          </div>
          {data.selectedSlot && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-3.5 bg-blue-50 border border-blue-100 rounded-xl flex items-center gap-3"
            >
              <Clock className="w-5 h-5 text-blue-500 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-blue-800">
                  {data.selectedSlot.dayName}, {new Date(data.selectedSlot.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} at {data.selectedSlot.displayTime}
                </p>
                {data.selectedSlot.doctorName && (
                  <p className="text-xs text-blue-600 mt-0.5">with {data.selectedSlot.doctorName}</p>
                )}
              </div>
            </motion.div>
          )}
        </div>
      )}
    </motion.div>
  );
}

// ─── Step 5: Booking Summary & Payment ──────────────────────────
function BookingSummaryStep({ clinic, data, priceBreakdown, totalAmount, isLab, labTest, specialistName }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-5"
    >
      <div className="text-center mb-6">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-green-200">
          <FileText className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Booking Summary</h2>
        <p className="text-gray-500 mt-1 text-sm">Review your appointment details</p>
      </div>

      {/* Hospital/Provider */}
      <div className="bg-white rounded-xl border border-gray-100 p-4">
        <div className="flex items-center gap-3">
          {clinic?.image_src && (
            <img src={clinic.image_src} alt="" className="w-12 h-12 rounded-lg object-cover" />
          )}
          <div className="min-w-0">
            <p className="text-sm font-bold text-gray-900 truncate">{clinic?.practitioner_name}</p>
            <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
              <MapPin className="w-3 h-3" />
              {clinic?.address}
            </p>
          </div>
        </div>
      </div>

      {/* Details grid */}
      <div className="bg-gray-50/80 rounded-xl border border-gray-100 p-4 space-y-3">
        <DetailRow icon={<Stethoscope className="w-4 h-4 text-teal-500" />} label="Service" value={
          isLab ? labTest?.name || 'Laboratory Test' :
          data.serviceType === 'specialist' ? `${specialistName} (Specialist)` : 'General Practitioner'
        } />
        {data.selectedSlot?.doctorName && (
          <DetailRow icon={<User className="w-4 h-4 text-blue-500" />} label="Doctor" value={data.selectedSlot.doctorName} />
        )}
        <DetailRow icon={<Calendar className="w-4 h-4 text-indigo-500" />} label="Date" value={
          data.selectedSlot ? `${data.selectedSlot.dayName}, ${new Date(data.selectedSlot.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}` : '—'
        } />
        <DetailRow icon={<Clock className="w-4 h-4 text-purple-500" />} label="Time" value={data.selectedSlot?.displayTime || '—'} />
        <div className="border-t border-gray-200 my-2" />
        <DetailRow icon={<User className="w-4 h-4 text-gray-500" />} label="Patient" value={data.fullName} />
        <DetailRow icon={<Phone className="w-4 h-4 text-gray-500" />} label="Phone" value={data.phone} />
        <DetailRow icon={<Mail className="w-4 h-4 text-gray-500" />} label="Email" value={data.email} />
        {data.symptoms && (
          <>
            <div className="border-t border-gray-200 my-2" />
            <DetailRow icon={<Activity className="w-4 h-4 text-rose-500" />} label="Symptoms" value={data.symptoms} />
            {data.symptomDuration && (
              <DetailRow icon={<Clock className="w-4 h-4 text-rose-500" />} label="Duration" value={
                data.symptomDuration.replace(/_/g, ' ').replace(/^\w/, c => c.toUpperCase())
              } />
            )}
          </>
        )}
      </div>

      {/* Price Breakdown */}
      <div className="bg-white rounded-xl border-2 border-emerald-100 p-4">
        <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-3">Price Breakdown</p>
        {priceBreakdown.map((item, idx) => (
          <div key={idx} className="flex items-center justify-between py-1.5">
            <span className="text-sm text-gray-700">{item.label}</span>
            <span className="text-sm font-semibold text-gray-900">{formatNaira(item.amount)}</span>
          </div>
        ))}
        <div className="border-t border-emerald-100 mt-2 pt-2 flex items-center justify-between">
          <span className="text-sm font-bold text-gray-900">Total</span>
          <span className="text-lg font-bold text-emerald-700">{formatNaira(totalAmount)}</span>
        </div>
      </div>

      {/* Specialist preassessment info */}
      {data.serviceType === 'specialist' && (
        <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 flex items-start gap-3">
          <Info className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-800">Includes GP Preassessment</p>
            <p className="text-xs text-amber-700 mt-0.5">
              Your appointment includes a mandatory GP preassessment ({formatNaira(10000)}) before your specialist consultation ({formatNaira(50000)}).
            </p>
          </div>
        </div>
      )}
    </motion.div>
  );
}

function DetailRow({ icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 flex-shrink-0">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{label}</p>
        <p className="text-sm text-gray-800 mt-0.5 break-words">{value}</p>
      </div>
    </div>
  );
}

// ─── Step 6: Confirmation ───────────────────────────────────────
function ConfirmationStep({ result, data, clinic, isLab, labTest, specialistName }) {
  const [copied, setCopied] = useState(false);

  const handleCopyRef = () => {
    navigator.clipboard.writeText(result.bookingRef);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="space-y-6 text-center"
    >
      {/* Success animation */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', damping: 15, stiffness: 200, delay: 0.1 }}
        className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center mx-auto shadow-xl shadow-green-200"
      >
        <CheckCircle className="w-10 h-10 text-white" />
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <h2 className="text-2xl font-bold text-gray-900">Booking Confirmed!</h2>
        <p className="text-gray-500 mt-1 text-sm">Your appointment has been successfully booked</p>
      </motion.div>

      {/* Booking ref */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-gradient-to-r from-blue-50 to-teal-50 rounded-xl p-5 border border-blue-100"
      >
        <p className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-2">Booking Reference</p>
        <div className="flex items-center justify-center gap-3">
          <span className="text-2xl font-mono font-bold text-gray-900 tracking-widest">{result.bookingRef}</span>
          <button
            onClick={handleCopyRef}
            className="p-2 rounded-lg hover:bg-blue-100 transition"
            title="Copy reference"
          >
            {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4 text-blue-500" />}
          </button>
        </div>
      </motion.div>

      {/* Confirmation details */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white rounded-xl border border-gray-100 p-5 text-left space-y-3"
      >
        <ConfirmRow label="Hospital" value={clinic?.practitioner_name} />
        <ConfirmRow label="Service" value={
          isLab ? labTest?.name :
          data.serviceType === 'specialist' ? `${specialistName} (Specialist)` : 'General Practitioner'
        } />
        {data.selectedSlot?.doctorName && <ConfirmRow label="Doctor" value={data.selectedSlot.doctorName} />}
        <ConfirmRow label="Date" value={
          data.selectedSlot ? `${data.selectedSlot.dayName}, ${new Date(data.selectedSlot.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}` : '—'
        } />
        <ConfirmRow label="Time" value={data.selectedSlot?.displayTime} />
        <ConfirmRow label="Amount Paid" value={formatNaira(result.appointment?.amount || 0)} highlight />
        <ConfirmRow label="Payment Status" value="Completed" badge="emerald" />
        <ConfirmRow label="Appointment Status" value="Confirmed" badge="blue" />

        {data.serviceType === 'specialist' && (
          <div className="mt-3 p-3 bg-amber-50 border border-amber-100 rounded-lg">
            <p className="text-xs font-semibold text-amber-800 mb-1">Booking includes:</p>
            <div className="space-y-1">
              <p className="text-xs text-amber-700">1. GP Preassessment — {formatNaira(10000)}</p>
              <p className="text-xs text-amber-700">2. {specialistName} Consultation — {formatNaira(50000)}</p>
            </div>
          </div>
        )}
      </motion.div>

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="flex flex-col gap-3"
      >
        <Link
          to="/appointments"
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-700 hover:to-teal-600 text-white py-3.5 px-6 rounded-xl text-sm font-semibold transition shadow-lg shadow-blue-200 hover:shadow-xl"
        >
          <Calendar className="w-4 h-4" />
          View My Appointments
        </Link>
        <Link
          to="/"
          className="w-full py-3 text-sm font-medium text-gray-500 hover:text-gray-700 transition"
        >
          Back to Home
        </Link>
      </motion.div>
    </motion.div>
  );
}

function ConfirmRow({ label, value, highlight, badge }) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-xs text-gray-500">{label}</span>
      {badge ? (
        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
          badge === 'emerald' ? 'bg-emerald-50 text-emerald-700' : 'bg-blue-50 text-blue-700'
        }`}>{value}</span>
      ) : (
        <span className={`text-sm ${highlight ? 'font-bold text-emerald-700' : 'font-medium text-gray-800'}`}>{value}</span>
      )}
    </div>
  );
}

// ─── Main Booking Page ──────────────────────────────────────────
export default function BookingPage() {
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { profile, user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const booking = useBooking();

  const isLab = searchParams.get('type') === 'laboratory';

  const [clinic, setClinic] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [bookingResult, setBookingResult] = useState(null);
  const [labSearchQuery, setLabSearchQuery] = useState('');

  // Form data
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    symptoms: '',
    symptomDuration: '',
    serviceType: isLab ? 'laboratory' : 'general_practitioner',
    specialistType: null,
    labTestId: null,
    selectedSlot: null,
  });

  // Pre-populate from auth
  useEffect(() => {
    if (profile || user) {
      setFormData(prev => ({
        ...prev,
        fullName: prev.fullName || profile?.full_name || '',
        email: prev.email || profile?.email || user?.email || '',
        phone: prev.phone || profile?.phone || '',
      }));
    }
  }, [profile, user]);

  // Load clinic
  useEffect(() => {
    async function load() {
      setLoading(true);
      const result = await fetchClinicBySlug(slug);
      if (result.data) {
        setClinic(result.data);
      } else {
        toast({ title: 'Error', description: 'Failed to load provider', variant: 'destructive' });
      }
      setLoading(false);
    }
    load();
  }, [slug, toast]);

  // Steps
  const steps = isLab
    ? [
        { id: 'details', label: 'Details' },
        { id: 'test', label: 'Test' },
        { id: 'notes', label: 'Notes' },
        { id: 'appointment', label: 'Date' },
        { id: 'summary', label: 'Review' },
        { id: 'confirmation', label: 'Done' },
      ]
    : [
        { id: 'details', label: 'Details' },
        { id: 'symptoms', label: 'Symptoms' },
        { id: 'recommendation', label: 'Service' },
        { id: 'appointment', label: 'Date' },
        { id: 'summary', label: 'Review' },
        { id: 'confirmation', label: 'Done' },
      ];

  const updateForm = (updates) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  // Get availability
  const availability = clinic ? booking.getAvailability(clinic.id) : [];

  // Computed values
  const labTest = booking.LAB_TESTS.find(t => t.id === formData.labTestId);
  const specialist = booking.SPECIALISTS.find(s => s.id === formData.specialistType);
  const specialistName = specialist?.name || '';

  const priceBreakdown = useMemo(() => {
    if (isLab) {
      return labTest ? [{ label: labTest.name, amount: labTest.price }] : [];
    }
    if (formData.serviceType === 'specialist') {
      return [
        { label: 'GP Preassessment', amount: booking.PRICING.gp_preassessment },
        { label: 'Specialist Consultation', amount: booking.PRICING.specialist_consultation },
      ];
    }
    return [{ label: 'GP Consultation', amount: booking.PRICING.gp_consultation }];
  }, [formData.serviceType, labTest, isLab, booking.PRICING]);

  const totalAmount = priceBreakdown.reduce((sum, item) => sum + item.amount, 0);

  // Validation
  const canProceed = () => {
    if (bookingResult) return false;

    if (isLab) {
      switch (currentStep) {
        case 0: return formData.fullName.trim() && formData.phone.trim() && formData.email.trim();
        case 1: return !!formData.labTestId;
        case 2: return true; // notes are optional
        case 3: return !!formData.selectedSlot;
        case 4: return true;
        default: return false;
      }
    }

    switch (currentStep) {
      case 0: return formData.fullName.trim() && formData.phone.trim() && formData.email.trim();
      case 1: return true; // symptoms optional but encourage
      case 2:
        if (formData.serviceType === 'specialist') return !!formData.specialistType;
        return !!formData.serviceType;
      case 3: return !!formData.selectedSlot;
      case 4: return true;
      default: return false;
    }
  };

  const handleNext = async () => {
    const lastContentStep = steps.length - 2; // summary step
    if (currentStep < lastContentStep) {
      setCurrentStep(prev => prev + 1);
      return;
    }

    // Payment & booking creation
    if (currentStep === lastContentStep) {
      setIsProcessing(true);
      try {
        const result = await booking.createBooking({
          clinicId: clinic.id,
          hospitalName: clinic.practitioner_name,
          hospitalImage: clinic.image_src,
          hospitalAddress: clinic.address,
          serviceType: formData.serviceType,
          specialistType: formData.specialistType,
          labTestId: formData.labTestId,
          selectedSlot: formData.selectedSlot,
          patientName: formData.fullName,
          patientPhone: formData.phone,
          patientEmail: formData.email,
          symptoms: formData.symptoms,
          symptomDuration: formData.symptomDuration,
          doctorName: formData.selectedSlot?.doctorName,
        });

        if (result.success) {
          setBookingResult(result);
          setCurrentStep(steps.length - 1);
          toast({ title: 'Booking confirmed!', description: `Reference: ${result.bookingRef}` });
        } else {
          toast({ title: 'Booking failed', description: result.error, variant: 'destructive' });
        }
      } catch (err) {
        toast({ title: 'Error', description: 'Something went wrong. Please try again.', variant: 'destructive' });
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 0) setCurrentStep(prev => prev - 1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50/80 via-white to-teal-50/80 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (!clinic) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50/80 via-white to-teal-50/80 flex flex-col items-center justify-center p-8">
        <AlertCircle className="w-12 h-12 text-gray-300 mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">Provider Not Found</h2>
        <p className="text-gray-500 text-sm mb-6">The provider you're looking for could not be found.</p>
        <button onClick={() => navigate(-1)} className="text-blue-600 hover:text-blue-700 text-sm font-semibold">
          Go back
        </button>
      </div>
    );
  }

  const isConfirmation = currentStep === steps.length - 1;

  return (
    <>
      <Helmet>
        <title>Book Appointment — {clinic.practitioner_name} | HealthProvida</title>
        <meta name="description" content={`Book an appointment at ${clinic.practitioner_name} on HealthProvida.`} />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-blue-50/80 via-white to-teal-50/80">
        {/* Top bar */}
        {!isConfirmation && (
          <div className="bg-white/80 backdrop-blur-lg border-b border-gray-100 sticky top-0 z-20">
            <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
              <button
                onClick={currentStep === 0 ? () => navigate(-1) : handleBack}
                className="p-2 rounded-lg hover:bg-gray-100 transition"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-900 truncate">{clinic.practitioner_name}</p>
                <p className="text-[10px] text-gray-500">{isLab ? 'Laboratory Booking' : 'Book Appointment'}</p>
              </div>
              <button onClick={() => navigate(-1)} className="p-2 rounded-lg hover:bg-gray-100 transition">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
          </div>
        )}

        <div className="max-w-lg mx-auto px-4 py-6 pb-32">
          {/* Step indicator */}
          {!isConfirmation && <StepIndicator steps={steps} currentStep={currentStep} />}

          {/* Step content */}
          <AnimatePresence mode="wait">
            {isLab ? (
              <>
                {currentStep === 0 && (
                  <PatientDetailsStep key="details" data={formData} onChange={updateForm} />
                )}
                {currentStep === 1 && (
                  <CareRecommendationStep
                    key="test"
                    data={formData}
                    onChange={updateForm}
                    specialists={[]}
                    isLab={true}
                    labTests={booking.LAB_TESTS}
                    labSearchQuery={labSearchQuery}
                    onLabSearchChange={setLabSearchQuery}
                  />
                )}
                {currentStep === 2 && (
                  <SymptomsStep key="notes" data={formData} onChange={updateForm} durations={booking.SYMPTOM_DURATIONS} isLab={true} />
                )}
                {currentStep === 3 && (
                  <AppointmentSelectionStep key="appointment" data={formData} onChange={updateForm} availability={availability} />
                )}
                {currentStep === 4 && (
                  <BookingSummaryStep
                    key="summary"
                    clinic={clinic}
                    data={formData}
                    priceBreakdown={priceBreakdown}
                    totalAmount={totalAmount}
                    isLab={true}
                    labTest={labTest}
                    specialistName=""
                  />
                )}
                {currentStep === 5 && bookingResult && (
                  <ConfirmationStep
                    key="confirmation"
                    result={bookingResult}
                    data={formData}
                    clinic={clinic}
                    isLab={true}
                    labTest={labTest}
                    specialistName=""
                  />
                )}
              </>
            ) : (
              <>
                {currentStep === 0 && (
                  <PatientDetailsStep key="details" data={formData} onChange={updateForm} />
                )}
                {currentStep === 1 && (
                  <SymptomsStep key="symptoms" data={formData} onChange={updateForm} durations={booking.SYMPTOM_DURATIONS} isLab={false} />
                )}
                {currentStep === 2 && (
                  <CareRecommendationStep
                    key="recommendation"
                    data={formData}
                    onChange={updateForm}
                    specialists={booking.SPECIALISTS}
                    isLab={false}
                    labTests={[]}
                    labSearchQuery=""
                    onLabSearchChange={() => {}}
                  />
                )}
                {currentStep === 3 && (
                  <AppointmentSelectionStep key="appointment" data={formData} onChange={updateForm} availability={availability} />
                )}
                {currentStep === 4 && (
                  <BookingSummaryStep
                    key="summary"
                    clinic={clinic}
                    data={formData}
                    priceBreakdown={priceBreakdown}
                    totalAmount={totalAmount}
                    isLab={false}
                    labTest={null}
                    specialistName={specialistName}
                  />
                )}
                {currentStep === 5 && bookingResult && (
                  <ConfirmationStep
                    key="confirmation"
                    result={bookingResult}
                    data={formData}
                    clinic={clinic}
                    isLab={false}
                    labTest={null}
                    specialistName={specialistName}
                  />
                )}
              </>
            )}
          </AnimatePresence>
        </div>

        {/* Bottom action bar */}
        {!isConfirmation && (
          <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-gray-100 p-4 z-20">
            <div className="max-w-lg mx-auto flex items-center gap-3">
              {currentStep > 0 && (
                <button
                  onClick={handleBack}
                  className="px-5 py-3 rounded-xl border-2 border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-50 transition"
                >
                  Back
                </button>
              )}
              <button
                onClick={handleNext}
                disabled={!canProceed() || isProcessing}
                className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-semibold transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-700 hover:to-teal-600 text-white hover:shadow-xl shadow-blue-200"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processing Payment...
                  </>
                ) : currentStep === steps.length - 2 ? (
                  <>
                    <CreditCard className="w-4 h-4" />
                    Pay {formatNaira(totalAmount)}
                  </>
                ) : (
                  <>
                    Continue
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
