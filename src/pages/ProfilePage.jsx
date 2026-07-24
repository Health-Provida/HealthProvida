import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Heart, CalendarCheck, MessageSquare, Settings,
  Shield, HelpCircle, LogOut, ChevronRight, Edit2, Camera,
  Phone, Mail, Clock, Star, Activity, FileText,
  Stethoscope, AlertCircle, CheckCircle2, Bell, Lock,
  Globe, Syringe, PlusCircle, ArrowRight, BadgeCheck, Eye, EyeOff
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useFavorites } from '@/context/FavoritesContext';
import { supabase } from '@/utils/supabase';
import { useToast } from '@/components/ui/use-toast';
import { getClinicUrl } from '@/utils/slugUtils';
import { fetchPatientAppointments, cancelAppointment } from '@/utils/supabaseQueries';
import { validatePassword } from '@/utils/validationUtils';

// ─── Sidebar Navigation Items ─────────────────────────────────────────────────
const navItems = [
  { id: 'about', icon: User, label: 'Personal Info', description: 'Your profile details' },
  { id: 'health', icon: Activity, label: 'Health Details', description: 'Medical information' },
  { id: 'appointments', icon: CalendarCheck, label: 'Appointments', description: 'Upcoming & past visits' },
  { id: 'saved', icon: Heart, label: 'Saved Clinics', description: 'Your wishlists' },
  { id: 'security', icon: Lock, label: 'Security', description: 'Account & privacy' },
  { id: 'notifications', icon: Bell, label: 'Notifications', description: 'Alert preferences' },
];

// ─── Animated section wrapper ─────────────────────────────────────────────────
function SectionFade({ children, tabKey }) {
  return (
    <motion.div
      key={tabKey}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.28, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
}

// ─── Info row ─────────────────────────────────────────────────────────────────
function InfoRow({ icon: Icon, label, value, placeholder }) {
  return (
    <div className="flex items-start gap-4 py-4 border-b border-gray-100 last:border-0">
      <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0 mt-0.5">
        <Icon className="w-4 h-4 text-blue-600" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-0.5">{label}</p>
        <p className={`text-sm font-medium ${value ? 'text-gray-900' : 'text-gray-400 italic'}`}>
          {value || placeholder}
        </p>
      </div>
    </div>
  );
}

// ─── Edit Modal ───────────────────────────────────────────────────────────────
function EditProfileModal({ profile, onClose, onSave }) {
  const [form, setForm] = useState({
    full_name: profile?.full_name || '',
    phone: profile?.phone || '',
    date_of_birth: profile?.date_of_birth || '',
    bio: profile?.bio || '',
  });
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    await onSave(form);
    setSaving(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.92, opacity: 0 }}
        transition={{ type: 'spring', damping: 28, stiffness: 320 }}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8"
        onClick={e => e.stopPropagation()}
      >
        <h3 className="text-xl font-bold text-gray-900 mb-6">Edit Personal Info</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Full Name</label>
            <input
              name="full_name"
              value={form.full_name}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-sm font-medium transition"
              placeholder="Your full name"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Phone Number</label>
            <input
              name="phone"
              value={form.phone}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-sm font-medium transition"
              placeholder="+44 7xxx xxxxxx"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Date of Birth</label>
            <input
              type="date"
              name="date_of_birth"
              value={form.date_of_birth}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-sm font-medium transition"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">About Me</label>
            <textarea
              name="bio"
              value={form.bio}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-sm font-medium transition resize-none"
              placeholder="Brief health background or notes..."
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-green-600 text-white text-sm font-semibold hover:from-blue-700 hover:to-green-700 transition disabled:opacity-60"
            >
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

// ─── Completion CTA ───────────────────────────────────────────────────────────
function CompleteProfileCard({ completionPct, onEdit }) {
  if (completionPct === 100) return null;
  return (
    <div className="bg-gradient-to-br from-blue-600 via-blue-500 to-green-500 rounded-2xl p-6 text-white mb-6 relative overflow-hidden">
      <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full bg-white/10" />
      <div className="absolute -right-2 bottom-0 w-24 h-24 rounded-full bg-white/5" />
      <div className="relative z-10">
        <p className="text-blue-100 text-xs font-semibold uppercase tracking-wider mb-1">Profile Completion</p>
        <h3 className="text-2xl font-bold mb-1">{completionPct}%</h3>
        <p className="text-blue-100 text-sm mb-4 leading-relaxed">
          Complete your profile to help healthcare providers understand your needs better.
        </p>
        <div className="w-full bg-white/20 rounded-full h-1.5 mb-4">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${completionPct}%` }}
            transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
            className="h-1.5 bg-white rounded-full"
          />
        </div>
        <button
          onClick={onEdit}
          className="inline-flex items-center gap-2 bg-white text-blue-600 font-semibold text-sm px-5 py-2.5 rounded-xl hover:bg-blue-50 transition"
        >
          Complete Profile <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// ─── Health Badge ─────────────────────────────────────────────────────────────
function HealthBadge({ label, value, icon: Icon, color }) {
  const colors = {
    blue: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-100' },
    green: { bg: 'bg-green-50', text: 'text-green-600', border: 'border-green-100' },
    red: { bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-100' },
    amber: { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-100' },
  };
  const c = colors[color] || colors.blue;
  return (
    <div className={`flex items-center gap-3 p-4 rounded-xl border ${c.bg} ${c.border}`}>
      <div className={`w-9 h-9 rounded-lg ${c.bg} ${c.text} flex items-center justify-center`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-xs text-gray-500 font-medium">{label}</p>
        <p className={`text-sm font-bold ${c.text}`}>{value || 'Not set'}</p>
      </div>
    </div>
  );
}

// ─── Appointment Stub ─────────────────────────────────────────────────────────
// ─── Appointment Card (real data) ─────────────────────────────────────────────
function AppointmentCard({ appointment, onCancel, isCancelling }) {
  const STATUS_STYLES = {
    pending: { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-400', label: 'Pending' },
    confirmed: { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-400', label: 'Confirmed' },
    completed: { bg: 'bg-green-50', text: 'text-green-700', dot: 'bg-green-500', label: 'Completed' },
    cancelled: { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-400', label: 'Cancelled' },
    no_show: { bg: 'bg-gray-50', text: 'text-gray-600', dot: 'bg-gray-400', label: 'No Show' },
  };
  const s = STATUS_STYLES[appointment.status] || STATUS_STYLES.pending;
  const canCancel = ['pending', 'confirmed'].includes(appointment.status);
  const formattedDate = appointment.date
    ? new Date(appointment.date + 'T00:00:00').toLocaleDateString('en-US', {
      weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
    })
    : '';

  return (
    <div className="flex items-start gap-4 p-4 rounded-2xl border border-gray-100 hover:border-blue-100 hover:bg-blue-50/20 transition group">
      {/* Clinic image */}
      <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
        <img
          src={appointment.clinicImage}
          alt={appointment.clinicName}
          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
        />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <Link to={`/clinic/${appointment.clinicId}`} className="font-semibold text-gray-900 text-sm hover:text-blue-700 transition truncate">
            {appointment.clinicName}
          </Link>
          <span className={`inline-flex items-center gap-1.5 text-[11px] font-bold uppercase px-2.5 py-1 rounded-full ${s.bg} ${s.text} border border-transparent`}>
            <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
            {s.label}
          </span>
        </div>
        <p className="text-xs text-gray-500 mt-0.5">{appointment.clinicType}</p>
        <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
          <span className="flex items-center gap-1">
            <CalendarCheck className="w-3 h-3" />
            {formattedDate}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {appointment.time}
          </span>
        </div>
        {appointment.notes && (
          <p className="text-xs text-gray-400 mt-1.5 italic truncate">Note: {appointment.notes}</p>
        )}
        {canCancel && (
          <button
            onClick={() => onCancel(appointment.id)}
            disabled={isCancelling}
            className="mt-2.5 text-xs font-medium text-red-500 hover:text-red-700 hover:underline transition disabled:opacity-50"
          >
            {isCancelling ? 'Cancelling...' : 'Cancel Appointment'}
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Toggle Row ───────────────────────────────────────────────────────────────
function NotificationToggle({ label, desc, icon: Icon, color, bg, defaultOn }) {
  const [on, setOn] = useState(defaultOn);
  return (
    <div className="flex items-center gap-4 p-5">
      <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center flex-shrink-0`}>
        <Icon className={`w-5 h-5 ${color}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-gray-900 text-sm">{label}</p>
        <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">{desc}</p>
      </div>
      <button
        onClick={() => setOn(v => !v)}
        className={`relative w-11 h-6 rounded-full transition-colors duration-200 flex-shrink-0 ${on ? 'bg-blue-600' : 'bg-gray-200'}`}
        aria-label={`Toggle ${label}`}
      >
        <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all duration-200 ${on ? 'left-[22px]' : 'left-0.5'}`} />
      </button>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

// ─── Password Change Form (inline) ───────────────────────────────────────────
function PasswordChangeForm() {
  const { updatePassword } = useAuth();
  const { toast } = useToast();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const pwResult = newPassword ? validatePassword(newPassword) : null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!newPassword.trim()) return;

    const { isValid, errors } = validatePassword(newPassword);
    if (!isValid) {
      toast({ title: 'Weak password', description: errors[0], variant: 'destructive' });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({ title: 'Mismatch', description: 'Passwords do not match.', variant: 'destructive' });
      return;
    }

    setSaving(true);
    const { error } = await updatePassword(newPassword);
    setSaving(false);

    if (error) {
      toast({ title: 'Error', description: error.message || 'Could not update password.', variant: 'destructive' });
    } else {
      toast({ title: 'Password updated', description: 'Your password has been changed successfully.' });
      setNewPassword('');
      setConfirmPassword('');
      setExpanded(false);
    }
  };

  if (!expanded) {
    return (
      <button
        onClick={() => setExpanded(true)}
        className="text-sm font-semibold text-blue-600 hover:text-blue-700 underline-offset-2 hover:underline transition"
      >
        Set or change password
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="relative">
        <input
          type={showPassword ? 'text' : 'password'}
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="New password"
          autoComplete="new-password"
          className="w-full px-4 pr-12 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-sm transition"
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
          tabIndex={-1}
        >
          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
      {pwResult && (
        <div className={`text-xs font-medium ${pwResult.strength === 'weak' ? 'text-red-500' : pwResult.strength === 'fair' ? 'text-amber-500' : 'text-emerald-500'
          }`}>
          {pwResult.strength === 'weak' ? 'Weak' : pwResult.strength === 'fair' ? 'Fair' : 'Strong'} password
        </div>
      )}
      <input
        type={showPassword ? 'text' : 'password'}
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        placeholder="Confirm new password"
        autoComplete="new-password"
        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-sm transition"
      />
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => { setExpanded(false); setNewPassword(''); setConfirmPassword(''); }}
          className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving || !newPassword || !confirmPassword}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-green-600 text-white text-sm font-semibold hover:from-blue-700 hover:to-green-700 transition disabled:opacity-60"
        >
          {saving ? 'Saving…' : 'Update Password'}
        </button>
      </div>
    </form>
  );
}

// ─── Onboarding Modal ─────────────────────────────────────────────────────────
function OnboardingModal({ onClose, onSave }) {
  const [form, setForm] = useState({
    full_name: '',
    phone: '',
    date_of_birth: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    await onSave(form);
    setSaving(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.92, opacity: 0 }}
        transition={{ type: 'spring', damping: 28, stiffness: 320 }}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
      >
        {/* Gradient bar */}
        <div className="h-1.5 bg-gradient-to-r from-blue-600 via-teal-500 to-green-500" />

        <div className="p-8">
          <div className="text-center mb-6">
            <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-blue-600 to-green-600 flex items-center justify-center shadow-lg shadow-blue-200">
              <User className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Complete your profile</h3>
            <p className="text-gray-500 text-sm mt-2 leading-relaxed">
              Add your details to book appointments or join as a provider.
            </p>
          </div>

          {/* Info banner */}
          <div className="mb-6 px-4 py-3 rounded-xl bg-blue-50 border border-blue-100 text-blue-700 text-xs leading-relaxed">
            <strong>Note:</strong> A complete profile is required to book appointments or join the provider network. You can skip this for now and complete it later.
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Full Name</label>
              <input
                name="full_name"
                value={form.full_name}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-sm font-medium transition"
                placeholder="Your full name"
                autoFocus
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Phone Number <span className="text-gray-300 font-normal normal-case">(optional)</span></label>
              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-sm font-medium transition"
                placeholder="+234 800 000 0000"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Date of Birth <span className="text-gray-300 font-normal normal-case">(optional)</span></label>
              <input
                type="date"
                name="date_of_birth"
                value={form.date_of_birth}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-sm font-medium transition"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Password <span className="text-gray-300 font-normal normal-case">(optional)</span></label>
              <div className="relative">
                <input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={handleChange}
                  className="w-full px-4 pr-12 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-sm font-medium transition"
                  placeholder="Set a password (optional)"
                  autoComplete="new-password"
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
              <p className="text-xs text-gray-400 mt-1.5">You don't need a password to sign in, but you can set one as a backup.</p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition"
              >
                Skip for now
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-green-600 text-white text-sm font-semibold hover:from-blue-700 hover:to-green-700 transition disabled:opacity-60"
              >
                {saving ? 'Saving…' : 'Save'}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function ProfilePage() {
  const { user, profile, signOut, refreshProfile, updatePassword, isProfileIncomplete } = useAuth();
  const { getFavoriteClinics, favoritesCount } = useFavorites();
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileInputRef = useRef(null);

  const [activeTab, setActiveTab] = useState('about');
  const [showEditModal, setShowEditModal] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Appointments state
  const [appointments, setAppointments] = useState([]);
  const [appointmentsLoading, setAppointmentsLoading] = useState(false);
  const [cancellingId, setCancellingId] = useState(null);

  const favoriteClinics = getFavoriteClinics();

  // Derived display values
  const userInitial = profile?.full_name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U';
  const userName = profile?.full_name || 'Your Name';
  const userEmail = profile?.email || user?.email || '';
  const userPhone = profile?.phone || '';
  const userDOB = profile?.date_of_birth
    ? new Date(profile.date_of_birth).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
    : '';
  const memberSince = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
    : '';
  const roleLabel = profile?.role === 'provider' ? 'Healthcare Provider'
    : profile?.role === 'admin' ? 'Administrator'
      : 'Patient';

  // Completion %
  const completionFields = [profile?.full_name, profile?.phone, profile?.date_of_birth, profile?.avatar_url];
  const completionPct = Math.round((completionFields.filter(Boolean).length / completionFields.length) * 100);

  // Save profile
  const handleSaveProfile = async (form) => {
    if (!supabase || !user?.id) return;
    const { error } = await supabase
      .from('profiles')
      .update({ full_name: form.full_name, phone: form.phone, date_of_birth: form.date_of_birth || null, bio: form.bio })
      .eq('id', user.id);
    if (error) {
      toast({ title: 'Error', description: 'Could not save changes. Please try again.', variant: 'destructive' });
    } else {
      await refreshProfile();
      toast({ title: 'Profile updated', description: 'Your changes have been saved.' });
      setShowEditModal(false);
    }
  };

  // Avatar upload
  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !supabase || !user?.id) return;
    setUploadingAvatar(true);
    try {
      const ext = file.name.split('.').pop();
      const path = `${user.id}/avatar.${ext}`;
      const { error: uploadError } = await supabase.storage.from('avatars').upload(path, file, { upsert: true });
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path);
      await supabase.from('profiles').update({ avatar_url: publicUrl }).eq('id', user.id);
      await refreshProfile();
      toast({ title: 'Photo updated!', description: 'Your profile photo has been changed.' });
    } catch {
      toast({ title: 'Upload failed', description: 'Could not update photo.', variant: 'destructive' });
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  // Fetch appointments when the appointments tab is activated
  const loadAppointments = useCallback(async () => {
    if (!user?.id) return;
    setAppointmentsLoading(true);
    const { data } = await fetchPatientAppointments(user.id);
    setAppointments(data || []);
    setAppointmentsLoading(false);
  }, [user?.id]);

  useEffect(() => {
    if (activeTab === 'appointments') {
      loadAppointments();
    }
  }, [activeTab, loadAppointments]);

  const handleCancelAppointment = async (appointmentId) => {
    setCancellingId(appointmentId);
    const { error } = await cancelAppointment(appointmentId);
    if (error) {
      toast({ title: 'Error', description: error.message || 'Failed to cancel appointment.', variant: 'destructive' });
    } else {
      toast({ title: 'Appointment cancelled', description: 'Your appointment has been cancelled and the slot released.' });
      await loadAppointments();
    }
    setCancellingId(null);
  };

  // ─── Section renderer ──────────────────────────────────────────────────────
  const renderSection = () => {
    switch (activeTab) {

      // ── Personal Info ──────────────────────────────────────────────────────
      case 'about':
        return (
          <SectionFade tabKey="about">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Personal Info</h2>
                <p className="text-gray-500 text-sm mt-0.5">Manage your personal details</p>
              </div>
              <button
                id="edit-profile-btn"
                onClick={() => setShowEditModal(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:border-blue-200 hover:text-blue-600 transition"
              >
                <Edit2 className="w-4 h-4" /> Edit
              </button>
            </div>

            <CompleteProfileCard completionPct={completionPct} onEdit={() => setShowEditModal(true)} />

            {/* Profile card */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-5">
              <div className="flex items-start gap-5 pb-5 border-b border-gray-100 mb-2">
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  <div className="w-20 h-20 rounded-2xl overflow-hidden bg-gradient-to-br from-blue-500 to-green-500 flex items-center justify-center shadow-lg relative">
                    {profile?.avatar_url ? (
                      <img src={profile.avatar_url} alt={userName} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-white text-3xl font-bold">{userInitial}</span>
                    )}
                    {uploadingAvatar && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      </div>
                    )}
                  </div>
                  <button
                    id="upload-avatar-btn"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute -bottom-2 -right-2 w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md hover:bg-blue-700 transition"
                    title="Change photo"
                  >
                    <Camera className="w-4 h-4" />
                  </button>
                  <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="text-xl font-bold text-gray-900">{userName}</h3>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700">
                      <Stethoscope className="w-3 h-3" /> {roleLabel}
                    </span>
                    {(!profile?.role || profile?.role === 'patient') && (
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-green-50 text-green-700">
                        <BadgeCheck className="w-3 h-3" /> Verified Patient
                      </span>
                    )}
                  </div>
                  {memberSince && (
                    <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Member since {memberSince}
                    </p>
                  )}
                </div>
              </div>

              <InfoRow icon={Mail} label="Email Address" value={userEmail} placeholder="Not provided" />
              <InfoRow icon={Phone} label="Phone Number" value={userPhone} placeholder="Add phone number" />
              <InfoRow icon={Clock} label="Date of Birth" value={userDOB} placeholder="Add date of birth" />
              {profile?.bio && (
                <InfoRow icon={FileText} label="About Me" value={profile.bio} placeholder="" />
              )}
            </div>

            {/* Quick links */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-2 mb-2">Quick Actions</p>
              <Link to="/favorites" className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-blue-50 transition group">
                <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center">
                  <Heart className="w-4 h-4 text-red-500" />
                </div>
                <span className="flex-1 text-sm font-medium text-gray-700 group-hover:text-blue-700">Saved Clinics</span>
                {favoritesCount > 0 && (
                  <span className="text-xs font-bold bg-blue-600 text-white px-2 py-0.5 rounded-full">{favoritesCount}</span>
                )}
                <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-blue-400 transition" />
              </Link>
              <Link to="/" className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-blue-50 transition group">
                <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
                  <Stethoscope className="w-4 h-4 text-blue-600" />
                </div>
                <span className="flex-1 text-sm font-medium text-gray-700 group-hover:text-blue-700">Find a Clinic</span>
                <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-blue-400 transition" />
              </Link>
              <Link to="/help" className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-blue-50 transition group">
                <div className="w-9 h-9 rounded-xl bg-purple-50 flex items-center justify-center">
                  <HelpCircle className="w-4 h-4 text-purple-500" />
                </div>
                <span className="flex-1 text-sm font-medium text-gray-700 group-hover:text-blue-700">Help Centre</span>
                <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-blue-400 transition" />
              </Link>
            </div>
          </SectionFade>
        );

      // ── Health Details ─────────────────────────────────────────────────────
      case 'health':
        return (
          <SectionFade tabKey="health">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Health Details</h2>
                <p className="text-gray-500 text-sm mt-0.5">Information shared with your healthcare providers</p>
              </div>
              <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:border-blue-200 hover:text-blue-600 transition">
                <Edit2 className="w-4 h-4" /> Edit
              </button>
            </div>

            <div className="flex items-start gap-3 p-4 rounded-2xl bg-blue-50 border border-blue-100 mb-6">
              <AlertCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-blue-700 leading-relaxed">
                Health information is kept private and only shared with clinicians you choose to see. It helps providers give you better, personalised care.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
              <HealthBadge icon={Activity} label="Blood Type" value={profile?.blood_type} color="red" />
              <HealthBadge icon={Globe} label="NHS Number" value={profile?.nhs_number} color="blue" />
              <HealthBadge icon={Syringe} label="Allergies" value={profile?.allergies} color="amber" />
              <HealthBadge icon={Shield} label="Emergency Contact" value={profile?.emergency_contact} color="green" />
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-blue-400" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Medical Records</h3>
              <p className="text-sm text-gray-500 mb-5 max-w-xs mx-auto leading-relaxed">
                Upload and manage your medical documents, prescriptions, and test results securely.
              </p>
              <button className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-green-600 text-white text-sm font-semibold hover:from-blue-700 hover:to-green-700 transition shadow-md">
                <PlusCircle className="w-4 h-4" /> Add Document
              </button>
            </div>
          </SectionFade>
        );

      // ── Appointments ───────────────────────────────────────────────────────
      case 'appointments':
        return (
          <SectionFade tabKey="appointments">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Appointments</h2>
                <p className="text-gray-500 text-sm mt-0.5">Manage your clinic visits</p>
              </div>
              <Link
                to="/"
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-green-600 text-white text-sm font-semibold hover:from-blue-700 hover:to-green-700 transition shadow-sm"
              >
                <PlusCircle className="w-4 h-4" /> Book Appointment
              </Link>
            </div>

            {appointmentsLoading ? (
              /* Loading skeleton */
              <div className="space-y-3 mb-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-start gap-4 p-4 rounded-2xl border border-gray-100 animate-pulse">
                    <div className="w-14 h-14 rounded-xl bg-gray-200 flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-40 bg-gray-200 rounded" />
                      <div className="h-3 w-28 bg-gray-100 rounded" />
                      <div className="h-3 w-48 bg-gray-100 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : appointments.length > 0 ? (
              /* Real appointment cards */
              <div className="space-y-3 mb-6">
                {appointments.map((appt) => (
                  <AppointmentCard
                    key={appt.id}
                    appointment={appt}
                    onCancel={handleCancelAppointment}
                    isCancelling={cancellingId === appt.id}
                  />
                ))}
              </div>
            ) : (
              /* Empty state */
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center mb-6">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-50 to-teal-50 flex items-center justify-center mx-auto mb-4">
                  <CalendarCheck className="w-8 h-8 text-blue-400" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">No Appointments Yet</h3>
                <p className="text-sm text-gray-500 mb-5 max-w-xs mx-auto leading-relaxed">
                  Browse thousands of clinics and book an appointment in seconds.
                </p>
                <Link
                  to="/"
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-green-600 text-white text-sm font-semibold hover:from-blue-700 hover:to-green-700 transition shadow-md"
                >
                  <Stethoscope className="w-4 h-4" /> Find a Clinic
                </Link>
              </div>
            )}

            {/* CTA for finding more clinics */}
            {appointments.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-50 to-teal-50 flex items-center justify-center mx-auto mb-4">
                  <CalendarCheck className="w-8 h-8 text-blue-400" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Book Your Next Visit</h3>
                <p className="text-sm text-gray-500 mb-5 max-w-xs mx-auto leading-relaxed">
                  Browse thousands of clinics and book an appointment in seconds.
                </p>
                <Link
                  to="/"
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-green-600 text-white text-sm font-semibold hover:from-blue-700 hover:to-green-700 transition shadow-md"
                >
                  <Stethoscope className="w-4 h-4" /> Find a Clinic
                </Link>
              </div>
            )}
          </SectionFade>
        );

      // ── Saved Clinics ──────────────────────────────────────────────────────
      case 'saved':
        return (
          <SectionFade tabKey="saved">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Saved Clinics</h2>
                <p className="text-gray-500 text-sm mt-0.5">
                  {favoritesCount > 0 ? `${favoritesCount} saved ${favoritesCount === 1 ? 'clinic' : 'clinics'}` : 'Your wishlist is empty'}
                </p>
              </div>
              <Link
                to="/favorites"
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition"
              >
                View All <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {favoriteClinics.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {favoriteClinics.slice(0, 4).map(clinic => (
                  <Link
                    key={clinic.id}
                    to={getClinicUrl(clinic)}
                    className="group flex gap-4 p-4 rounded-2xl border border-gray-100 hover:border-blue-100 hover:bg-blue-50/30 transition"
                  >
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                      <img src={clinic.image_src} alt={clinic.practitioner_name} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900 text-sm truncate group-hover:text-blue-700 transition">{clinic.practitioner_name}</h4>
                      <p className="text-xs text-gray-500 truncate">{clinic.practice_type}</p>
                      <div className="flex items-center gap-1 mt-1.5">
                        <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                        <span className="text-xs font-bold text-gray-800">{clinic.rating}</span>
                        <span className="text-xs text-gray-400">({clinic.number_of_reviews})</span>
                      </div>
                    </div>
                    <Heart className="w-4 h-4 text-red-400 fill-red-400 flex-shrink-0 mt-1" />
                  </Link>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
                <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-8 h-8 text-red-300" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">No saved clinics yet</h3>
                <p className="text-sm text-gray-500 mb-5 max-w-xs mx-auto leading-relaxed">
                  Tap the heart icon on any clinic to save it for later.
                </p>
                <Link
                  to="/"
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-green-600 text-white text-sm font-semibold hover:from-blue-700 hover:to-green-700 transition shadow-md"
                >
                  Explore Clinics
                </Link>
              </div>
            )}
          </SectionFade>
        );

      // ── Security ───────────────────────────────────────────────────────────
      case 'security':
        return (
          <SectionFade tabKey="security">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Security</h2>
              <p className="text-gray-500 text-sm mt-0.5">Manage your account and privacy settings</p>
            </div>

            <div className="space-y-4">
              {/* Inline Password Change */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                    <Lock className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">Password</p>
                    <p className="text-xs text-gray-400 mt-0.5">Set or update your password (optional — you can always sign in with email OTP)</p>
                  </div>
                </div>
                <PasswordChangeForm />
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">Email Verified</p>
                    <p className="text-xs text-gray-400 mt-0.5">{userEmail}</p>
                  </div>
                  <span className="ml-auto text-xs font-semibold text-green-600 bg-green-50 px-2.5 py-1 rounded-full">Verified</span>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
                      <Shield className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">Two-Factor Authentication</p>
                      <p className="text-xs text-gray-400 mt-0.5">Add an extra layer of security to your account</p>
                    </div>
                  </div>
                  <button className="text-sm font-semibold text-blue-600 hover:text-blue-700 underline-offset-2 hover:underline transition">Enable</button>
                </div>
              </div>

              <div className="bg-red-50 rounded-2xl border border-red-100 p-5">
                <h4 className="font-bold text-red-700 mb-1 text-sm">Danger Zone</h4>
                <p className="text-xs text-red-600 mb-4">Once deleted, your account and all associated data will be permanently removed and cannot be recovered.</p>
                <button className="text-sm font-semibold text-red-600 hover:text-red-700 underline-offset-2 hover:underline transition">Delete Account</button>
              </div>
            </div>
          </SectionFade>
        );

      // ── Notifications ──────────────────────────────────────────────────────
      case 'notifications':
        return (
          <SectionFade tabKey="notifications">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Notifications</h2>
              <p className="text-gray-500 text-sm mt-0.5">Choose what alerts you receive</p>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-100">
              <NotificationToggle label="Appointment Reminders" desc="Get notified before your scheduled appointments" icon={CalendarCheck} color="text-blue-500" bg="bg-blue-50" defaultOn={true} />
              <NotificationToggle label="New Messages" desc="Receive alerts when clinics send you a message" icon={MessageSquare} color="text-green-500" bg="bg-green-50" defaultOn={true} />
              <NotificationToggle label="Health Tips" desc="Weekly health articles and wellness advice" icon={Activity} color="text-teal-500" bg="bg-teal-50" defaultOn={false} />
              <NotificationToggle label="Promotions & Offers" desc="Exclusive deals from partner healthcare providers" icon={Star} color="text-amber-500" bg="bg-amber-50" defaultOn={false} />
            </div>
          </SectionFade>
        );

      default:
        return null;
    }
  };

  // ─── Onboarding state ─────────────────────────────────────
  const [showOnboarding, setShowOnboarding] = useState(false);
  const onboardingShownRef = useRef(false);

  // Show onboarding modal on first render if profile is incomplete
  useEffect(() => {
    if (isProfileIncomplete && !onboardingShownRef.current) {
      onboardingShownRef.current = true;
      // Small delay so the page renders first
      const timer = setTimeout(() => setShowOnboarding(true), 600);
      return () => clearTimeout(timer);
    }
  }, [isProfileIncomplete]);

  const handleOnboardingSave = async (form) => {
    if (!supabase || !user?.id) return;

    // Update profile fields
    const updates = {};
    if (form.full_name?.trim()) updates.full_name = form.full_name.trim();
    if (form.phone?.trim()) updates.phone = form.phone.trim();
    if (form.date_of_birth) updates.date_of_birth = form.date_of_birth;

    if (Object.keys(updates).length > 0) {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

      if (error) {
        toast({ title: 'Error', description: 'Could not save profile. Please try again.', variant: 'destructive' });
        return;
      }
    }

    // Set password if provided
    if (form.password?.trim()) {
      const { error: pwError } = await updatePassword(form.password.trim());
      if (pwError) {
        toast({ title: 'Password Error', description: pwError.message || 'Could not set password.', variant: 'destructive' });
      }
    }

    await refreshProfile();
    setShowOnboarding(false);
    toast({ title: 'Profile updated', description: 'Your profile has been saved successfully.' });
  };

  return (
    <>
      <Helmet>
        <title>My Profile — HealthProvida</title>
        <meta name="description" content="Manage your HealthProvida profile, health details, appointments, and saved clinics." />
      </Helmet>

      <div className="min-h-screen bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

          {/* Page title */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
          </div>

          {/* Mobile tab strip */}
          <div className="md:hidden mb-6 -mx-1">
            <div className="flex gap-2 overflow-x-auto pb-2 px-1">
              {navItems.map(item => {
                const Icon = item.icon;
                const active = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    id={`mobile-tab-${item.id}`}
                    onClick={() => setActiveTab(item.id)}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap flex-shrink-0 transition
                      ${active
                        ? 'bg-gradient-to-r from-blue-600 to-green-500 text-white shadow-md'
                        : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                  >
                    <Icon className="w-3.5 h-3.5" /> {item.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex gap-8 items-start">

            {/* Desktop Sidebar */}
            <aside className="w-64 flex-shrink-0 hidden md:block">
              <nav className="space-y-1">
                {navItems.map(item => {
                  const Icon = item.icon;
                  const active = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      id={`tab-${item.id}`}
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-left transition-all duration-200 group
                        ${active
                          ? 'bg-gradient-to-r from-blue-50 to-green-50 border border-blue-100 shadow-sm'
                          : 'hover:bg-gray-50 border border-transparent'
                        }`}
                    >
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition
                        ${active
                          ? 'bg-gradient-to-br from-blue-600 to-green-500 shadow-md'
                          : 'bg-gray-100 group-hover:bg-gray-200'
                        }`}
                      >
                        <Icon className={`w-4 h-4 ${active ? 'text-white' : 'text-gray-500'}`} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className={`text-sm font-semibold truncate ${active ? 'text-blue-700' : 'text-gray-700'}`}>
                          {item.label}
                        </p>
                        <p className={`text-xs truncate ${active ? 'text-blue-400' : 'text-gray-400'}`}>
                          {item.description}
                        </p>
                      </div>
                      {active && <ChevronRight className="w-4 h-4 text-blue-400 flex-shrink-0" />}
                    </button>
                  );
                })}
              </nav>

              {/* Sign out */}
              <div className="mt-4 pt-4 border-t border-gray-100">
                <button
                  id="sign-out-btn"
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-left text-gray-500 hover:bg-red-50 hover:text-red-600 transition group"
                >
                  <div className="w-9 h-9 rounded-xl bg-gray-100 group-hover:bg-red-100 flex items-center justify-center flex-shrink-0 transition">
                    <LogOut className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-semibold">Sign Out</span>
                </button>
              </div>
            </aside>

            {/* Main content */}
            <main className="flex-1 min-w-0">
              <AnimatePresence mode="wait">
                {renderSection()}
              </AnimatePresence>
            </main>

          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <AnimatePresence>
        {showEditModal && (
          <EditProfileModal
            profile={profile}
            onClose={() => setShowEditModal(false)}
            onSave={handleSaveProfile}
          />
        )}
      </AnimatePresence>

      {/* Onboarding Modal */}
      <AnimatePresence>
        {showOnboarding && (
          <OnboardingModal
            onClose={() => setShowOnboarding(false)}
            onSave={handleOnboardingSave}
          />
        )}
      </AnimatePresence>
    </>
  );
}
