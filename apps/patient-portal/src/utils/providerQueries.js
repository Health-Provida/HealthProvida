/**
 * providerQueries.js
 * ──────────────────────────────────────────────────────────────
 * Supabase query functions scoped to the authenticated provider's
 * own clinic. Used by the Provider Dashboard pages.
 * ──────────────────────────────────────────────────────────────
 */
import { supabase } from './supabase';

// ─── Clinic ────────────────────────────────────────────────────

/**
 * Fetch the clinic owned by the given user.
 * A provider owns exactly one clinic (created when their application was approved).
 */
export async function fetchProviderClinic(userId) {
  if (!supabase || !userId) return { data: null, error: { message: 'Not configured' } };

  const { data, error } = await supabase
    .from('clinics')
    .select(`
      *,
      clinic_tags(tag),
      clinic_specialties(specialty),
      clinic_equipment(equipment_name),
      clinic_hmos(hmo_id, hmos(id, name)),
      clinic_operating_hours(day, is_open, open_time, close_time)
    `)
    .eq('owner_id', userId)
    .limit(1)
    .single();

  return { data, error };
}

/**
 * Update basic clinic details.
 */
export async function updateClinicDetails(clinicId, updates) {
  if (!supabase) return { data: null, error: { message: 'Not configured' } };

  const { data, error } = await supabase
    .from('clinics')
    .update({
      practitioner_name: updates.practitionerName,
      address: updates.address,
      phone: updates.phone,
      email: updates.email,
      practice_type: updates.practiceType,
      updated_at: new Date().toISOString(),
    })
    .eq('id', clinicId)
    .select()
    .single();

  return { data, error };
}

/**
 * Replace clinic tags (delete all, insert new).
 */
export async function updateClinicTags(clinicId, tags) {
  if (!supabase) return { error: { message: 'Not configured' } };

  // Delete existing
  await supabase.from('clinic_tags').delete().eq('clinic_id', clinicId);

  if (tags.length === 0) return { error: null };

  const { error } = await supabase
    .from('clinic_tags')
    .insert(tags.map((tag) => ({ clinic_id: clinicId, tag })));

  return { error };
}

/**
 * Replace clinic specialties.
 */
export async function updateClinicSpecialties(clinicId, specialties) {
  if (!supabase) return { error: { message: 'Not configured' } };

  await supabase.from('clinic_specialties').delete().eq('clinic_id', clinicId);

  if (specialties.length === 0) return { error: null };

  const { error } = await supabase
    .from('clinic_specialties')
    .insert(specialties.map((specialty) => ({ clinic_id: clinicId, specialty })));

  return { error };
}

/**
 * Replace clinic equipment.
 */
export async function updateClinicEquipment(clinicId, equipment) {
  if (!supabase) return { error: { message: 'Not configured' } };

  await supabase.from('clinic_equipment').delete().eq('clinic_id', clinicId);

  if (equipment.length === 0) return { error: null };

  const { error } = await supabase
    .from('clinic_equipment')
    .insert(equipment.map((equipment_name) => ({ clinic_id: clinicId, equipment_name })));

  return { error };
}

/**
 * Replace clinic HMOs (delete all, insert new by HMO ID).
 * @param {string} clinicId
 * @param {string[]} hmoIds  – array of HMO UUIDs
 */
export async function updateClinicHMOs(clinicId, hmoIds) {
  if (!supabase) return { error: { message: 'Not configured' } };

  await supabase.from('clinic_hmos').delete().eq('clinic_id', clinicId);

  if (hmoIds.length === 0) return { error: null };

  const { error } = await supabase
    .from('clinic_hmos')
    .insert(hmoIds.map((hmo_id) => ({ clinic_id: clinicId, hmo_id })));

  return { error };
}

// ─── Appointments ──────────────────────────────────────────────

/**
 * Fetch appointments for a clinic with optional filters.
 */
export async function fetchProviderAppointments(clinicId, { status, dateFrom, dateTo, page = 1, pageSize = 20 } = {}) {
  if (!supabase || !clinicId) return { data: [], count: 0, error: { message: 'Not configured' } };

  let query = supabase
    .from('appointments')
    .select('*, profiles!appointments_patient_id_fkey(full_name, email, phone)', { count: 'exact' })
    .eq('clinic_id', clinicId)
    .order('appointment_date', { ascending: false })
    .order('appointment_time', { ascending: false });

  if (status && status !== 'all') {
    query = query.eq('status', status);
  }
  if (dateFrom) {
    query = query.gte('appointment_date', dateFrom);
  }
  if (dateTo) {
    query = query.lte('appointment_date', dateTo);
  }

  // Pagination
  const from = (page - 1) * pageSize;
  query = query.range(from, from + pageSize - 1);

  const { data, error, count } = await query;
  return { data: data || [], count: count || 0, error };
}

/**
 * Update an appointment's status.
 */
export async function updateAppointmentStatus(appointmentId, status) {
  if (!supabase) return { error: { message: 'Not configured' } };

  const { data, error } = await supabase
    .from('appointments')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', appointmentId)
    .select()
    .single();

  return { data, error };
}

// ─── Reviews ───────────────────────────────────────────────────

/**
 * Fetch reviews for a clinic.
 */
export async function fetchProviderReviews(clinicId, { rating, page = 1, pageSize = 20 } = {}) {
  if (!supabase || !clinicId) return { data: [], count: 0, error: { message: 'Not configured' } };

  let query = supabase
    .from('reviews')
    .select('*', { count: 'exact' })
    .eq('clinic_id', clinicId)
    .order('created_at', { ascending: false });

  if (rating) {
    query = query.eq('rating', rating);
  }

  const from = (page - 1) * pageSize;
  query = query.range(from, from + pageSize - 1);

  const { data, error, count } = await query;
  return { data: data || [], count: count || 0, error };
}

// ─── Schedule & Slots ──────────────────────────────────────────

/**
 * Update operating hours for a clinic.
 */
export async function updateOperatingHours(clinicId, hours) {
  if (!supabase) return { error: { message: 'Not configured' } };

  // Delete existing hours
  await supabase.from('clinic_operating_hours').delete().eq('clinic_id', clinicId);

  if (!hours || hours.length === 0) return { error: null };

  const rows = hours.map((h) => ({
    clinic_id: clinicId,
    day: h.day,
    is_open: h.isOpen,
    open_time: h.isOpen ? h.openTime : null,
    close_time: h.isOpen ? h.closeTime : null,
  }));

  const { error } = await supabase.from('clinic_operating_hours').insert(rows);
  return { error };
}

/**
 * Generate appointment slots for a date range.
 */
export async function generateAppointmentSlots(clinicId, { startDate, endDate, durationMinutes = 30, operatingHours }) {
  if (!supabase) return { error: { message: 'Not configured' } };

  const slots = [];
  const start = new Date(startDate);
  const end = new Date(endDate);

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const dayName = d.toLocaleDateString('en-US', { weekday: 'long' });
    const dayHours = operatingHours?.find((h) => h.day === dayName);

    if (!dayHours || !dayHours.isOpen) continue;

    const [openH, openM] = dayHours.openTime.split(':').map(Number);
    const [closeH, closeM] = dayHours.closeTime.split(':').map(Number);
    const openMinutes = openH * 60 + openM;
    const closeMinutes = closeH * 60 + closeM;

    for (let t = openMinutes; t + durationMinutes <= closeMinutes; t += durationMinutes) {
      const hours = String(Math.floor(t / 60)).padStart(2, '0');
      const mins = String(t % 60).padStart(2, '0');
      slots.push({
        clinic_id: clinicId,
        slot_date: d.toISOString().split('T')[0],
        slot_time: `${hours}:${mins}`,
        duration_minutes: durationMinutes,
        is_booked: false,
      });
    }
  }

  if (slots.length === 0) return { error: null, count: 0 };

  // Upsert to avoid conflicts with existing slots
  const { error } = await supabase
    .from('appointment_slots')
    .upsert(slots, { onConflict: 'clinic_id,slot_date,slot_time' });

  return { error, count: slots.length };
}

// ─── Dashboard Stats ───────────────────────────────────────────

/**
 * Fetch dashboard stats for a provider's clinic.
 */
export async function fetchProviderDashboardStats(clinicId) {
  if (!supabase || !clinicId) return { data: null, error: { message: 'Not configured' } };

  try {
    const today = new Date().toISOString().split('T')[0];

    const [
      appointmentsRes,
      todayRes,
      pendingRes,
      reviewsRes,
      ratingRes,
    ] = await Promise.all([
      supabase.from('appointments').select('id', { count: 'exact', head: true }).eq('clinic_id', clinicId),
      supabase.from('appointments').select('id', { count: 'exact', head: true }).eq('clinic_id', clinicId).eq('appointment_date', today),
      supabase.from('appointments').select('id', { count: 'exact', head: true }).eq('clinic_id', clinicId).eq('status', 'pending'),
      supabase.from('reviews').select('id', { count: 'exact', head: true }).eq('clinic_id', clinicId),
      supabase.from('clinics').select('rating, number_of_reviews').eq('id', clinicId).single(),
    ]);

    return {
      data: {
        total_appointments: appointmentsRes.count ?? 0,
        today_appointments: todayRes.count ?? 0,
        pending_appointments: pendingRes.count ?? 0,
        total_reviews: reviewsRes.count ?? 0,
        average_rating: ratingRes.data?.rating ?? 0,
        number_of_reviews: ratingRes.data?.number_of_reviews ?? 0,
      },
      error: null,
    };
  } catch (err) {
    return { data: null, error: err };
  }
}

/**
 * Fetch upcoming appointments (next N).
 */
export async function fetchUpcomingAppointments(clinicId, limit = 5) {
  if (!supabase || !clinicId) return { data: [], error: { message: 'Not configured' } };

  const today = new Date().toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('appointments')
    .select('*, profiles!appointments_patient_id_fkey(full_name, email)')
    .eq('clinic_id', clinicId)
    .gte('appointment_date', today)
    .in('status', ['pending', 'confirmed'])
    .order('appointment_date', { ascending: true })
    .order('appointment_time', { ascending: true })
    .limit(limit);

  return { data: data || [], error };
}

/**
 * Fetch recent reviews (last N).
 */
export async function fetchRecentReviews(clinicId, limit = 3) {
  if (!supabase || !clinicId) return { data: [], error: { message: 'Not configured' } };

  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('clinic_id', clinicId)
    .order('created_at', { ascending: false })
    .limit(limit);

  return { data: data || [], error };
}
