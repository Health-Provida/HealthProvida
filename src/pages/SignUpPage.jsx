import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, Phone, Calendar, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import {
  validateEmail,
  validatePassword,
  validatePhone,
  validateName,
  validateDateOfBirth,
  mapSupabaseError,
} from '@/utils/validationUtils';
import logo from '../components/ui/logo.png';

// ─── Password Strength Meter ────────────────────────────────
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
      <p className={`text-xs mt-1 font-medium ${
        strength === 'weak' ? 'text-red-500' : strength === 'fair' ? 'text-amber-500' : 'text-emerald-500'
      }`}>
        {labels[strength]} password
      </p>
    </div>
  );
}

// ─── Inline Field Error ─────────────────────────────────────
function FieldError({ error }) {
  if (!error) return null;
  return (
    <motion.p
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      className="text-red-500 text-xs mt-1.5 flex items-start gap-1"
    >
      <AlertCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
      {error}
    </motion.p>
  );
}

// ─── Main Component ──────────────────────────────────────────
export default function SignUpPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    optOutPromo: false,
  });

  const [fieldErrors, setFieldErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, strength: 'weak', isValid: false });
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState({});

  const { signUp, checkPhoneExists, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) navigate('/', { replace: true });
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    document.title = 'Sign Up | HealthProvida';
  }, []);

  // ─── Handlers ─────────────────────────────────────────────

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear server error on any change
    if (serverError) setServerError('');
  };

  const handleBlur = useCallback(
    (field) => {
      setTouched((prev) => ({ ...prev, [field]: true }));

      const value = formData[field];
      let error = null;

      switch (field) {
        case 'firstName':
          error = validateName(value, 'First name');
          break;
        case 'lastName':
          error = validateName(value, 'Last name');
          break;
        case 'dateOfBirth':
          error = validateDateOfBirth(value);
          break;
        case 'email':
          error = validateEmail(value);
          break;
        case 'phone':
          error = validatePhone(value);
          break;
        case 'password': {
          const result = validatePassword(value);
          setPasswordStrength(result);
          error = result.isValid ? null : 'Password does not meet the strength requirements.';
          break;
        }
        case 'confirmPassword':
          if (value && value !== formData.password) {
            error = 'Passwords do not match.';
          } else if (!value && formData.password) {
            error = 'Please confirm your password.';
          }
          break;
        default:
          break;
      }

      setFieldErrors((prev) => ({ ...prev, [field]: error }));
    },
    [formData]
  );

  // Real-time password strength as user types
  useEffect(() => {
    if (formData.password) {
      setPasswordStrength(validatePassword(formData.password));
    } else {
      setPasswordStrength({ score: 0, strength: 'weak', isValid: false });
    }
  }, [formData.password]);

  // ─── Full Validation ──────────────────────────────────────

  const validateAll = () => {
    const errors = {};

    errors.firstName = validateName(formData.firstName, 'First name');
    errors.lastName = validateName(formData.lastName, 'Last name');
    errors.dateOfBirth = validateDateOfBirth(formData.dateOfBirth);
    errors.email = validateEmail(formData.email);
    errors.phone = validatePhone(formData.phone);

    const pwResult = validatePassword(formData.password);
    errors.password = pwResult.isValid ? null : 'Password does not meet the strength requirements.';

    if (formData.confirmPassword !== formData.password) {
      errors.confirmPassword = 'Passwords do not match.';
    } else if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password.';
    }

    // Remove null entries
    const cleanErrors = {};
    for (const [key, val] of Object.entries(errors)) {
      if (val) cleanErrors[key] = val;
    }

    setFieldErrors(cleanErrors);
    // Mark all as touched
    setTouched({ firstName: true, lastName: true, dateOfBirth: true, email: true, phone: true, password: true, confirmPassword: true });

    return Object.keys(cleanErrors).length === 0;
  };

  // ─── Submit ───────────────────────────────────────────────

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    if (!validateAll()) return;

    setLoading(true);

    try {
      // Check phone uniqueness (if provided)
      if (formData.phone.trim()) {
        const { exists, error: phoneError } = await checkPhoneExists(formData.phone.trim());
        if (phoneError) {
          console.error('Phone check error:', phoneError);
        }
        if (exists) {
          setFieldErrors((prev) => ({
            ...prev,
            phone: 'This phone number is already associated with an account.',
          }));
          setLoading(false);
          return;
        }
      }

      // Attempt signup
      const { error: signUpError } = await signUp({
        email: formData.email.trim(),
        password: formData.password,
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        dateOfBirth: formData.dateOfBirth || null,
        phone: formData.phone.trim() || null,
        optOutPromo: formData.optOutPromo,
      });

      if (signUpError) {
        setServerError(mapSupabaseError(signUpError));
        setLoading(false);
        return;
      }

      // Success → navigate to OTP verification
      navigate('/verify-email', { state: { email: formData.email.trim() } });
    } catch (err) {
      console.error('Signup exception:', err);
      setServerError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ─── Input Helper ─────────────────────────────────────────

  const inputClass = (field) => {
    const hasError = touched[field] && fieldErrors[field];
    return `w-full px-4 py-3.5 rounded-xl border ${
      hasError
        ? 'border-red-300 bg-red-50/30 focus:border-red-400 focus:ring-red-100'
        : 'border-gray-200 bg-gray-50/50 focus:border-blue-400 focus:ring-blue-100'
    } focus:bg-white focus:ring-2 outline-none transition text-sm`;
  };

  const inputWithIconClass = (field) => {
    const hasError = touched[field] && fieldErrors[field];
    return `w-full pl-11 pr-4 py-3.5 rounded-xl border ${
      hasError
        ? 'border-red-300 bg-red-50/30 focus:border-red-400 focus:ring-red-100'
        : 'border-gray-200 bg-gray-50/50 focus:border-blue-400 focus:ring-blue-100'
    } focus:bg-white focus:ring-2 outline-none transition text-sm`;
  };

  // ─── Render ───────────────────────────────────────────────

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-blue-50 to-teal-50">
      {/* Logo */}
      <div className="px-6 py-5">
        <Link to="/">
          <img src={logo} alt="HealthProvida" style={{ width: '9rem' }} />
        </Link>
      </div>

      {/* Form Container */}
      <div className="flex-1 flex items-start justify-center px-4 pb-16 pt-2">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            {/* Gradient bar */}
            <div className="h-1.5 bg-gradient-to-r from-blue-600 via-teal-500 to-green-500" />

            <div className="px-8 pt-8 pb-10">
              {/* Header */}
              <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Let's create your account</h1>
                <p className="text-gray-500 mt-1.5 text-sm">
                  This information is required to book or host.
                </p>
              </div>

              {/* Server Error */}
              <AnimatePresence>
                {serverError && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="mb-6 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-2"
                  >
                    <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    {serverError}
                  </motion.div>
                )}
              </AnimatePresence>

              <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                {/* ── Legal Name Section ──────────────────── */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-3">
                    Legal name
                  </label>
                  <div className="space-y-0">
                    {/* First name */}
                    <div>
                      <input
                        id="signup-first-name"
                        type="text"
                        value={formData.firstName}
                        onChange={(e) => updateField('firstName', e.target.value)}
                        onBlur={() => handleBlur('firstName')}
                        placeholder="First name"
                        required
                        autoComplete="given-name"
                        className={`w-full px-4 py-3.5 rounded-t-xl rounded-b-none border border-b-0 ${
                          touched.firstName && fieldErrors.firstName
                            ? 'border-red-300 bg-red-50/30'
                            : 'border-gray-200 bg-gray-50/50 focus:border-blue-400'
                        } focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none transition text-sm`}
                      />
                    </div>
                    {/* Last name */}
                    <div>
                      <input
                        id="signup-last-name"
                        type="text"
                        value={formData.lastName}
                        onChange={(e) => updateField('lastName', e.target.value)}
                        onBlur={() => handleBlur('lastName')}
                        placeholder="Last name"
                        required
                        autoComplete="family-name"
                        className={`w-full px-4 py-3.5 rounded-b-xl rounded-t-none border ${
                          touched.lastName && fieldErrors.lastName
                            ? 'border-red-300 bg-red-50/30'
                            : 'border-gray-200 bg-gray-50/50 focus:border-blue-400'
                        } focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none transition text-sm`}
                      />
                    </div>
                  </div>
                  <AnimatePresence>
                    {touched.firstName && fieldErrors.firstName && (
                      <FieldError error={fieldErrors.firstName} />
                    )}
                    {touched.lastName && fieldErrors.lastName && (
                      <FieldError error={fieldErrors.lastName} />
                    )}
                  </AnimatePresence>
                  <p className="text-xs text-gray-400 mt-2 leading-relaxed">
                    Make sure it matches the name on your government ID.
                  </p>
                </div>

                {/* ── Date of Birth ───────────────────────── */}
                <div>
                  <label htmlFor="signup-dob" className="block text-sm font-semibold text-gray-900 mb-1.5">
                    Date of birth
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-gray-400 pointer-events-none" />
                    <input
                      id="signup-dob"
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) => updateField('dateOfBirth', e.target.value)}
                      onBlur={() => handleBlur('dateOfBirth')}
                      required
                      className={inputWithIconClass('dateOfBirth')}
                    />
                  </div>
                  <AnimatePresence>
                    {touched.dateOfBirth && fieldErrors.dateOfBirth && (
                      <FieldError error={fieldErrors.dateOfBirth} />
                    )}
                  </AnimatePresence>
                </div>

                {/* ── Email ───────────────────────────────── */}
                <div>
                  <label htmlFor="signup-email" className="block text-sm font-semibold text-gray-900 mb-1.5">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-gray-400" />
                    <input
                      id="signup-email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => updateField('email', e.target.value)}
                      onBlur={() => handleBlur('email')}
                      placeholder="you@example.com"
                      required
                      autoComplete="email"
                      className={inputWithIconClass('email')}
                    />
                  </div>
                  <AnimatePresence>
                    {touched.email && fieldErrors.email && (
                      <FieldError error={fieldErrors.email} />
                    )}
                  </AnimatePresence>
                  <p className="text-xs text-gray-400 mt-1.5">
                    We'll email you appointment confirmations.
                  </p>
                </div>

                {/* ── Phone (Optional) ────────────────────── */}
                <div>
                  <label htmlFor="signup-phone" className="block text-sm font-semibold text-gray-900 mb-1.5">
                    Phone number <span className="text-gray-400 font-normal">(optional)</span>
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-gray-400" />
                    <input
                      id="signup-phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => updateField('phone', e.target.value)}
                      onBlur={() => handleBlur('phone')}
                      placeholder="+234 800 000 0000"
                      autoComplete="tel"
                      className={inputWithIconClass('phone')}
                    />
                  </div>
                  <AnimatePresence>
                    {touched.phone && fieldErrors.phone && (
                      <FieldError error={fieldErrors.phone} />
                    )}
                  </AnimatePresence>
                </div>

                {/* ── Password ────────────────────────────── */}
                <div>
                  <label htmlFor="signup-password" className="block text-sm font-semibold text-gray-900 mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-gray-400" />
                    <input
                      id="signup-password"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => updateField('password', e.target.value)}
                      onBlur={() => handleBlur('password')}
                      placeholder="Create a strong password"
                      required
                      autoComplete="new-password"
                      className={`w-full pl-11 pr-12 py-3.5 rounded-xl border ${
                        touched.password && fieldErrors.password
                          ? 'border-red-300 bg-red-50/30 focus:border-red-400 focus:ring-red-100'
                          : 'border-gray-200 bg-gray-50/50 focus:border-blue-400 focus:ring-blue-100'
                      } focus:bg-white focus:ring-2 outline-none transition text-sm`}
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
                  <PasswordStrengthMeter score={passwordStrength.score} strength={passwordStrength.strength} />
                  <AnimatePresence>
                    {touched.password && fieldErrors.password && (
                      <FieldError error={fieldErrors.password} />
                    )}
                  </AnimatePresence>
                </div>

                {/* ── Confirm Password ────────────────────── */}
                <div>
                  <label htmlFor="signup-confirm" className="block text-sm font-semibold text-gray-900 mb-1.5">
                    Confirm password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-gray-400" />
                    <input
                      id="signup-confirm"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      onChange={(e) => updateField('confirmPassword', e.target.value)}
                      onBlur={() => handleBlur('confirmPassword')}
                      placeholder="Re-enter your password"
                      required
                      autoComplete="new-password"
                      className={inputWithIconClass('confirmPassword')}
                    />
                  </div>
                  <AnimatePresence>
                    {touched.confirmPassword && fieldErrors.confirmPassword && (
                      <FieldError error={fieldErrors.confirmPassword} />
                    )}
                  </AnimatePresence>
                </div>

                {/* ── Promotional Opt-Out ─────────────────── */}
                <div className="pt-2 border-t border-gray-100">
                  <p className="text-xs text-gray-500 mb-3 leading-relaxed">
                    HealthProvida will send you promotions such as deals and marketing notifications.
                    You can opt out anytime via account settings or within marketing emails.
                  </p>
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <div className="relative mt-0.5">
                      <input
                        id="signup-promo-opt-out"
                        type="checkbox"
                        checked={formData.optOutPromo}
                        onChange={(e) => updateField('optOutPromo', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-5 h-5 rounded-md border-2 border-gray-300 peer-checked:border-blue-600 peer-checked:bg-blue-600 transition-all duration-200 flex items-center justify-center group-hover:border-gray-400">
                        {formData.optOutPromo && (
                          <CheckCircle className="w-3.5 h-3.5 text-white" />
                        )}
                      </div>
                    </div>
                    <span className="text-sm text-gray-700 leading-snug">
                      I don't want to receive HealthProvida promotions.
                    </span>
                  </label>
                </div>

                {/* ── Legal Note ──────────────────────────── */}
                <div className="pt-2">
                  <p className="text-xs text-gray-500 leading-relaxed">
                    By selecting <strong className="text-gray-700">Agree and continue</strong>, I agree to
                    HealthProvida's{' '}
                    <Link to="/terms" className="text-blue-600 hover:underline font-medium">
                      Terms of Service
                    </Link>
                    ,{' '}
                    <Link to="/payment-terms" className="text-blue-600 hover:underline font-medium">
                      Payment Terms of Service
                    </Link>
                    , and{' '}
                    <Link to="/non-discrimination" className="text-blue-600 hover:underline font-medium">
                      Non-discrimination Policy
                    </Link>
                    , and acknowledge the{' '}
                    <Link to="/privacy" className="text-blue-600 hover:underline font-medium">
                      Privacy Policy
                    </Link>
                    .
                  </p>
                </div>

                {/* ── Submit Button ───────────────────────── */}
                <button
                  id="signup-submit-button"
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white font-semibold text-sm shadow-lg shadow-blue-200/50 hover:shadow-xl transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    'Agree and continue'
                  )}
                </button>
              </form>

              {/* ── Footer ───────────────────────────────── */}
              <div className="mt-6 pt-6 border-t border-gray-100 text-center">
                <p className="text-sm text-gray-500">
                  Already have an account?{' '}
                  <Link to="/login" className="text-blue-600 hover:text-blue-700 font-semibold">
                    Sign in
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
