import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Eye, EyeOff, ArrowLeft, ArrowRight, ShieldCheck, CheckCircle2, AlertTriangle } from 'lucide-react';
import { supabase } from '@/utils/supabase';
import { validatePassword } from '@/utils/validationUtils';
import logo from '../components/ui/logo.png';

// ─── Password Strength Meter ────────────────────────────────────
function PasswordStrengthMeter({ score, strength }) {
  const colors = { weak: 'bg-red-500', fair: 'bg-amber-500', strong: 'bg-emerald-500' };
  const labels = { weak: 'Weak', fair: 'Fair', strong: 'Strong' };
  const widths = { weak: 'w-1/3', fair: 'w-2/3', strong: 'w-full' };

  if (score === 0) return null;

  return (
    <div className="mt-2">
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: '100%' }}
          className={`h-full rounded-full transition-all duration-500 ${colors[strength]} ${widths[strength]}`}
        />
      </div>
      <p className={`text-xs mt-1 font-medium ${strength === 'weak' ? 'text-red-500' : strength === 'fair' ? 'text-amber-500' : 'text-emerald-500'
        }`}>
        {labels[strength]} password
      </p>
    </div>
  );
}

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [passwordErrors, setPasswordErrors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);
  const [sessionError, setSessionError] = useState(false);
  const [checking, setChecking] = useState(true);

  const navigate = useNavigate();

  // Password validation
  const pwResult = validatePassword(password);

  // Listen for Supabase auth session from the reset link
  useEffect(() => {
    document.title = 'Reset Password | HealthProvida';

    if (!supabase) {
      setSessionError(true);
      setChecking(false);
      return;
    }

    // Listen for PASSWORD_RECOVERY event (fires when session is established via /auth/confirm)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'PASSWORD_RECOVERY' || (event === 'SIGNED_IN' && session)) {
          setSessionReady(true);
          setChecking(false);
        }
      }
    );

    // Check if session was already established by /auth/confirm before this page loaded
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setSessionReady(true);
        setChecking(false);
      } else {
        // Give extra time for the auth state change to propagate from verifyOtp.
        // AuthConfirmPage now waits for the event before navigating, so this
        // timeout is only a safety net for unexpected edge cases.
        setTimeout(() => {
          setChecking(false);
        }, 5000);
      }
    };

    checkSession();

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setPasswordErrors([]);

    // Validate password strength
    const { isValid, errors } = validatePassword(password);
    if (!isValid) {
      setPasswordErrors(errors);
      return;
    }

    // Check passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      // Wrap updateUser in a timeout to prevent indefinite hanging
      const updatePromise = supabase.auth.updateUser({ password });
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('TIMEOUT')), 15000)
      );

      const { error: updateError } = await Promise.race([updatePromise, timeoutPromise]);

      if (updateError) {
        if (/same.*password/i.test(updateError.message)) {
          setError('New password must be different from your current password.');
        } else if (/weak/i.test(updateError.message)) {
          setError('Password is too weak. Please choose a stronger password.');
        } else {
          setError(updateError.message || 'Failed to update password. Please try again.');
        }
        setLoading(false);
        return;
      }

      // Sign out so user can log in fresh with new password
      await supabase.auth.signOut();
      setSuccess(true);
      setLoading(false);
    } catch (err) {
      if (err.message === 'TIMEOUT') {
        setError(
          'The request timed out. Your session may have expired — please request a new password reset link.'
        );
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
      setLoading(false);
    }
  };

  // ─── Invalid / Expired Link State ─────────────────────────────
  if (!checking && !sessionReady && !success) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-blue-50 to-teal-50">
        <div className="px-6 py-5">
          <Link to="/">
            <img src={logo} alt="HealthProvida" style={{ width: '9rem' }} />
          </Link>
        </div>
        <div className="flex-1 flex items-center justify-center px-4 pb-16">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-md"
          >
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="h-1.5 bg-gradient-to-r from-red-500 via-orange-500 to-amber-500" />
              <div className="px-8 pt-8 pb-10 text-center">
                <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center shadow-lg shadow-red-200">
                  <AlertTriangle className="w-7 h-7 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900">Invalid or expired link</h1>
                <p className="text-gray-500 mt-3 text-sm leading-relaxed">
                  This password reset link has expired or is no longer valid. Please request a new one.
                </p>
                <div className="mt-8 flex flex-col gap-3">
                  <Link
                    to="/forgot-password"
                    className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white font-semibold text-sm shadow-lg shadow-blue-200/50 hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    Request new link
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    to="/login"
                    className="inline-flex items-center justify-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 font-semibold transition"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back to sign in
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // ─── Loading check ────────────────────────────────────────────
  if (checking) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-blue-50 to-teal-50">
        <div className="px-6 py-5">
          <Link to="/">
            <img src={logo} alt="HealthProvida" style={{ width: '9rem' }} />
          </Link>
        </div>
        <div className="flex-1 flex items-center justify-center px-4 pb-16">
          <div className="flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
            <p className="text-gray-500 text-sm">Verifying your reset link...</p>
          </div>
        </div>
      </div>
    );
  }

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
                {!success ? (
                  /* ─── New Password Form ─────────────────────── */
                  <motion.div
                    key="form"
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 16 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="text-center mb-8">
                      <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-blue-600 to-green-600 flex items-center justify-center shadow-lg shadow-blue-200">
                        <ShieldCheck className="w-7 h-7 text-white" />
                      </div>
                      <h1 className="text-2xl font-bold text-gray-900">Set new password</h1>
                      <p className="text-gray-500 mt-2 text-sm leading-relaxed">
                        Choose a strong password to secure your account.
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
                      {/* New Password */}
                      <div>
                        <label htmlFor="reset-password" className="block text-sm font-medium text-gray-700 mb-1.5">
                          New password
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-gray-400" />
                          <input
                            id="reset-password"
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={(e) => {
                              setPassword(e.target.value);
                              if (passwordErrors.length) setPasswordErrors([]);
                            }}
                            placeholder="Create a strong password"
                            required
                            autoComplete="new-password"
                            autoFocus
                            className={`w-full pl-11 pr-12 py-3 rounded-xl border bg-gray-50/50 focus:bg-white focus:ring-2 outline-none transition text-sm ${passwordErrors.length
                                ? 'border-red-300 focus:border-red-400 focus:ring-red-100'
                                : 'border-gray-200 focus:border-blue-400 focus:ring-blue-100'
                              }`}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                            tabIndex={-1}
                          >
                            {showPassword ? <EyeOff className="w-[18px] h-[18px]" /> : <Eye className="w-[18px] h-[18px]" />}
                          </button>
                        </div>
                        <PasswordStrengthMeter score={pwResult.score} strength={pwResult.strength} />
                        {passwordErrors.length > 0 && (
                          <motion.ul
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="mt-2 space-y-1"
                          >
                            {passwordErrors.map((err) => (
                              <li key={err} className="text-red-500 text-xs flex items-center gap-1">
                                <span className="w-1 h-1 rounded-full bg-red-400 shrink-0" />
                                {err}
                              </li>
                            ))}
                          </motion.ul>
                        )}
                      </div>

                      {/* Confirm Password */}
                      <div>
                        <label htmlFor="reset-confirm" className="block text-sm font-medium text-gray-700 mb-1.5">
                          Confirm new password
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-gray-400" />
                          <input
                            id="reset-confirm"
                            type={showConfirm ? 'text' : 'password'}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Re-enter your password"
                            required
                            autoComplete="new-password"
                            className={`w-full pl-11 pr-12 py-3 rounded-xl border bg-gray-50/50 focus:bg-white focus:ring-2 outline-none transition text-sm ${confirmPassword && password !== confirmPassword
                                ? 'border-red-300 focus:border-red-400 focus:ring-red-100'
                                : 'border-gray-200 focus:border-blue-400 focus:ring-blue-100'
                              }`}
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirm(!showConfirm)}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                            tabIndex={-1}
                          >
                            {showConfirm ? <EyeOff className="w-[18px] h-[18px]" /> : <Eye className="w-[18px] h-[18px]" />}
                          </button>
                        </div>
                        {confirmPassword && password !== confirmPassword && (
                          <motion.p
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-red-500 text-xs mt-1.5"
                          >
                            Passwords do not match.
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
                            Updating password...
                          </>
                        ) : (
                          <>
                            Reset password
                            <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    </form>
                  </motion.div>
                ) : (
                  /* ─── Success State ─────────────────────────── */
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4 }}
                  >
                    <div className="text-center">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
                        className="w-16 h-16 mx-auto mb-5 rounded-full bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center shadow-lg shadow-green-200"
                      >
                        <CheckCircle2 className="w-8 h-8 text-white" />
                      </motion.div>
                      <h2 className="text-2xl font-bold text-gray-900">Password updated!</h2>
                      <p className="text-gray-500 mt-3 text-sm leading-relaxed">
                        Your password has been reset successfully. You can now sign in with your new password.
                      </p>
                      <div className="mt-8">
                        <Link
                          to="/login"
                          className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white font-semibold text-sm shadow-lg shadow-blue-200/50 hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2"
                        >
                          Sign in
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                      </div>
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
