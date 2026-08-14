import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail, MapPin, Phone, User, CheckCircle, ArrowRight, ArrowLeft,
  Stethoscope, Shield, Tag, Clock, Upload, Trash2, Image,
  Home, X, Search, Lock, Info, Monitor, Armchair, FlaskConical, Syringe
} from 'lucide-react';
import { submitProviderApplication } from '@/utils/submitProviderApplication';
import { availableHMOs } from '@/constants/hmos';
import AddressAutocomplete from '@/components/AddressAutocomplete';
import { runAntiSpamChecks, createTimestampTracker, HONEYPOT_FIELD_NAME, HONEYPOT_STYLES } from '@/utils/antiSpam';
import logo from '@/components/ui/logo.png';

// ─── Constants ─────────────────────────────────────────────────────
const TAG_MAX_LENGTH = 50;

const commonEquipment = [
  "X-Ray Machine", "Ultrasound", "ECG Monitor", "CT Scan",
  "MRI Machine", "Laboratory", "Pharmacy", "Operating Theater",
  "ICU Facilities", "Dental Equipment", "Dialysis Machine", "Ambulance"
];

const commonSpecialties = [
  "General Practice", "Pediatrics", "Cardiology", "Dermatology",
  "Orthopedics", "Gynecology", "Ophthalmology", "Dentistry",
  "Surgery", "Emergency Medicine", "Radiology", "Neurology",
  "Nephrology", "Endocrinology", "Ear, Nose and Throat",
  "Cardiac/ Heart Surgery", "Neurosurgery", "Spine Surgery",
  "Orthopaedic Surgery", "Gastroenterology", "Pulmonology"
];

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const STEPS = [
  { id: 1, label: 'Basic Info', icon: User },
  { id: 2, label: 'Location', icon: MapPin },
  { id: 3, label: 'Services', icon: Stethoscope },
  { id: 4, label: 'Insurances', icon: Shield },
  { id: 5, label: 'Hours & Photos', icon: Clock },
];

const PHOTO_CATEGORIES = [
  { key: 'receptionArea', label: 'Reception Area', icon: Armchair },
  { key: 'consultingRoom', label: 'Consulting Room', icon: Stethoscope },
  { key: 'operatingTheater', label: 'Operating Theater', icon: Monitor },
  { key: 'laboratory', label: 'Laboratory', icon: FlaskConical },
];

// ─── Solid Blue and Green Palette ─────────────────────────────────
const THEME = {
  blue: {
    primary: '#2563eb', // Solid Blue 600
    dark: '#1d4ed8',    // Solid Blue 700
    light: '#eff6ff',   // Blue 50
    border: '#bfdbfe',  // Blue 200
  },
  green: {
    primary: '#16a34a', // Solid Green 600
    dark: '#15803d',    // Solid Green 700
    light: '#f0fdf4',   // Green 50
    border: '#bbf7d0',  // Green 200
  },
};

// ─── Component ────────────────────────────────────────────────────
export default function JoinProviderPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [maxVisitedStep, setMaxVisitedStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [submitted, setSubmitted] = useState(false);

  const [formData, setFormData] = useState({
    // Step 1 — Basic Info
    practitionerName: '',
    practitionerType: '',
    registrationNumber: '',
    email: '',
    phone: '',
    // Step 2 — Location
    address: '',
    latitude: null,
    longitude: null,
    city: '',
    state: '',
    // Step 3 — Services
    equipment: [],
    tags: [],
    specialties: [],
    // Step 4 — Insurances
    supportedHMOs: [],
    // Step 5 — Hours & Photos
    facilityImages: {
      receptionArea: null,
      consultingRoom: null,
      operatingTheater: null,
      laboratory: null,
    },
    operatingHours: daysOfWeek.map(day => ({
      day,
      isOpen: day !== 'Sunday',
      openTime: '08:00',
      closeTime: '17:00'
    })),
    appointmentSlotDuration: '30'
  });

  const [honeypot, setHoneypot] = useState('');
  const timestampTracker = useMemo(() => createTimestampTracker(), []);
  const [submitting, setSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState(null);
  const [tagInput, setTagInput] = useState('');

  useEffect(() => { timestampTracker.getLoadTime(); }, [timestampTracker]);

  // ─── Scroll to top on step change ─────────────────────────────
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentStep]);

  // ─── Helpers ──────────────────────────────────────────────────
  // Count how many categorized photos are uploaded
  const uploadedPhotoCount = useMemo(() => {
    return Object.values(formData.facilityImages).filter(Boolean).length;
  }, [formData.facilityImages]);

  // Convert categorized photos to flat array for submission
  const getFacilityImagesArray = useCallback(() => {
    return Object.values(formData.facilityImages).filter(Boolean);
  }, [formData.facilityImages]);

  // ─── Form helpers ─────────────────────────────────────────────
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddressSelect = useCallback((address, lat, lng, city, state) => {
    setFormData(prev => ({
      ...prev, address, latitude: lat, longitude: lng,
      city: city || '', state: state || '',
    }));
  }, []);

  const toggleArrayItem = (field, item) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(item)
        ? prev[field].filter(i => i !== item)
        : [...prev[field], item]
    }));
  };

  const addCustomItem = (field, value) => {
    const trimmed = value.trim();
    if (trimmed && !formData[field].includes(trimmed)) {
      if (field === 'tags' && trimmed.length > TAG_MAX_LENGTH) return;
      setFormData(prev => ({ ...prev, [field]: [...prev[field], trimmed] }));
    }
  };

  const removeItem = (field, item) => {
    setFormData(prev => ({ ...prev, [field]: prev[field].filter(i => i !== item) }));
  };

  const handleCategoryImageChange = (categoryKey, e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData(prev => ({
        ...prev,
        facilityImages: {
          ...prev.facilityImages,
          [categoryKey]: { file, preview: reader.result },
        },
      }));
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const removeCategoryImage = (categoryKey) => {
    setFormData(prev => ({
      ...prev,
      facilityImages: {
        ...prev.facilityImages,
        [categoryKey]: null,
      },
    }));
  };

  const updateOperatingHours = (index, field, value) => {
    setFormData(prev => {
      const updated = [...prev.operatingHours];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, operatingHours: updated };
    });
  };

  // ─── Validation ────────────────────────────────────────────────
  const validateStep1 = () =>
    formData.practitionerName && formData.practitionerType &&
    formData.registrationNumber && formData.email && formData.phone;

  const validateStep2 = () => formData.address.trim().length > 0;

  const validateStep3 = () =>
    formData.equipment.length > 0 || formData.specialties.length > 0;

  // ─── Navigation ────────────────────────────────────────────────
  const goToStep = (step) => {
    if (step === currentStep || step > maxVisitedStep) return;
    setDirection(step > currentStep ? 1 : -1);
    setCurrentStep(step);
  };

  const handleNext = () => {
    if (currentStep === 1 && !validateStep1()) {
      setSubmitResult({ type: 'error', message: 'Please fill in all required fields.' });
      return;
    }
    if (currentStep === 2 && !validateStep2()) {
      setSubmitResult({ type: 'error', message: 'Please enter your facility address.' });
      return;
    }
    if (currentStep === 3 && !validateStep3()) {
      setSubmitResult({ type: 'error', message: 'Please select at least one equipment or specialty.' });
      return;
    }
    setSubmitResult(null);
    const next = Math.min(currentStep + 1, STEPS.length);
    setDirection(1);
    setCurrentStep(next);
    setMaxVisitedStep(prev => Math.max(prev, next));
  };

  const handlePrevious = () => {
    setSubmitResult(null);
    setDirection(-1);
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  // ─── Submit ────────────────────────────────────────────────────
  const handleSubmit = async () => {
    const spamResult = runAntiSpamChecks({
      honeypotValue: honeypot,
      action: 'provider-application',
      rateLimit: { maxAttempts: 3, windowMs: 600000 },
      timestampTracker,
      minSubmitTimeMs: 10000,
    });
    if (spamResult === '__silent_drop__') return;
    if (spamResult) {
      setSubmitResult({ type: 'error', message: spamResult });
      return;
    }
    if (uploadedPhotoCount < 4) {
      setSubmitResult({ type: 'error', message: 'Please upload all 4 required facility photos before submitting.' });
      return;
    }

    setSubmitting(true);
    setSubmitResult(null);

    // Convert categorized photos to flat array for submission
    const submissionData = {
      ...formData,
      facilityImages: getFacilityImagesArray(),
    };

    const result = await submitProviderApplication(submissionData);
    setSubmitting(false);

    if (result.success) {
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setSubmitResult({ type: 'error', message: result.error || 'Something went wrong. Please try again.' });
    }
  };

  // ─── Progress percentage ──────────────────────────────────────
  const progress = ((currentStep) / STEPS.length) * 100;

  // ═══════════════════════════════════════════════════════════════
  //  PAGE FOOTER (shared)
  // ═══════════════════════════════════════════════════════════════
  const PageFooter = () => (
    <footer className="bg-slate-800 text-white mt-auto">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-slate-400 text-sm">
          © 2025 Health Provida. Professional Healthcare Network.
        </p>
        <nav className="flex flex-wrap items-center gap-4 sm:gap-6 text-sm">
          <Link to="/terms" className="text-slate-400 hover:text-white transition-colors">Terms of Service</Link>
          <Link to="/privacy" className="text-slate-400 hover:text-white transition-colors">Privacy Policy</Link>
          <Link to="/terms" className="text-slate-400 hover:text-white transition-colors">Provider Agreement</Link>
          <Link to="/contact" className="text-slate-400 hover:text-white transition-colors">Contact Support</Link>
        </nav>
      </div>
    </footer>
  );

  // ═══════════════════════════════════════════════════════════════
  //  SUCCESS STATE
  // ═══════════════════════════════════════════════════════════════
  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        {/* Minimal header */}
        <header className="w-full bg-white border-b border-gray-200 py-4">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <Link to="/" className="inline-block">
              <img src={logo} className="w-28 sm:w-36 h-auto" alt="HealthProvida" />
            </Link>
          </div>
        </header>

        <div className="flex-1 flex items-center justify-center px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="text-center max-w-lg"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="w-24 h-24 mx-auto mb-8 rounded-full flex items-center justify-center shadow-lg bg-green-600"
            >
              <CheckCircle className="w-12 h-12 text-white" strokeWidth={2.5} />
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-3xl md:text-4xl font-bold text-gray-900 mb-4"
            >
              Application Submitted!
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-gray-500 text-lg mb-3 leading-relaxed"
            >
              Thank you for applying to join the HealthProvida network.
              Our team will review your application and get back to you within 2–3 business days.
            </motion.p>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="text-gray-400 text-sm mb-10"
            >
              A confirmation email has been sent to <span className="font-medium text-gray-600">{formData.email}</span>
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <Link
                to="/"
                className="inline-flex items-center gap-2 px-8 py-3.5 text-white font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 transition-all shadow-md hover:shadow-lg"
              >
                <Home size={18} />
                Return Home
              </Link>
            </motion.div>
          </motion.div>
        </div>

        <PageFooter />
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════
  //  MULTI-STEP FORM
  // ═══════════════════════════════════════════════════════════════
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">

      {/* ─── Top Navigation Bar ──────────────────────────────────── */}
      <header className="sticky top-0 z-50 w-full bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-14">
            {/* Logo */}
            <Link to="/" className="flex-shrink-0">
              <img src={logo} className="w-28 sm:w-32 h-auto" alt="HealthProvida" />
            </Link>

            {/* Right side label */}
            <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
              <Lock size={14} className="text-gray-400" />
              <span className="hidden sm:inline">Secure Provider Registration</span>
            </div>
          </div>
        </div>
      </header>

      {/* ─── Step Progress Section ────────────────────────────────── */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-6 pb-0">
          {/* Step counter + label */}
          <div className="flex items-center justify-between mb-3">
            <div>
              <span className="text-xs font-bold tracking-wider uppercase text-blue-600">
                Step {currentStep} of {STEPS.length}
              </span>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mt-0.5">
                {currentStep === 1 && 'Facility Details'}
                {currentStep === 2 && 'Location Address'}
                {currentStep === 3 && 'Services & Specialties'}
                {currentStep === 4 && 'Equipment & HMOs'}
                {currentStep === 5 && 'Facility Photos'}
              </h2>
            </div>
            <span className="hidden sm:block text-sm text-gray-400 font-medium">
              {currentStep === 1 && 'Basic Information'}
              {currentStep === 2 && 'Pinpoint Your Facility'}
              {currentStep === 3 && 'Clinical Offerings'}
              {currentStep === 4 && 'Finalizing Setup'}
              {currentStep === 5 && 'Visual Verification'}
            </span>
          </div>

          {/* Progress bar */}
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mb-0">
            <motion.div
              className="h-full rounded-full bg-blue-600"
              initial={false}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>

          {/* Step tabs */}
          <nav className="flex items-center mt-0 -mb-px overflow-x-auto scrollbar-none">
            {STEPS.map((step, idx) => {
              const isActive = currentStep === step.id;
              const isCompleted = step.id < currentStep;
              const isVisited = step.id <= maxVisitedStep;

              return (
                <button
                  key={step.id}
                  onClick={() => goToStep(step.id)}
                  disabled={!isVisited}
                  className={`relative flex-shrink-0 px-3 sm:px-4 py-3 text-xs sm:text-sm font-medium transition-all border-b-2
                    ${isActive
                      ? 'border-blue-600 text-blue-600 font-semibold'
                      : isCompleted
                        ? 'border-transparent text-green-600 hover:text-green-700 cursor-pointer'
                        : isVisited
                          ? 'border-transparent text-gray-400 hover:text-gray-600 cursor-pointer'
                          : 'border-transparent text-gray-300 cursor-not-allowed'
                    }`}
                >
                  {isCompleted && <span className="inline-block mr-1 text-green-600 font-bold">✓</span>}
                  {step.label}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* ─── Form Content ────────────────────────────────────────── */}
      <main className="flex-1">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
          {/* Honeypot */}
          <div style={HONEYPOT_STYLES} aria-hidden="true">
            <label htmlFor={`provider-${HONEYPOT_FIELD_NAME}`}>Leave this empty</label>
            <input
              id={`provider-${HONEYPOT_FIELD_NAME}`}
              name={HONEYPOT_FIELD_NAME}
              type="text"
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
              autoComplete="off"
              tabIndex={-1}
            />
          </div>

          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentStep}
              custom={direction}
              variants={{
                initial: (dir) => ({ opacity: 0, x: dir * 50 }),
                animate: { opacity: 1, x: 0 },
                exit: (dir) => ({ opacity: 0, x: dir * -50 }),
              }}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.28, ease: 'easeInOut' }}
            >

              {/* ═══ Step 1: Basic Info ═══════════════════════════════ */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  {/* Card: Facility Details */}
                  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8">
                    <p className="text-gray-500 mb-6">
                      Please provide the basic information about your healthcare facility to begin the registration process.
                    </p>

                    <div className="space-y-5">
                      <div className="grid md:grid-cols-2 gap-5">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Facility Name <span className="text-red-400">*</span>
                          </label>
                          <input
                            type="text"
                            name="practitionerName"
                            value={formData.practitionerName}
                            onChange={handleInputChange}
                            placeholder="e.g. St. Jude's Hospital"
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Facility Type <span className="text-red-400">*</span>
                          </label>
                          <select
                            name="practitionerType"
                            value={formData.practitionerType}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none bg-white"
                            required
                          >
                            <option value="">Select Type</option>
                            <option value="Multi-specialty Clinic / General Practice">Multi-specialty Clinic / General Practice</option>
                            <option value="General Hospital / Specialist Care">General Hospital / Specialist Care</option>
                            <option value="Tertiary Care Hospital / National Referral Center">Tertiary Care Hospital / National Referral Center</option>
                            <option value="Private Multi-specialty Clinic">Private Multi-specialty Clinic</option>
                            <option value="Fertility &amp; Reproductive Health Clinic">Fertility &amp; Reproductive Health Clinic</option>
                            <option value="Reproductive Health &amp; Family Planning Clinic">Reproductive Health &amp; Family Planning Clinic</option>
                            <option value="General Private Hospital">General Private Hospital</option>
                            <option value="Private General Hospital">Private General Hospital</option>
                            <option value="Specialist Surgical Hospital">Specialist Surgical Hospital</option>
                            <option value="Diagnostic Center">Diagnostic Center</option>
                            <option value="Pharmacy">Pharmacy</option>
                            <option value="Dental Clinic">Dental Clinic</option>
                          </select>
                        </div>
                      </div>

                      {/* Registration Number */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Registration Number (HEFAMAA etc.) <span className="text-red-400">*</span>
                        </label>
                        <input
                          type="text"
                          name="registrationNumber"
                          value={formData.registrationNumber}
                          onChange={handleInputChange}
                          placeholder="Enter official registration ID"
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
                          required
                        />
                        <p className="mt-1.5 text-xs text-gray-400">
                          Required for verification of facility authenticity.
                        </p>
                      </div>

                      {/* Divider */}
                      <hr className="border-gray-100 my-2" />

                      {/* Contact info */}
                      <div className="grid md:grid-cols-2 gap-5">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Email Address <span className="text-red-400">*</span>
                          </label>
                          <div className="relative">
                            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                              type="email"
                              name="email"
                              value={formData.email}
                              onChange={handleInputChange}
                              placeholder="contact@clinic.com"
                              className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
                              required
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Phone Number <span className="text-red-400">*</span>
                          </label>
                          <div className="relative">
                            <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                              type="tel"
                              name="phone"
                              value={formData.phone}
                              onChange={handleInputChange}
                              placeholder="+234 123 456 7890"
                              className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
                              required
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ═══ Step 2: Location ═════════════════════════════════ */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                    {/* Solid Map hero area */}
                    <div className="bg-blue-50 border-b border-blue-100 px-6 py-10 flex flex-col items-center text-center">
                      <div className="w-16 h-16 rounded-full flex items-center justify-center shadow-md mb-4 bg-blue-600 text-white">
                        <MapPin className="w-8 h-8" />
                      </div>
                      <h2 className="text-xl font-bold text-gray-900 mb-1">Pin your location</h2>
                      <p className="text-gray-500 text-sm max-w-md">
                        Start typing your address below and select from the suggestions to automatically capture your coordinates.
                      </p>
                    </div>

                    {/* Address input */}
                    <div className="p-6 space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          <Search size={14} className="inline mr-1.5 mb-0.5" />
                          Search for your address
                        </label>
                        <AddressAutocomplete
                          name="address"
                          value={formData.address}
                          onChange={handleInputChange}
                          onAddressSelect={handleAddressSelect}
                          placeholder="Start typing your clinic address..."
                          required
                          inputClassName="!py-3 !rounded-xl !border-gray-200 focus:!ring-blue-500"
                        />
                      </div>

                      {/* Coordinates confirmation */}
                      {formData.latitude && formData.longitude ? (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-xl"
                        >
                          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm font-semibold text-green-800">Location captured</p>
                            <p className="text-xs text-green-700 mt-0.5">{formData.address}</p>
                            {formData.city && (
                              <p className="text-xs text-green-600 mt-0.5">
                                {formData.city}{formData.state ? `, ${formData.state}` : ''}
                              </p>
                            )}
                          </div>
                        </motion.div>
                      ) : formData.address ? (
                        <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                          <MapPin className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-amber-800">Select a suggestion to capture coordinates</p>
                            <p className="text-xs text-amber-600 mt-0.5">
                              Pick an address from the dropdown for the best accuracy on our map.
                            </p>
                          </div>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
              )}

              {/* ═══ Step 3: Services ═════════════════════════════════ */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8">
                    <p className="text-gray-500 mb-6">
                      Select the clinical departments and specific medical services your facility offers. You can search or browse categories below.
                    </p>

                    {/* Equipment - Solid Blue */}
                    <div className="mb-8">
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Available Equipment
                      </label>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {commonEquipment.map((item) => (
                          <button
                            key={item}
                            type="button"
                            onClick={() => toggleArrayItem('equipment', item)}
                            className={`px-4 py-2.5 text-sm rounded-full border-2 transition-all duration-200
                              ${formData.equipment.includes(item)
                                ? 'border-blue-600 bg-blue-50 text-blue-700 font-medium shadow-sm'
                                : 'border-gray-200 text-gray-600 hover:border-blue-300 hover:shadow-sm bg-white'
                              }`}
                          >
                            {item}
                          </button>
                        ))}
                      </div>
                      <input
                        type="text"
                        placeholder="Add custom equipment — press Enter"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addCustomItem('equipment', e.target.value);
                            e.target.value = '';
                          }
                        }}
                      />
                      {formData.equipment.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {formData.equipment.filter(i => !commonEquipment.includes(i)).map((item) => (
                            <span key={item} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                              {item}
                              <button type="button" onClick={() => removeItem('equipment', item)} className="hover:text-red-500 transition-colors">
                                <X size={14} />
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <hr className="border-gray-100 mb-8" />

                    {/* Specialties - Solid Green */}
                    <div className="mb-8">
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Specialties
                      </label>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {commonSpecialties.map((item) => (
                          <button
                            key={item}
                            type="button"
                            onClick={() => toggleArrayItem('specialties', item)}
                            className={`px-4 py-2.5 text-sm rounded-full border-2 transition-all duration-200
                              ${formData.specialties.includes(item)
                                ? 'border-green-600 bg-green-50 text-green-700 font-medium shadow-sm'
                                : 'border-gray-200 text-gray-600 hover:border-green-300 hover:shadow-sm bg-white'
                              }`}
                          >
                            {item}
                          </button>
                        ))}
                      </div>
                      <input
                        type="text"
                        placeholder="Add custom specialty — press Enter"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all bg-white"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addCustomItem('specialties', e.target.value);
                            e.target.value = '';
                          }
                        }}
                      />
                      {formData.specialties.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {formData.specialties.filter(i => !commonSpecialties.includes(i)).map((item) => (
                            <span key={item} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                              {item}
                              <button type="button" onClick={() => removeItem('specialties', item)} className="hover:text-red-500 transition-colors">
                                <X size={14} />
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <hr className="border-gray-100 mb-8" />

                    {/* Tags */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <label className="block text-sm font-semibold text-gray-700">
                          Tags <span className="font-normal text-gray-400">(optional)</span>
                        </label>
                        {tagInput.length > 0 && (
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full
                            ${tagInput.length > TAG_MAX_LENGTH
                              ? 'bg-red-100 text-red-600'
                              : tagInput.length > TAG_MAX_LENGTH - 10
                                ? 'bg-amber-100 text-amber-600'
                                : 'bg-gray-100 text-gray-500'
                            }`}>
                            {tagInput.length}/{TAG_MAX_LENGTH}
                          </span>
                        )}
                      </div>
                      <input
                        type="text"
                        value={tagInput}
                        onChange={(e) => {
                          if (e.target.value.length <= TAG_MAX_LENGTH) {
                            setTagInput(e.target.value);
                          }
                        }}
                        placeholder="Add descriptive tags — press Enter"
                        maxLength={TAG_MAX_LENGTH}
                        className={`w-full px-4 py-3 border rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all bg-white
                          ${tagInput.length >= TAG_MAX_LENGTH
                            ? 'border-amber-300 focus:ring-amber-400'
                            : 'border-gray-200 focus:ring-blue-500'
                          }`}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            const val = tagInput.trim();
                            if (val && val.length <= TAG_MAX_LENGTH) {
                              addCustomItem('tags', val);
                              setTagInput('');
                            }
                          }
                        }}
                      />
                      <p className="mt-1.5 text-xs text-gray-400">
                        Max {TAG_MAX_LENGTH} characters per tag. Press Enter to add.
                      </p>
                      {formData.tags.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {formData.tags.map((item) => (
                            <span key={item} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                              <Tag size={13} />
                              {item}
                              <button type="button" onClick={() => removeItem('tags', item)} className="hover:text-red-500 transition-colors">
                                <X size={14} />
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* ═══ Step 4: Insurances ═══════════════════════════════ */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8">
                    <p className="text-gray-500 mb-6">
                      Select the HMO plans your facility supports. This helps patients with coverage find you.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {availableHMOs.map((hmo) => {
                        const selected = formData.supportedHMOs.includes(hmo);
                        return (
                          <button
                            key={hmo}
                            type="button"
                            onClick={() => toggleArrayItem('supportedHMOs', hmo)}
                            className={`group relative flex items-center gap-3 px-4 py-4 rounded-xl border-2 text-left transition-all duration-200
                              ${selected
                                ? 'border-blue-600 bg-blue-50 shadow-sm'
                                : 'border-gray-200 hover:border-blue-300 hover:shadow-sm bg-white'
                              }`}
                          >
                            <div className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all
                              ${selected
                                ? 'border-blue-600 bg-blue-600'
                                : 'border-gray-300 group-hover:border-blue-400'
                              }`}>
                              {selected && <CheckCircle size={14} className="text-white" />}
                            </div>
                            <span className={`font-medium text-sm ${selected ? 'text-blue-800' : 'text-gray-700'}`}>
                              {hmo}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    {formData.supportedHMOs.length > 0 && (
                      <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
                        <p className="text-sm font-semibold text-blue-800 mb-2">
                          {formData.supportedHMOs.length} HMO{formData.supportedHMOs.length !== 1 ? 's' : ''} selected
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {formData.supportedHMOs.map((hmo) => (
                            <span key={hmo} className="px-3 py-1 bg-white text-blue-700 rounded-full text-xs font-medium border border-blue-200 shadow-sm">
                              {hmo}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ═══ Step 5: Hours & Photos ═══════════════════════════ */}
              {currentStep === 5 && (
                <div className="space-y-6">

                  {/* Facility Photos Card */}
                  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8">
                    <p className="text-gray-500 mb-6">
                      Provide clear images of your facility to help patients build trust.
                    </p>

                    {/* Photo Quality Guidelines - Blue Theme */}
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 mb-6">
                      <div className="flex items-start gap-3">
                        <Info size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">Photo Quality Guidelines</h4>
                          <ul className="space-y-1.5 text-sm text-gray-600">
                            <li className="flex items-start gap-2">
                              <span className="w-1 h-1 rounded-full bg-blue-400 mt-2 flex-shrink-0" />
                              Ensure photos are well-lit and in focus.
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="w-1 h-1 rounded-full bg-blue-400 mt-2 flex-shrink-0" />
                              Avoid blurred images or heavy filters.
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="w-1 h-1 rounded-full bg-blue-400 mt-2 flex-shrink-0" />
                              Showcase clean, organized spaces.
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="w-1 h-1 rounded-full bg-blue-400 mt-2 flex-shrink-0" />
                              Minimum resolution: 1024×768 pixels. Max size: 5MB per photo.
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    {/* Categorized upload grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {PHOTO_CATEGORIES.map((cat) => {
                        const uploaded = formData.facilityImages[cat.key];
                        const CatIcon = cat.icon;

                        return (
                          <div key={cat.key} className="bg-white rounded-xl border border-gray-200 p-4 transition-all hover:shadow-sm">
                            {/* Category header */}
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="font-semibold text-gray-900 text-sm">{cat.label}</h4>
                              <CatIcon size={18} className="text-gray-400" />
                            </div>

                            {uploaded ? (
                              /* Uploaded preview */
                              <div className="relative group">
                                <img
                                  src={uploaded.preview}
                                  alt={cat.label}
                                  className="w-full h-36 object-cover rounded-lg border border-gray-100"
                                />
                                <button
                                  type="button"
                                  onClick={() => removeCategoryImage(cat.key)}
                                  className="absolute top-2 right-2 w-7 h-7 bg-black/50 backdrop-blur-sm text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow"
                                  title="Remove photo"
                                >
                                  <Trash2 size={13} />
                                </button>
                                <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                                  <span className="truncate flex-1 bg-gray-50 px-2 py-1 rounded border border-gray-100">
                                    {uploaded.file.name}
                                  </span>
                                  <CheckCircle size={16} className="text-green-600 flex-shrink-0" />
                                </div>
                              </div>
                            ) : (
                              /* Upload zone */
                              <label className="cursor-pointer block border-2 border-dashed border-gray-200 rounded-lg p-6 text-center hover:border-blue-500 hover:bg-blue-50/40 transition-all group">
                                <Upload className="mx-auto w-8 h-8 text-gray-300 mb-2 group-hover:text-blue-600 transition-colors" />
                                <p className="text-blue-600 font-medium text-sm">Click to upload</p>
                                <p className="text-gray-400 text-xs mt-1">or drag and drop</p>
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => handleCategoryImageChange(cat.key, e)}
                                  className="hidden"
                                />
                              </label>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {uploadedPhotoCount < 4 && (
                      <p className="mt-4 text-xs text-amber-600 font-medium flex items-center gap-1.5">
                        <span>⚠</span>
                        All 4 photos required ({4 - uploadedPhotoCount} more needed)
                      </p>
                    )}
                  </div>

                  {/* Operating Hours & Slot Duration Card */}
                  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8">
                    {/* Appointment Slot Duration */}
                    <div className="mb-6">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Appointment Slot Duration
                      </label>
                      <select
                        name="appointmentSlotDuration"
                        value={formData.appointmentSlotDuration}
                        onChange={handleInputChange}
                        className="w-full md:w-auto px-4 py-3 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none bg-white"
                      >
                        <option value="15">15 minutes</option>
                        <option value="30">30 minutes</option>
                        <option value="45">45 minutes</option>
                        <option value="60">1 hour</option>
                        <option value="90">1.5 hours</option>
                      </select>
                    </div>

                    <hr className="border-gray-100 mb-6" />

                    {/* Operating Hours */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-1.5">
                        <Clock size={16} />
                        Operating Hours
                      </label>
                      <div className="space-y-2.5">
                        {formData.operatingHours.map((dayData, index) => (
                          <div
                            key={dayData.day}
                            className={`flex flex-col sm:flex-row items-start sm:items-center gap-3 p-3.5 rounded-xl border transition-all bg-white
                              ${dayData.isOpen
                                ? 'border-blue-200 bg-blue-50/20'
                                : 'border-gray-100 opacity-60'
                              }`}
                          >
                            <div className="flex items-center gap-3 min-w-[140px]">
                              <button
                                type="button"
                                onClick={() => updateOperatingHours(index, 'isOpen', !dayData.isOpen)}
                                className={`relative w-11 h-6 rounded-full transition-colors duration-200
                                  ${dayData.isOpen ? 'bg-green-600' : 'bg-gray-300'}`}
                              >
                                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200
                                  ${dayData.isOpen ? 'translate-x-6' : 'translate-x-1'}`}
                                />
                              </button>
                              <span className={`font-medium text-sm ${dayData.isOpen ? 'text-gray-900' : 'text-gray-400'}`}>
                                {dayData.day}
                              </span>
                            </div>

                            {dayData.isOpen ? (
                              <div className="flex items-center gap-2.5 text-sm">
                                <input
                                  type="time"
                                  value={dayData.openTime}
                                  onChange={(e) => updateOperatingHours(index, 'openTime', e.target.value)}
                                  className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                                />
                                <span className="text-gray-400 font-medium">to</span>
                                <input
                                  type="time"
                                  value={dayData.closeTime}
                                  onChange={(e) => updateOperatingHours(index, 'closeTime', e.target.value)}
                                  className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                                />
                              </div>
                            ) : (
                              <span className="text-sm text-gray-400 italic">Closed</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </motion.div>
          </AnimatePresence>

          {/* Error message */}
          {submitResult && submitResult.type === 'error' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 p-4 bg-red-50 text-red-700 border border-red-200 rounded-xl text-sm font-medium"
            >
              {submitResult.message}
            </motion.div>
          )}

          {/* ─── Bottom Navigation (non-sticky) ─────────────────────── */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            {/* Terms note on final step */}
            {currentStep === STEPS.length && (
              <p className="text-center text-xs text-gray-400 mb-5">
                By submitting, you agree to the{' '}
                <Link to="/terms" className="text-blue-600 hover:underline">Provider Agreement</Link>
                {' '}and{' '}
                <Link to="/terms" className="text-blue-600 hover:underline">Terms of Service</Link>.
              </p>
            )}

            <div className="flex items-center justify-between">
              {/* Back button */}
              {currentStep > 1 ? (
                <button
                  onClick={handlePrevious}
                  className="flex items-center gap-2 px-6 py-3 text-gray-600 font-semibold rounded-xl border border-gray-200 hover:bg-gray-50 transition-all"
                >
                  <ArrowLeft size={18} />
                  Back
                </button>
              ) : (
                <div />
              )}

              {/* Next / Submit button */}
              {currentStep < STEPS.length ? (
                <button
                  onClick={handleNext}
                  className="flex items-center gap-2 px-8 py-3.5 text-white font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 transition-all shadow-md hover:shadow-lg active:scale-[0.98]"
                >
                  Continue
                  <ArrowRight size={18} />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="flex items-center gap-2 px-8 py-3.5 text-white font-semibold rounded-xl bg-green-600 hover:bg-green-700 active:bg-green-800 transition-all shadow-md hover:shadow-lg active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100"
                >
                  {submitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Submitting…
                    </>
                  ) : (
                    <>
                      Submit for Review
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* ─── Page Footer ──────────────────────────────────────────── */}
      <PageFooter />
    </div>
  );
}