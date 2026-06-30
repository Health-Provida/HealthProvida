-- ============================================================
-- HealthProvida — Provider Dashboard Database Migration
-- Run this in the Supabase SQL Editor AFTER the base schema
-- and the admin migration.
-- ============================================================

-- ==================== PROVIDER RLS POLICIES ====================

-- Clinics: providers can read and update ONLY their own clinic
CREATE POLICY clinics_provider_select ON clinics
  FOR SELECT USING (
    owner_id = auth.uid()
  );

CREATE POLICY clinics_provider_update ON clinics
  FOR UPDATE USING (
    owner_id = auth.uid()
  );

-- Clinic sub-tables: providers can manage their own clinic's related data
-- Tags
CREATE POLICY tags_provider_select ON clinic_tags
  FOR SELECT USING (
    clinic_id IN (SELECT id FROM clinics WHERE owner_id = auth.uid())
  );
CREATE POLICY tags_provider_insert ON clinic_tags
  FOR INSERT WITH CHECK (
    clinic_id IN (SELECT id FROM clinics WHERE owner_id = auth.uid())
  );
CREATE POLICY tags_provider_delete ON clinic_tags
  FOR DELETE USING (
    clinic_id IN (SELECT id FROM clinics WHERE owner_id = auth.uid())
  );

-- Specialties
CREATE POLICY specialties_provider_select ON clinic_specialties
  FOR SELECT USING (
    clinic_id IN (SELECT id FROM clinics WHERE owner_id = auth.uid())
  );
CREATE POLICY specialties_provider_insert ON clinic_specialties
  FOR INSERT WITH CHECK (
    clinic_id IN (SELECT id FROM clinics WHERE owner_id = auth.uid())
  );
CREATE POLICY specialties_provider_delete ON clinic_specialties
  FOR DELETE USING (
    clinic_id IN (SELECT id FROM clinics WHERE owner_id = auth.uid())
  );

-- Equipment
CREATE POLICY equipment_provider_select ON clinic_equipment
  FOR SELECT USING (
    clinic_id IN (SELECT id FROM clinics WHERE owner_id = auth.uid())
  );
CREATE POLICY equipment_provider_insert ON clinic_equipment
  FOR INSERT WITH CHECK (
    clinic_id IN (SELECT id FROM clinics WHERE owner_id = auth.uid())
  );
CREATE POLICY equipment_provider_delete ON clinic_equipment
  FOR DELETE USING (
    clinic_id IN (SELECT id FROM clinics WHERE owner_id = auth.uid())
  );

-- Operating Hours
CREATE POLICY hours_provider_select ON clinic_operating_hours
  FOR SELECT USING (
    clinic_id IN (SELECT id FROM clinics WHERE owner_id = auth.uid())
  );
CREATE POLICY hours_provider_insert ON clinic_operating_hours
  FOR INSERT WITH CHECK (
    clinic_id IN (SELECT id FROM clinics WHERE owner_id = auth.uid())
  );
CREATE POLICY hours_provider_delete ON clinic_operating_hours
  FOR DELETE USING (
    clinic_id IN (SELECT id FROM clinics WHERE owner_id = auth.uid())
  );

-- Clinic HMOs
CREATE POLICY clinic_hmos_provider_select ON clinic_hmos
  FOR SELECT USING (
    clinic_id IN (SELECT id FROM clinics WHERE owner_id = auth.uid())
  );
CREATE POLICY clinic_hmos_provider_insert ON clinic_hmos
  FOR INSERT WITH CHECK (
    clinic_id IN (SELECT id FROM clinics WHERE owner_id = auth.uid())
  );
CREATE POLICY clinic_hmos_provider_delete ON clinic_hmos
  FOR DELETE USING (
    clinic_id IN (SELECT id FROM clinics WHERE owner_id = auth.uid())
  );

-- ==================== APPOINTMENTS ====================

-- Providers can read appointments for their clinic
CREATE POLICY appointments_provider_select ON appointments
  FOR SELECT USING (
    clinic_id IN (SELECT id FROM clinics WHERE owner_id = auth.uid())
  );

-- Providers can update appointment status for their clinic
CREATE POLICY appointments_provider_update ON appointments
  FOR UPDATE USING (
    clinic_id IN (SELECT id FROM clinics WHERE owner_id = auth.uid())
  );

-- ==================== APPOINTMENT SLOTS ====================

-- Providers can manage appointment slots for their clinic
CREATE POLICY slots_provider_select ON appointment_slots
  FOR SELECT USING (
    clinic_id IN (SELECT id FROM clinics WHERE owner_id = auth.uid())
  );
CREATE POLICY slots_provider_insert ON appointment_slots
  FOR INSERT WITH CHECK (
    clinic_id IN (SELECT id FROM clinics WHERE owner_id = auth.uid())
  );
CREATE POLICY slots_provider_update ON appointment_slots
  FOR UPDATE USING (
    clinic_id IN (SELECT id FROM clinics WHERE owner_id = auth.uid())
  );
CREATE POLICY slots_provider_delete ON appointment_slots
  FOR DELETE USING (
    clinic_id IN (SELECT id FROM clinics WHERE owner_id = auth.uid())
  );

-- ==================== REVIEWS ====================

-- Providers can read reviews for their clinic (read-only)
CREATE POLICY reviews_provider_select ON reviews
  FOR SELECT USING (
    clinic_id IN (SELECT id FROM clinics WHERE owner_id = auth.uid())
  );

-- ==================== GALLERY ====================

-- Providers can manage gallery images for their clinic
CREATE POLICY gallery_images_provider_select ON gallery_images
  FOR SELECT USING (
    clinic_id IN (SELECT id FROM clinics WHERE owner_id = auth.uid())
  );
CREATE POLICY gallery_images_provider_insert ON gallery_images
  FOR INSERT WITH CHECK (
    clinic_id IN (SELECT id FROM clinics WHERE owner_id = auth.uid())
  );
CREATE POLICY gallery_images_provider_delete ON gallery_images
  FOR DELETE USING (
    clinic_id IN (SELECT id FROM clinics WHERE owner_id = auth.uid())
  );

-- ==================== HELPER FUNCTION ====================

-- Check if the current user is a provider
CREATE OR REPLACE FUNCTION is_provider()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
      AND role = 'provider'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Get the provider's clinic ID
CREATE OR REPLACE FUNCTION get_provider_clinic_id()
RETURNS BIGINT AS $$
DECLARE
  cid BIGINT;
BEGIN
  SELECT id INTO cid FROM clinics WHERE owner_id = auth.uid() LIMIT 1;
  RETURN cid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;
