
-- ============================================================
-- HealthProvida — Clinic Images Cleanup Migration
--
-- WARNING: Run this ONLY AFTER:
--   1. supabase_clinic_images_migration.sql has been applied
--   2. All application code referencing `facility_image_url`
--      (singular) has been updated to use `facility_image_urls`
--   3. The fix has been deployed and verified in production
--
-- What this does:
--   Drops the now-redundant `facility_image_url TEXT` scalar
--   column from provider_applications. All data was already
--   copied into facility_image_urls[] by the backfill migration.
-- ============================================================

BEGIN;

ALTER TABLE provider_applications
  DROP COLUMN IF EXISTS facility_image_url;

COMMIT;

