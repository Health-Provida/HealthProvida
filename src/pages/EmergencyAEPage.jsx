/**
 * EmergencyAEPage.jsx
 * ──────────────────────────────────────────────────────────────
 * A&E Emergency redirect page shown when a patient confirms
 * emergency red-flag symptoms during the booking flow.
 *
 * Displays hospital contact info, emergency call buttons,
 * directions, and first-aid guidance.
 * ──────────────────────────────────────────────────────────────
 */
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import {
  Phone, MapPin, ArrowLeft, AlertTriangle, Heart,
  Shield, Clock, Navigation, ExternalLink, Siren,
  Activity, ChevronRight,
} from 'lucide-react';
import { fetchClinicBySlug } from '@/utils/supabaseQueries';

// ─── First-aid tips while waiting ──────────────────────────────
const FIRST_AID_TIPS = [
  {
    title: 'Stay calm',
    description: 'Try to stay as calm as possible. Take slow, deep breaths if you can.',
  },
  {
    title: 'Do not eat or drink',
    description: 'Avoid eating or drinking anything until you are assessed by a medical professional.',
  },
  {
    title: 'Keep still',
    description: 'If you or the patient has a suspected injury, avoid unnecessary movement.',
  },
  {
    title: 'Gather your medications',
    description: 'If possible, bring a list of current medications and any allergies to the hospital.',
  },
  {
    title: 'Bring identification',
    description: 'Take your ID card, health insurance card, and any relevant medical records.',
  },
];

export default function EmergencyAEPage() {
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [clinic, setClinic] = useState(null);
  const [loading, setLoading] = useState(true);

  // Parse confirmed symptoms from search params
  const confirmedSymptoms = searchParams.get('symptoms')
    ? decodeURIComponent(searchParams.get('symptoms')).split('||')
    : [];

  useEffect(() => {
    async function load() {
      setLoading(true);
      const result = await fetchClinicBySlug(slug);
      if (result.data) setClinic(result.data);
      setLoading(false);
    }
    load();
  }, [slug]);

  const hospitalPhone = clinic?.phone || '+234 112';
  const hospitalAddress = clinic?.address || '';
  const mapsUrl = hospitalAddress
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(hospitalAddress)}`
    : '#';

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }}
        >
          <Activity className="w-8 h-8 text-red-500" />
        </motion.div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Emergency — A&E | {clinic?.practitioner_name || 'Hospital'} | HealthProvida</title>
        <meta name="description" content="Emergency A&E information and contact details." />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50/80">
        {/* ── Pulsing top bar ────────────────────────────────── */}
        <div className="bg-gradient-to-r from-red-600 to-red-500 relative overflow-hidden">
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-red-500/0 via-white/10 to-red-500/0"
            animate={{ x: ['-100%', '100%'] }}
            transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
          />
          <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3 relative z-10">
            <button
              onClick={() => navigate(`/clinic/${slug}/book`)}
              className="p-2 rounded-lg hover:bg-white/10 transition"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white">Emergency — A&E</p>
              <p className="text-[10px] text-red-100">Immediate medical attention needed</p>
            </div>
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            >
              <AlertTriangle className="w-6 h-6 text-yellow-300" />
            </motion.div>
          </div>
        </div>

        <div className="max-w-lg mx-auto px-4 py-6 pb-32 space-y-6">
          {/* ── Emergency header ────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <motion.div
              animate={{ scale: [1, 1.08, 1] }}
              transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
              className="w-20 h-20 rounded-full bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center mx-auto mb-5 shadow-xl shadow-red-200"
            >
              <Siren className="w-10 h-10 text-white" />
            </motion.div>
            <h1 className="text-2xl font-bold text-gray-900">You may need emergency care</h1>
            <p className="text-gray-500 mt-2 text-sm leading-relaxed max-w-xs mx-auto">
              Based on the symptoms you confirmed, we recommend going to the <strong>Accident & Emergency (A&E)</strong> department immediately.
            </p>
          </motion.div>

          {/* ── Hospital info card ──────────────────────────── */}
          {clinic && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="bg-white rounded-2xl border-2 border-red-100 shadow-lg shadow-red-100/40 p-5"
            >
              <div className="flex items-start gap-4">
                {clinic.image_src && (
                  <img
                    src={clinic.image_src}
                    alt=""
                    className="w-14 h-14 rounded-xl object-cover flex-shrink-0 ring-2 ring-red-100"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <h2 className="text-base font-bold text-gray-900 leading-tight">
                    {clinic.practitioner_name}
                  </h2>
                  <p className="text-xs text-gray-500 flex items-start gap-1 mt-1.5 leading-relaxed">
                    <MapPin className="w-3.5 h-3.5 text-red-400 flex-shrink-0 mt-0.5" />
                    <span>{clinic.address}</span>
                  </p>
                </div>
              </div>

              {/* Action buttons */}
              <div className="mt-5 space-y-2.5">
                <a
                  href={`tel:${hospitalPhone.replace(/\s/g, '')}`}
                  className="w-full flex items-center justify-center gap-2.5 bg-gradient-to-r from-red-600 to-rose-500 hover:from-red-700 hover:to-rose-600 text-white py-3.5 px-6 rounded-xl text-sm font-bold transition shadow-lg shadow-red-200 hover:shadow-xl active:scale-[0.98]"
                >
                  <Phone className="w-5 h-5" />
                  Call A&E — {hospitalPhone}
                </a>
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2.5 bg-white border-2 border-red-200 text-red-700 hover:bg-red-50 py-3.5 px-6 rounded-xl text-sm font-bold transition active:scale-[0.98]"
                >
                  <Navigation className="w-4 h-4" />
                  Get Directions
                  <ExternalLink className="w-3.5 h-3.5 ml-auto opacity-50" />
                </a>
              </div>
            </motion.div>
          )}

          {/* ── National Emergency ──────────────────────────── */}
          <motion.a
            href="tel:112"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="block bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-2xl p-4 hover:border-amber-300 transition active:scale-[0.99]"
          >
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
                <Phone className="w-5 h-5 text-amber-700" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-amber-900">Call National Emergency — 112</p>
                <p className="text-xs text-amber-700 mt-0.5">
                  If you can't reach the hospital, call Nigeria's emergency number
                </p>
              </div>
              <ChevronRight className="w-5 h-5 text-amber-400 flex-shrink-0" />
            </div>
          </motion.a>

          {/* ── Confirmed symptoms ─────────────────────────── */}
          {confirmedSymptoms.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="bg-red-50/80 border border-red-100 rounded-2xl p-5"
            >
              <p className="text-xs font-bold text-red-700 uppercase tracking-wider mb-3 flex items-center gap-2">
                <AlertTriangle className="w-3.5 h-3.5" />
                Symptoms you confirmed
              </p>
              <p className="text-[11px] text-red-600 mb-3">
                Show this to the emergency team when you arrive
              </p>
              <div className="space-y-2">
                {confirmedSymptoms.map((symptom, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2.5 bg-white/80 rounded-xl p-3 border border-red-100"
                  >
                    <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-[10px] font-bold text-red-600">{idx + 1}</span>
                    </div>
                    <p className="text-sm text-red-800 leading-relaxed">{symptom}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* ── While waiting tips ─────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="bg-white rounded-2xl border border-gray-100 p-5"
          >
            <p className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Shield className="w-3.5 h-3.5 text-blue-500" />
              What to do while waiting
            </p>
            <div className="space-y-3.5">
              {FIRST_AID_TIPS.map((tip, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-blue-600">{idx + 1}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900">{tip.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{tip.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* ── Disclaimer ─────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55 }}
            className="bg-gray-50 border border-gray-100 rounded-2xl p-4 flex items-start gap-3"
          >
            <Heart className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs text-gray-500 leading-relaxed">
                This is not a diagnosis. This screening is designed to help identify situations that may need urgent medical attention. Always trust your instincts — if you feel something is seriously wrong, seek emergency care.
              </p>
            </div>
          </motion.div>

          {/* ── Back to booking ─────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="text-center pt-2"
          >
            <button
              onClick={() => navigate(`/clinic/${slug}/book`)}
              className="text-sm text-gray-400 hover:text-gray-600 transition font-medium"
            >
              ← I don't need emergency care, go back to booking
            </button>
          </motion.div>
        </div>

        {/* ── Sticky bottom call bar ─────────────────────────── */}
        <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t-2 border-red-100 p-4 z-20">
          <div className="max-w-lg mx-auto">
            <a
              href={`tel:${hospitalPhone.replace(/\s/g, '')}`}
              className="w-full flex items-center justify-center gap-2.5 bg-gradient-to-r from-red-600 to-rose-500 hover:from-red-700 hover:to-rose-600 text-white py-3.5 px-6 rounded-xl text-sm font-bold transition shadow-lg shadow-red-200 hover:shadow-xl active:scale-[0.98]"
            >
              <Phone className="w-5 h-5" />
              Call A&E Now
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
