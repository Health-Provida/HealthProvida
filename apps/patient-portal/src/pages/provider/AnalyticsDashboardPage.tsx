/**
 * AnalyticsDashboardPage.jsx
 * Visual analytics with CSS-based charts — no external charting library needed.
 */
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Clock, Star, Calendar, PieChart, AlertCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { fetchProviderClinic } from '@/utils/providerQueries';
import {
  fetchAppointmentTrend,
  fetchStatusBreakdown,
  fetchBusiestHours,
  fetchBusiestDays,
  fetchRatingDistribution,
  fetchReviewTrend,
} from '@/utils/analyticsQueries';

// ─── Color Constants ──────────────────────────────────────────
const STATUS_COLORS = {
  pending: '#f59e0b', confirmed: '#3b82f6', completed: '#10b981', cancelled: '#ef4444', no_show: '#6b7280',
};
const RATING_COLORS = { 5: '#10b981', 4: '#22c55e', 3: '#f59e0b', 2: '#f97316', 1: '#ef4444' };
const BAR_GRADIENT = 'linear-gradient(180deg, #14b8a6, #0d9488)';

export default function AnalyticsDashboardPage() {
  const [clinicId, setClinicId] = useState(null);
  const [trend, setTrend] = useState([]);
  const [statusBreakdown, setStatusBreakdown] = useState([]);
  const [busiestHours, setBusiestHours] = useState([]);
  const [busiestDays, setBusiestDays] = useState([]);
  const [ratingDist, setRatingDist] = useState([]);
  const [reviewTrend, setReviewTrend] = useState([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState(30);

  const { user } = useAuth();

  useEffect(() => { if (user?.id) init(); }, [user?.id]);

  const init = async () => {
    const { data } = await fetchProviderClinic(user.id);
    if (data) {
      setClinicId(data.id);
      await loadAll(data.id);
    }
    setLoading(false);
  };

  const loadAll = async (cId) => {
    setLoading(true);
    const [t, sb, bh, bd, rd, rt] = await Promise.all([
      fetchAppointmentTrend(cId, period),
      fetchStatusBreakdown(cId),
      fetchBusiestHours(cId),
      fetchBusiestDays(cId),
      fetchRatingDistribution(cId),
      fetchReviewTrend(cId, 6),
    ]);
    setTrend(t.data || []);
    setStatusBreakdown(sb.data || []);
    setBusiestHours(bh.data || []);
    setBusiestDays(bd.data || []);
    setRatingDist(rd.data || []);
    setReviewTrend(rt.data || []);
    setLoading(false);
  };

  useEffect(() => {
    if (clinicId) loadAll(clinicId);
  }, [period]);

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6 h-72 animate-pulse">
              <div className="h-4 bg-gray-100 rounded w-32 mb-4" />
              <div className="h-full bg-gray-50 rounded-xl" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const totalAppts = statusBreakdown.reduce((s, r) => s + r.count, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-500 text-sm mt-1">Track performance and trends for your clinic</p>
        </div>
        <div className="flex gap-2">
          {[7, 30, 90].map((d) => (
            <button
              key={d}
              onClick={() => setPeriod(d)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
                period === d ? 'bg-slate-900 text-white shadow-sm' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {d}d
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ── Appointment Trend (Bar Chart) ──────────── */}
        <ChartCard title="Appointment Volume" icon={BarChart3} span="lg:col-span-2">
          {trend.length === 0 ? (
            <EmptyChart label="No appointment data" />
          ) : (
            <BarChartCSS data={trend.slice(-Math.min(period, 30))} valueKey="total" labelKey="date" color={BAR_GRADIENT} />
          )}
        </ChartCard>

        {/* ── Status Breakdown (Donut) ───────────────── */}
        <ChartCard title="Status Breakdown" icon={PieChart}>
          {totalAppts === 0 ? (
            <EmptyChart label="No appointments" />
          ) : (
            <DonutChart data={statusBreakdown} total={totalAppts} colorMap={STATUS_COLORS} />
          )}
        </ChartCard>

        {/* ── Rating Distribution ────────────────────── */}
        <ChartCard title="Rating Distribution" icon={Star}>
          {ratingDist.every((r) => r.count === 0) ? (
            <EmptyChart label="No reviews yet" />
          ) : (
            <HorizontalBarChart data={ratingDist} labelKey="rating" valueKey="count" colorMap={RATING_COLORS} starLabel />
          )}
        </ChartCard>

        {/* ── Busiest Days ──────────────────────────── */}
        <ChartCard title="Busiest Days" icon={Calendar}>
          {busiestDays.every((d) => d.count === 0) ? (
            <EmptyChart label="No data yet" />
          ) : (
            <BarChartCSS data={busiestDays} valueKey="count" labelKey="day" color={BAR_GRADIENT} />
          )}
        </ChartCard>

        {/* ── Busiest Hours ─────────────────────────── */}
        <ChartCard title="Busiest Hours" icon={Clock}>
          {busiestHours.length === 0 ? (
            <EmptyChart label="No data yet" />
          ) : (
            <BarChartCSS data={busiestHours} valueKey="count" labelKey="hour" color="linear-gradient(180deg, #8b5cf6, #7c3aed)" />
          )}
        </ChartCard>

        {/* ── Review Trend ──────────────────────────── */}
        <ChartCard title="Reviews (Last 6 Months)" icon={TrendingUp} span="lg:col-span-2">
          {reviewTrend.length === 0 ? (
            <EmptyChart label="No review data" />
          ) : (
            <div>
              <BarChartCSS data={reviewTrend} valueKey="count" labelKey="month" color="linear-gradient(180deg, #f59e0b, #d97706)" />
              <div className="flex justify-center gap-6 mt-4">
                {reviewTrend.filter((m) => m.avgRating).map((m) => (
                  <div key={m.month} className="text-center">
                    <p className="text-xs text-gray-400">{m.month}</p>
                    <p className="text-sm font-bold text-gray-700 flex items-center gap-0.5 justify-center">
                      {m.avgRating} <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </ChartCard>
      </div>
    </div>
  );
}

// ─── Chart Card Wrapper ──────────────────────────────────────

function ChartCard({ title, icon: Icon, children, span }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white rounded-2xl border border-gray-100 shadow-sm p-6 ${span || ''}`}
    >
      <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2 mb-5">
        <Icon className="w-4 h-4 text-teal-500" /> {title}
      </h3>
      {children}
    </motion.div>
  );
}

function EmptyChart({ label }) {
  return (
    <div className="h-40 flex items-center justify-center">
      <p className="text-sm text-gray-400">{label}</p>
    </div>
  );
}

// ─── CSS Bar Chart ───────────────────────────────────────────

function BarChartCSS({ data, valueKey, labelKey, color }) {
  const max = Math.max(...data.map((d) => d[valueKey]), 1);

  return (
    <div className="flex items-end gap-1.5 h-40 px-1">
      {data.map((d, i) => {
        const pct = (d[valueKey] / max) * 100;
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-1.5 min-w-0 group">
            <span className="text-[10px] text-gray-500 font-medium opacity-0 group-hover:opacity-100 transition tabular-nums">
              {d[valueKey]}
            </span>
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: `${Math.max(pct, 2)}%` }}
              transition={{ duration: 0.5, delay: i * 0.02 }}
              className="w-full rounded-t-md min-h-[2px] group-hover:opacity-80 transition-opacity"
              style={{ background: color }}
              title={`${d[labelKey]}: ${d[valueKey]}`}
            />
            <span className="text-[9px] text-gray-400 truncate w-full text-center leading-none">
              {labelKey === 'date' ? new Date(d[labelKey]).getDate() : d[labelKey]}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ─── CSS Donut Chart ─────────────────────────────────────────

function DonutChart({ data, total, colorMap }) {
  let cumulative = 0;
  const segments = data.map((d) => {
    const pct = (d.count / total) * 100;
    const start = cumulative;
    cumulative += pct;
    return { ...d, pct, start };
  });

  const gradientStops = segments
    .map((s) => `${colorMap[s.status] || '#94a3b8'} ${s.start}% ${s.start + s.pct}%`)
    .join(', ');

  return (
    <div className="flex items-center gap-8">
      <div
        className="w-36 h-36 rounded-full flex-shrink-0 relative"
        style={{
          background: `conic-gradient(${gradientStops})`,
        }}
      >
        <div className="absolute inset-4 bg-white rounded-full flex items-center justify-center">
          <div className="text-center">
            <p className="text-xl font-bold text-gray-900">{total}</p>
            <p className="text-[10px] text-gray-400">total</p>
          </div>
        </div>
      </div>
      <div className="space-y-2 flex-1">
        {segments.map((s) => (
          <div key={s.status} className="flex items-center gap-2.5">
            <div className="w-3 h-3 rounded-sm flex-shrink-0" style={{ background: colorMap[s.status] || '#94a3b8' }} />
            <span className="text-xs text-gray-600 flex-1 capitalize">{s.status?.replace('_', ' ')}</span>
            <span className="text-xs font-bold text-gray-900 tabular-nums">{s.count}</span>
            <span className="text-[10px] text-gray-400 tabular-nums w-10 text-right">{s.pct.toFixed(0)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── CSS Horizontal Bar Chart ────────────────────────────────

function HorizontalBarChart({ data, labelKey, valueKey, colorMap, starLabel }) {
  const max = Math.max(...data.map((d) => d[valueKey]), 1);

  return (
    <div className="space-y-3">
      {data.map((d) => {
        const pct = (d[valueKey] / max) * 100;
        return (
          <div key={d[labelKey]} className="flex items-center gap-3">
            <div className="w-12 flex items-center gap-1 flex-shrink-0">
              {starLabel && <Star className="w-3 h-3 text-amber-400 fill-amber-400" />}
              <span className="text-sm font-medium text-gray-700">{d[labelKey]}</span>
            </div>
            <div className="flex-1 h-5 bg-gray-100 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.6 }}
                className="h-full rounded-full"
                style={{ background: colorMap?.[d[labelKey]] || '#14b8a6' }}
              />
            </div>
            <span className="text-xs font-bold text-gray-700 tabular-nums w-8 text-right">{d[valueKey]}</span>
          </div>
        );
      })}
    </div>
  );
}
