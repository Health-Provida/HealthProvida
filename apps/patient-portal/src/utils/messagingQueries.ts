/**
 * messagingQueries.js
 * Query functions for the provider–patient messaging system.
 */
import { supabase } from './supabase';

/**
 * Fetch conversations for a clinic, with latest message preview.
 */
export async function fetchConversations(clinicId) {
  if (!supabase || !clinicId) return { data: [], error: { message: 'Not configured' } };

  const { data, error } = await supabase
    .from('conversations')
    .select(`
      *,
      profiles!conversations_patient_id_fkey(full_name, email),
      messages(content, created_at, sender_type)
    `)
    .eq('clinic_id', clinicId)
    .order('updated_at', { ascending: false });

  if (error) return { data: [], error };

  // Attach latest message as a preview
  const conversations = (data || []).map((conv) => {
    const sorted = (conv.messages || []).sort(
      (a, b) => new Date(b.created_at) - new Date(a.created_at)
    );
    return {
      ...conv,
      lastMessage: sorted[0] || null,
      messages: undefined, // don't carry full list
    };
  });

  return { data: conversations, error: null };
}

/**
 * Fetch messages for a conversation.
 */
export async function fetchMessages(conversationId) {
  if (!supabase || !conversationId) return { data: [], error: { message: 'Not configured' } };

  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });

  return { data: data || [], error };
}

/**
 * Send a message from the provider.
 */
export async function sendMessage(conversationId, content) {
  if (!supabase || !conversationId || !content?.trim()) {
    return { error: { message: 'Missing parameters' } };
  }

  const { data, error } = await supabase
    .from('messages')
    .insert({
      conversation_id: conversationId,
      sender_type: 'provider',
      sender_id: (await supabase.auth.getUser()).data?.user?.id,
      content: content.trim(),
    })
    .select()
    .single();

  if (!error) {
    // Update conversation's updated_at
    await supabase
      .from('conversations')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', conversationId);
  }

  return { data, error };
}

/**
 * Mark all unread messages in a conversation as read (from patient side).
 */
export async function markConversationRead(conversationId) {
  if (!supabase || !conversationId) return { error: { message: 'Not configured' } };

  const { error } = await supabase
    .from('messages')
    .update({ is_read: true })
    .eq('conversation_id', conversationId)
    .eq('sender_type', 'patient')
    .eq('is_read', false);

  return { error };
}

/**
 * Get unread message count for a clinic.
 */
export async function fetchUnreadCount(clinicId) {
  if (!supabase || !clinicId) return { count: 0, error: { message: 'Not configured' } };

  // Get all conversations for this clinic
  const { data: convs, error: convErr } = await supabase
    .from('conversations')
    .select('id')
    .eq('clinic_id', clinicId);

  if (convErr || !convs?.length) return { count: 0, error: convErr };

  const convIds = convs.map((c) => c.id);

  const { count, error } = await supabase
    .from('messages')
    .select('id', { count: 'exact', head: true })
    .in('conversation_id', convIds)
    .eq('sender_type', 'patient')
    .eq('is_read', false);

  return { count: count || 0, error };
}

// ─── Patient-side query functions ─────────────────────────────────────────────

/**
 * Fetch conversations for a patient, joined with clinic info and latest message.
 * Used by the Messages page.
 *
 * @param {string} patientId - UUID of the patient
 * @returns {{ data: Array, error: Error|null }}
 */
export async function fetchPatientConversations(patientId) {
  if (!supabase || !patientId) return { data: [], error: { message: 'Not configured' } };

  const { data, error } = await supabase
    .from('conversations')
    .select(`
      *,
      clinics!conversations_clinic_id_fkey(id, practitioner_name, practice_type, image_url),
      messages(id, content, created_at, sender_type, is_read)
    `)
    .eq('patient_id', patientId)
    .order('updated_at', { ascending: false });

  if (error) return { data: [], error };

  const conversations = (data || []).map((conv) => {
    const sorted = (conv.messages || []).sort(
      (a, b) => new Date(b.created_at) - new Date(a.created_at)
    );
    const unreadCount = (conv.messages || []).filter(
      (m) => m.sender_type === 'provider' && !m.is_read
    ).length;
    return {
      ...conv,
      clinicName: conv.clinics?.practitioner_name ?? 'Unknown Clinic',
      clinicType: conv.clinics?.practice_type ?? '',
      clinicImage: conv.clinics?.image_url ?? '',
      clinicId: conv.clinics?.id ?? conv.clinic_id,
      lastMessage: sorted[0] || null,
      unreadCount,
      messages: undefined,
    };
  });

  return { data: conversations, error: null };
}

/**
 * Send a message as the patient.
 *
 * @param {string} conversationId - the conversation to send in
 * @param {string} content - message body
 * @returns {{ data: Object|null, error: Error|null }}
 */
export async function sendPatientMessage(conversationId, content) {
  if (!supabase || !conversationId || !content?.trim()) {
    return { error: { message: 'Missing parameters' } };
  }

  const { data, error } = await supabase
    .from('messages')
    .insert({
      conversation_id: conversationId,
      sender_type: 'patient',
      sender_id: (await supabase.auth.getUser()).data?.user?.id,
      content: content.trim(),
    })
    .select()
    .single();

  if (!error) {
    await supabase
      .from('conversations')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', conversationId);
  }

  return { data, error };
}

/**
 * Mark all unread provider messages in a conversation as read (from patient's perspective).
 *
 * @param {string} conversationId
 * @returns {{ error: Error|null }}
 */
export async function markPatientConversationRead(conversationId) {
  if (!supabase || !conversationId) return { error: { message: 'Not configured' } };

  const { error } = await supabase
    .from('messages')
    .update({ is_read: true })
    .eq('conversation_id', conversationId)
    .eq('sender_type', 'provider')
    .eq('is_read', false);

  return { error };
}
