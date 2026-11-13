import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, ArrowRight, ArrowLeft, RefreshCw } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { validateEmail, mapSupabaseError } from '@/utils/validationUtils';
import { runAntiSpamChecks, createTimestampTracker, HONEYPOT_FIELD_NAME, HONEYPOT_STYLES } from '@/utils/antiSpam';
import logo from '../components/ui/logo.png';

const OTP_LENGTH = 6;
const RESEND_COOLDOWN = 60;

export default function LoginPage() {
  // ─── State ────────────────────────────────────────────────
  const [step, setStep] = useState('email'); // 'email' | 'otp'
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(''));
  const [error, setError] = useState('');
  const [fieldError, setFieldError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resending, setResending] = useState(false);
  const [honeypot, setHoneypot] = useState('');
  const timestampTracker = useMemo(() => createTimestampTracker(), []);

  const inputRefs = useRef([]);

  const { signIn, signInVerifyOtp, isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // If already authenticated, redirect
  // Initialize timestamp tracker on mount
  useEffect(() => {
    timestampTracker.getLoadTime();
  }, [timestampTracker]);

  useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from?.pathname;
      if (from) {
        navigate(from, { replace: true });
      } else if (isAdmin) {
        navigate('/admin', { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    }
  }, [isAuthenticated, isAdmin, navigate, location]);

  useEffect(() => {
    document.title = 'Log In | HealthProvida';
  }, []);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Auto-focus first OTP input when switching to OTP step
  useEffect(() => {
    if (step === 'otp' && inputRefs.current[0]) {
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    }
  }, [step]);

  // ─── Step 1: Send OTP ─────────────────────────────────────

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');
    setFieldError('');

    // Anti-spam checks
    const spamResult = runAntiSpamChecks({
      honeypotValue: honeypot,
      action: 'login-otp',
      rateLimit: { maxAttempts: 5, windowMs: 60000 },
      timestampTracker,
      minSubmitTimeMs: 3000,
    });
    if (spamResult === '__silent_drop__') return; // silently ignore bots
    if (spamResult) { setError(spamResult); return; }

    const emailErr = validateEmail(email);
    if (emailErr) {
      setFieldError(emailErr);
      return;
    }

    setLoading(true);

    const { error: otpError } = await signIn({ email: email.trim() });

    if (otpError) {
      if (/rate limit/i.test(otpError.message)) {
        setError('Too many requests. Please wait a few minutes and try again.');
      } else {
        setError(mapSupabaseError(otpError));
      }
      setLoading(false);
      return;
    }

    setResendCooldown(RESEND_COOLDOWN);
    setStep('otp');
    setLoading(false);
  };

  // ─── Step 2: OTP Input Handlers ───────────────────────────

  const handleOtpChange = useCallback(
    (index, value) => {
      if (!/^[0-9]?$/.test(value)) return;

      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      setError('');

      // Auto-advance
      if (value && index < OTP_LENGTH - 1) {
        inputRefs.current[index + 1]?.focus();
      }

      // Auto-submit when complete
      if (value && newOtp.every((d) => d !== '')) {
        handleVerifyOtp(newOtp.join(''));
      }
    },
    [otp]
  );

  const handleOtpKeyDown = useCallback(
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

  const handleOtpPaste = useCallback((e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
    if (!pasted) return;

    const newOtp = Array(OTP_LENGTH).fill('');
    for (let i = 0; i < pasted.length; i++) {
      newOtp[i] = pasted[i];
    }
    setOtp(newOtp);
    setError('');

    const focusIdx = Math.min(pasted.length, OTP_LENGTH - 1);
    inputRefs.current[focusIdx]?.focus();

    if (pasted.length === OTP_LENGTH) {
      handleVerifyOtp(pasted);
    }
  }, []);

  // ─── Verify OTP ───────────────────────────────────────────

  const handleVerifyOtp = async (code) => {
    if (!code || code.length !== OTP_LENGTH) return;

    setLoading(true);
    setError('');

    const { error: verifyError } = await signInVerifyOtp({
      email: email.trim(),
      token: code,
    });

    if (verifyError) {
      setError(mapSupabaseError(verifyError));
      setOtp(Array(OTP_LENGTH).fill(''));
      inputRefs.current[0]?.focus();
      setLoading(false);
      return;
    }

    // Success — navigation happens via the useEffect above when isAuthenticated changes
    setLoading(false);
  };

  // ─── Resend OTP ───────────────────────────────────────────

  const handleResend = async () => {
    if (resendCooldown > 0 || resending) return;

    setResending(true);
    setError('');

    const { error: resendError } = await signIn({ email: email.trim() });

    if (resendError) {
      setError(mapSupabaseError(resendError));
    } else {
      setResendCooldown(RESEND_COOLDOWN);
      setOtp(Array(OTP_LENGTH).fill(''));
      inputRefs.current[0]?.focus();
    }

    setResending(false);
  };

  // ─── Go Back to Email Step ────────────────────────────────

  const handleBackToEmail = () => {
    setStep('email');
    setOtp(Array(OTP_LENGTH).fill(''));
    setError('');
    setResendCooldown(0);
  };

  // ─── Render ───────────────────────────────────────────────

  return (
    <>
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-blue-50 to-teal-50">
        {/* Minimal header */}
        <div className="px-6 py-5">
          <Link to="/">
            <img src={logo} alt="HealthProvida" style={{ width: '9rem' }} />
          </Link>
        </div>

        {/* Main content */}
        <div className="flex-1 flex items-center justify-center px-4 pb-16">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-md"
          >
            {/* Card */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              {/* Header gradient bar */}
              <div className="h-1.5 bg-gradient-to-r from-blue-600 via-teal-500 to-green-500" />

              <div className="px-8 pt-8 pb-10">
                <AnimatePresence mode="wait">
                  {step === 'email' ? (
                    /* ─── Step 1: Email Entry ─────────────────── */
                    <motion.div
                      key="email-step"
                      initial={{ opacity: 0, x: -16 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 16 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="text-center mb-8">
                        <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-blue-600 to-green-600 flex items-center justify-center shadow-lg shadow-blue-200">
                          <Mail className="w-7 h-7 text-white" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900">Log in or sign up</h1>
                        <p className="text-gray-500 mt-1 text-sm">
                          Enter your email and we'll send you a verification code.
                        </p>
                      </div>

                      {/* Error alert */}
                      {error && (
                        <motion.div
                          initial={{ opacity: 0, y: -8 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mb-6 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm"
                        >
                          {error}
                        </motion.div>
                      )}

                      <form onSubmit={handleSendOtp} className="space-y-5">
                        {/* Honeypot — invisible to humans, bots auto-fill it */}
                        <div style={HONEYPOT_STYLES} aria-hidden="true">
                          <label htmlFor={HONEYPOT_FIELD_NAME}>Leave this empty</label>
                          <input
                            id={HONEYPOT_FIELD_NAME}
                            name={HONEYPOT_FIELD_NAME}
                            type="text"
                            value={honeypot}
                            onChange={(e) => setHoneypot(e.target.value)}
                            autoComplete="off"
                            tabIndex={-1}
                          />
                        </div>
                        {/* Email */}
                        <div>
                          <label htmlFor="login-email" className="block text-sm font-medium text-gray-700 mb-1.5">
                            Email address
                          </label>
                          <div className="relative">
                            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-gray-400" />
                            <input
                              id="login-email"
                              type="email"
                              value={email}
                              onChange={(e) => {
                                setEmail(e.target.value);
                                if (fieldError) setFieldError('');
                              }}
                              placeholder="you@example.com"
                              required
                              autoComplete="email"
                              autoFocus
                              className={`w-full pl-11 pr-4 py-3 rounded-xl border bg-gray-50/50 focus:bg-white focus:ring-2 outline-none transition text-sm ${
                                fieldError
                                  ? 'border-red-300 focus:border-red-400 focus:ring-red-100'
                                  : 'border-gray-200 focus:border-blue-400 focus:ring-blue-100'
                              }`}
                            />
                          </div>
                          {fieldError && (
                            <motion.p
                              initial={{ opacity: 0, y: -4 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="text-red-500 text-xs mt-1.5"
                            >
                              {fieldError}
                            </motion.p>
                          )}
                        </div>

                        {/* Submit */}
                        <button
                          type="submit"
                          disabled={loading}
                          className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white font-semibold text-sm shadow-lg shadow-blue-200/50 hover:shadow-xl hover:shadow-blue-200/60 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                          {loading ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                              Sending code...
                            </>
                          ) : (
                            <>
                              Continue
                              <ArrowRight className="w-4 h-4" />
                            </>
                          )}
                        </button>
                      </form>
                    </motion.div>
                  ) : (
                    /* ─── Step 2: OTP Verification ─────────────── */
                    <motion.div
                      key="otp-step"
                      initial={{ opacity: 0, x: 16 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -16 }}
                      transition={{ duration: 0.3 }}
                    >
                      {/* Back button */}
                      <button
                        onClick={handleBackToEmail}
                        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition mb-6"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        Use a different email
                      </button>

                      <div className="text-center mb-8">
                        <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-blue-600 to-green-600 flex items-center justify-center shadow-lg shadow-blue-200">
                          <Mail className="w-7 h-7 text-white" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900">Enter verification code</h1>
                        <p className="text-gray-500 mt-2 text-sm leading-relaxed">
                          We sent a 6-digit code to{' '}
                          <strong className="text-gray-700">{email}</strong>
                        </p>
                      </div>

                      {/* Error alert */}
                      <AnimatePresence>
                        {error && (
                          <motion.div
                            initial={{ opacity: 0, y: -8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            className="mb-6 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm"
                          >
                            {error}
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* OTP Input */}
                      <div className="flex justify-center gap-3 mb-8" onPaste={handleOtpPaste}>
                        {otp.map((digit, index) => (
                          <input
                            key={index}
                            ref={(el) => (inputRefs.current[index] = el)}
                            type="text"
                            inputMode="numeric"
                            maxLength={1}
                            value={digit}
                            onChange={(e) => handleOtpChange(index, e.target.value)}
                            onKeyDown={(e) => handleOtpKeyDown(index, e)}
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
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
}
