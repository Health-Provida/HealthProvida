/**
 * ProviderSettingsPage.jsx
 * Account settings: edit profile, change password, notification preferences.
 */
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Lock, Bell, Save, CheckCircle, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/utils/supabase';

export default function ProviderSettingsPage() {
  const { profile, refreshProfile } = useAuth();

  // Profile form
  const [profileForm, setProfileForm] = useState({
    fullName: '',
    email: '',
    phone: '',
  });

  // Password form
  const [passwordForm, setPasswordForm] = useState({
    newPassword: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);

  // Notification preferences
  const [notifPrefs, setNotifPrefs] = useState({
    emailAppointments: true,
    emailReviews: true,
    emailMarketing: true,
  });

  const [saving, setSaving] = useState(null); // which section is saving
  const [message, setMessage] = useState(null);

  useEffect(() => {
    if (profile) {
      setProfileForm({
        fullName: profile.full_name || '',
        email: profile.email || '',
        phone: profile.phone || '',
      });
      setNotifPrefs({
        emailAppointments: true,
        emailReviews: true,
        emailMarketing: !profile.promo_opt_out,
      });
    }
  }, [profile]);

  const handleSaveProfile = async () => {
    setSaving('profile');
    setMessage(null);

    if (!supabase) {
      setMessage({ type: 'error', text: 'Not connected to database.' });
      setSaving(null);
      return;
    }

    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: profileForm.fullName.trim(),
        phone: profileForm.phone.trim() || null,
      })
      .eq('id', profile.id);

    if (error) {
      setMessage({ type: 'error', text: error.message || 'Failed to update profile.' });
    } else {
      await refreshProfile();
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    }
    setSaving(null);
  };

  const handleChangePassword = async () => {
    if (passwordForm.newPassword.length < 8) {
      setMessage({ type: 'error', text: 'Password must be at least 8 characters.' });
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match.' });
      return;
    }

    setSaving('password');
    setMessage(null);

    if (!supabase) {
      setMessage({ type: 'error', text: 'Not connected to database.' });
      setSaving(null);
      return;
    }

    const { error } = await supabase.auth.updateUser({
      password: passwordForm.newPassword,
    });

    if (error) {
      setMessage({ type: 'error', text: error.message || 'Failed to change password.' });
    } else {
      setMessage({ type: 'success', text: 'Password changed successfully!' });
      setPasswordForm({ newPassword: '', confirmPassword: '' });
    }
    setSaving(null);
  };

  const handleSaveNotifications = async () => {
    setSaving('notifications');
    setMessage(null);

    if (!supabase) {
      setMessage({ type: 'error', text: 'Not connected to database.' });
      setSaving(null);
      return;
    }

    const { error } = await supabase
      .from('profiles')
      .update({ promo_opt_out: !notifPrefs.emailMarketing })
      .eq('id', profile.id);

    if (error) {
      setMessage({ type: 'error', text: 'Failed to update preferences.' });
    } else {
      setMessage({ type: 'success', text: 'Notification preferences saved!' });
    }
    setSaving(null);
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 text-sm mt-1">Manage your account and preferences</p>
      </div>

      {/* Message */}
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className={`px-4 py-3 rounded-xl text-sm flex items-center gap-2 ${
            message.type === 'success'
              ? 'bg-green-50 border border-green-200 text-green-700'
              : 'bg-red-50 border border-red-200 text-red-700'
          }`}
        >
          {message.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {message.text}
        </motion.div>
      )}

      {/* Profile Section */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
            <User className="w-5 h-5 text-teal-500" /> Personal Information
          </h2>
          <button
            onClick={handleSaveProfile}
            disabled={saving === 'profile'}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-teal-600 to-green-600 hover:from-teal-700 hover:to-green-700 text-white text-sm font-semibold shadow-sm disabled:opacity-60 transition"
          >
            <Save className="w-4 h-4" />
            {saving === 'profile' ? 'Saving...' : 'Save'}
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
            <input
              value={profileForm.fullName}
              onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:border-teal-400 focus:ring-2 focus:ring-teal-100 outline-none transition text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
            <input
              value={profileForm.email}
              disabled
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-100 text-gray-500 text-sm cursor-not-allowed"
            />
            <p className="text-xs text-gray-400 mt-1">Email cannot be changed here. Contact support for assistance.</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone</label>
            <input
              value={profileForm.phone}
              onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
              placeholder="+234 800 000 0000"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:border-teal-400 focus:ring-2 focus:ring-teal-100 outline-none transition text-sm"
            />
          </div>
        </div>
      </div>

      {/* Password Section */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
            <Lock className="w-5 h-5 text-teal-500" /> Change Password
          </h2>
          <button
            onClick={handleChangePassword}
            disabled={saving === 'password' || !passwordForm.newPassword}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-teal-600 to-green-600 hover:from-teal-700 hover:to-green-700 text-white text-sm font-semibold shadow-sm disabled:opacity-60 transition"
          >
            <Save className="w-4 h-4" />
            {saving === 'password' ? 'Saving...' : 'Update'}
          </button>
        </div>
        <div className="space-y-4">
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">New Password</label>
            <input
              type={showPassword ? 'text' : 'password'}
              value={passwordForm.newPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
              placeholder="Min 8 characters"
              className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:border-teal-400 focus:ring-2 focus:ring-teal-100 outline-none transition text-sm"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-[38px] text-gray-400 hover:text-gray-600 transition"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm Password</label>
            <input
              type={showPassword ? 'text' : 'password'}
              value={passwordForm.confirmPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
              placeholder="Re-enter new password"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:border-teal-400 focus:ring-2 focus:ring-teal-100 outline-none transition text-sm"
            />
          </div>
        </div>
      </div>

      {/* Notification Preferences */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
            <Bell className="w-5 h-5 text-teal-500" /> Notifications
          </h2>
          <button
            onClick={handleSaveNotifications}
            disabled={saving === 'notifications'}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-teal-600 to-green-600 hover:from-teal-700 hover:to-green-700 text-white text-sm font-semibold shadow-sm disabled:opacity-60 transition"
          >
            <Save className="w-4 h-4" />
            {saving === 'notifications' ? 'Saving...' : 'Save'}
          </button>
        </div>
        <div className="space-y-4">
          {[
            { key: 'emailAppointments', label: 'Appointment notifications', desc: 'Receive emails when patients book, cancel, or modify appointments' },
            { key: 'emailReviews', label: 'Review notifications', desc: 'Receive emails when patients leave new reviews' },
            { key: 'emailMarketing', label: 'Marketing communications', desc: 'Receive promotional emails about HealthProvida features and updates' },
          ].map((pref) => (
            <label key={pref.key} className="flex items-start gap-4 cursor-pointer group p-3 rounded-xl hover:bg-gray-50 transition">
              <div className="relative mt-0.5">
                <input
                  type="checkbox"
                  checked={notifPrefs[pref.key]}
                  onChange={(e) => setNotifPrefs({ ...notifPrefs, [pref.key]: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-gray-200 peer-checked:bg-teal-500 rounded-full transition-colors" />
                <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow peer-checked:translate-x-4 transition-transform" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{pref.label}</p>
                <p className="text-xs text-gray-400 mt-0.5">{pref.desc}</p>
              </div>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
