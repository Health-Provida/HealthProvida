-- ============================================================
-- HealthProvida — Reviews System Migration
-- Adds unique constraint and index for the review system
-- Run AFTER supabase_schema.sql
-- ============================================================

-- Enforce one review per patient per clinic at the database level.
-- If a patient tries to insert a duplicate, Supabase returns error code 23505.
ALTER TABLE reviews
  ADD CONSTRAINT reviews_unique_patient_clinic
  UNIQUE (clinic_id, patient_id);

-- Index on patient_id for efficient "has this user already reviewed?" lookups.
CREATE INDEX IF NOT EXISTS idx_reviews_patient
  ON reviews(patient_id);
