-- ============================================================
-- HealthProvida — Provider Dashboard Tables Migration
-- Run this in the Supabase SQL Editor AFTER the base schema
-- and the existing provider_migration (RLS policies).
--
-- Creates all tables needed by the provider-portal app:
--   doctors, schedules, patients, encounters, authorizations,
--   service tariffs, notifications, EMR sync, performance,
--   promoted campaigns, facility photos, and verification steps.
-- ============================================================

-- ==================== ENUM TYPES ====================

-- Clinic verification lifecycle
CREATE TYPE verification_state AS ENUM (
  'pending', 'verified', 'changes_required', 'rejected'
);

-- How the patient pays
CREATE TYPE payer_type AS ENUM ('direct_pay', 'hmo');

-- Provider-side appointment workflow
CREATE TYPE provider_appointment_status AS ENUM (
  'confirmed', 'checked_in', 'in_consultation', 'completed', 'cancelled', 'no_show'
);

-- Encounter lifecycle
CREATE TYPE encounter_status AS ENUM (
  'arrived', 'in_consultation', 'completed', 'checked_out'
);

-- HMO authorization verdict
CREATE TYPE authorization_status AS ENUM (
  'approved', 'manual_review', 'pending', 'declined'
);

-- How a consultation is delivered
CREATE TYPE consultation_type AS ENUM ('physical', 'telemedicine');

-- Photo slot within a facility profile
CREATE TYPE facility_photo_slot AS ENUM (
  'exterior', 'reception', 'consultation_room'
);

-- Review state for uploaded photos
CREATE TYPE facility_photo_status AS ENUM (
  'missing', 'pending_review', 'approved', 'rejected'
);

-- Provider ↔ HMO connection state
CREATE TYPE hmo_network_status AS ENUM (
  'connected', 'pending', 'not_connected'
);

-- ==================== ADD COLUMNS TO clinics ====================
-- These extend the base clinics table with provider-dashboard fields.

ALTER TABLE clinics
  ADD COLUMN IF NOT EXISTS description TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS state TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS city TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS verification verification_state NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS verification_note TEXT,
  ADD COLUMN IF NOT EXISTS visibility TEXT NOT NULL DEFAULT 'organic'
    CHECK (visibility IN ('organic', 'promoted'));

-- ==================== FACILITY PHOTOS ====================

CREATE TABLE facility_photos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id BIGINT NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  slot facility_photo_slot NOT NULL,
  label TEXT NOT NULL,
  url TEXT,
  status facility_photo_status NOT NULL DEFAULT 'missing',
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (clinic_id, slot)
);

-- ==================== VERIFICATION STEPS ====================

CREATE TABLE verification_steps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id BIGINT NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('complete', 'in_progress', 'pending')),
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ==================== PROVIDER DOCTORS ====================

CREATE TABLE provider_doctors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id BIGINT NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  title TEXT NOT NULL DEFAULT 'Dr.',
  specialty TEXT NOT NULL,
  consultation_type consultation_type NOT NULL DEFAULT 'physical',
  consultation_fee NUMERIC(12,2) NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ==================== PROVIDER SCHEDULES ====================

CREATE TABLE provider_schedules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  doctor_id UUID NOT NULL REFERENCES provider_doctors(id) ON DELETE CASCADE,
  clinic_id BIGINT NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  day TEXT NOT NULL,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  slot_duration INT NOT NULL DEFAULT 30,
  slots INT NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'blocked')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ==================== PROVIDER PATIENTS ====================
-- Patients as seen by the provider (may differ from the auth user profile)

CREATE TABLE provider_patients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id BIGINT NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  reference TEXT NOT NULL,
  initials TEXT NOT NULL DEFAULT '',
  display_name TEXT NOT NULL,
  sex TEXT NOT NULL DEFAULT 'M' CHECK (sex IN ('M', 'F')),
  age_band TEXT NOT NULL DEFAULT '',
  payer payer_type NOT NULL DEFAULT 'direct_pay',
  hmo_id UUID,
  plan TEXT,
  policy_number TEXT,
  eligibility TEXT CHECK (eligibility IN ('eligible', 'review', 'ineligible')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (clinic_id, reference)
);

-- ==================== PROVIDER APPOINTMENTS ====================

CREATE TABLE provider_appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id BIGINT NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  reference TEXT NOT NULL,
  patient_id UUID NOT NULL REFERENCES provider_patients(id) ON DELETE CASCADE,
  doctor_id UUID NOT NULL REFERENCES provider_doctors(id) ON DELETE CASCADE,
  specialty TEXT NOT NULL DEFAULT '',
  date DATE NOT NULL,
  time TEXT NOT NULL,
  appointment_type TEXT NOT NULL DEFAULT 'follow_up',
  consultation_type consultation_type NOT NULL DEFAULT 'physical',
  payer payer_type NOT NULL DEFAULT 'direct_pay',
  status provider_appointment_status NOT NULL DEFAULT 'confirmed',
  payment_status TEXT NOT NULL DEFAULT 'unpaid'
    CHECK (payment_status IN ('paid', 'unpaid', 'covered', 'pending')),
  amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  notes TEXT,
  checked_in_at TEXT,
  authorization_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ==================== PROVIDER ENCOUNTERS ====================

CREATE TABLE provider_encounters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id BIGINT NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  appointment_id UUID NOT NULL REFERENCES provider_appointments(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES provider_patients(id) ON DELETE CASCADE,
  doctor_id UUID NOT NULL REFERENCES provider_doctors(id) ON DELETE CASCADE,
  arrival_time TEXT NOT NULL,
  status encounter_status NOT NULL DEFAULT 'arrived',
  payer payer_type NOT NULL DEFAULT 'direct_pay',
  completed_at TEXT,
  checked_out_at TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (appointment_id)
);

-- ==================== PROVIDER HMO CONNECTIONS ====================
-- Provider-specific HMO view with network status and plans

CREATE TABLE provider_hmo_connections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id BIGINT NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  hmo_id BIGINT REFERENCES hmos(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  short_name TEXT NOT NULL DEFAULT '',
  network_status hmo_network_status NOT NULL DEFAULT 'not_connected',
  plans TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ==================== PROVIDER AUTHORIZATIONS ====================

CREATE TABLE provider_authorizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id BIGINT NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  code TEXT,
  patient_id UUID NOT NULL REFERENCES provider_patients(id) ON DELETE CASCADE,
  hmo_connection_id UUID REFERENCES provider_hmo_connections(id) ON DELETE SET NULL,
  plan TEXT NOT NULL DEFAULT '',
  procedure_name TEXT NOT NULL,
  procedure_code TEXT NOT NULL DEFAULT '',
  diagnosis TEXT NOT NULL DEFAULT '',
  icd10 TEXT NOT NULL DEFAULT '',
  tariff NUMERIC(12,2) NOT NULL DEFAULT 0,
  estimated_cost NUMERIC(12,2) NOT NULL DEFAULT 0,
  status authorization_status NOT NULL DEFAULT 'pending',
  reason TEXT,
  requested_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  appointment_id UUID REFERENCES provider_appointments(id) ON DELETE SET NULL
);

-- ==================== SERVICE TARIFFS ====================

CREATE TABLE service_tariffs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id BIGINT NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  service TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT '',
  provider_price NUMERIC(12,2) NOT NULL DEFAULT 0,
  benchmark NUMERIC(12,2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ==================== PROVIDER NOTIFICATIONS ====================

CREATE TABLE provider_notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id BIGINT NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  type TEXT NOT NULL DEFAULT 'appointment'
    CHECK (type IN ('appointment', 'check_in', 'authorization', 'verification', 'review', 'sync')),
  title TEXT NOT NULL,
  body TEXT NOT NULL DEFAULT '',
  time TEXT NOT NULL DEFAULT '',
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ==================== EMR SYNC ====================

CREATE TABLE emr_sync_state (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id BIGINT NOT NULL REFERENCES clinics(id) ON DELETE CASCADE UNIQUE,
  connected BOOLEAN NOT NULL DEFAULT false,
  integration_type TEXT NOT NULL DEFAULT 'HL7 FHIR',
  last_sync TEXT,
  records_synced INT NOT NULL DEFAULT 0,
  appointments_synced INT NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE emr_sync_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id BIGINT NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  time TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'Manual',
  records INT NOT NULL DEFAULT 0,
  appointments INT NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'success'
    CHECK (status IN ('success', 'partial', 'failed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ==================== PROMOTED CAMPAIGNS ====================

CREATE TABLE promoted_campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id BIGINT NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  location TEXT NOT NULL DEFAULT '',
  specialty TEXT NOT NULL DEFAULT '',
  placement TEXT NOT NULL DEFAULT '',
  budget NUMERIC(12,2) NOT NULL DEFAULT 0,
  duration_days INT NOT NULL DEFAULT 7,
  status TEXT NOT NULL DEFAULT 'pending_approval'
    CHECK (status IN ('pending_approval', 'active', 'ended')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ==================== INDEXES ====================

CREATE INDEX idx_facility_photos_clinic ON facility_photos(clinic_id);
CREATE INDEX idx_verification_steps_clinic ON verification_steps(clinic_id);
CREATE INDEX idx_provider_doctors_clinic ON provider_doctors(clinic_id);
CREATE INDEX idx_provider_schedules_doctor ON provider_schedules(doctor_id);
CREATE INDEX idx_provider_schedules_clinic ON provider_schedules(clinic_id);
CREATE INDEX idx_provider_patients_clinic ON provider_patients(clinic_id);
CREATE INDEX idx_provider_appointments_clinic ON provider_appointments(clinic_id);
CREATE INDEX idx_provider_appointments_date ON provider_appointments(date);
CREATE INDEX idx_provider_appointments_patient ON provider_appointments(patient_id);
CREATE INDEX idx_provider_appointments_doctor ON provider_appointments(doctor_id);
CREATE INDEX idx_provider_encounters_clinic ON provider_encounters(clinic_id);
CREATE INDEX idx_provider_encounters_appointment ON provider_encounters(appointment_id);
CREATE INDEX idx_provider_hmo_connections_clinic ON provider_hmo_connections(clinic_id);
CREATE INDEX idx_provider_authorizations_clinic ON provider_authorizations(clinic_id);
CREATE INDEX idx_provider_authorizations_patient ON provider_authorizations(patient_id);
CREATE INDEX idx_service_tariffs_clinic ON service_tariffs(clinic_id);
CREATE INDEX idx_provider_notifications_clinic ON provider_notifications(clinic_id);
CREATE INDEX idx_provider_notifications_read ON provider_notifications(clinic_id, read);
CREATE INDEX idx_emr_sync_history_clinic ON emr_sync_history(clinic_id);
CREATE INDEX idx_promoted_campaigns_clinic ON promoted_campaigns(clinic_id);

-- ==================== TRIGGERS (updated_at) ====================

CREATE TRIGGER trg_provider_doctors_updated_at
  BEFORE UPDATE ON provider_doctors
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_provider_appointments_updated_at
  BEFORE UPDATE ON provider_appointments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ==================== ROW LEVEL SECURITY ====================

ALTER TABLE facility_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE verification_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE provider_doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE provider_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE provider_patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE provider_appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE provider_encounters ENABLE ROW LEVEL SECURITY;
ALTER TABLE provider_hmo_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE provider_authorizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_tariffs ENABLE ROW LEVEL SECURITY;
ALTER TABLE provider_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE emr_sync_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE emr_sync_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE promoted_campaigns ENABLE ROW LEVEL SECURITY;

-- Helper: get the current provider's clinic ID (reused by all policies)
-- Note: get_provider_clinic_id() already exists in supabase_provider_migration.sql

-- RLS macro: provider can only access rows belonging to their clinic
-- facility_photos
CREATE POLICY fp_provider_select ON facility_photos FOR SELECT USING (clinic_id = get_provider_clinic_id());
CREATE POLICY fp_provider_insert ON facility_photos FOR INSERT WITH CHECK (clinic_id = get_provider_clinic_id());
CREATE POLICY fp_provider_update ON facility_photos FOR UPDATE USING (clinic_id = get_provider_clinic_id());

-- verification_steps
CREATE POLICY vs_provider_select ON verification_steps FOR SELECT USING (clinic_id = get_provider_clinic_id());
CREATE POLICY vs_provider_update ON verification_steps FOR UPDATE USING (clinic_id = get_provider_clinic_id());

-- provider_doctors
CREATE POLICY pd_provider_select ON provider_doctors FOR SELECT USING (clinic_id = get_provider_clinic_id());
CREATE POLICY pd_provider_insert ON provider_doctors FOR INSERT WITH CHECK (clinic_id = get_provider_clinic_id());
CREATE POLICY pd_provider_update ON provider_doctors FOR UPDATE USING (clinic_id = get_provider_clinic_id());

-- provider_schedules
CREATE POLICY ps_provider_select ON provider_schedules FOR SELECT USING (clinic_id = get_provider_clinic_id());
CREATE POLICY ps_provider_insert ON provider_schedules FOR INSERT WITH CHECK (clinic_id = get_provider_clinic_id());
CREATE POLICY ps_provider_update ON provider_schedules FOR UPDATE USING (clinic_id = get_provider_clinic_id());
CREATE POLICY ps_provider_delete ON provider_schedules FOR DELETE USING (clinic_id = get_provider_clinic_id());

-- provider_patients
CREATE POLICY pp_provider_select ON provider_patients FOR SELECT USING (clinic_id = get_provider_clinic_id());
CREATE POLICY pp_provider_insert ON provider_patients FOR INSERT WITH CHECK (clinic_id = get_provider_clinic_id());
CREATE POLICY pp_provider_update ON provider_patients FOR UPDATE USING (clinic_id = get_provider_clinic_id());

-- provider_appointments
CREATE POLICY pa_provider_select ON provider_appointments FOR SELECT USING (clinic_id = get_provider_clinic_id());
CREATE POLICY pa_provider_insert ON provider_appointments FOR INSERT WITH CHECK (clinic_id = get_provider_clinic_id());
CREATE POLICY pa_provider_update ON provider_appointments FOR UPDATE USING (clinic_id = get_provider_clinic_id());

-- provider_encounters
CREATE POLICY pe_provider_select ON provider_encounters FOR SELECT USING (clinic_id = get_provider_clinic_id());
CREATE POLICY pe_provider_insert ON provider_encounters FOR INSERT WITH CHECK (clinic_id = get_provider_clinic_id());
CREATE POLICY pe_provider_update ON provider_encounters FOR UPDATE USING (clinic_id = get_provider_clinic_id());

-- provider_hmo_connections
CREATE POLICY phc_provider_select ON provider_hmo_connections FOR SELECT USING (clinic_id = get_provider_clinic_id());
CREATE POLICY phc_provider_insert ON provider_hmo_connections FOR INSERT WITH CHECK (clinic_id = get_provider_clinic_id());
CREATE POLICY phc_provider_update ON provider_hmo_connections FOR UPDATE USING (clinic_id = get_provider_clinic_id());

-- provider_authorizations
CREATE POLICY pau_provider_select ON provider_authorizations FOR SELECT USING (clinic_id = get_provider_clinic_id());
CREATE POLICY pau_provider_insert ON provider_authorizations FOR INSERT WITH CHECK (clinic_id = get_provider_clinic_id());
CREATE POLICY pau_provider_update ON provider_authorizations FOR UPDATE USING (clinic_id = get_provider_clinic_id());

-- service_tariffs
CREATE POLICY st_provider_select ON service_tariffs FOR SELECT USING (clinic_id = get_provider_clinic_id());
CREATE POLICY st_provider_insert ON service_tariffs FOR INSERT WITH CHECK (clinic_id = get_provider_clinic_id());
CREATE POLICY st_provider_update ON service_tariffs FOR UPDATE USING (clinic_id = get_provider_clinic_id());

-- provider_notifications
CREATE POLICY pn_provider_select ON provider_notifications FOR SELECT USING (clinic_id = get_provider_clinic_id());
CREATE POLICY pn_provider_insert ON provider_notifications FOR INSERT WITH CHECK (clinic_id = get_provider_clinic_id());
CREATE POLICY pn_provider_update ON provider_notifications FOR UPDATE USING (clinic_id = get_provider_clinic_id());

-- emr_sync_state
CREATE POLICY ess_provider_select ON emr_sync_state FOR SELECT USING (clinic_id = get_provider_clinic_id());
CREATE POLICY ess_provider_insert ON emr_sync_state FOR INSERT WITH CHECK (clinic_id = get_provider_clinic_id());
CREATE POLICY ess_provider_update ON emr_sync_state FOR UPDATE USING (clinic_id = get_provider_clinic_id());

-- emr_sync_history
CREATE POLICY esh_provider_select ON emr_sync_history FOR SELECT USING (clinic_id = get_provider_clinic_id());
CREATE POLICY esh_provider_insert ON emr_sync_history FOR INSERT WITH CHECK (clinic_id = get_provider_clinic_id());

-- promoted_campaigns
CREATE POLICY pc_provider_select ON promoted_campaigns FOR SELECT USING (clinic_id = get_provider_clinic_id());
CREATE POLICY pc_provider_insert ON promoted_campaigns FOR INSERT WITH CHECK (clinic_id = get_provider_clinic_id());
CREATE POLICY pc_provider_update ON promoted_campaigns FOR UPDATE USING (clinic_id = get_provider_clinic_id());

-- ==================== DEFAULT VERIFICATION STEPS TRIGGER ====================
-- Auto-create the standard verification steps when a clinic is created

CREATE OR REPLACE FUNCTION create_default_verification_steps()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO verification_steps (clinic_id, label, status, sort_order) VALUES
    (NEW.id, 'Create facility profile', 'complete', 1),
    (NEW.id, 'Upload facility photographs', 'pending', 2),
    (NEW.id, 'Add at least one doctor', 'pending', 3),
    (NEW.id, 'Submit for verification', 'pending', 4);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_create_verification_steps
  AFTER INSERT ON clinics
  FOR EACH ROW EXECUTE FUNCTION create_default_verification_steps();

-- ==================== DEFAULT FACILITY PHOTOS TRIGGER ====================
-- Auto-create photo placeholder rows when a clinic is created

CREATE OR REPLACE FUNCTION create_default_facility_photos()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO facility_photos (clinic_id, slot, label, status) VALUES
    (NEW.id, 'exterior', 'Building exterior', 'missing'),
    (NEW.id, 'reception', 'Reception area', 'missing'),
    (NEW.id, 'consultation_room', 'Consultation room', 'missing');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_create_facility_photos
  AFTER INSERT ON clinics
  FOR EACH ROW EXECUTE FUNCTION create_default_facility_photos();

-- ==================== DEFAULT EMR SYNC STATE TRIGGER ====================
-- Auto-create EMR sync state when a clinic is created

CREATE OR REPLACE FUNCTION create_default_emr_state()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO emr_sync_state (clinic_id, connected, integration_type)
  VALUES (NEW.id, false, 'HL7 FHIR');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_create_emr_state
  AFTER INSERT ON clinics
  FOR EACH ROW EXECUTE FUNCTION create_default_emr_state();

