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

-- Backfill structured category feedback for the existing seeded reviewers.
-- Existing patient-entered category feedback is preserved.
UPDATE reviews AS r
SET
  staff_friendliness_rating = ratings.staff_friendliness_rating,
  wait_time_rating = ratings.wait_time_rating,
  quality_of_care_rating = ratings.quality_of_care_rating,
  facility_cleanliness_rating = ratings.facility_cleanliness_rating
FROM (
  VALUES
    (1, 'Amina O.', 5, 5, 5, 5),
    (1, 'Chidi N.', 5, 5, 5, 5),
    (1, 'Fatima B.', 5, 4, 4, 5),
    (2, 'Emeka A.', 5, 5, 5, 5),
    (2, 'Grace I.', 5, 5, 5, 5),
    (2, 'Yusuf M.', 4, 4, 5, 4),
    (3, 'Dr. Okonkwo R.', 5, 4, 5, 4),
    (3, 'Blessing U.', 5, 4, 5, 5),
    (3, 'Suleiman D.', 4, 2, 5, 4),
    (4, 'Ngozi K.', 5, 5, 5, 5),
    (4, 'Tunde S.', 5, 5, 5, 5),
    (4, 'Halima J.', 5, 4, 5, 5),
    (5, 'Chioma E.', 5, 4, 5, 5),
    (5, 'Ibrahim T.', 5, 5, 5, 5),
    (5, 'Aisha W.', 4, 3, 5, 4),
    (6, 'Funke A.', 5, 4, 5, 5),
    (6, 'Maryam L.', 5, 5, 5, 5),
    (6, 'Joy P.', 5, 4, 4, 4),
    (7, 'Obinna C.', 5, 5, 5, 4),
    (7, 'Zainab H.', 5, 4, 5, 4),
    (7, 'Kenneth O.', 4, 4, 4, 4),
    (8, 'Adaeze M.', 5, 5, 5, 5),
    (8, 'Rasheed B.', 5, 5, 5, 5),
    (8, 'Patricia N.', 4, 4, 5, 5),
    (9, 'Victor E.', 5, 5, 5, 5),
    (9, 'Comfort A.', 5, 5, 5, 4),
    (9, 'Daniel U.', 4, 4, 4, 4)
) AS ratings (
  clinic_id,
  author_name,
  staff_friendliness_rating,
  wait_time_rating,
  quality_of_care_rating,
  facility_cleanliness_rating
)
WHERE r.clinic_id = ratings.clinic_id
  AND r.author_name = ratings.author_name
  AND r.staff_friendliness_rating IS NULL
  AND r.wait_time_rating IS NULL
  AND r.quality_of_care_rating IS NULL
  AND r.facility_cleanliness_rating IS NULL;
