-- ============================================================
-- HealthProvida — Google Maps Integration Migration
-- Run this in the Supabase SQL Editor AFTER the base schema
-- and seed data.
-- ============================================================

-- ==================== 1. Add lat/lng to provider_applications ====================
-- (The clinics table already has latitude/longitude columns from the base schema)
ALTER TABLE provider_applications
  ADD COLUMN IF NOT EXISTS latitude NUMERIC(10,7),
  ADD COLUMN IF NOT EXISTS longitude NUMERIC(10,7);

-- ==================== 2. Backfill real Abuja coordinates for 9 seed clinics ====================
-- These are accurate lat/lng for the actual clinic locations in Abuja, Nigeria.

-- Clinic 1: Wellington Clinics — Life Camp area
UPDATE clinics SET latitude = 9.0827, longitude = 7.3987 WHERE id = 1;

-- Clinic 2: Alliance Hospital — Area 11, Garki
UPDATE clinics SET latitude = 9.0489, longitude = 7.4839 WHERE id = 2;

-- Clinic 3: National Hospital Abuja — Central Business District
UPDATE clinics SET latitude = 9.0408, longitude = 7.4942 WHERE id = 3;

-- Clinic 4: Abuja Clinics — Maitama
UPDATE clinics SET latitude = 9.0820, longitude = 7.4920 WHERE id = 4;

-- Clinic 5: Aquila Clinic and Fertility — Apo Legislative Quarters
UPDATE clinics SET latitude = 9.0167, longitude = 7.5094 WHERE id = 5;

-- Clinic 6: Marie Stopes Medical Centre — Wuse II
UPDATE clinics SET latitude = 9.0624, longitude = 7.4876 WHERE id = 6;

-- Clinic 7: Garki Hospital — Tafawa Balewa Way, Garki
UPDATE clinics SET latitude = 9.0343, longitude = 7.4901 WHERE id = 7;

-- Clinic 8: Nizamiye Hospital — Life Camp Junction
UPDATE clinics SET latitude = 9.0844, longitude = 7.4051 WHERE id = 8;

-- Clinic 9: Kelina Hospital — Gwarimpa Estate
UPDATE clinics SET latitude = 9.1048, longitude = 7.3879 WHERE id = 9;

-- ==================== 3. Verify ====================
-- Quick check: all 9 clinics should now have coordinates
-- SELECT id, practitioner_name, latitude, longitude FROM clinics WHERE id <= 9;
