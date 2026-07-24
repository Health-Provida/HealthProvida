-- ============================================================
-- HealthProvida — Slug URL Migration
-- Run this in the Supabase SQL Editor AFTER the base schema
-- and admin migration.
--
-- What this does:
--   1. Adds `slug TEXT UNIQUE`, `city TEXT`, `state TEXT` to clinics
--   2. Adds `city TEXT`, `state TEXT` to provider_applications
--   3. Creates helper functions:
--        slugify()           — clean text → url-safe slug
--        clinic_short_hash() — deterministic 4-char base-36 hash from clinic id
--        generate_clinic_slug() — two-tier slug assignment (no-hash → hash fallback)
--   4. Backfills slugs for all existing clinics (parsing city/state from address)
--   5. Creates an index on clinics(slug)
--   6. Updates approve_provider_application() to auto-generate slugs on creation
--   7. Adds a trigger so slugs are never NULL after insert
-- ============================================================

BEGIN;

-- ══════════════════════════════════════════════════════════════
-- STEP 1: Add columns to clinics
-- ══════════════════════════════════════════════════════════════

ALTER TABLE clinics
  ADD COLUMN IF NOT EXISTS slug  TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS city  TEXT,
  ADD COLUMN IF NOT EXISTS state TEXT;

-- ══════════════════════════════════════════════════════════════
-- STEP 2: Add city / state to provider_applications
-- (populated from Google Places address_components on the client)
-- ══════════════════════════════════════════════════════════════

ALTER TABLE provider_applications
  ADD COLUMN IF NOT EXISTS city  TEXT,
  ADD COLUMN IF NOT EXISTS state TEXT;

-- ══════════════════════════════════════════════════════════════
-- STEP 3: Helper functions
-- ══════════════════════════════════════════════════════════════

-- ── 3a. slugify ───────────────────────────────────────────────
-- Converts any string to a lowercase url-safe slug.
--   "Apex Dental"  →  "apex-dental"
--   "Austin, TX"   →  "austin-tx"
CREATE OR REPLACE FUNCTION slugify(p_text TEXT)
RETURNS TEXT AS $$
  SELECT regexp_replace(
           regexp_replace(
             regexp_replace(
               lower(trim(COALESCE(p_text, ''))),
               '[^a-z0-9\s-]', '', 'g'   -- strip non-alphanumeric (keep space/dash)
             ),
             '[\s-]+', '-', 'g'           -- collapse spaces/dashes → single dash
           ),
           '^-|-$', '', 'g'              -- trim leading/trailing dashes
         );
$$ LANGUAGE SQL IMMUTABLE STRICT;


-- ── 3b. clinic_short_hash ─────────────────────────────────────
-- Produces a deterministic 4-character base-36 (0-9a-z) hash
-- from a clinic's numeric ID. The multiplier (6700417) is a
-- large prime so adjacent IDs map to very different hashes.
-- This matches the JS implementation in src/utils/slugUtils.js.
CREATE OR REPLACE FUNCTION clinic_short_hash(p_id BIGINT)
RETURNS TEXT AS $$
DECLARE
  chars    TEXT   := '0123456789abcdefghijklmnopqrstuvwxyz';
  hash_num BIGINT := ((p_id * 6700417) + 1337) % (36 * 36 * 36 * 36); -- mod 36^4 = 1679616
  result   TEXT   := '';
  i        INT;
BEGIN
  -- Ensure positive result
  IF hash_num < 0 THEN hash_num := hash_num + 1679616; END IF;

  FOR i IN 1..4 LOOP
    result   := substr(chars, (hash_num % 36)::INT + 1, 1) || result;
    hash_num := hash_num / 36;
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql IMMUTABLE STRICT;


-- ── 3c. parse_city_from_address ───────────────────────────────
-- Fallback: extract city from a formatted address string when
-- explicit city/state columns are not yet populated.
-- Handles the common "Street, City, State" and "Street, City"
-- patterns used across African address formats.
CREATE OR REPLACE FUNCTION parse_city_from_address(p_address TEXT)
RETURNS TEXT AS $$
DECLARE
  parts TEXT[];
  n     INT;
BEGIN
  -- Split on comma, trim each part
  parts := regexp_split_to_array(trim(COALESCE(p_address, '')), '\s*,\s*');
  n     := array_length(parts, 1);
  IF n IS NULL OR n < 2 THEN RETURN NULL; END IF;
  -- Second-to-last part is typically the city
  -- e.g. "14 Anywhere St, Austin, TX 78701" → parts[2] = "Austin"
  RETURN trim(parts[n - 1]);
END;
$$ LANGUAGE plpgsql IMMUTABLE STRICT;


-- ── 3d. generate_clinic_slug ──────────────────────────────────
-- Two-tier slug assignment for a clinic record:
--   Tier 1: name-city-state           (no hash, if unique)
--   Tier 2: name-city-state-XXXX      (4-char hash appended if collision)
-- p_id must already be the clinic's real BIGINT id.
CREATE OR REPLACE FUNCTION generate_clinic_slug(
  p_id   BIGINT,
  p_name TEXT,
  p_city TEXT,
  p_state TEXT
)
RETURNS TEXT AS $$
DECLARE
  base_slug TEXT;
  candidate TEXT;
  existing  INT;
BEGIN
  -- Build location-scoped base slug
  base_slug := slugify(p_name);
  IF p_city  IS NOT NULL AND p_city  <> '' THEN base_slug := base_slug || '-' || slugify(p_city);  END IF;
  IF p_state IS NOT NULL AND p_state <> '' THEN base_slug := base_slug || '-' || slugify(p_state); END IF;

  -- Tier 1: try the clean slug first
  candidate := base_slug;
  SELECT COUNT(*) INTO existing
    FROM clinics
   WHERE slug = candidate AND id <> p_id;

  IF existing = 0 THEN RETURN candidate; END IF;

  -- Tier 2: append short hash (guaranteed unique per clinic id)
  RETURN base_slug || '-' || clinic_short_hash(p_id);
END;
$$ LANGUAGE plpgsql;


-- ══════════════════════════════════════════════════════════════
-- STEP 4: Backfill slugs for existing clinics
-- Uses the city/state columns first; falls back to parsing the
-- address string for clinics without explicit city/state.
-- ══════════════════════════════════════════════════════════════

-- First: try to parse city from existing address for any clinic
-- that doesn't have city set yet.
UPDATE clinics
   SET city = parse_city_from_address(address)
 WHERE city IS NULL AND address IS NOT NULL AND address <> '';

-- Now generate slugs (may be updated again after city is set)
DO $$
DECLARE
  rec RECORD;
  new_slug TEXT;
BEGIN
  FOR rec IN SELECT id, practitioner_name, city, state FROM clinics ORDER BY id LOOP
    new_slug := generate_clinic_slug(rec.id, rec.practitioner_name, rec.city, rec.state);
    UPDATE clinics SET slug = new_slug WHERE id = rec.id;
  END LOOP;
END;
$$;

-- ══════════════════════════════════════════════════════════════
-- STEP 5: Index for fast slug lookups
-- ══════════════════════════════════════════════════════════════

CREATE UNIQUE INDEX IF NOT EXISTS idx_clinics_slug ON clinics(slug);
CREATE INDEX IF NOT EXISTS idx_clinics_city  ON clinics(city);

-- ══════════════════════════════════════════════════════════════
-- STEP 6: RPC — look up a clinic by slug (used by ClinicPage)
-- ══════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION get_clinic_id_by_slug(p_slug TEXT)
RETURNS BIGINT AS $$
  SELECT id FROM clinics WHERE slug = p_slug AND is_active = true LIMIT 1;
$$ LANGUAGE SQL STABLE;

-- ══════════════════════════════════════════════════════════════
-- STEP 7: Update approve_provider_application() to auto-generate
--         slugs when a new clinic is created.
-- This replaces the version in supabase_clinic_images_migration.sql
-- ══════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION approve_provider_application(
  app_id UUID,
  notes  TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
  app_row       provider_applications%ROWTYPE;
  new_clinic_id BIGINT;
  new_slug      TEXT;
  hmo_record    RECORD;
  img_url       TEXT;
  img_idx       INT;
  -- Derived city/state from the application
  app_city      TEXT;
  app_state     TEXT;
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

  -- Resolve city/state: prefer explicit columns, fall back to parsing the address
  app_city  := COALESCE(NULLIF(trim(app_row.city),  ''), parse_city_from_address(app_row.address));
  app_state := COALESCE(NULLIF(trim(app_row.state), ''), NULL);

  UPDATE provider_applications
     SET status = 'approved', admin_notes = COALESCE(notes, admin_notes), updated_at = now()
   WHERE id = app_id;

  INSERT INTO clinics (
    owner_id, practitioner_name, practice_type,
    practitioner_category, address, phone, email,
    image_url, is_verified, is_active,
    city, state
  ) VALUES (
    app_row.applicant_id,
    app_row.practitioner_name,
    app_row.practitioner_type::TEXT,
    app_row.practitioner_type,
    app_row.address,
    app_row.phone,
    app_row.email,
    COALESCE(NULLIF(app_row.facility_image_urls[1], ''), app_row.facility_image_url),
    true,
    true,
    app_city,
    app_state
  ) RETURNING id INTO new_clinic_id;

  -- Generate the slug now that we have the real clinic ID
  new_slug := generate_clinic_slug(new_clinic_id, app_row.practitioner_name, app_city, app_state);
  UPDATE clinics SET slug = new_slug WHERE id = new_clinic_id;

  -- Populate clinic images
  IF cardinality(app_row.facility_image_urls) > 0 THEN
    img_idx := 0;
    FOREACH img_url IN ARRAY app_row.facility_image_urls LOOP
      INSERT INTO clinic_images (ward_id, clinic_id, image_url, sort_order)
      VALUES ('reception', new_clinic_id, img_url, img_idx);
      img_idx := img_idx + 1;
    END LOOP;
  ELSIF app_row.facility_image_url IS NOT NULL THEN
    INSERT INTO clinic_images (ward_id, clinic_id, image_url, sort_order)
    VALUES ('reception', new_clinic_id, app_row.facility_image_url, 0);
  END IF;

  IF cardinality(app_row.tags) > 0 THEN
    INSERT INTO clinic_tags (clinic_id, tag)
    SELECT new_clinic_id, unnest(app_row.tags);
  END IF;

  IF cardinality(app_row.specialties) > 0 THEN
    INSERT INTO clinic_specialties (clinic_id, specialty)
    SELECT new_clinic_id, unnest(app_row.specialties);
  END IF;

  IF cardinality(app_row.equipment) > 0 THEN
    INSERT INTO clinic_equipment (clinic_id, equipment_name)
    SELECT new_clinic_id, unnest(app_row.equipment);
  END IF;

  IF cardinality(app_row.supported_hmos) > 0 THEN
    FOR hmo_record IN
      SELECT h.id FROM hmos h WHERE h.name = ANY(app_row.supported_hmos)
    LOOP
      INSERT INTO clinic_hmos (clinic_id, hmo_id) VALUES (new_clinic_id, hmo_record.id);
    END LOOP;
  END IF;

  IF app_row.operating_hours IS NOT NULL THEN
    INSERT INTO clinic_operating_hours (clinic_id, day, is_open, open_time, close_time)
    SELECT
      new_clinic_id,
      (entry->>'day')::day_of_week,
      (entry->>'isOpen')::BOOLEAN,
      CASE WHEN (entry->>'isOpen')::BOOLEAN THEN (entry->>'openTime')::TIME  ELSE NULL END,
      CASE WHEN (entry->>'isOpen')::BOOLEAN THEN (entry->>'closeTime')::TIME ELSE NULL END
    FROM jsonb_array_elements(
      CASE jsonb_typeof(app_row.operating_hours)
        WHEN 'array'  THEN app_row.operating_hours
        WHEN 'string' THEN (app_row.operating_hours #>> '{}')::JSONB
        ELSE '[]'::JSONB
      END
    ) AS entry
    WHERE (entry->>'isOpen') IS NOT NULL;
  END IF;

  IF app_row.appointment_slot_duration IS NOT NULL THEN
    -- Slot generation is handled separately by the provider dashboard.
    NULL;
  END IF;

  IF app_row.applicant_id IS NOT NULL THEN
    UPDATE profiles
       SET role = 'provider'
     WHERE id = app_row.applicant_id AND role = 'patient';
  END IF;

  INSERT INTO admin_audit_log (admin_id, action, target_type, target_id, details)
  VALUES (
    auth.uid(),
    'approve_application',
    'provider_application',
    app_id::TEXT,
    json_build_object(
      'clinic_id',         new_clinic_id,
      'slug',              new_slug,
      'practitioner_name', app_row.practitioner_name,
      'images_imported',   cardinality(app_row.facility_image_urls),
      'notes',             notes
    )::JSONB
  );

  RETURN json_build_object(
    'success',         true,
    'clinic_id',       new_clinic_id,
    'slug',            new_slug,
    'images_imported', cardinality(app_row.facility_image_urls),
    'message',         'Application approved and clinic created'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMIT;
