/**
 * labQueries.js
 * ──────────────────────────────────────────────────────────────
 * Supabase query functions for the laboratory portal.
 * All functions accept a supabase client and lab_id to enforce
 * multi-tenant scoping. RLS provides the server-side guarantee.
 * ──────────────────────────────────────────────────────────────
 */
import { supabase } from '@/utils/supabase';

// ─── Helpers ────────────────────────────────────────────────

/** Throw on Supabase errors so React Query treats them as failures */
function unwrap(result) {
  if (result.error) throw result.error;
  return result.data;
}

// ─── Lab Staff / Auth ───────────────────────────────────────

/** Get all labs the current user is staff of */
export async function fetchUserLabs() {
  return unwrap(await supabase.rpc('get_user_labs'));
}

/** Get the user's staff record for a specific lab */
export async function fetchLabStaffRecord(labId) {
  return unwrap(
    await supabase
      .from('lab_staff')
      .select('*, profiles:user_id(id, full_name, email, avatar_url)')
      .eq('lab_id', labId)
      .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
      .single()
  );
}

/** Get all staff members for a lab */
export async function fetchLabStaff(labId) {
  return unwrap(
    await supabase
      .from('lab_staff')
      .select('*, profiles:user_id(id, full_name, email, avatar_url)')
      .eq('lab_id', labId)
      .order('created_at', { ascending: true })
  );
}

// ─── Lab Organization ───────────────────────────────────────

export async function fetchLabOrganization(labId) {
  return unwrap(
    await supabase
      .from('lab_organizations')
      .select('*')
      .eq('id', labId)
      .single()
  );
}

export async function updateLabOrganization(labId, updates) {
  return unwrap(
    await supabase
      .from('lab_organizations')
      .update(updates)
      .eq('id', labId)
      .select()
      .single()
  );
}

// ─── Lab Branches ───────────────────────────────────────────

export async function fetchLabBranches(labId) {
  return unwrap(
    await supabase
      .from('lab_branches')
      .select('*')
      .eq('lab_id', labId)
      .order('created_at', { ascending: true })
  );
}

// ─── Lab Operating Hours ────────────────────────────────────

export async function fetchLabHours(labId) {
  return unwrap(
    await supabase
      .from('lab_operating_hours')
      .select('*')
      .eq('lab_id', labId)
  );
}

// ─── Test Catalog ───────────────────────────────────────────

export async function fetchLabTests(labId) {
  return unwrap(
    await supabase
      .from('lab_test_catalog')
      .select('*')
      .eq('lab_id', labId)
      .order('name', { ascending: true })
  );
}

export async function upsertLabTest(test) {
  if (test.id) {
    return unwrap(
      await supabase
        .from('lab_test_catalog')
        .update(test)
        .eq('id', test.id)
        .select()
        .single()
    );
  }
  return unwrap(
    await supabase
      .from('lab_test_catalog')
      .insert(test)
      .select()
      .single()
  );
}

export async function toggleLabTest(testId, isActive) {
  return unwrap(
    await supabase
      .from('lab_test_catalog')
      .update({ is_active: isActive })
      .eq('id', testId)
      .select()
      .single()
  );
}

// ─── Orders ─────────────────────────────────────────────────

export async function fetchLabOrders(labId, { status, query } = {}) {
  let q = supabase
    .from('lab_orders')
    .select(`
      *,
      branch:branch_id(id, name),
      patient:patient_id(id, full_name, email, phone, avatar_url),
      tests:lab_order_tests(id, test_name, price, test_id)
    `)
    .eq('lab_id', labId)
    .order('created_at', { ascending: false });

  if (status && status !== 'all') {
    q = q.eq('status', status);
  }
  if (query) {
    q = q.or(`order_number.ilike.%${query}%,patient.full_name.ilike.%${query}%`);
  }
  return unwrap(await q);
}

export async function fetchLabOrder(orderId) {
  return unwrap(
    await supabase
      .from('lab_orders')
      .select(`
        *,
        branch:branch_id(id, name),
        patient:patient_id(id, full_name, email, phone, avatar_url, date_of_birth),
        tests:lab_order_tests(id, test_name, price, test_id)
      `)
      .eq('id', orderId)
      .single()
  );
}

export async function updateOrderStatus(orderId, status) {
  return unwrap(
    await supabase
      .from('lab_orders')
      .update({ status })
      .eq('id', orderId)
      .select()
      .single()
  );
}

export async function createLabOrder(order) {
  // Generate order number server-side via RPC
  const orderNumber = unwrap(await supabase.rpc('generate_lab_order_number'));
  const orderData = { ...order, order_number: orderNumber };
  const newOrder = unwrap(
    await supabase
      .from('lab_orders')
      .insert(orderData)
      .select()
      .single()
  );
  return newOrder;
}

// ─── Samples ────────────────────────────────────────────────

export async function fetchLabSamples(labId) {
  return unwrap(
    await supabase
      .from('lab_samples')
      .select(`
        *,
        order:order_id(id, order_number, lab_id),
        patient:patient_id(id, full_name)
      `)
      .eq('lab_id', labId)
      .order('created_at', { ascending: false })
  );
}

export async function updateSampleStatus(sampleId, status, extra = {}) {
  return unwrap(
    await supabase
      .from('lab_samples')
      .update({ status, ...extra })
      .eq('id', sampleId)
      .select()
      .single()
  );
}

export async function createLabSample(sample) {
  const sampleNumber = unwrap(await supabase.rpc('generate_lab_sample_number'));
  return unwrap(
    await supabase
      .from('lab_samples')
      .insert({ ...sample, sample_number: sampleNumber })
      .select()
      .single()
  );
}

// ─── Results ────────────────────────────────────────────────

export async function fetchLabResults(labId) {
  return unwrap(
    await supabase
      .from('lab_results')
      .select(`
        *,
        order:order_id(id, order_number),
        sample:sample_id(id, sample_number),
        patient:patient_id(id, full_name),
        rows:lab_result_rows(*)
      `)
      .eq('lab_id', labId)
      .order('created_at', { ascending: false })
  );
}

export async function fetchLabResult(resultId) {
  return unwrap(
    await supabase
      .from('lab_results')
      .select(`
        *,
        order:order_id(id, order_number),
        sample:sample_id(id, sample_number),
        patient:patient_id(id, full_name),
        rows:lab_result_rows(*)
      `)
      .eq('id', resultId)
      .single()
  );
}

export async function updateLabResult(resultId, patch) {
  return unwrap(
    await supabase
      .from('lab_results')
      .update(patch)
      .eq('id', resultId)
      .select()
      .single()
  );
}

export async function upsertResultRows(resultId, rows) {
  // Delete existing rows and re-insert
  await supabase.from('lab_result_rows').delete().eq('result_id', resultId);
  if (rows.length > 0) {
    return unwrap(
      await supabase
        .from('lab_result_rows')
        .insert(rows.map((r, i) => ({ ...r, result_id: resultId, sort_order: i })))
        .select()
    );
  }
  return [];
}

export async function publishResult(resultId) {
  const userId = (await supabase.auth.getUser()).data.user?.id;
  return unwrap(
    await supabase
      .from('lab_results')
      .update({
        status: 'published',
        published_by: userId,
        published_at: new Date().toISOString(),
      })
      .eq('id', resultId)
      .select()
      .single()
  );
}

// ─── Patients ───────────────────────────────────────────────

/** Fetch patients who have orders at this lab */
export async function fetchLabPatients(labId) {
  // Get distinct patient IDs from orders for this lab,
  // then fetch their profile data
  const orders = unwrap(
    await supabase
      .from('lab_orders')
      .select('patient_id, status, order_number, created_at')
      .eq('lab_id', labId)
      .order('created_at', { ascending: false })
  );

  // Get unique patient IDs
  const patientIds = [...new Set(orders.map(o => o.patient_id))];
  if (patientIds.length === 0) return [];

  const profiles = unwrap(
    await supabase
      .from('profiles')
      .select('id, full_name, email, phone, avatar_url, date_of_birth')
      .in('id', patientIds)
  );

  // Enrich profiles with last order info
  return profiles.map(p => {
    const patientOrders = orders.filter(o => o.patient_id === p.id);
    const lastOrder = patientOrders[0];
    return {
      ...p,
      order_count: patientOrders.length,
      last_order_number: lastOrder?.order_number,
      last_order_status: lastOrder?.status,
      last_order_date: lastOrder?.created_at,
    };
  });
}

// ─── Notifications ──────────────────────────────────────────

export async function fetchLabNotifications(labId) {
  return unwrap(
    await supabase
      .from('lab_notifications')
      .select('*')
      .eq('lab_id', labId)
      .order('created_at', { ascending: false })
      .limit(50)
  );
}

export async function markNotificationRead(notifId) {
  return unwrap(
    await supabase
      .from('lab_notifications')
      .update({ is_read: true })
      .eq('id', notifId)
      .select()
      .single()
  );
}

export async function markAllNotificationsRead(labId) {
  const userId = (await supabase.auth.getUser()).data.user?.id;
  return unwrap(
    await supabase
      .from('lab_notifications')
      .update({ is_read: true })
      .eq('lab_id', labId)
      .eq('user_id', userId)
      .eq('is_read', false)
      .select()
  );
}

// ─── Activity Log ───────────────────────────────────────────

export async function fetchLabActivity(labId, limit = 20) {
  return unwrap(
    await supabase
      .from('lab_activity_log')
      .select('*')
      .eq('lab_id', labId)
      .order('created_at', { ascending: false })
      .limit(limit)
  );
}

export async function logLabActivity(labId, action, entityType, entityId = null, metadata = {}) {
  return supabase.rpc('log_lab_activity', {
    p_lab_id: labId,
    p_action: action,
    p_entity_type: entityType,
    p_entity_id: entityId,
    p_metadata: metadata,
  });
}

// ─── Dashboard Stats ────────────────────────────────────────

export async function fetchDashboardStats(labId) {
  const [orders, samples, results] = await Promise.all([
    supabase
      .from('lab_orders')
      .select('id, status, created_at, tests:lab_order_tests(price)')
      .eq('lab_id', labId),
    supabase
      .from('lab_samples')
      .select('id, status')
      .eq('lab_id', labId),
    supabase
      .from('lab_results')
      .select('id, status')
      .eq('lab_id', labId),
  ]);

  const allOrders = orders.data || [];
  const allSamples = samples.data || [];
  const allResults = results.data || [];

  const newOrders = allOrders.filter(o => o.status === 'new').length;
  const pendingSamples = allSamples.filter(s => s.status !== 'completed').length;
  const awaitingReview = allResults.filter(r => r.status === 'review').length;

  const revenue = allOrders
    .filter(o => o.status === 'completed' || o.status === 'results_ready')
    .reduce((sum, o) => {
      const orderTotal = (o.tests || []).reduce((s, t) => s + Number(t.price || 0), 0);
      return sum + orderTotal;
    }, 0);

  return { newOrders, pendingSamples, awaitingReview, revenue };
}
