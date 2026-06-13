-- ============================================================
-- HealthProvida — Admin Panel Database Migration
-- Run this in the Supabase SQL Editor AFTER the base schema.
-- ============================================================

-- ==================== ROLE SYSTEM UPDATE ====================

-- Update the profiles role constraint to support multi-role admin
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_role_check 
  CHECK (role IN ('patient', 'provider', 'admin', 'super_admin', 'moderator'));

-- ==================== ADMIN HELPER FUNCTIONS ====================

-- Check if the current user has ANY admin-tier role (read access)
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
      AND role IN ('super_admin', 'admin', 'moderator')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Check if the current user has write-level admin access
-- (super_admin or admin, NOT moderator)
CREATE OR REPLACE FUNCTION has_admin_write()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
      AND role IN ('super_admin', 'admin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Check if the current user is a super_admin
CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
      AND role = 'super_admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Get the current user's admin role (returns NULL if not admin)
CREATE OR REPLACE FUNCTION get_admin_role()
RETURNS TEXT AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role INTO user_role FROM profiles WHERE id = auth.uid();
  IF user_role IN ('super_admin', 'admin', 'moderator') THEN
    RETURN user_role;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- ==================== ADMIN RLS POLICIES ====================

-- Profiles: admins can read ALL profiles
CREATE POLICY profiles_admin_select ON profiles 
  FOR SELECT USING (is_admin());

-- Profiles: super_admin can update any profile; admin can update non-admin profiles
CREATE POLICY profiles_admin_update ON profiles 
  FOR UPDATE USING (
    is_super_admin() 
    OR (
      has_admin_write() 
      AND (SELECT role FROM profiles WHERE id = profiles.id) NOT IN ('super_admin', 'admin', 'moderator')
    )
  );

-- Clinics: admins can read ALL clinics (including inactive)
CREATE POLICY clinics_admin_select ON clinics 
  FOR SELECT USING (is_admin());

-- Clinics: admin-write can insert, update, delete
CREATE POLICY clinics_admin_insert ON clinics 
  FOR INSERT WITH CHECK (has_admin_write());
CREATE POLICY clinics_admin_update ON clinics 
  FOR UPDATE USING (has_admin_write());
CREATE POLICY clinics_admin_delete ON clinics 
  FOR DELETE USING (has_admin_write());

-- Provider applications: all admins can read; admin-write can update
CREATE POLICY provider_apps_admin_select ON provider_applications 
  FOR SELECT USING (is_admin());
CREATE POLICY provider_apps_admin_update ON provider_applications 
  FOR UPDATE USING (has_admin_write());

-- Appointments: all admins can read; admin + moderator can update
CREATE POLICY appointments_admin_select ON appointments 
  FOR SELECT USING (is_admin());
CREATE POLICY appointments_admin_update ON appointments 
  FOR UPDATE USING (is_admin());

-- Reviews: all admins can read, update, delete (moderation)
CREATE POLICY reviews_admin_select ON reviews 
  FOR SELECT USING (is_admin());
CREATE POLICY reviews_admin_update ON reviews 
  FOR UPDATE USING (is_admin());
CREATE POLICY reviews_admin_delete ON reviews 
  FOR DELETE USING (is_admin());

-- Contact messages: all admins can read, update, delete
CREATE POLICY contact_admin_select ON contact_messages 
  FOR SELECT USING (is_admin());
CREATE POLICY contact_admin_update ON contact_messages 
  FOR UPDATE USING (is_admin());
CREATE POLICY contact_admin_delete ON contact_messages 
  FOR DELETE USING (is_admin());

-- HMOs: admin-write can manage
CREATE POLICY hmos_admin_insert ON hmos 
  FOR INSERT WITH CHECK (has_admin_write());
CREATE POLICY hmos_admin_update ON hmos 
  FOR UPDATE USING (has_admin_write());
CREATE POLICY hmos_admin_delete ON hmos 
  FOR DELETE USING (has_admin_write());

-- Clinic sub-tables: admin-write full access
CREATE POLICY tags_admin_all ON clinic_tags 
  FOR ALL USING (has_admin_write());
CREATE POLICY specialties_admin_all ON clinic_specialties 
  FOR ALL USING (has_admin_write());
CREATE POLICY equipment_admin_all ON clinic_equipment 
  FOR ALL USING (has_admin_write());
CREATE POLICY clinic_hmos_admin_all ON clinic_hmos 
  FOR ALL USING (has_admin_write());
CREATE POLICY hours_admin_all ON clinic_operating_hours 
  FOR ALL USING (has_admin_write());
CREATE POLICY slots_admin_all ON appointment_slots 
  FOR ALL USING (has_admin_write());
CREATE POLICY gallery_images_admin_all ON gallery_images 
  FOR ALL USING (has_admin_write());
CREATE POLICY gallery_wards_admin_all ON gallery_wards 
  FOR ALL USING (has_admin_write());
CREATE POLICY favorites_admin_select ON favorites 
  FOR SELECT USING (is_admin());

-- ==================== AUDIT LOG TABLE ====================

CREATE TABLE IF NOT EXISTS admin_audit_log (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  admin_id UUID NOT NULL REFERENCES profiles(id),
  action TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id TEXT NOT NULL,
  details JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_admin ON admin_audit_log(admin_id);
CREATE INDEX IF NOT EXISTS idx_audit_action ON admin_audit_log(action);
CREATE INDEX IF NOT EXISTS idx_audit_target ON admin_audit_log(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_audit_date ON admin_audit_log(created_at DESC);

ALTER TABLE admin_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY audit_admin_select ON admin_audit_log 
  FOR SELECT USING (has_admin_write());
CREATE POLICY audit_admin_insert ON admin_audit_log 
  FOR INSERT WITH CHECK (is_admin());

-- ==================== RPC: APPROVE APPLICATION ====================

CREATE OR REPLACE FUNCTION approve_provider_application(
  app_id UUID,
  notes TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
  app_row provider_applications%ROWTYPE;
  new_clinic_id BIGINT;
  hmo_record RECORD;
BEGIN
  -- Verify caller has admin-write access
  IF NOT has_admin_write() THEN
    RAISE EXCEPTION 'Unauthorized: admin or super_admin role required';
  END IF;

  -- Fetch the application
  SELECT * INTO app_row FROM provider_applications WHERE id = app_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Application not found';
  END IF;
  IF app_row.status != 'pending' THEN
    RAISE EXCEPTION 'Application is not in pending status (current: %)', app_row.status;
  END IF;

  -- Update application status
  UPDATE provider_applications 
  SET status = 'approved', admin_notes = COALESCE(notes, admin_notes), updated_at = now()
  WHERE id = app_id;

  -- Create clinic from application data
  INSERT INTO clinics (
    owner_id, practitioner_name, practice_type, 
    practitioner_category, address, phone, email,
    image_url, is_verified, is_active
  ) VALUES (
    app_row.applicant_id, 
    app_row.practitioner_name,
    app_row.practitioner_type::TEXT,
    app_row.practitioner_type,
    app_row.address, 
    app_row.phone, 
    app_row.email,
    app_row.facility_image_url,
    true,
    true
  ) RETURNING id INTO new_clinic_id;

  -- Create clinic tags
  IF array_length(app_row.tags, 1) > 0 THEN
    INSERT INTO clinic_tags (clinic_id, tag)
    SELECT new_clinic_id, unnest(app_row.tags);
  END IF;

  -- Create clinic specialties
  IF array_length(app_row.specialties, 1) > 0 THEN
    INSERT INTO clinic_specialties (clinic_id, specialty)
    SELECT new_clinic_id, unnest(app_row.specialties);
  END IF;

  -- Create clinic equipment
  IF array_length(app_row.equipment, 1) > 0 THEN
    INSERT INTO clinic_equipment (clinic_id, equipment_name)
    SELECT new_clinic_id, unnest(app_row.equipment);
  END IF;

  -- Create clinic HMO associations
  IF array_length(app_row.supported_hmos, 1) > 0 THEN
    FOR hmo_record IN 
      SELECT h.id FROM hmos h 
      WHERE h.name = ANY(app_row.supported_hmos)
    LOOP
      INSERT INTO clinic_hmos (clinic_id, hmo_id) 
      VALUES (new_clinic_id, hmo_record.id);
    END LOOP;
  END IF;

  -- Create operating hours from JSONB
  IF app_row.operating_hours IS NOT NULL AND jsonb_array_length(app_row.operating_hours) > 0 THEN
    INSERT INTO clinic_operating_hours (clinic_id, day, is_open, open_time, close_time)
    SELECT 
      new_clinic_id,
      (entry->>'day')::day_of_week,
      (entry->>'isOpen')::BOOLEAN,
      CASE WHEN (entry->>'isOpen')::BOOLEAN 
           THEN (entry->>'openTime')::TIME ELSE NULL END,
      CASE WHEN (entry->>'isOpen')::BOOLEAN 
           THEN (entry->>'closeTime')::TIME ELSE NULL END
    FROM jsonb_array_elements(app_row.operating_hours) AS entry;
  END IF;

  -- Promote applicant to provider role (only if they're currently a patient)
  IF app_row.applicant_id IS NOT NULL THEN
    UPDATE profiles 
    SET role = 'provider' 
    WHERE id = app_row.applicant_id AND role = 'patient';
  END IF;

  -- Log the action
  INSERT INTO admin_audit_log (admin_id, action, target_type, target_id, details)
  VALUES (
    auth.uid(), 
    'approve_application', 
    'provider_application', 
    app_id::TEXT,
    json_build_object(
      'clinic_id', new_clinic_id,
      'practitioner_name', app_row.practitioner_name,
      'notes', notes
    )::JSONB
  );

  RETURN json_build_object(
    'success', true, 
    'clinic_id', new_clinic_id,
    'message', 'Application approved and clinic created'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==================== RPC: REJECT APPLICATION ====================

CREATE OR REPLACE FUNCTION reject_provider_application(
  app_id UUID,
  rejection_reason TEXT
)
RETURNS JSON AS $$
DECLARE
  app_row provider_applications%ROWTYPE;
BEGIN
  IF NOT has_admin_write() THEN
    RAISE EXCEPTION 'Unauthorized: admin or super_admin role required';
  END IF;

  SELECT * INTO app_row FROM provider_applications WHERE id = app_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Application not found';
  END IF;
  IF app_row.status != 'pending' THEN
    RAISE EXCEPTION 'Application is not in pending status (current: %)', app_row.status;
  END IF;

  UPDATE provider_applications 
  SET status = 'rejected', admin_notes = rejection_reason, updated_at = now()
  WHERE id = app_id;

  -- Log the action
  INSERT INTO admin_audit_log (admin_id, action, target_type, target_id, details)
  VALUES (
    auth.uid(),
    'reject_application',
    'provider_application',
    app_id::TEXT,
    json_build_object(
      'practitioner_name', app_row.practitioner_name,
      'reason', rejection_reason
    )::JSONB
  );

  RETURN json_build_object(
    'success', true,
    'message', 'Application rejected'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==================== RPC: DASHBOARD STATS ====================

CREATE OR REPLACE FUNCTION get_admin_dashboard_stats()
RETURNS JSON AS $$
BEGIN
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Unauthorized: admin role required';
  END IF;

  RETURN json_build_object(
    'total_clinics', (SELECT COUNT(*) FROM clinics),
    'active_clinics', (SELECT COUNT(*) FROM clinics WHERE is_active = true),
    'inactive_clinics', (SELECT COUNT(*) FROM clinics WHERE is_active = false),
    'verified_clinics', (SELECT COUNT(*) FROM clinics WHERE is_verified = true),
    'pending_applications', (SELECT COUNT(*) FROM provider_applications WHERE status = 'pending'),
    'approved_applications', (SELECT COUNT(*) FROM provider_applications WHERE status = 'approved'),
    'rejected_applications', (SELECT COUNT(*) FROM provider_applications WHERE status = 'rejected'),
    'total_applications', (SELECT COUNT(*) FROM provider_applications),
    'total_users', (SELECT COUNT(*) FROM profiles),
    'total_patients', (SELECT COUNT(*) FROM profiles WHERE role = 'patient'),
    'total_providers', (SELECT COUNT(*) FROM profiles WHERE role = 'provider'),
    'total_admins', (SELECT COUNT(*) FROM profiles WHERE role IN ('super_admin', 'admin', 'moderator')),
    'total_appointments', (SELECT COUNT(*) FROM appointments),
    'today_appointments', (SELECT COUNT(*) FROM appointments WHERE appointment_date = CURRENT_DATE),
    'pending_appointments', (SELECT COUNT(*) FROM appointments WHERE status = 'pending'),
    'total_reviews', (SELECT COUNT(*) FROM reviews),
    'unread_messages', (SELECT COUNT(*) FROM contact_messages WHERE is_read = false),
    'total_hmos', (SELECT COUNT(*) FROM hmos WHERE is_active = true)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- ==================== RPC: LOG ADMIN ACTION ====================

CREATE OR REPLACE FUNCTION log_admin_action(
  p_action TEXT,
  p_target_type TEXT,
  p_target_id TEXT,
  p_details JSONB DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  INSERT INTO admin_audit_log (admin_id, action, target_type, target_id, details)
  VALUES (auth.uid(), p_action, p_target_type, p_target_id, p_details);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
