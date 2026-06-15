-- ============================================================
-- HealthProvida — Supabase Database Schema
-- Generated from project analysis on 2026-05-12
-- ============================================================

-- ==================== EXTENSIONS ====================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==================== ENUM TYPES ====================
CREATE TYPE practitioner_type AS ENUM (
  'Hospital',
  'Clinic',
  'Diagnostic Center',
  'Pharmacy',
  'Dental Clinic',
  'Specialist Center'
);

CREATE TYPE appointment_status AS ENUM (
  'pending',
  'confirmed',
  'cancelled',
  'completed',
  'no_show'
);

CREATE TYPE provider_application_status AS ENUM (
  'pending',
  'approved',
  'rejected'
);

CREATE TYPE day_of_week AS ENUM (
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday'
);

-- ==================== CORE TABLES ====================

-- 1. User Profiles (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'patient' CHECK (role IN ('patient', 'provider', 'admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Clinics (main entity)
CREATE TABLE clinics (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  owner_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  practitioner_name TEXT NOT NULL,
  practice_type TEXT NOT NULL,
  practitioner_category practitioner_type NOT NULL DEFAULT 'Clinic',
  address TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  image_url TEXT,
  rating NUMERIC(2,1) NOT NULL DEFAULT 0.0 CHECK (rating >= 0 AND rating <= 5),
  number_of_reviews INT NOT NULL DEFAULT 0,
  distance_from_location TEXT,
  next_available TEXT,
  is_verified BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  -- Map coordinates (percentage-based for the custom map)
  map_pin_x NUMERIC(5,2),
  map_pin_y NUMERIC(5,2),
  -- Geo coordinates for future real map integration
  latitude NUMERIC(10,7),
  longitude NUMERIC(10,7),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Clinic Tags (e.g. "General Practice", "Telehealth Available")
CREATE TABLE clinic_tags (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  clinic_id BIGINT NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  tag TEXT NOT NULL,
  UNIQUE (clinic_id, tag)
);

-- 4. Clinic Specialties
CREATE TABLE clinic_specialties (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  clinic_id BIGINT NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  specialty TEXT NOT NULL,
  UNIQUE (clinic_id, specialty)
);

-- 5. Clinic Equipment & Facilities
CREATE TABLE clinic_equipment (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  clinic_id BIGINT NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  equipment_name TEXT NOT NULL,
  UNIQUE (clinic_id, equipment_name)
);

-- 6. HMOs (lookup table)
CREATE TABLE hmos (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  logo_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. Clinic ↔ HMO junction
CREATE TABLE clinic_hmos (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  clinic_id BIGINT NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  hmo_id BIGINT NOT NULL REFERENCES hmos(id) ON DELETE CASCADE,
  UNIQUE (clinic_id, hmo_id)
);

-- 8. Operating Hours
CREATE TABLE clinic_operating_hours (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  clinic_id BIGINT NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  day day_of_week NOT NULL,
  is_open BOOLEAN NOT NULL DEFAULT true,
  open_time TIME,
  close_time TIME,
  UNIQUE (clinic_id, day)
);

-- 9. Appointment Slots (available time slots per clinic per date)
CREATE TABLE appointment_slots (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  clinic_id BIGINT NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  slot_date DATE NOT NULL,
  slot_time TIME NOT NULL,
  is_booked BOOLEAN NOT NULL DEFAULT false,
  duration_minutes INT NOT NULL DEFAULT 30,
  UNIQUE (clinic_id, slot_date, slot_time)
);

-- 10. Appointments (bookings)
CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id BIGINT NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  slot_id BIGINT REFERENCES appointment_slots(id) ON DELETE SET NULL,
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  status appointment_status NOT NULL DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 11. Reviews
CREATE TABLE reviews (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  clinic_id BIGINT NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  patient_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  author_name TEXT NOT NULL,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT NOT NULL,
  review_date TEXT, -- e.g. "April 2026" as displayed in the app
  is_verified BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 12. Gallery Wards (shared ward categories)
CREATE TABLE gallery_wards (
  id TEXT PRIMARY KEY, -- e.g. 'reception', 'consulting_room'
  title TEXT NOT NULL,
  description TEXT,
  sort_order INT NOT NULL DEFAULT 0
);

-- 13. Gallery Images
CREATE TABLE gallery_images (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  ward_id TEXT NOT NULL REFERENCES gallery_wards(id) ON DELETE CASCADE,
  clinic_id BIGINT REFERENCES clinics(id) ON DELETE CASCADE, -- NULL = shared/common
  image_url TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 14. User Favorites / Wishlists
CREATE TABLE favorites (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  clinic_id BIGINT NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, clinic_id)
);

-- 15. Provider Applications (Join Provider form submissions)
CREATE TABLE provider_applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  applicant_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  practitioner_name TEXT NOT NULL,
  practitioner_type practitioner_type NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,
  specialties TEXT[] NOT NULL DEFAULT '{}',
  equipment TEXT[] NOT NULL DEFAULT '{}',
  tags TEXT[] NOT NULL DEFAULT '{}',
  supported_hmos TEXT[] NOT NULL DEFAULT '{}',
  facility_image_url TEXT,
  operating_hours JSONB, -- stores the full operating hours object
  appointment_slot_duration INT DEFAULT 30,
  status provider_application_status NOT NULL DEFAULT 'pending',
  admin_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 16. Contact Messages
CREATE TABLE contact_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_name TEXT NOT NULL,
  sender_email TEXT NOT NULL,
  sender_type TEXT NOT NULL DEFAULT 'patient' CHECK (sender_type IN ('patient', 'provider')),
  subject TEXT,
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ==================== INDEXES ====================
CREATE INDEX idx_clinics_active ON clinics(is_active) WHERE is_active = true;
CREATE INDEX idx_clinics_rating ON clinics(rating DESC);
CREATE INDEX idx_clinics_owner ON clinics(owner_id);
CREATE INDEX idx_clinic_tags_clinic ON clinic_tags(clinic_id);
CREATE INDEX idx_clinic_tags_tag ON clinic_tags(tag);
CREATE INDEX idx_clinic_specialties_clinic ON clinic_specialties(clinic_id);
CREATE INDEX idx_clinic_specialties_specialty ON clinic_specialties(specialty);
CREATE INDEX idx_clinic_equipment_clinic ON clinic_equipment(clinic_id);
CREATE INDEX idx_clinic_hmos_clinic ON clinic_hmos(clinic_id);
CREATE INDEX idx_clinic_hmos_hmo ON clinic_hmos(hmo_id);
CREATE INDEX idx_operating_hours_clinic ON clinic_operating_hours(clinic_id);
CREATE INDEX idx_appointment_slots_clinic_date ON appointment_slots(clinic_id, slot_date);
CREATE INDEX idx_appointments_patient ON appointments(patient_id);
CREATE INDEX idx_appointments_clinic ON appointments(clinic_id);
CREATE INDEX idx_appointments_date ON appointments(appointment_date);
CREATE INDEX idx_reviews_clinic ON reviews(clinic_id);
CREATE INDEX idx_reviews_rating ON reviews(clinic_id, rating);
CREATE INDEX idx_gallery_images_ward ON gallery_images(ward_id);
CREATE INDEX idx_gallery_images_clinic ON gallery_images(clinic_id);
CREATE INDEX idx_favorites_user ON favorites(user_id);
CREATE INDEX idx_favorites_clinic ON favorites(clinic_id);
CREATE INDEX idx_provider_apps_status ON provider_applications(status);

-- ==================== FUNCTIONS ====================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recalculate clinic rating after review insert/update/delete
CREATE OR REPLACE FUNCTION recalculate_clinic_rating()
RETURNS TRIGGER AS $$
DECLARE
  target_clinic_id BIGINT;
BEGIN
  target_clinic_id := COALESCE(NEW.clinic_id, OLD.clinic_id);

  UPDATE clinics SET
    rating = COALESCE((
      SELECT ROUND(AVG(rating)::numeric, 1)
      FROM reviews WHERE clinic_id = target_clinic_id
    ), 0),
    number_of_reviews = (
      SELECT COUNT(*) FROM reviews WHERE clinic_id = target_clinic_id
    ),
    updated_at = now()
  WHERE id = target_clinic_id;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Mark slot as booked when appointment is created
CREATE OR REPLACE FUNCTION mark_slot_booked()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.slot_id IS NOT NULL THEN
    UPDATE appointment_slots SET is_booked = true WHERE id = NEW.slot_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ==================== TRIGGERS ====================

CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_clinics_updated_at
  BEFORE UPDATE ON clinics
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_appointments_updated_at
  BEFORE UPDATE ON appointments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_provider_apps_updated_at
  BEFORE UPDATE ON provider_applications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_review_rating_insert
  AFTER INSERT ON reviews
  FOR EACH ROW EXECUTE FUNCTION recalculate_clinic_rating();

CREATE TRIGGER trg_review_rating_update
  AFTER UPDATE ON reviews
  FOR EACH ROW EXECUTE FUNCTION recalculate_clinic_rating();

CREATE TRIGGER trg_review_rating_delete
  AFTER DELETE ON reviews
  FOR EACH ROW EXECUTE FUNCTION recalculate_clinic_rating();

CREATE TRIGGER trg_mark_slot_booked
  AFTER INSERT ON appointments
  FOR EACH ROW EXECUTE FUNCTION mark_slot_booked();

-- ==================== ROW LEVEL SECURITY ====================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinics ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinic_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinic_specialties ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinic_equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE hmos ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinic_hmos ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinic_operating_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointment_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_wards ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE provider_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read all, update own
CREATE POLICY profiles_select ON profiles FOR SELECT USING (true);
CREATE POLICY profiles_insert ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY profiles_update ON profiles FOR UPDATE USING (auth.uid() = id);

-- Clinics: anyone can read active clinics, owners can update
CREATE POLICY clinics_select ON clinics FOR SELECT USING (is_active = true);
CREATE POLICY clinics_insert ON clinics FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY clinics_update ON clinics FOR UPDATE USING (auth.uid() = owner_id);

-- Clinic sub-tables: public read, owner write
CREATE POLICY tags_select ON clinic_tags FOR SELECT USING (true);
CREATE POLICY tags_insert ON clinic_tags FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM clinics WHERE id = clinic_id AND owner_id = auth.uid()));
CREATE POLICY tags_delete ON clinic_tags FOR DELETE
  USING (EXISTS (SELECT 1 FROM clinics WHERE id = clinic_id AND owner_id = auth.uid()));

CREATE POLICY specialties_select ON clinic_specialties FOR SELECT USING (true);
CREATE POLICY specialties_insert ON clinic_specialties FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM clinics WHERE id = clinic_id AND owner_id = auth.uid()));
CREATE POLICY specialties_delete ON clinic_specialties FOR DELETE
  USING (EXISTS (SELECT 1 FROM clinics WHERE id = clinic_id AND owner_id = auth.uid()));

CREATE POLICY equipment_select ON clinic_equipment FOR SELECT USING (true);
CREATE POLICY equipment_insert ON clinic_equipment FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM clinics WHERE id = clinic_id AND owner_id = auth.uid()));
CREATE POLICY equipment_delete ON clinic_equipment FOR DELETE
  USING (EXISTS (SELECT 1 FROM clinics WHERE id = clinic_id AND owner_id = auth.uid()));

-- HMOs: public read
CREATE POLICY hmos_select ON hmos FOR SELECT USING (true);

-- Clinic HMOs: public read, owner write
CREATE POLICY clinic_hmos_select ON clinic_hmos FOR SELECT USING (true);
CREATE POLICY clinic_hmos_insert ON clinic_hmos FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM clinics WHERE id = clinic_id AND owner_id = auth.uid()));
CREATE POLICY clinic_hmos_delete ON clinic_hmos FOR DELETE
  USING (EXISTS (SELECT 1 FROM clinics WHERE id = clinic_id AND owner_id = auth.uid()));

-- Operating hours: public read, owner write
CREATE POLICY hours_select ON clinic_operating_hours FOR SELECT USING (true);
CREATE POLICY hours_insert ON clinic_operating_hours FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM clinics WHERE id = clinic_id AND owner_id = auth.uid()));
CREATE POLICY hours_update ON clinic_operating_hours FOR UPDATE
  USING (EXISTS (SELECT 1 FROM clinics WHERE id = clinic_id AND owner_id = auth.uid()));

-- Appointment slots: public read
CREATE POLICY slots_select ON appointment_slots FOR SELECT USING (true);
CREATE POLICY slots_insert ON appointment_slots FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM clinics WHERE id = clinic_id AND owner_id = auth.uid()));

-- Appointments: patients see own, clinic owners see their clinic's
CREATE POLICY appointments_select_patient ON appointments FOR SELECT
  USING (auth.uid() = patient_id);
CREATE POLICY appointments_select_provider ON appointments FOR SELECT
  USING (EXISTS (SELECT 1 FROM clinics WHERE id = clinic_id AND owner_id = auth.uid()));
CREATE POLICY appointments_insert ON appointments FOR INSERT
  WITH CHECK (auth.uid() = patient_id);
CREATE POLICY appointments_update ON appointments FOR UPDATE
  USING (auth.uid() = patient_id OR EXISTS (SELECT 1 FROM clinics WHERE id = clinic_id AND owner_id = auth.uid()));

-- Reviews: public read, authenticated users can create
CREATE POLICY reviews_select ON reviews FOR SELECT USING (true);
CREATE POLICY reviews_insert ON reviews FOR INSERT WITH CHECK (auth.uid() = patient_id);
CREATE POLICY reviews_update ON reviews FOR UPDATE USING (auth.uid() = patient_id);
CREATE POLICY reviews_delete ON reviews FOR DELETE USING (auth.uid() = patient_id);

-- Gallery: public read
CREATE POLICY wards_select ON gallery_wards FOR SELECT USING (true);
CREATE POLICY images_select ON gallery_images FOR SELECT USING (true);
CREATE POLICY images_insert ON gallery_images FOR INSERT
  WITH CHECK (clinic_id IS NULL OR EXISTS (SELECT 1 FROM clinics WHERE id = clinic_id AND owner_id = auth.uid()));

-- Favorites: users manage own
CREATE POLICY favorites_select ON favorites FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY favorites_insert ON favorites FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY favorites_delete ON favorites FOR DELETE USING (auth.uid() = user_id);

-- Provider applications: applicants see own
CREATE POLICY provider_apps_select ON provider_applications FOR SELECT
  USING (auth.uid() = applicant_id);
CREATE POLICY provider_apps_insert ON provider_applications FOR INSERT
  WITH CHECK (auth.uid() = applicant_id);

-- Contact messages: anyone can insert
CREATE POLICY contact_insert ON contact_messages FOR INSERT WITH CHECK (true);

-- ==================== AUTO-CREATE PROFILE ON SIGNUP ====================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger 
LANGUAGE plpgsql
SECURITY DEFINER 
-- Forces Postgres to look in the public schema for tables
SET search_path = public, pg_catalog 
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.email
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ==================== SEED DATA ====================

-- HMOs
INSERT INTO hmos (name) VALUES
  ('Hygeia HMO'),
  ('Avon Healthcare'),
  ('Reliance HMO'),
  ('AXA Mansard'),
  ('MetroHealth HMO'),
  ('Apex Healthcare'),
  ('Total Health Trust'),
  ('Wellness HMO'),
  ('Sterling Health HMO'),
  ('Clearline HMO');

-- Gallery Ward Categories
INSERT INTO gallery_wards (id, title, description, sort_order) VALUES
  ('reception', 'Reception', 'Modern, comfortable seating, 24/7 front desk, and a welcoming environment for all patients and visitors.', 1),
  ('consulting_room', 'Consulting Room', 'Private and comfortable consulting rooms designed to facilitate open communication and comprehensive medical examinations.', 2),
  ('private_ward', 'Private Ward', 'Premium, private rooms designed for comfort and privacy, featuring en-suite bathrooms and accommodations for a loved one.', 3),
  ('laboratory', 'Laboratory', 'State-of-the-art diagnostic laboratory equipped with advanced technology for accurate and timely test results.', 4),
  ('special_units', 'Special Units', 'Dedicated intensive care and maternity units with advanced life support systems and specialized nursing.', 5);

-- ==================== STORAGE BUCKETS ====================
-- Run these via the Supabase Dashboard or Management API:
--
-- 1. clinic-images     — Clinic facility photos (public)
-- 2. gallery-images    — Ward/gallery photos (public)
-- 3. profile-avatars   — User avatar uploads (public)
-- 4. provider-uploads  — Provider application documents (private)
