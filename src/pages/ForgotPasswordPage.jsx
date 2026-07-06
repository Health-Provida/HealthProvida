import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, ArrowLeft, ArrowRight, CheckCircle, RefreshCw } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { validateEmail } from '@/utils/validationUtils';
import logo from '../components/ui/logo.png';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [fieldError, setFieldError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const { resetPassword } = useAuth();

  useEffect(() => {
    document.title = 'Forgot Password | HealthProvida';
  }, []);

  // Cooldown countdown timer for resend
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setFieldError('');

    const emailErr = validateEmail(email);
    if (emailErr) {
      setFieldError(emailErr);
      return;
    }

    setLoading(true);

    const { error: resetError } = await resetPassword(email.trim());

    if (resetError) {
      // Supabase returns generic messages for security; map common ones
      if (/rate limit/i.test(resetError.message)) {
        setError('Too many requests. Please wait a few minutes and try again.');
      } else {
        // For security, still show success even if email doesn't exist
        setSent(true);
        setCooldown(60);
      }
      setLoading(false);
      return;
    }

    setSent(true);
    setCooldown(60);
    setLoading(false);
  };

  const handleResend = async () => {
    if (cooldown > 0) return;
    setLoading(true);
    await resetPassword(email.trim());
    setCooldown(60);
    setLoading(false);
  };

  return (
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
                {!sent ? (
                  /* ─── Request Form ──────────────────────────── */
                  <motion.div
                    key="form"
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 16 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="text-center mb-8">
                      <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-blue-600 to-green-600 flex items-center justify-center shadow-lg shadow-blue-200">
                        <Mail className="w-7 h-7 text-white" />
                      </div>
                      <h1 className="text-2xl font-bold text-gray-900">Forgot your password?</h1>
                      <p className="text-gray-500 mt-2 text-sm leading-relaxed">
                        No worries — enter the email address linked to your account and we'll send you a reset link.
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

                    <form onSubmit={handleSubmit} className="space-y-5">
                      {/* Email */}
                      <div>
                        <label htmlFor="forgot-email" className="block text-sm font-medium text-gray-700 mb-1.5">
                          Email address
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-gray-400" />
                          <input
                            id="forgot-email"
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
                            Sending link...
                          </>
                        ) : (
                          <>
                            Send reset link
                            <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    </form>

                    {/* Back to login */}
                    <div className="mt-8 pt-6 border-t border-gray-100 text-center">
                      <Link
                        to="/login"
                        className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 font-semibold transition"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        Back to sign in
                      </Link>
                    </div>
                  </motion.div>
                ) : (
                  /* ─── Success State ─────────────────────────── */
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -16 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="text-center mb-6">
                      <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', damping: 12, delay: 0.15 }}
                  className="w-16 h-16 mx-auto mb-5 rounded-full bg-green-100 flex items-center justify-center"
                >
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </motion.div>
                      <h2 className="text-2xl font-bold text-gray-900">Check your inbox</h2>
                      <p className="text-gray-500 mt-3 text-sm leading-relaxed">
                        We've sent a password reset link to
                      </p>
                      <p className="text-gray-900 font-semibold text-sm mt-1">{email}</p>
                      <p className="text-gray-400 text-xs mt-3 leading-relaxed">
                        The link will expire in 1 hour. If you don't see the email, check your spam folder.
                      </p>
                    </div>

                    {/* Resend */}
                    <div className="flex flex-col items-center gap-4 mt-8">
                      <button
                        onClick={handleResend}
                        disabled={cooldown > 0 || loading}
                        className={`inline-flex items-center gap-2 text-sm font-medium transition ${
                          cooldown > 0
                            ? 'text-gray-400 cursor-not-allowed'
                            : 'text-blue-600 hover:text-blue-700'
                        }`}
                      >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend email'}
                      </button>

                      <button
                        onClick={() => {
                          setSent(false);
                          setEmail('');
                          setCooldown(0);
                        }}
                        className="text-sm text-gray-500 hover:text-gray-700 transition"
                      >
                        Try a different email
                      </button>
                    </div>

                    {/* Back to login */}
                    <div className="mt-8 pt-6 border-t border-gray-100 text-center">
                      <Link
                        to="/login"
                        className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 font-semibold transition"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        Back to sign in
                      </Link>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
