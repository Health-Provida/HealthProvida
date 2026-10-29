/**
 * EmergencyTriagePage.jsx
 * ──────────────────────────────────────────────────────────────
 * Standalone emergency triage page shown when a patient confirms
 * red-flag symptoms during the triage screening step.
 *
 * Excludes emergencies from the booking flow:
 *   • Urgent warning: "You need emergency care now"
 *   • Ticked red-flag symptoms display
 *   • Direct click-to-call emergency numbers: 112 (National) & 767 (Regional)
 *   • List of all hospitals with 24/7 A&E departments (hasAE === true)
 *     with one-click phone dialling and Google Maps navigation
 *   • First-aid guidance while en route
 *   • "This doesn't apply to me — go back" navigation back to triage
 * ──────────────────────────────────────────────────────────────
 */
import React, { useMemo } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import {
  Phone,
  MapPin,
  ArrowLeft,
  AlertTriangle,
  Heart,
  Shield,
  Clock,
  Navigation,
  ExternalLink,
  Siren,
  Activity,
  ChevronRight,
  Building2,
  AlertOctagon,
  Check,
} from 'lucide-react';
import { useClinics } from '@/context/ClinicsContext';
import { RED_FLAGS } from '@/data/redFlags';

// ─── First-aid advice while en route ────────────────────────────
const FIRST_AID_TIPS = [
  {
    title: 'Call an ambulance or have someone drive you',
    description: 'Do not drive yourself to the emergency department, especially if experiencing chest pain, dizziness, or shortness of breath.',
  },
  {
    title: 'Stay calm and rest',
    description: 'Sit or lie down in a comfortable position. Take slow, deep breaths if possible.',
  },
  {
    title: 'Do not eat or drink',
    description: 'Avoid food, water, or medication until you have been evaluated by emergency medical staff.',
  },
  {
    title: 'Keep still if injured',
    description: 'If you suffered an accident, fall, or trauma, keep your head and neck still and avoid unnecessary movement.',
  },
  {
    title: 'Gather identification and current medications',
    description: 'If someone is with you, have them grab your ID, insurance cards, and any medications you take regularly.',
  },
];

export default function EmergencyTriagePage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { clinics, loading } = useClinics();

  // Parse flagged IDs from query params: ?flags=heart_attack,stroke
  const flagsParam = searchParams.get('flags') || '';
  const fromParam = searchParams.get('from') || '';
  const clinicSlugParam = searchParams.get('clinic') || '';

  const confirmedFlagIds = useMemo(() => {
    if (!flagsParam.trim()) return [];
    return flagsParam.split(',').map((s) => s.trim()).filter(Boolean);
  }, [flagsParam]);

  // Lookup matched red flags
  const confirmedFlags = useMemo(() => {
    return confirmedFlagIds
      .map((id) => RED_FLAGS.find((rf) => rf.id === id))
      .filter(Boolean);
  }, [confirmedFlagIds]);

  // Filter clinics that have 24/7 A&E facilities
  const aeHospitals = useMemo(() => {
    if (!clinics || clinics.length === 0) return [];
    // Separate selected hospital if clinicSlugParam is provided
    const allAE = clinics.filter((c) => c.hasAE);
    if (!clinicSlugParam) return allAE;

    // Put current clinic at top if it has AE
    return [...allAE].sort((a, b) => {
      if (a.slug === clinicSlugParam) return -1;
      if (b.slug === clinicSlugParam) return 1;
      return 0;
    });
  }, [clinics, clinicSlugParam]);

  const handleGoBack = () => {
    if (fromParam) {
      navigate(fromParam);
    } else {
      navigate(-1);
    }
  };

  return (
    <>
      <Helmet>
        <title>Urgent: Emergency Care Required | HealthProvida</title>
        <meta
          name="description"
          content="Immediate emergency medical care guidance and 24/7 Accident & Emergency hospital locations."
        />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50/80">
        {/* ── Top Alert Banner ─────────────────────────────────── */}
        <div className="bg-gradient-to-r from-red-600 via-rose-600 to-red-600 text-white shadow-md relative overflow-hidden">
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-red-500/0 via-white/15 to-red-500/0"
            animate={{ x: ['-100%', '100%'] }}
            transition={{ repeat: Infinity, duration: 2.2, ease: 'linear' }}
          />
          <div className="max-w-2xl mx-auto px-4 py-3.5 flex items-center gap-3 relative z-10">
            <button
              onClick={handleGoBack}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition active:scale-95"
              aria-label="Go back"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Siren className="w-4 h-4 text-yellow-300 animate-pulse" />
                Emergency Triage Alert
              </p>
              <p className="text-[11px] text-red-100">
                Immediate clinical assessment required — do not delay
              </p>
            </div>
            <motion.div
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ repeat: Infinity, duration: 1.2 }}
            >
              <AlertTriangle className="w-6 h-6 text-yellow-300" />
            </motion.div>
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-4 py-8 pb-28 space-y-6">
          {/* ── Hero Heading ─────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <motion.div
              animate={{ scale: [1, 1.08, 1] }}
              transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
              className="w-20 h-20 rounded-3xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center mx-auto mb-4 shadow-xl shadow-red-200"
            >
              <AlertOctagon className="w-10 h-10 text-white" />
            </motion.div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
              You need emergency care now
            </h1>
            <p className="text-gray-600 mt-2.5 text-sm sm:text-base leading-relaxed max-w-lg mx-auto">
              Based on the red-flag symptoms identified during triage, you should{' '}
              <strong className="text-red-600">not</strong> wait for a regular clinic appointment.{' '}
              Please go directly to an <strong>Accident & Emergency (A&E)</strong> department or call an ambulance immediately.
            </p>
          </motion.div>

          {/* ── Primary National / State Emergency Call Actions ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <motion.a
              href="tel:112"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="flex items-center gap-3.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white p-4 rounded-2xl shadow-lg shadow-red-200 active:scale-[0.98] transition group"
            >
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition">
                <Phone className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-red-100 uppercase tracking-wider">
                  National Emergency
                </p>
                <p className="text-lg font-black text-white leading-tight">Call 112</p>
                <p className="text-[11px] text-red-100 mt-0.5">Toll-free across Nigeria</p>
              </div>
              <ChevronRight className="w-5 h-5 text-red-200 flex-shrink-0" />
            </motion.a>

            <motion.a
              href="tel:767"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="flex items-center gap-3.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white p-4 rounded-2xl shadow-lg shadow-amber-200 active:scale-[0.98] transition group"
            >
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition">
                <Phone className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-amber-100 uppercase tracking-wider">
                  Lagos / State Hotline
                </p>
                <p className="text-lg font-black text-white leading-tight">Call 767</p>
                <p className="text-[11px] text-amber-100 mt-0.5">Toll-free emergency line</p>
              </div>
              <ChevronRight className="w-5 h-5 text-amber-200 flex-shrink-0" />
            </motion.a>
          </div>

          {/* ── Confirmed Red Flag Symptoms List ────────────── */}
          {confirmedFlags.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl border-2 border-red-200 shadow-lg shadow-red-100/60 p-5 sm:p-6"
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-lg bg-red-100 flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-red-900 uppercase tracking-wide">
                    Red-Flag Symptoms You Reported
                  </h2>
                  <p className="text-xs text-gray-500">
                    Inform hospital staff immediately about these symptoms upon arrival:
                  </p>
                </div>
              </div>

              <div className="space-y-2.5 mt-3">
                {confirmedFlags.map((flag, idx) => (
                  <div
                    key={flag.id}
                    className="flex items-start gap-3 p-3.5 bg-red-50/70 border border-red-100 rounded-xl"
                  >
                    <div className="w-5 h-5 rounded-full bg-red-500 text-white text-[11px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                      {idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-red-900">{flag.label}</p>
                      <p className="text-xs text-red-700 mt-0.5 leading-relaxed">
                        {flag.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* ── Hospitals with 24/7 A&E Departments ──────────── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-red-600" />
                  Accident & Emergency (A&E) Hospitals
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  The following accredited facilities have open 24/7 emergency departments:
                </p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-red-100 text-red-700">
                {aeHospitals.length} Available
              </span>
            </div>

            {loading ? (
              <div className="p-8 bg-white rounded-2xl border border-gray-200 text-center">
                <Activity className="w-6 h-6 text-red-500 animate-spin mx-auto mb-2" />
                <p className="text-xs text-gray-500">Loading emergency hospitals...</p>
              </div>
            ) : aeHospitals.length === 0 ? (
              <div className="p-6 bg-white rounded-2xl border border-gray-200 text-center">
                <p className="text-sm font-medium text-gray-700">
                  Please call <strong>112</strong> immediately for emergency medical dispatch.
                </p>
              </div>
            ) : (
              <div className="space-y-3.5">
                {aeHospitals.map((hospital) => {
                  const phoneClean = (hospital.phone || '+234 112').replace(/\s/g, '');
                  const mapsUrl = hospital.address
                    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                        `${hospital.practitioner_name} ${hospital.address}`
                      )}`
                    : '#';

                  const isCurrentClinic = hospital.slug === clinicSlugParam;

                  return (
                    <div
                      key={hospital.id}
                      className={`bg-white rounded-2xl p-4 sm:p-5 border transition shadow-sm ${
                        isCurrentClinic
                          ? 'border-2 border-red-400 ring-2 ring-red-100 shadow-md shadow-red-50'
                          : 'border-gray-200 hover:border-red-200'
                      }`}
                    >
                      <div className="flex items-start gap-3.5">
                        {hospital.image_src && (
                          <img
                            src={hospital.image_src}
                            alt=""
                            className="w-14 h-14 rounded-xl object-cover flex-shrink-0 ring-1 ring-gray-200"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-base font-bold text-gray-900 leading-tight">
                              {hospital.practitioner_name}
                            </h3>
                            {isCurrentClinic && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                                Selected Facility
                              </span>
                            )}
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                              24/7 A&E
                            </span>
                          </div>

                          <p className="text-xs text-gray-500 flex items-start gap-1 mt-1.5 leading-relaxed">
                            <MapPin className="w-3.5 h-3.5 text-red-500 flex-shrink-0 mt-0.5" />
                            <span>{hospital.address}</span>
                          </p>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4">
                        <a
                          href={`tel:${phoneClean}`}
                          className="flex items-center justify-center gap-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-red-100 transition active:scale-[0.98]"
                        >
                          <Phone className="w-4 h-4" />
                          Call A&E ({hospital.phone})
                        </a>

                        <a
                          href={mapsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-2 bg-gray-50 border border-gray-200 hover:bg-gray-100 text-gray-700 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold transition active:scale-[0.98]"
                        >
                          <Navigation className="w-3.5 h-3.5 text-blue-600" />
                          Get Directions
                          <ExternalLink className="w-3.5 h-3.5 text-gray-400 ml-auto" />
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>

          {/* ── While Waiting / Transport Advice ────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="bg-white rounded-2xl border border-gray-200 p-5"
          >
            <p className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Shield className="w-4 h-4 text-blue-600" />
              What to do right now
            </p>
            <div className="space-y-3">
              {FIRST_AID_TIPS.map((tip, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center flex-shrink-0 text-xs font-bold mt-0.5">
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-bold text-gray-900">{tip.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                      {tip.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* ── Medical Disclaimer ──────────────────────────── */}
          <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
            <Heart className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-amber-800 leading-relaxed">
              This triage screening is an automated emergency exclusion safety check designed to protect patients from appointment delays when acute care is needed. If you feel seriously unwell or suspect severe deterioration, contact emergency services without hesitation.
            </p>
          </div>

          {/* ── Return Link ("This doesn't apply to me") ──────── */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-center pt-3 pb-8"
          >
            <button
              onClick={handleGoBack}
              className="text-sm font-semibold text-gray-500 hover:text-gray-800 hover:underline transition inline-flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              This doesn't apply to me — go back to booking
            </button>
          </motion.div>
        </div>

        {/* ── Sticky Bottom Emergency Call Bar ─────────────── */}
        <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t-2 border-red-200 p-3.5 z-30">
          <div className="max-w-2xl mx-auto flex items-center gap-3">
            <a
              href="tel:112"
              className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white py-3 px-4 rounded-xl text-sm font-bold shadow-md shadow-red-200 transition active:scale-[0.98]"
            >
              <Phone className="w-4 h-4" />
              Call 112 (Emergency)
            </a>
            <button
              onClick={handleGoBack}
              className="px-4 py-3 rounded-xl border border-gray-300 text-gray-700 font-semibold text-xs hover:bg-gray-50 transition"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
