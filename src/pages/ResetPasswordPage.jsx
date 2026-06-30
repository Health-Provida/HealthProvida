import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Eye, EyeOff, ArrowRight, CheckCircle, AlertCircle, ShieldCheck } from 'lucide-react';
import { supabase } from '@/utils/supabase';
import logo from '../components/ui/logo.png';

// Password strength helper
function getStrength(pw) {
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return score; // 0-4
}

const strengthLabels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
const strengthColors = ['', 'bg-red-400', 'bg-amber-400', 'bg-blue-400', 'bg-green-500'];
const strengthTextColors = ['', 'text-red-500', 'text-amber-500', 'text-blue-600', 'text-green-600'];

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  const [sessionReady, setSessionReady] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Reset Password | HealthProvida';
  }, []);

  // Supabase sends the user back with a session in the URL hash (PKCE flow).
  // The PASSWORD_RECOVERY event fires once during token exchange — we must
  // subscribe BEFORE calling getSession() to avoid missing it.
  useEffect(() => {
    if (!supabase) return;

    let settled = false;

    // 1. Subscribe first so we never miss the event.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY' && session) {
        settled = true;
        setSessionReady(true);
      }
    });

    // 2. Check if the URL itself contains a recovery token (handles the case
    //    where the event already fired before this component mounted).
    const hash = window.location.hash;
    const search = window.location.search;
    const isRecoveryUrl =
      hash.includes('type=recovery') ||
      search.includes('type=recovery') ||
      hash.includes('access_token') || // implicit flow
      new URLSearchParams(search).get('type') === 'recovery';

    if (isRecoveryUrl) {
      // Give Supabase a moment to exchange the token and fire the event.
      // If it already fired and we caught it above, settled=true so this is a no-op.
      const timer = setTimeout(() => {
        if (!settled) {
          // Token is in URL — Supabase will have exchanged it; get the session.
          supabase.auth.getSession().then(({ data: { session } }) => {
            if (session && !settled) {
              settled = true;
              setSessionReady(true);
            }
          });
        }
      }, 1500);

      return () => {
        clearTimeout(timer);
        subscription?.unsubscribe();
      };
    }

    return () => subscription?.unsubscribe();
  }, []);

  const strength = getStrength(password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    const { error: updateError } = await supabase.auth.updateUser({ password });

    setLoading(false);

    if (updateError) {
      setError(updateError.message || 'Failed to update password. The link may have expired.');
    } else {
      setDone(true);
      setTimeout(() => navigate('/login', { replace: true }), 3000);
    }
  };

  // ── Success state ────────────────────────────────────────────────
  if (done) {
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
            transition={{ duration: 0.4 }}
            className="w-full max-w-md"
          >
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="h-1.5 bg-gradient-to-r from-green-500 via-teal-500 to-blue-600" />
              <div className="px-8 pt-8 pb-10 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', damping: 12, delay: 0.15 }}
                  className="w-16 h-16 mx-auto mb-5 rounded-full bg-green-100 flex items-center justify-center"
                >
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </motion.div>

                <h1 className="text-2xl font-bold text-gray-900 mb-2">Password updated!</h1>
                <p className="text-gray-500 text-sm leading-relaxed mb-8">
                  Your password has been changed successfully. Redirecting you to sign in...
                </p>
                <div className="w-6 h-6 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto" />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // ── Invalid / expired link state ─────────────────────────────────
  if (!sessionReady) {
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
              <div className="h-1.5 bg-gradient-to-r from-blue-600 via-teal-500 to-green-500" />
              <div className="px-8 pt-10 pb-10 text-center">
                <div className="w-6 h-6 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-5" />
                <p className="text-gray-500 text-sm">Verifying your reset link…</p>
                <p className="text-gray-400 text-xs mt-3">
                  If this takes too long, your link may have expired.{' '}
                  <Link to="/forgot-password" className="text-blue-600 hover:text-blue-700 font-medium">
                    Request a new one
                  </Link>
                  .
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // ── Main form ────────────────────────────────────────────────────
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
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            {/* Header gradient bar */}
            <div className="h-1.5 bg-gradient-to-r from-blue-600 via-teal-500 to-green-500" />

            <div className="px-8 pt-8 pb-10">
              {/* Header */}
              <div className="text-center mb-8">
                <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-blue-600 to-green-600 flex items-center justify-center shadow-lg shadow-blue-200">
                  <ShieldCheck className="w-7 h-7 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900">Set a new password</h1>
                <p className="text-gray-500 mt-1 text-sm">
                  Choose a strong password to keep your account secure.
                </p>
              </div>

              {/* Error alert */}
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

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* New password */}
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
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="At least 8 characters"
                      required
                      autoComplete="new-password"
                      autoFocus
                      className="w-full pl-11 pr-12 py-3 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition text-sm"
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

                  {/* Strength meter */}
                  {password.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-2.5"
                    >
                      <div className="flex gap-1 mb-1">
                        {[1, 2, 3, 4].map((level) => (
                          <div
                            key={level}
                            className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                              strength >= level ? strengthColors[strength] : 'bg-gray-200'
                            }`}
                          />
                        ))}
                      </div>
                      <p className={`text-xs font-medium ${strengthTextColors[strength]}`}>
                        {strengthLabels[strength]}
                      </p>
                    </motion.div>
                  )}
                </div>

                {/* Confirm password */}
                <div>
                  <label htmlFor="reset-confirm" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Confirm new password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-gray-400" />
                    <input
                      id="reset-confirm"
                      type={showConfirm ? 'text' : 'password'}
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      placeholder="Repeat your new password"
                      required
                      autoComplete="new-password"
                      className={`w-full pl-11 pr-12 py-3 rounded-xl border bg-gray-50/50 focus:bg-white outline-none transition text-sm ${
                        confirm && confirm !== password
                          ? 'border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100'
                          : confirm && confirm === password
                          ? 'border-green-400 focus:border-green-400 focus:ring-2 focus:ring-green-100'
                          : 'border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100'
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
                  {confirm && confirm !== password && (
                    <p className="mt-1 text-xs text-red-500">Passwords don't match</p>
                  )}
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading || (confirm.length > 0 && confirm !== password)}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white font-semibold text-sm shadow-lg shadow-blue-200/50 hover:shadow-xl hover:shadow-blue-200/60 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Updating password...
                    </>
                  ) : (
                    <>
                      Update password
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
