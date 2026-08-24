-- ==================== GALLERY MIGRATION ====================
-- Run this in Supabase SQL Editor to update gallery wards and images
-- This script is safe to run on an existing database — it only touches
-- gallery_wards and clinic_images tables.
-- ============================================================

-- Step 1: Remove old clinic_images (shared/common ones with clinic_id IS NULL)
DELETE FROM clinic_images WHERE clinic_id IS NULL;

-- Step 2: Remove old gallery_wards and re-insert with updated categories
DELETE FROM gallery_wards;

INSERT INTO gallery_wards (id, title, description, sort_order) VALUES
  ('reception', 'Reception', 'Modern, comfortable seating, 24/7 front desk, and a welcoming environment for all patients and visitors.', 1),
  ('outpatient_area', 'Outpatient Area', 'Our outpatient area provides high-quality, walk-in medical services without the need for overnight admission. Patients benefit from swift consultations, diagnostics, and treatments in a calm, well-organised space designed to minimise wait times and maximise comfort.', 2),
  ('phlebotomy_room', 'Phlebotomy Room', 'Our dedicated phlebotomy room offers a clean, hygienic, and patient-friendly environment for blood draws and specimen collection. Staffed by trained phlebotomists, we ensure a safe, efficient, and as comfortable an experience as possible for every patient.', 3),
  ('consulting_room', 'Consulting Room', 'Private and comfortable consulting rooms designed to facilitate open communication and comprehensive medical examinations.', 4),
  ('private_ward', 'Private Ward', 'Our private wards offer a premium, fully private inpatient experience with en-suite bathrooms, personalised nursing care, and comfortable accommodation for a family member or loved one — ensuring rest, dignity, and peace of mind throughout recovery.', 5),
  ('semi_private_ward', 'Semi-Private Ward', 'Our semi-private wards provide quality inpatient care in a shared but thoughtfully partitioned space. Patients enjoy attentive nursing, essential amenities, and a comfortable environment, offering the right balance of care and value.', 6),
  ('laboratory', 'Laboratory', 'State-of-the-art diagnostic laboratory equipped with advanced technology for accurate and timely test results.', 7),
  ('special_units', 'Special Units', 'Dedicated intensive care and maternity units with advanced life support systems and specialized nursing.', 8);

-- Step 3: Insert updated clinic_images (3+ per category)

-- Reception
INSERT INTO clinic_images (ward_id, clinic_id, image_url, sort_order) VALUES
  ('reception', NULL, 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=800', 2),
  ('reception', NULL, 'https://images.unsplash.com/photo-1538108149393-fbbd81895907?auto=format&fit=crop&q=80&w=800', 3),
  ('reception', NULL, 'https://images.unsplash.com/photo-1519494080410-f9aa76cb4283?auto=format&fit=crop&q=80&w=800', 4);

-- Outpatient Area
INSERT INTO clinic_images (ward_id, clinic_id, image_url, sort_order) VALUES
  ('outpatient_area', NULL, 'https://images.unsplash.com/photo-1580281657702-257584239a55?auto=format&fit=crop&q=80&w=800', 2),
  ('outpatient_area', NULL, 'https://images.unsplash.com/photo-1562243057-02dae7bb3bb4?auto=format&fit=crop&q=80&w=800', 3),
  ('outpatient_area', NULL, 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=800', 4);

-- Phlebotomy Room
INSERT INTO clinic_images (ward_id, clinic_id, image_url, sort_order) VALUES
  ('phlebotomy_room', NULL, 'https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&q=80&w=800', 2),
  ('phlebotomy_room', NULL, 'https://images.unsplash.com/photo-1584483766114-2cea6facdf57?auto=format&fit=crop&q=80&w=800', 3),
  ('phlebotomy_room', NULL, 'https://images.unsplash.com/photo-1581594693702-fbdc51b2763b?auto=format&fit=crop&q=80&w=800', 4);

-- Consulting Room
INSERT INTO clinic_images (ward_id, clinic_id, image_url, sort_order) VALUES
  ('consulting_room', NULL, 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&q=80&w=800', 1),
  ('consulting_room', NULL, 'https://images.unsplash.com/photo-1550831107-1553da8c8464?auto=format&fit=crop&q=80&w=800', 2),
  ('consulting_room', NULL, 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&q=80&w=800', 3);

-- Private Ward
INSERT INTO clinic_images (ward_id, clinic_id, image_url, sort_order) VALUES
  ('private_ward', NULL, 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&q=80&w=800', 2),
  ('private_ward', NULL, 'https://images.unsplash.com/photo-1505692952047-1a78307da8f2?auto=format&fit=crop&q=80&w=800', 3),
  ('private_ward', NULL, 'https://images.unsplash.com/photo-1512678080530-7760d81faba6?auto=format&fit=crop&q=80&w=800', 4);

-- Semi-Private Ward
INSERT INTO clinic_images (ward_id, clinic_id, image_url, sort_order) VALUES
  ('semi_private_ward', NULL, 'https://images.unsplash.com/photo-1519710164239-da123dc03ef4?auto=format&fit=crop&q=80&w=800', 2),
  ('semi_private_ward', NULL, 'https://images.unsplash.com/photo-1538108149393-fbbd81895907?auto=format&fit=crop&q=80&w=800', 3),
  ('semi_private_ward', NULL, 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&q=80&w=800', 4);

-- Laboratory
INSERT INTO clinic_images (ward_id, clinic_id, image_url, sort_order) VALUES
  ('laboratory', NULL, 'https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&q=80&w=800', 1),
  ('laboratory', NULL, 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&q=80&w=800', 2),
  ('laboratory', NULL, 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&q=80&w=800', 3);

-- Special Units
INSERT INTO clinic_images (ward_id, clinic_id, image_url, sort_order) VALUES
  ('special_units', NULL, 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=800', 2),
  ('special_units', NULL, 'https://images.unsplash.com/photo-1530497610245-94d3c16cda28?auto=format&fit=crop&q=80&w=800', 3),
  ('special_units', NULL, 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=800', 4);
