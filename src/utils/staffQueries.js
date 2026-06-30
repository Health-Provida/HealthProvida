/**
 * staffQueries.js
 * CRUD operations for clinic staff members.
 */
import { supabase } from './supabase';

/**
 * Fetch all staff members for a clinic.
 */
export async function fetchClinicStaff(clinicId) {
  if (!supabase || !clinicId) return { data: [], error: { message: 'Not configured' } };

  const { data, error } = await supabase
    .from('clinic_staff')
    .select('*')
    .eq('clinic_id', clinicId)
    .order('created_at', { ascending: true });

  return { data: data || [], error };
}

/**
 * Add a staff member to a clinic.
 */
export async function addStaffMember(clinicId, staff) {
  if (!supabase) return { error: { message: 'Not configured' } };

  const { data, error } = await supabase
    .from('clinic_staff')
    .insert({
      clinic_id: clinicId,
      full_name: staff.fullName.trim(),
      role: staff.role,
      email: staff.email?.trim() || null,
      phone: staff.phone?.trim() || null,
      is_active: true,
    })
    .select()
    .single();

  return { data, error };
}

/**
 * Update a staff member.
 */
export async function updateStaffMember(staffId, updates) {
  if (!supabase) return { error: { message: 'Not configured' } };

  const { data, error } = await supabase
    .from('clinic_staff')
    .update({
      full_name: updates.fullName?.trim(),
      role: updates.role,
      email: updates.email?.trim() || null,
      phone: updates.phone?.trim() || null,
      is_active: updates.isActive,
      updated_at: new Date().toISOString(),
    })
    .eq('id', staffId)
    .select()
    .single();

  return { data, error };
}

/**
 * Remove a staff member.
 */
export async function removeStaffMember(staffId) {
  if (!supabase) return { error: { message: 'Not configured' } };

  const { error } = await supabase
    .from('clinic_staff')
    .delete()
    .eq('id', staffId);

  return { error };
}
