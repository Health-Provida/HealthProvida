-- ============================================================
-- HealthProvida — Clinic Images Migration
-- Run this in the Supabase SQL Editor.
--
-- What this does:
--   1. Renames the existing `gallery_images` table to `clinic_images`
--      (preserves ward category grouping, sort_order, all data)
--   2. Renames dependent indexes to match the new table name
--   3. Adds `facility_image_urls TEXT[]` to provider_applications
--      (fixes the silent data-loss bug in submitProviderApplication.js)
--   4. Adds `image_review_status TEXT` to provider_applications
--      (hook for future automated image quality review pipeline)
--   5. Backfills facility_image_urls from facility_image_url where missing
--   6. Re-creates approve_provider_application() so it populates
--      clinic_images from all submitted facility images on approval
--
-- Prerequisites: supabase_schema.sql + supabase_admin_migration.sql
-- ============================================================

BEGIN;

-- ══════════════════════════════════════════════════════════════
-- STEP 1: Rename gallery_images → clinic_images
-- ══════════════════════════════════════════════════════════════
-- NOTE: Existing RLS policies follow the table automatically when
-- it is renamed (policies are bound to the table OID, not its name).
-- Index names must be renamed explicitly.

ALTER TABLE gallery_images RENAME TO clinic_images;

ALTER INDEX IF EXISTS idx_gallery_images_ward   RENAME TO idx_clinic_images_ward;
ALTER INDEX IF EXISTS idx_gallery_images_clinic RENAME TO idx_clinic_images_clinic_id;

-- Compound index that speeds up "all images for a clinic ordered by position"
CREATE INDEX IF NOT EXISTS idx_clinic_images_clinic_order
  ON clinic_images(clinic_id, sort_order);

-- ══════════════════════════════════════════════════════════════
-- STEP 2: Fix provider_applications — add facility_image_urls
-- ══════════════════════════════════════════════════════════════

-- Stores ALL submitted facility images.
-- Previously this column was missing, so the JS client was
-- silently dropping every URL after the first one.
ALTER TABLE provider_applications
  ADD COLUMN IF NOT EXISTS facility_image_urls TEXT[] NOT NULL DEFAULT '{}';

-- Lifecycle column for a future automated image quality review
-- pipeline (e.g. Cloud Vision API, manual moderation queue).
--
-- Values:
--   'pending'      — not yet reviewed (default)
--   'approved'     — all images meet quality requirements
--   'rejected'     — images failed quality check
--   'needs_review' — flagged for human moderation
ALTER TABLE provider_applications
  ADD COLUMN IF NOT EXISTS image_review_status TEXT NOT NULL DEFAULT 'pending'
  CHECK (image_review_status IN ('pending', 'approved', 'rejected', 'needs_review'));

-- Partial index: review queue can efficiently find only the
-- pending applications that still need image moderation.
CREATE INDEX IF NOT EXISTS idx_provider_apps_image_review_status
  ON provider_applications(image_review_status)
  WHERE status = 'pending';

-- ──────────────────────────────────────────────────────────────
-- Backfill: populate facility_image_urls from the scalar
-- facility_image_url for all existing rows submitted before
-- this fix was applied.
-- ──────────────────────────────────────────────────────────────
UPDATE provider_applications
SET facility_image_urls = ARRAY[facility_image_url]
WHERE facility_image_url IS NOT NULL
  AND facility_image_urls = '{}';

-- ══════════════════════════════════════════════════════════════
-- STEP 3: Re-create approve_provider_application() RPC
-- Updated to populate clinic_images from ALL facility images.
-- ══════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION approve_provider_application(
  app_id UUID,
  notes TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
  app_row       provider_applications%ROWTYPE;
  new_clinic_id BIGINT;
  hmo_record    RECORD;
  img_url       TEXT;
  img_idx       INT;
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
  SET status      = 'approved',
      admin_notes = COALESCE(notes, admin_notes),
      updated_at  = now()
  WHERE id = app_id;

  -- Create clinic from application data.
  -- image_url is set to the first facility image (primary/hero image).
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
    -- Primary image: first in facility_image_urls, fallback to
    -- legacy scalar facility_image_url for backward compatibility
    COALESCE(
      NULLIF(app_row.facility_image_urls[1], ''),
      app_row.facility_image_url
    ),
    true,
    true
  ) RETURNING id INTO new_clinic_id;

  -- Populate clinic_images with all submitted facility photos.
  -- sort_order mirrors the submission order (0 = primary / hero).
  -- ward_id defaults to 'reception'; admins can re-categorise via
  -- the admin UI later.
  IF cardinality(app_row.facility_image_urls) > 0 THEN
    img_idx := 0;
    FOREACH img_url IN ARRAY app_row.facility_image_urls LOOP
      INSERT INTO clinic_images (ward_id, clinic_id, image_url, sort_order)
      VALUES ('reception', new_clinic_id, img_url, img_idx);
      img_idx := img_idx + 1;
    END LOOP;
  ELSIF app_row.facility_image_url IS NOT NULL THEN
    -- Legacy fallback: single-image path (pre-fix submissions)
    INSERT INTO clinic_images (ward_id, clinic_id, image_url, sort_order)
    VALUES ('reception', new_clinic_id, app_row.facility_image_url, 0);
  END IF;

  -- Create clinic tags
  IF cardinality(app_row.tags) > 0 THEN
    INSERT INTO clinic_tags (clinic_id, tag)
    SELECT new_clinic_id, unnest(app_row.tags);
  END IF;

  -- Create clinic specialties
  IF cardinality(app_row.specialties) > 0 THEN
    INSERT INTO clinic_specialties (clinic_id, specialty)
    SELECT new_clinic_id, unnest(app_row.specialties);
  END IF;

  -- Create clinic equipment
  IF cardinality(app_row.equipment) > 0 THEN
    INSERT INTO clinic_equipment (clinic_id, equipment_name)
    SELECT new_clinic_id, unnest(app_row.equipment);
  END IF;

  -- Create clinic HMO associations
  IF cardinality(app_row.supported_hmos) > 0 THEN
    FOR hmo_record IN
      SELECT h.id FROM hmos h
      WHERE h.name = ANY(app_row.supported_hmos)
    LOOP
      INSERT INTO clinic_hmos (clinic_id, hmo_id)
      VALUES (new_clinic_id, hmo_record.id);
    END LOOP;
  END IF;

  -- Create operating hours from JSONB
  -- Handles both storage formats:
  --   'array'  → stored correctly as JSONB array (new submissions)
  --   'string' → stored as a JSONB string scalar (old submissions)
  IF app_row.operating_hours IS NOT NULL THEN
    INSERT INTO clinic_operating_hours (clinic_id, day, is_open, open_time, close_time)
    SELECT
      new_clinic_id,
      (entry->>'day')::day_of_week,
      (entry->>'isOpen')::BOOLEAN,
      CASE WHEN (entry->>'isOpen')::BOOLEAN
           THEN (entry->>'openTime')::TIME ELSE NULL END,
      CASE WHEN (entry->>'isOpen')::BOOLEAN
           THEN (entry->>'closeTime')::TIME ELSE NULL END
    FROM jsonb_array_elements(
      CASE jsonb_typeof(app_row.operating_hours)
        WHEN 'array'  THEN app_row.operating_hours
        WHEN 'string' THEN (app_row.operating_hours #>> '{}')::JSONB
        ELSE '[]'::JSONB
      END
    ) AS entry
    WHERE (entry->>'isOpen') IS NOT NULL;
  END IF;

  -- Promote applicant to provider role (only if currently a patient)
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
      'clinic_id',         new_clinic_id,
      'practitioner_name', app_row.practitioner_name,
      'images_imported',   cardinality(app_row.facility_image_urls),
      'notes',             notes
    )::JSONB
  );

  RETURN json_build_object(
    'success',         true,
    'clinic_id',       new_clinic_id,
    'images_imported', cardinality(app_row.facility_image_urls),
    'message',         'Application approved and clinic created'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMIT;
