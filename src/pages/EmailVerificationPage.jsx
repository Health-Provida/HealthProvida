import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, ArrowLeft, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { mapSupabaseError } from '@/utils/validationUtils';
import { supabase } from '@/utils/supabase';
import logo from '../components/ui/logo.png';

const OTP_LENGTH = 6;
const RESEND_COOLDOWN = 60; // seconds

export default function EmailVerificationPage() {
  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(''));
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [verified, setVerified] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(RESEND_COOLDOWN);
  const [resending, setResending] = useState(false);

  const inputRefs = useRef([]);
  const { verifyOtp, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const email = location.state?.email || '';

  // Redirect if no email provided
  useEffect(() => {
    if (!email) {
      navigate('/signup', { replace: true });
    }
  }, [email, navigate]);

  // Redirect if already authenticated (from a previous session)
  useEffect(() => {
    if (isAuthenticated && !verified) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, verified, navigate]);

  useEffect(() => {
    document.title = 'Verify Email | HealthProvida';
  }, []);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Auto-focus first input on mount
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  // ─── OTP Input Handlers ────────────────────────────────────

  const handleChange = useCallback(
    (index, value) => {
      if (!/^[0-9]?$/.test(value)) return; // Only single digits

      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      setError('');

      // Auto-advance to next input
      if (value && index < OTP_LENGTH - 1) {
        inputRefs.current[index + 1]?.focus();
      }

      // Auto-submit when all digits filled
      if (value && newOtp.every((d) => d !== '')) {
        handleVerify(newOtp.join(''));
      }
    },
    [otp]
  );

  const handleKeyDown = useCallback(
    (index, e) => {
      if (e.key === 'Backspace' && !otp[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
      if (e.key === 'ArrowLeft' && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
      if (e.key === 'ArrowRight' && index < OTP_LENGTH - 1) {
        inputRefs.current[index + 1]?.focus();
      }
    },
    [otp]
  );

  const handlePaste = useCallback((e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
    if (!pasted) return;

    const newOtp = Array(OTP_LENGTH).fill('');
    for (let i = 0; i < pasted.length; i++) {
      newOtp[i] = pasted[i];
    }
    setOtp(newOtp);
    setError('');

    // Focus last filled or next empty
    const focusIdx = Math.min(pasted.length, OTP_LENGTH - 1);
    inputRefs.current[focusIdx]?.focus();

    // Auto-submit if complete
    if (pasted.length === OTP_LENGTH) {
      handleVerify(pasted);
    }
  }, []);

  // ─── Verification ──────────────────────────────────────────

  const handleVerify = async (code) => {
    if (!code || code.length !== OTP_LENGTH) return;

    setLoading(true);
    setError('');

    const { error: verifyError } = await verifyOtp({ email, token: code });

    if (verifyError) {
      setError(mapSupabaseError(verifyError));
      setOtp(Array(OTP_LENGTH).fill(''));
      inputRefs.current[0]?.focus();
      setLoading(false);
      return;
    }

    setVerified(true);
    setLoading(false);

    // Auto-redirect after showing success
    setTimeout(() => {
      navigate('/', { replace: true });
    }, 2000);
  };

  // ─── Resend ────────────────────────────────────────────────

  const handleResend = async () => {
    if (resendCooldown > 0 || resending) return;

    setResending(true);
    setError('');

    try {
      if (supabase) {
        const { error: resendError } = await supabase.auth.resend({
          type: 'signup',
          email,
        });
        if (resendError) {
          setError(mapSupabaseError(resendError));
        } else {
          setResendCooldown(RESEND_COOLDOWN);
          setOtp(Array(OTP_LENGTH).fill(''));
          inputRefs.current[0]?.focus();
        }
      }
    } catch (err) {
      setError('Failed to resend code. Please try again.');
    } finally {
      setResending(false);
    }
  };

  // ─── Success State ─────────────────────────────────────────

  if (verified) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-blue-50 to-teal-50">
        <div className="px-6 py-5">
          <Link to="/">
            <img src={logo} alt="HealthProvida" style={{ width: '9rem' }} />
          </Link>
        </div>
        <div className="flex-1 flex items-center justify-center px-4 pb-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md"
          >
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="h-1.5 bg-gradient-to-r from-green-500 via-teal-500 to-blue-600" />
              <div className="px-8 pt-8 pb-10 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', damping: 12, delay: 0.2 }}
                  className="w-16 h-16 mx-auto mb-5 rounded-full bg-green-100 flex items-center justify-center"
                >
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </motion.div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">You're all set!</h1>
                <p className="text-gray-500 text-sm leading-relaxed mb-6">
                  Your email has been verified and you're now logged in.
                  Redirecting you to the homepage...
                </p>
                <div className="w-6 h-6 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto" />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // ─── Main Render ───────────────────────────────────────────

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-blue-50 to-teal-50">
      {/* Logo */}
      <div className="px-6 py-5">
        <Link to="/">
          <img src={logo} alt="HealthProvida" style={{ width: '9rem' }} />
        </Link>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center px-4 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="h-1.5 bg-gradient-to-r from-blue-600 via-teal-500 to-green-500" />

            <div className="px-8 pt-8 pb-10">
              {/* Back link */}
              <Link
                to="/signup"
                className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition mb-6"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Link>

              {/* Header */}
              <div className="text-center mb-8">
                <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-blue-600 to-green-600 flex items-center justify-center shadow-lg shadow-blue-200">
                  <Mail className="w-7 h-7 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900">Confirm your email</h1>
                <p className="text-gray-500 mt-2 text-sm leading-relaxed">
                  Enter the 6-digit code we sent to{' '}
                  <strong className="text-gray-700">{email}</strong>
                </p>
              </div>

              {/* Error */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="mb-6 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-2"
                  >
                    <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* OTP Input */}
              <div className="flex justify-center gap-3 mb-8" onPaste={handlePaste}>
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => (inputRefs.current[index] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    disabled={loading}
                    className={`w-12 h-14 text-center text-xl font-bold rounded-xl border-2 transition-all duration-200 outline-none ${
                      digit
                        ? 'border-blue-500 bg-blue-50/30 text-blue-700'
                        : 'border-gray-200 bg-gray-50/50 text-gray-900'
                    } focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:opacity-50`}
                  />
                ))}
              </div>

              {/* Loading indicator */}
              {loading && (
                <div className="flex items-center justify-center gap-2 mb-6 text-sm text-gray-500">
                  <div className="w-4 h-4 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
                  Verifying...
                </div>
              )}

              {/* Resend */}
              <div className="text-center">
                <p className="text-sm text-gray-500 mb-2">Didn't receive the code?</p>
                <button
                  onClick={handleResend}
                  disabled={resendCooldown > 0 || resending}
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-700 disabled:text-gray-400 disabled:cursor-not-allowed transition"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${resending ? 'animate-spin' : ''}`} />
                  {resendCooldown > 0
                    ? `Resend code in ${resendCooldown}s`
                    : resending
                    ? 'Sending...'
                    : 'Resend code'}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
