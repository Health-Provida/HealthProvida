-- ============================================================
-- HealthProvida — Signup Redesign Migration
-- Run this in the Supabase SQL Editor AFTER the base schema.
-- ============================================================

-- ==================== NEW PROFILE COLUMNS ====================

-- Add split name fields
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS first_name TEXT DEFAULT '';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_name TEXT DEFAULT '';

-- Add date of birth
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS date_of_birth DATE;

-- Add promotional opt-out preference
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS promo_opt_out BOOLEAN DEFAULT false;

-- ==================== UNIQUE PHONE CONSTRAINT ====================

-- Ensure phone numbers are unique (excluding NULL and empty strings)
-- This enables the "phone number already exists" check
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_phone_unique 
  ON profiles(phone) WHERE phone IS NOT NULL AND phone != '';

-- ==================== UPDATED TRIGGER ====================

-- Update the handle_new_user trigger to store new fields from user metadata
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger 
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path = public, pg_catalog 
AS $$
BEGIN
  INSERT INTO public.profiles (
    id, full_name, first_name, last_name, email, 
    date_of_birth, phone, promo_opt_out
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'first_name', '') || ' ' || COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    NEW.email,
    CASE 
      WHEN NEW.raw_user_meta_data->>'date_of_birth' IS NOT NULL 
        AND NEW.raw_user_meta_data->>'date_of_birth' != ''
      THEN (NEW.raw_user_meta_data->>'date_of_birth')::DATE
      ELSE NULL
    END,
    NULLIF(NEW.raw_user_meta_data->>'phone', ''),
    COALESCE((NEW.raw_user_meta_data->>'promo_opt_out')::BOOLEAN, false)
  );
  RETURN NEW;
END;
$$;

-- ==================== BACKFILL EXISTING PROFILES ====================

-- For existing profiles that only have full_name, attempt to split into first/last
-- This is a best-effort split on the first space character
UPDATE profiles
SET 
  first_name = CASE 
    WHEN full_name LIKE '% %' THEN split_part(full_name, ' ', 1)
    ELSE full_name 
  END,
  last_name = CASE 
    WHEN full_name LIKE '% %' THEN substring(full_name FROM position(' ' IN full_name) + 1)
    ELSE '' 
  END
WHERE first_name = '' AND full_name != '';
