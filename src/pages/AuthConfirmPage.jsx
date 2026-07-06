import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader2, AlertTriangle, ArrowRight, ArrowLeft } from 'lucide-react';
import { supabase } from '@/utils/supabase';
import logo from '../components/ui/logo.png';

/**
 * AuthConfirmPage
 * ──────────────────────────────────────────────────────────────
 * Handles Supabase auth callback for email-based flows such as
 * password recovery. Extracts `token_hash` and `type` from URL
 * query parameters, calls verifyOtp() to establish an
 * authenticated session, then redirects to the appropriate page.
 *
 * Expected URL: /auth/confirm?token_hash=<hash>&type=recovery
 * ──────────────────────────────────────────────────────────────
 */
export default function AuthConfirmPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [status, setStatus] = useState('verifying'); // 'verifying' | 'error'
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    document.title = 'Verifying… | HealthProvida';

    const tokenHash = searchParams.get('token_hash');
    const type = searchParams.get('type');

    if (!tokenHash || !type) {
      setStatus('error');
      setErrorMessage('Invalid or missing verification parameters.');
      return;
    }

    const verifyToken = async () => {
      if (!supabase) {
        setStatus('error');
        setErrorMessage('Authentication service is not available. Please try again later.');
        return;
      }

      try {
        const { data, error } = await supabase.auth.verifyOtp({
          token_hash: tokenHash,
          type,
        });

        if (error) {
          console.error('AuthConfirm: OTP verification failed:', error);
          setStatus('error');
          setErrorMessage(
            error.message?.includes('expired')
              ? 'This link has expired. Please request a new password reset.'
              : error.message || 'Verification failed. Please try again.'
          );
          return;
        }

        // Session is now established — redirect based on flow type
        if (type === 'recovery') {
          navigate('/reset-password', { replace: true });
        } else if (type === 'signup' || type === 'email') {
          navigate('/', { replace: true });
        } else {
          // Fallback for other types
          navigate('/', { replace: true });
        }
      } catch (err) {
        console.error('AuthConfirm: Unexpected error:', err);
        setStatus('error');
        setErrorMessage('An unexpected error occurred. Please try again.');
      }
    };

    verifyToken();
  }, [searchParams, navigate]);

  // ─── Error State ──────────────────────────────────────────
  if (status === 'error') {
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
                <h1 className="text-2xl font-bold text-gray-900">
                  Verification failed
                </h1>
                <p className="text-gray-500 mt-3 text-sm leading-relaxed">
                  {errorMessage}
                </p>
                <div className="mt-8 flex flex-col gap-3">
                  <Link
                    to="/forgot-password"
                    className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white font-semibold text-sm shadow-lg shadow-blue-200/50 hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    Request a new link
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

  // ─── Verifying State (spinner) ────────────────────────────
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
            <div className="px-8 pt-10 pb-12 text-center">
              <div className="w-10 h-10 mx-auto mb-4 border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
              <h1 className="text-xl font-bold text-gray-900">
                Verifying your link…
              </h1>
              <p className="text-gray-500 mt-2 text-sm">
                Please wait while we confirm your identity.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
