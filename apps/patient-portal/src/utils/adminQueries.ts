/**
 * adminQueries.js
 * ──────────────────────────────────────────────────────────────
 * Supabase queries for the admin panel.
 * Covers: provider applications, dashboard stats, audit log,
 *         users, appointments, reviews, contact messages, HMOs.
 * ──────────────────────────────────────────────────────────────
 */
import { supabase } from './supabase';

const NO_CLIENT = { message: 'Supabase client is not configured.' };
function noClient() { return !supabase; }

// ─── Dashboard ──────────────────────────────────────────────

export async function fetchDashboardStats() {
  if (noClient()) return { data: null, error: NO_CLIENT };
  const { data, error } = await supabase.rpc('get_admin_dashboard_stats');
  if (error) return { data: null, error };
  return { data, error: null };
}

// ─── Provider Applications ─────────────────────────────────

export async function fetchApplications({ status, search, page = 0, pageSize = 20 } = {}) {
  if (noClient()) return { data: null, count: 0, error: NO_CLIENT };

  let query = supabase
    .from('provider_applications')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false });

  if (status && status !== 'all') {
    query = query.eq('status', status);
  }
  if (search) {
    query = query.or(`practitioner_name.ilike.%${search}%,email.ilike.%${search}%`);
  }
  query = query.range(page * pageSize, (page + 1) * pageSize - 1);

  const { data, error, count } = await query;
  if (error) return { data: null, count: 0, error };
  return { data: data ?? [], count: count ?? 0, error: null };
}

export async function fetchApplicationById(id) {
  if (noClient()) return { data: null, error: NO_CLIENT };
  const { data, error } = await supabase
    .from('provider_applications')
    .select('*')
    .eq('id', id)
    .single();
  if (error) return { data: null, error };
  return { data, error: null };
}

export async function approveApplication(id, notes) {
  if (noClient()) return { data: null, error: NO_CLIENT };
  const { data, error } = await supabase.rpc('approve_provider_application', {
    app_id: id,
    notes: notes || null,
  });
  if (error) return { data: null, error };
  return { data, error: null };
}

export async function rejectApplication(id, reason) {
  if (noClient()) return { data: null, error: NO_CLIENT };
  const { data, error } = await supabase.rpc('reject_provider_application', {
    app_id: id,
    rejection_reason: reason,
  });
  if (error) return { data: null, error };
  return { data, error: null };
}

export async function updateApplicationNotes(id, notes) {
  if (noClient()) return { error: NO_CLIENT };
  const { error } = await supabase
    .from('provider_applications')
    .update({ admin_notes: notes })
    .eq('id', id);
  return { error: error || null };
}

// ─── Users ──────────────────────────────────────────────────

export async function fetchUsers({ role, search, page = 0, pageSize = 20 } = {}) {
  if (noClient()) return { data: null, count: 0, error: NO_CLIENT };

  let query = supabase
    .from('profiles')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false });

  if (role && role !== 'all') {
    query = query.eq('role', role);
  }
  if (search) {
    query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`);
  }
  query = query.range(page * pageSize, (page + 1) * pageSize - 1);

  const { data, error, count } = await query;
  if (error) return { data: null, count: 0, error };
  return { data: data ?? [], count: count ?? 0, error: null };
}

export async function updateUserRole(userId, newRole) {
  if (noClient()) return { error: NO_CLIENT };
  const { error } = await supabase
    .from('profiles')
    .update({ role: newRole })
    .eq('id', userId);

  if (!error) {
    await logAdminAction('change_role', 'profile', userId, { new_role: newRole });
  }
  return { error: error || null };
}

// ─── Clinics (admin) ────────────────────────────────────────

export async function fetchAllClinics({ search, category, active, page = 0, pageSize = 20 } = {}) {
  if (noClient()) return { data: null, count: 0, error: NO_CLIENT };

  let query = supabase
    .from('clinics')
    .select('*, clinic_tags(tag), clinic_specialties(specialty)', { count: 'exact' })
    .order('id', { ascending: true });

  if (search) {
    query = query.or(`practitioner_name.ilike.%${search}%,email.ilike.%${search}%,address.ilike.%${search}%`);
  }
  if (category && category !== 'all') {
    query = query.eq('practitioner_category', category);
  }
  if (active === 'true') query = query.eq('is_active', true);
  if (active === 'false') query = query.eq('is_active', false);

  query = query.range(page * pageSize, (page + 1) * pageSize - 1);

  const { data, error, count } = await query;
  if (error) return { data: null, count: 0, error };
  return { data: data ?? [], count: count ?? 0, error: null };
}

export async function toggleClinicField(clinicId, field, value) {
  if (noClient()) return { error: NO_CLIENT };
  const { error } = await supabase
    .from('clinics')
    .update({ [field]: value })
    .eq('id', clinicId);

  if (!error) {
    await logAdminAction(`toggle_${field}`, 'clinic', String(clinicId), { [field]: value });
  }
  return { error: error || null };
}

export async function deleteClinic(clinicId) {
  if (noClient()) return { error: NO_CLIENT };
  const { error } = await supabase
    .from('clinics')
    .delete()
    .eq('id', clinicId);

  if (!error) {
    await logAdminAction('delete_clinic', 'clinic', String(clinicId));
  }
  return { error: error || null };
}

// ─── Appointments ───────────────────────────────────────────

export async function fetchAllAppointments({ status, search, page = 0, pageSize = 20 } = {}) {
  if (noClient()) return { data: null, count: 0, error: NO_CLIENT };

  let query = supabase
    .from('appointments')
    .select(`
      *,
      clinics!inner(practitioner_name),
      profiles!appointments_patient_id_fkey(full_name, email)
    `, { count: 'exact' })
    .order('appointment_date', { ascending: false });

  if (status && status !== 'all') {
    query = query.eq('status', status);
  }
  query = query.range(page * pageSize, (page + 1) * pageSize - 1);

  const { data, error, count } = await query;
  if (error) return { data: null, count: 0, error };

  const shaped = (data ?? []).map(a => ({
    ...a,
    clinic_name: a.clinics?.practitioner_name ?? 'Unknown',
    patient_name: a.profiles?.full_name ?? 'Unknown',
    patient_email: a.profiles?.email ?? '',
  }));

  return { data: shaped, count: count ?? 0, error: null };
}

export async function updateAppointmentStatus(appointmentId, status) {
  if (noClient()) return { error: NO_CLIENT };
  const { error } = await supabase
    .from('appointments')
    .update({ status })
    .eq('id', appointmentId);

  if (!error) {
    await logAdminAction('update_appointment_status', 'appointment', appointmentId, { status });
  }
  return { error: error || null };
}

// ─── Reviews ────────────────────────────────────────────────

export async function fetchAllReviews({ search, rating, page = 0, pageSize = 20 } = {}) {
  if (noClient()) return { data: null, count: 0, error: NO_CLIENT };

  let query = supabase
    .from('reviews')
    .select('*, clinics!inner(practitioner_name)', { count: 'exact' })
    .order('created_at', { ascending: false });

  if (rating && rating !== 'all') {
    query = query.eq('rating', parseInt(rating));
  }
  query = query.range(page * pageSize, (page + 1) * pageSize - 1);

  const { data, error, count } = await query;
  if (error) return { data: null, count: 0, error };

  const shaped = (data ?? []).map(r => ({
    ...r,
    clinic_name: r.clinics?.practitioner_name ?? 'Unknown',
  }));

  return { data: shaped, count: count ?? 0, error: null };
}

export async function deleteReview(reviewId) {
  if (noClient()) return { error: NO_CLIENT };
  const { error } = await supabase
    .from('reviews')
    .delete()
    .eq('id', reviewId);

  if (!error) {
    await logAdminAction('delete_review', 'review', String(reviewId));
  }
  return { error: error || null };
}

export async function toggleReviewVerified(reviewId, isVerified) {
  if (noClient()) return { error: NO_CLIENT };
  const { error } = await supabase
    .from('reviews')
    .update({ is_verified: isVerified })
    .eq('id', reviewId);
  return { error: error || null };
}

// ─── Contact Messages ───────────────────────────────────────

export async function fetchContactMessages({ read, search, page = 0, pageSize = 20 } = {}) {
  if (noClient()) return { data: null, count: 0, error: NO_CLIENT };

  let query = supabase
    .from('contact_messages')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false });

  if (read === 'true') query = query.eq('is_read', true);
  if (read === 'false') query = query.eq('is_read', false);

  if (search) {
    query = query.or(`sender_name.ilike.%${search}%,sender_email.ilike.%${search}%,subject.ilike.%${search}%`);
  }
  query = query.range(page * pageSize, (page + 1) * pageSize - 1);

  const { data, error, count } = await query;
  if (error) return { data: null, count: 0, error };
  return { data: data ?? [], count: count ?? 0, error: null };
}

export async function toggleMessageRead(messageId, isRead) {
  if (noClient()) return { error: NO_CLIENT };
  const { error } = await supabase
    .from('contact_messages')
    .update({ is_read: isRead })
    .eq('id', messageId);
  return { error: error || null };
}

export async function deleteMessage(messageId) {
  if (noClient()) return { error: NO_CLIENT };
  const { error } = await supabase
    .from('contact_messages')
    .delete()
    .eq('id', messageId);
  return { error: error || null };
}

// ─── HMOs ───────────────────────────────────────────────────

export async function fetchAllHMOs() {
  if (noClient()) return { data: null, error: NO_CLIENT };
  const { data, error } = await supabase
    .from('hmos')
    .select('*, clinic_hmos(count)')
    .order('name', { ascending: true });

  if (error) return { data: null, error };

  const shaped = (data ?? []).map(h => ({
    ...h,
    clinic_count: h.clinic_hmos?.[0]?.count ?? 0,
  }));

  return { data: shaped, error: null };
}

export async function createHMO(name) {
  if (noClient()) return { error: NO_CLIENT };
  const { error } = await supabase
    .from('hmos')
    .insert({ name, is_active: true });

  if (!error) {
    await logAdminAction('create_hmo', 'hmo', name);
  }
  return { error: error || null };
}

export async function updateHMO(id, updates) {
  if (noClient()) return { error: NO_CLIENT };
  const { error } = await supabase
    .from('hmos')
    .update(updates)
    .eq('id', id);
  return { error: error || null };
}

export async function deleteHMO(id) {
  if (noClient()) return { error: NO_CLIENT };
  const { error } = await supabase
    .from('hmos')
    .delete()
    .eq('id', id);

  if (!error) {
    await logAdminAction('delete_hmo', 'hmo', String(id));
  }
  return { error: error || null };
}

// ─── Audit Log ──────────────────────────────────────────────

export async function fetchAuditLog({ action, page = 0, pageSize = 30 } = {}) {
  if (noClient()) return { data: null, count: 0, error: NO_CLIENT };

  let query = supabase
    .from('admin_audit_log')
    .select('*, profiles!admin_audit_log_admin_id_fkey(full_name, email)', { count: 'exact' })
    .order('created_at', { ascending: false });

  if (action && action !== 'all') {
    query = query.eq('action', action);
  }
  query = query.range(page * pageSize, (page + 1) * pageSize - 1);

  const { data, error, count } = await query;
  if (error) return { data: null, count: 0, error };

  const shaped = (data ?? []).map(log => ({
    ...log,
    admin_name: log.profiles?.full_name ?? 'Unknown',
    admin_email: log.profiles?.email ?? '',
  }));

  return { data: shaped, count: count ?? 0, error: null };
}

// ─── Helper: Log admin action ───────────────────────────────

async function logAdminAction(action, targetType, targetId, details = null) {
  if (noClient()) return;
  try {
    await supabase.rpc('log_admin_action', {
      p_action: action,
      p_target_type: targetType,
      p_target_id: targetId,
      p_details: details ? JSON.stringify(details) : null,
    });
  } catch (err) {
    console.error('Failed to log admin action:', err);
  }
}
