/**
 * ProviderDashboard.jsx
 * Overview page with stat cards, upcoming appointments, and recent reviews.
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Calendar, Star, Clock, Users, TrendingUp,
  AlertCircle, ChevronRight, CheckCircle, XCircle
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import {
  fetchProviderClinic,
  fetchProviderDashboardStats,
  fetchUpcomingAppointments,
  fetchRecentReviews,
} from '@/utils/providerQueries';

const STATUS_STYLES = {
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  confirmed: 'bg-blue-50 text-blue-700 border-blue-200',
  completed: 'bg-green-50 text-green-700 border-green-200',
  cancelled: 'bg-red-50 text-red-700 border-red-200',
  no_show: 'bg-gray-50 text-gray-700 border-gray-200',
};

export default function ProviderDashboard() {
  const [clinic, setClinic] = useState(null);
  const [stats, setStats] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.id) loadDashboard();
  }, [user?.id]);

  const loadDashboard = async () => {
    setLoading(true);
    setError(null);

    const { data: clinicData, error: clinicErr } = await fetchProviderClinic(user.id);
    if (clinicErr || !clinicData) {
      setError('Could not load your clinic. Please ensure your provider application has been approved.');
      setLoading(false);
      return;
    }

    setClinic(clinicData);

    const [statsRes, apptsRes, reviewsRes] = await Promise.all([
      fetchProviderDashboardStats(clinicData.id),
      fetchUpcomingAppointments(clinicData.id, 5),
      fetchRecentReviews(clinicData.id, 3),
    ]);

    setStats(statsRes.data);
    setAppointments(apptsRes.data || []);
    setReviews(reviewsRes.data || []);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">Loading your clinic data...</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
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
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-center">
          <AlertCircle className="w-10 h-10 text-amber-400 mx-auto mb-3" />
          <p className="text-amber-800 font-medium">{error}</p>
          <button
            onClick={loadDashboard}
            className="mt-4 px-4 py-2 text-sm font-medium text-amber-600 hover:bg-amber-100 rounded-xl transition"
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
        <p className="text-gray-500 text-sm mt-1">
          Welcome back — here's how <strong className="text-gray-700">{clinic?.practitioner_name}</strong> is doing
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Today's Appointments"
          value={s.today_appointments ?? 0}
          icon={Calendar}
          color="blue"
          onClick={() => navigate('/provider/appointments')}
        />
        <StatCard
          label="Pending"
          value={s.pending_appointments ?? 0}
          icon={Clock}
          color="amber"
          onClick={() => navigate('/provider/appointments')}
        />
        <StatCard
          label="Total Reviews"
          value={s.total_reviews ?? 0}
          icon={Star}
          color="purple"
          onClick={() => navigate('/provider/reviews')}
        />
        <StatCard
          label="Average Rating"
          value={s.average_rating ? Number(s.average_rating).toFixed(1) : '—'}
          icon={TrendingUp}
          color="green"
          subtitle={s.number_of_reviews ? `${s.number_of_reviews} reviews` : null}
        />
      </div>

      {/* Two-column: Upcoming Appointments + Recent Reviews */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Appointments */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
        >
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
            <h2 className="text-base font-semibold text-gray-900">Upcoming Appointments</h2>
            <button
              onClick={() => navigate('/provider/appointments')}
              className="text-xs font-medium text-teal-600 hover:text-teal-700 flex items-center gap-1 transition"
            >
              View all <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="divide-y divide-gray-50">
            {appointments.length === 0 ? (
              <div className="px-6 py-8 text-center">
                <Calendar className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-400">No upcoming appointments</p>
              </div>
            ) : (
              appointments.map((appt) => (
                <div key={appt.id} className="px-6 py-3.5 hover:bg-gray-50/50 transition flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-5 h-5 text-blue-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {appt.profiles?.full_name || 'Patient'}
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(appt.appointment_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      {' · '}
                      {appt.appointment_time?.slice(0, 5)}
                    </p>
                  </div>
                  <span className={`px-2.5 py-1 text-[10px] font-bold uppercase rounded-full border ${STATUS_STYLES[appt.status] || STATUS_STYLES.pending}`}>
                    {appt.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </motion.div>

        {/* Recent Reviews */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
        >
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
            <h2 className="text-base font-semibold text-gray-900">Recent Reviews</h2>
            <button
              onClick={() => navigate('/provider/reviews')}
              className="text-xs font-medium text-teal-600 hover:text-teal-700 flex items-center gap-1 transition"
            >
              View all <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="divide-y divide-gray-50">
            {reviews.length === 0 ? (
              <div className="px-6 py-8 text-center">
                <Star className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-400">No reviews yet</p>
              </div>
            ) : (
              reviews.map((review) => (
                <div key={review.id} className="px-6 py-4">
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-sm font-medium text-gray-900">{review.author_name}</p>
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${i < review.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200'}`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{review.review_text}</p>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// ─── Stat Card ──────────────────────────────────────────────

const STAT_COLORS = {
  blue: { bg: 'bg-blue-50', icon: 'text-blue-500', ring: 'ring-blue-100' },
  amber: { bg: 'bg-amber-50', icon: 'text-amber-500', ring: 'ring-amber-100' },
  green: { bg: 'bg-emerald-50', icon: 'text-emerald-500', ring: 'ring-emerald-100' },
  purple: { bg: 'bg-purple-50', icon: 'text-purple-500', ring: 'ring-purple-100' },
  teal: { bg: 'bg-teal-50', icon: 'text-teal-500', ring: 'ring-teal-100' },
};

function StatCard({ label, value, icon: Icon, color = 'blue', subtitle, onClick }) {
  const c = STAT_COLORS[color] || STAT_COLORS.blue;
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={onClick}
      className={`bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all duration-200 ${onClick ? 'cursor-pointer' : ''}`}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</span>
        <div className={`w-9 h-9 rounded-xl ${c.bg} flex items-center justify-center`}>
          <Icon className={`w-[18px] h-[18px] ${c.icon}`} />
        </div>
      </div>
      <p className="text-2xl font-bold text-gray-900 tabular-nums">{value}</p>
      {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
    </motion.div>
  );
}
