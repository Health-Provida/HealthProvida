/**
 * AdminDashboard.jsx
 * Overview dashboard with stat cards and quick actions.
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Building2, FileText, Users, Calendar, Star, MessageSquare,
  Shield, TrendingUp, Clock, CheckCircle, XCircle, AlertCircle
} from 'lucide-react';
import StatCard from '@/components/admin/StatCard';
import { fetchDashboardStats } from '@/utils/adminQueries';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading(true);
    const { data, error: fetchError } = await fetchDashboardStats();
    if (fetchError) {
      setError(fetchError.message || 'Failed to load dashboard stats');
    } else {
      setStats(data);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">Welcome to the HealthProvida admin panel</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse">
              <div className="h-4 bg-gray-100 rounded w-24 mb-3" />
              <div className="h-8 bg-gray-100 rounded w-16" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
          <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
          <p className="text-red-700 font-medium">{error}</p>
          <button
            onClick={loadStats}
            className="mt-4 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-100 rounded-xl transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const s = stats || {};

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Overview of your platform's activity</p>
      </div>

      {/* Primary stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Pending Applications"
          value={s.pending_applications ?? 0}
          icon={FileText}
          color="amber"
          onClick={() => navigate('/admin/applications')}
        />
        <StatCard
          label="Active Clinics"
          value={s.active_clinics ?? 0}
          icon={Building2}
          color="green"
          onClick={() => navigate('/admin/clinics')}
        />
        <StatCard
          label="Total Users"
          value={s.total_users ?? 0}
          icon={Users}
          color="blue"
          onClick={() => navigate('/admin/users')}
        />
        <StatCard
          label="Unread Messages"
          value={s.unread_messages ?? 0}
          icon={MessageSquare}
          color="red"
          onClick={() => navigate('/admin/messages')}
        />
      </div>

      {/* Secondary stats */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Platform Overview</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Total Clinics"
            value={s.total_clinics ?? 0}
            icon={Building2}
            color="teal"
          />
          <StatCard
            label="Verified Clinics"
            value={s.verified_clinics ?? 0}
            icon={CheckCircle}
            color="green"
          />
          <StatCard
            label="Total Appointments"
            value={s.total_appointments ?? 0}
            icon={Calendar}
            color="blue"
          />
          <StatCard
            label="Today's Appointments"
            value={s.today_appointments ?? 0}
            icon={Clock}
            color="purple"
          />
        </div>
      </div>

      {/* Breakdown row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Applications breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm"
        >
          <h3 className="text-base font-semibold text-gray-900 mb-4">Applications Summary</h3>
          <div className="space-y-3">
            <StatRow
              icon={<Clock className="w-4 h-4 text-amber-500" />}
              label="Pending"
              value={s.pending_applications ?? 0}
              color="amber"
              onClick={() => navigate('/admin/applications')}
            />
            <StatRow
              icon={<CheckCircle className="w-4 h-4 text-emerald-500" />}
              label="Approved"
              value={s.approved_applications ?? 0}
              color="emerald"
            />
            <StatRow
              icon={<XCircle className="w-4 h-4 text-red-500" />}
              label="Rejected"
              value={s.rejected_applications ?? 0}
              color="red"
            />
            <div className="pt-2 border-t border-gray-100 flex justify-between">
              <span className="text-sm font-medium text-gray-700">Total</span>
              <span className="text-sm font-bold text-gray-900">{s.total_applications ?? 0}</span>
            </div>
          </div>
        </motion.div>

        {/* Users breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm"
        >
          <h3 className="text-base font-semibold text-gray-900 mb-4">Users Breakdown</h3>
          <div className="space-y-3">
            <StatRow
              icon={<Users className="w-4 h-4 text-gray-500" />}
              label="Patients"
              value={s.total_patients ?? 0}
              color="gray"
            />
            <StatRow
              icon={<Building2 className="w-4 h-4 text-green-500" />}
              label="Providers"
              value={s.total_providers ?? 0}
              color="green"
            />
            <StatRow
              icon={<Shield className="w-4 h-4 text-blue-500" />}
              label="Admins"
              value={s.total_admins ?? 0}
              color="blue"
            />
            <div className="pt-2 border-t border-gray-100 flex justify-between">
              <span className="text-sm font-medium text-gray-700">Total</span>
              <span className="text-sm font-bold text-gray-900">{s.total_users ?? 0}</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Quick stats footer */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Total Reviews" value={s.total_reviews ?? 0} icon={Star} color="amber" />
        <StatCard label="Active HMOs" value={s.total_hmos ?? 0} icon={Shield} color="teal" />
        <StatCard label="Pending Appointments" value={s.pending_appointments ?? 0} icon={Calendar} color="purple" />
        <StatCard label="Inactive Clinics" value={s.inactive_clinics ?? 0} icon={Building2} color="slate" />
      </div>
    </div>
  );
}

function StatRow({ icon, label, value, color, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`flex items-center justify-between py-2 px-3 rounded-xl hover:bg-gray-50 transition ${onClick ? 'cursor-pointer' : ''}`}
    >
      <div className="flex items-center gap-2.5">
        {icon}
        <span className="text-sm text-gray-600">{label}</span>
      </div>
      <span className="text-sm font-bold text-gray-900 tabular-nums">{value}</span>
    </div>
  );
}
