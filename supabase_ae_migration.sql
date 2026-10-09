-- ============================================================
-- HealthProvida — Accident & Emergency (A & E) Specialty Migration
-- ============================================================
-- Adds the 'A & E' specialty to confirmed hospitals that operate
-- 24/7 Accident & Emergency departments in Abuja, Nigeria.
--
-- Hospitals included:
--   • ID 2:  Alliance Hospital (Area 11, Garki)
--   • ID 3:  National Hospital Abuja (Central Business District)
--   • ID 7:  Garki Hospital Abuja (Garki II)
--   • ID 8:  Nizamiye Hospital (Life Camp)
--   • ID 9:  Kelina Hospital (Gwarimpa)
--   • ID 14: Cedarcrest Hospitals (Apo)
--   • ID 15: Nisa Premier Hospital (Jabi)
-- ============================================================

INSERT INTO clinic_specialties (clinic_id, specialty) VALUES
  (2, 'A & E'),
  (3, 'A & E'),
  (7, 'A & E'),
  (8, 'A & E'),
  (9, 'A & E'),
  (14, 'A & E'),
  (15, 'A & E')
ON CONFLICT (clinic_id, specialty) DO NOTHING;
