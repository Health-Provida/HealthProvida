-- ============================================================
-- HealthProvida — Review category ratings
-- Run this in the Supabase SQL Editor after supabase_reviews_migration.sql.
-- ============================================================

ALTER TABLE reviews
  ADD COLUMN IF NOT EXISTS staff_friendliness_rating SMALLINT,
  ADD COLUMN IF NOT EXISTS wait_time_rating SMALLINT,
  ADD COLUMN IF NOT EXISTS quality_of_care_rating SMALLINT,
  ADD COLUMN IF NOT EXISTS facility_cleanliness_rating SMALLINT;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'reviews_staff_friendliness_rating_range'
  ) THEN
    ALTER TABLE reviews
      ADD CONSTRAINT reviews_staff_friendliness_rating_range
      CHECK (staff_friendliness_rating BETWEEN 1 AND 5 OR staff_friendliness_rating IS NULL);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'reviews_wait_time_rating_range'
  ) THEN
    ALTER TABLE reviews
      ADD CONSTRAINT reviews_wait_time_rating_range
      CHECK (wait_time_rating BETWEEN 1 AND 5 OR wait_time_rating IS NULL);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'reviews_quality_of_care_rating_range'
  ) THEN
    ALTER TABLE reviews
      ADD CONSTRAINT reviews_quality_of_care_rating_range
      CHECK (quality_of_care_rating BETWEEN 1 AND 5 OR quality_of_care_rating IS NULL);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'reviews_facility_cleanliness_rating_range'
  ) THEN
    ALTER TABLE reviews
      ADD CONSTRAINT reviews_facility_cleanliness_rating_range
      CHECK (facility_cleanliness_rating BETWEEN 1 AND 5 OR facility_cleanliness_rating IS NULL);
  END IF;
END $$;
