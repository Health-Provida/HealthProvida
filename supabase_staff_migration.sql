-- ============================================================
-- HealthProvida — Staff Management Migration
-- Run in Supabase SQL Editor after the provider migration.
-- ============================================================

-- ==================== CLINIC STAFF TABLE ====================

CREATE TABLE IF NOT EXISTS clinic_staff (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  clinic_id BIGINT NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'Other',
  email TEXT,
  phone TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for fast lookups by clinic
CREATE INDEX IF NOT EXISTS idx_clinic_staff_clinic_id ON clinic_staff(clinic_id);

-- Enable RLS
ALTER TABLE clinic_staff ENABLE ROW LEVEL SECURITY;

-- ==================== RLS POLICIES ====================

-- Providers can manage staff for their own clinic only
CREATE POLICY staff_provider_select ON clinic_staff
  FOR SELECT USING (
    clinic_id IN (SELECT id FROM clinics WHERE owner_id = auth.uid())
  );

CREATE POLICY staff_provider_insert ON clinic_staff
  FOR INSERT WITH CHECK (
    clinic_id IN (SELECT id FROM clinics WHERE owner_id = auth.uid())
  );

CREATE POLICY staff_provider_update ON clinic_staff
  FOR UPDATE USING (
    clinic_id IN (SELECT id FROM clinics WHERE owner_id = auth.uid())
  );

CREATE POLICY staff_provider_delete ON clinic_staff
  FOR DELETE USING (
    clinic_id IN (SELECT id FROM clinics WHERE owner_id = auth.uid())
  );

-- Admin full access
CREATE POLICY staff_admin_all ON clinic_staff
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
  );
