-- ============================================================
-- HealthProvida — Messaging System Migration
-- Run in Supabase SQL Editor after the staff migration.
-- ============================================================

-- ==================== CONVERSATIONS TABLE ====================

CREATE TABLE IF NOT EXISTS conversations (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  clinic_id BIGINT NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject TEXT DEFAULT '',
  is_archived BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  -- Prevent duplicate conversations between same patient and clinic
  UNIQUE(clinic_id, patient_id)
);

CREATE INDEX IF NOT EXISTS idx_conversations_clinic ON conversations(clinic_id);
CREATE INDEX IF NOT EXISTS idx_conversations_patient ON conversations(patient_id);

-- ==================== MESSAGES TABLE ====================

CREATE TABLE IF NOT EXISTS messages (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  conversation_id BIGINT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('patient', 'provider')),
  sender_id UUID NOT NULL REFERENCES auth.users(id),
  content TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_unread ON messages(conversation_id, sender_type, is_read) 
  WHERE is_read = false;

-- ==================== ENABLE RLS ====================

ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- ==================== CONVERSATION POLICIES ====================

-- Providers can view conversations for their clinic
CREATE POLICY conversations_provider_select ON conversations
  FOR SELECT USING (
    clinic_id IN (SELECT id FROM clinics WHERE owner_id = auth.uid())
  );

-- Providers can update conversations (archive, etc.)
CREATE POLICY conversations_provider_update ON conversations
  FOR UPDATE USING (
    clinic_id IN (SELECT id FROM clinics WHERE owner_id = auth.uid())
  );

-- Patients can view their own conversations
CREATE POLICY conversations_patient_select ON conversations
  FOR SELECT USING (
    patient_id = auth.uid()
  );

-- Patients can create conversations
CREATE POLICY conversations_patient_insert ON conversations
  FOR INSERT WITH CHECK (
    patient_id = auth.uid()
  );

-- ==================== MESSAGE POLICIES ====================

-- Providers can read messages in their clinic's conversations
CREATE POLICY messages_provider_select ON messages
  FOR SELECT USING (
    conversation_id IN (
      SELECT c.id FROM conversations c
      JOIN clinics cl ON c.clinic_id = cl.id
      WHERE cl.owner_id = auth.uid()
    )
  );

-- Providers can send messages (insert) in their clinic's conversations
CREATE POLICY messages_provider_insert ON messages
  FOR INSERT WITH CHECK (
    sender_type = 'provider'
    AND sender_id = auth.uid()
    AND conversation_id IN (
      SELECT c.id FROM conversations c
      JOIN clinics cl ON c.clinic_id = cl.id
      WHERE cl.owner_id = auth.uid()
    )
  );

-- Providers can mark messages as read
CREATE POLICY messages_provider_update ON messages
  FOR UPDATE USING (
    conversation_id IN (
      SELECT c.id FROM conversations c
      JOIN clinics cl ON c.clinic_id = cl.id
      WHERE cl.owner_id = auth.uid()
    )
  );

-- Patients can read messages in their own conversations
CREATE POLICY messages_patient_select ON messages
  FOR SELECT USING (
    conversation_id IN (
      SELECT id FROM conversations WHERE patient_id = auth.uid()
    )
  );

-- Patients can send messages in their own conversations
CREATE POLICY messages_patient_insert ON messages
  FOR INSERT WITH CHECK (
    sender_type = 'patient'
    AND sender_id = auth.uid()
    AND conversation_id IN (
      SELECT id FROM conversations WHERE patient_id = auth.uid()
    )
  );

-- Patients can mark messages as read
CREATE POLICY messages_patient_update ON messages
  FOR UPDATE USING (
    conversation_id IN (
      SELECT id FROM conversations WHERE patient_id = auth.uid()
    )
  );

-- ==================== ADMIN ACCESS ====================

CREATE POLICY conversations_admin_all ON conversations
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

CREATE POLICY messages_admin_all ON messages
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

-- ==================== HELPER: Auto-update conversation timestamp ====================

CREATE OR REPLACE FUNCTION update_conversation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE conversations SET updated_at = NOW() WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_message_update_conversation
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_timestamp();
