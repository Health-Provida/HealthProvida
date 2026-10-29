/**
 * analyticsQueries.js
 * ──────────────────────────────────────────────────────────────
 * Aggregate queries for the provider analytics dashboard.
 * Computes appointment trends, review trends, status breakdowns,
 * and busiest time-slots from existing tables.
 * ──────────────────────────────────────────────────────────────
 */
import { supabase } from './supabase';

/**
 * Fetch appointment counts per day for the last N days.
 */
export async function fetchAppointmentTrend(clinicId, days = 30) {
  if (!supabase || !clinicId) return { data: [], error: { message: 'Not configured' } };

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  const startStr = startDate.toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('appointments')
    .select('appointment_date, status')
    .eq('clinic_id', clinicId)
    .gte('appointment_date', startStr)
    .order('appointment_date', { ascending: true });

  if (error) return { data: [], error };

  // Group by date
  const byDate = {};
  for (let d = new Date(startDate); d <= new Date(); d.setDate(d.getDate() + 1)) {
    const key = d.toISOString().split('T')[0];
    byDate[key] = { date: key, total: 0, completed: 0, cancelled: 0, pending: 0, confirmed: 0 };
  }

  (data || []).forEach((row) => {
    const key = row.appointment_date;
    if (!byDate[key]) byDate[key] = { date: key, total: 0, completed: 0, cancelled: 0, pending: 0, confirmed: 0 };
    byDate[key].total += 1;
    if (row.status === 'completed') byDate[key].completed += 1;
    else if (row.status === 'cancelled') byDate[key].cancelled += 1;
    else if (row.status === 'pending') byDate[key].pending += 1;
    else if (row.status === 'confirmed') byDate[key].confirmed += 1;
  });

  return { data: Object.values(byDate), error: null };
}

/**
 * Fetch appointment status breakdown.
 */
export async function fetchStatusBreakdown(clinicId) {
  if (!supabase || !clinicId) return { data: [], error: { message: 'Not configured' } };

  const { data, error } = await supabase
    .from('appointments')
    .select('status')
    .eq('clinic_id', clinicId);

  if (error) return { data: [], error };

  const counts = {};
  (data || []).forEach((row) => {
    counts[row.status] = (counts[row.status] || 0) + 1;
  });

  const result = Object.entries(counts).map(([status, count]) => ({ status, count }));
  return { data: result, error: null };
}

/**
 * Fetch busiest hours (appointment_time distribution).
 */
export async function fetchBusiestHours(clinicId) {
  if (!supabase || !clinicId) return { data: [], error: { message: 'Not configured' } };

  const { data, error } = await supabase
    .from('appointments')
    .select('appointment_time')
    .eq('clinic_id', clinicId)
    .in('status', ['completed', 'confirmed', 'pending']);

  if (error) return { data: [], error };

  const hourCounts = {};
  (data || []).forEach((row) => {
    if (row.appointment_time) {
      const hour = parseInt(row.appointment_time.split(':')[0], 10);
      const label = `${hour.toString().padStart(2, '0')}:00`;
      hourCounts[label] = (hourCounts[label] || 0) + 1;
    }
  });

  const result = Object.entries(hourCounts)
    .map(([hour, count]) => ({ hour, count }))
    .sort((a, b) => a.hour.localeCompare(b.hour));

  return { data: result, error: null };
}

/**
 * Fetch busiest days of the week.
 */
export async function fetchBusiestDays(clinicId) {
  if (!supabase || !clinicId) return { data: [], error: { message: 'Not configured' } };

  const { data, error } = await supabase
    .from('appointments')
    .select('appointment_date')
    .eq('clinic_id', clinicId)
    .in('status', ['completed', 'confirmed', 'pending']);

  if (error) return { data: [], error };

  const dayOrder = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayCounts = {};
  dayOrder.forEach((d) => { dayCounts[d] = 0; });

  (data || []).forEach((row) => {
    if (row.appointment_date) {
      const dayName = new Date(row.appointment_date).toLocaleDateString('en-US', { weekday: 'long' });
      dayCounts[dayName] = (dayCounts[dayName] || 0) + 1;
    }
  });

  return { data: dayOrder.map((day) => ({ day: day.slice(0, 3), count: dayCounts[day] })), error: null };
}

/**
 * Fetch rating distribution (how many 1★, 2★, ... 5★).
 */
export async function fetchRatingDistribution(clinicId) {
  if (!supabase || !clinicId) return { data: [], error: { message: 'Not configured' } };

  const { data, error } = await supabase
    .from('reviews')
    .select('rating')
    .eq('clinic_id', clinicId);

  if (error) return { data: [], error };

  const dist = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  (data || []).forEach((row) => {
    if (row.rating >= 1 && row.rating <= 5) dist[row.rating] += 1;
  });

  return {
    data: [5, 4, 3, 2, 1].map((r) => ({ rating: r, count: dist[r] })),
    error: null,
  };
}

/**
 * Fetch monthly review counts for the last N months.
 */
export async function fetchReviewTrend(clinicId, months = 6) {
  if (!supabase || !clinicId) return { data: [], error: { message: 'Not configured' } };

  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - months);

  const { data, error } = await supabase
    .from('reviews')
    .select('created_at, rating')
    .eq('clinic_id', clinicId)
    .gte('created_at', startDate.toISOString())
    .order('created_at', { ascending: true });

  if (error) return { data: [], error };

  // Group by month
  const byMonth = {};
  for (let i = 0; i < months; i++) {
    const d = new Date();
    d.setMonth(d.getMonth() - (months - 1 - i));
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const label = d.toLocaleDateString('en-US', { month: 'short' });
    byMonth[key] = { month: label, count: 0, totalRating: 0 };
  }

  (data || []).forEach((row) => {
    const d = new Date(row.created_at);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    if (byMonth[key]) {
      byMonth[key].count += 1;
      byMonth[key].totalRating += row.rating || 0;
    }
  });

  return {
    data: Object.values(byMonth).map((m) => ({
      ...m,
      avgRating: m.count > 0 ? (m.totalRating / m.count).toFixed(1) : null,
    })),
    error: null,
  };
}
