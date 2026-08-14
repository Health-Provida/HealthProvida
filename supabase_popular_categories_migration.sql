-- ============================================================
-- HealthProvida — Popular Categories & Provider Expansion Migration
-- Adds 6 high-quality, premier clinics in Abuja covering:
--   1. Eye Care / Ophthalmology (Rachel Eye Center)
--   2. Dental / Dentistry (Bethel Dental Clinic)
--   3. Neurology / Neurosurgery (Brain & Spine Surgery Hospital - BASS)
--   4. Pharmacy / Community Health (H-Medix Pharmacy & Medical Stores)
--   5. Orthopedics & Trauma (Cedarcrest Hospitals)
--   6. Pediatrics & Maternal Health (Nisa Premier Hospital)
--
-- Also enriches specialties for existing clinics 1-9 to ensure
-- all hero popular searches (Hospitals, Dentists, Pharmacies,
-- Pediatrics, Cardiology, Eye Care, Orthopedics, Neurology)
-- return accurate, high-quality results.
-- ============================================================

BEGIN;

-- ══════════════════════════════════════════════════════════════
-- 1. INSERT 6 NEW CLINICS (IDs 10 to 15)
-- ══════════════════════════════════════════════════════════════

INSERT INTO clinics (
  id,
  practitioner_name,
  practice_type,
  practitioner_category,
  address,
  phone,
  email,
  image_url,
  rating,
  number_of_reviews,
  distance_from_location,
  next_available,
  is_verified,
  is_active,
  map_pin_x,
  map_pin_y,
  latitude,
  longitude,
  city,
  state,
  slug
)
OVERRIDING SYSTEM VALUE
VALUES
  -- 10. Rachel Eye Center (Eye Care / Ophthalmology)
  (
    10,
    'Rachel Eye Center',
    'Specialist Eye Clinic / Ophthalmology Center',
    'Specialist Center',
    '23 Onitsha Crescent, Off Gimbiya Street, Area 11, Garki, Abuja 900103, Federal Capital Territory, Nigeria.',
    '+234 908 111 2233',
    'info@racheleye.com.ng',
    'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&q=80&w=1000',
    4.9,
    185,
    '4 km',
    'Today 3:00 PM',
    true,
    true,
    62.00,
    44.00,
    9.0435000,
    7.4892000,
    'Abuja',
    'Federal Capital Territory',
    'rachel-eye-center-abuja-fct'
  ),

  -- 11. Bethel Dental Clinic (Dentistry & Orthodontics)
  (
    11,
    'Bethel Dental Clinic',
    'Specialist Dental Clinic / Oral Healthcare',
    'Dental Clinic',
    '26 Monrovia Street, Off Aminu Kano Crescent, Wuse II, Abuja 904101, Federal Capital Territory, Nigeria.',
    '+234 908 222 3344',
    'care@betheldental.ng',
    'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?auto=format&fit=crop&q=80&w=1000',
    4.9,
    210,
    '6 km',
    'Tomorrow 9:30 AM',
    true,
    true,
    65.00,
    32.00,
    9.0792000,
    7.4721000,
    'Abuja',
    'Federal Capital Territory',
    'bethel-dental-clinic-abuja-fct'
  ),

  -- 12. Brain & Spine Surgery (BASS) Hospital (Neurology & Neurosurgery)
  (
    12,
    'Brain & Spine Surgery Hospital (BASS)',
    'Neurology & Neurosurgery Specialist Hospital',
    'Specialist Center',
    'Plot 645, Alex Ekwueme Way, Jabi District, Abuja 900108, Federal Capital Territory, Nigeria.',
    '+234 908 333 4455',
    'appointments@brainandspine.ng',
    'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=1000',
    4.9,
    140,
    '8 km',
    'Tomorrow 11:00 AM',
    true,
    true,
    35.00,
    40.00,
    9.0683000,
    7.4231000,
    'Abuja',
    'Federal Capital Territory',
    'brain-spine-surgery-hospital-bass-abuja-fct'
  ),

  -- 13. H-Medix Pharmacy & Medical Stores (Pharmacy & Community Health)
  (
    13,
    'H-Medix Pharmacy & Medical Stores',
    'Community Pharmacy & Retail Healthcare Center',
    'Pharmacy',
    '48 Adetokunbo Ademola Crescent, Wuse II, Abuja 904101, Federal Capital Territory, Nigeria.',
    '+234 908 444 5566',
    'pharmacy@hmedix.ng',
    'https://images.unsplash.com/photo-1631549916768-4119b2e5f926?auto=format&fit=crop&q=80&w=1000',
    4.8,
    420,
    '5 km',
    'Today 1:00 PM',
    true,
    true,
    70.00,
    28.00,
    9.0825000,
    7.4810000,
    'Abuja',
    'Federal Capital Territory',
    'h-medix-pharmacy-medical-stores-abuja-fct'
  ),

  -- 14. Cedarcrest Hospitals (Orthopedics & Trauma)
  (
    14,
    'Cedarcrest Hospitals',
    'Orthopedic, Trauma & Multi-specialty Hospital',
    'Hospital',
    'No. 2 Sam Mbakwe Street, Gudu District, Apo, Abuja 900110, Federal Capital Territory, Nigeria.',
    '+234 908 555 6677',
    'info@cedarcresthospitals.com',
    'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&q=80&w=1000',
    4.9,
    340,
    '7 km',
    'Today 4:00 PM',
    true,
    true,
    48.00,
    75.00,
    9.0125000,
    7.4650000,
    'Abuja',
    'Federal Capital Territory',
    'cedarcrest-hospitals-abuja-fct'
  ),

  -- 15. Nisa Premier Hospital (Pediatrics & Maternal Care)
  (
    15,
    'Nisa Premier Hospital',
    'Pediatric, Maternal & Multi-specialty Hospital',
    'Hospital',
    '15/21 Alex Ekwueme Way, Jabi, Abuja 900108, Federal Capital Territory, Nigeria.',
    '+234 908 666 7788',
    'care@nisapremier.com',
    'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?auto=format&fit=crop&q=80&w=1000',
    4.8,
    380,
    '9 km',
    'Tomorrow 10:00 AM',
    true,
    true,
    32.00,
    48.00,
    9.0620000,
    7.4310000,
    'Abuja',
    'Federal Capital Territory',
    'nisa-premier-hospital-abuja-fct'
  )
ON CONFLICT (id) DO UPDATE SET
  practitioner_name = EXCLUDED.practitioner_name,
  practice_type = EXCLUDED.practice_type,
  practitioner_category = EXCLUDED.practitioner_category,
  address = EXCLUDED.address,
  phone = EXCLUDED.phone,
  email = EXCLUDED.email,
  image_url = EXCLUDED.image_url,
  rating = EXCLUDED.rating,
  number_of_reviews = EXCLUDED.number_of_reviews,
  distance_from_location = EXCLUDED.distance_from_location,
  next_available = EXCLUDED.next_available,
  is_verified = EXCLUDED.is_verified,
  is_active = EXCLUDED.is_active,
  map_pin_x = EXCLUDED.map_pin_x,
  map_pin_y = EXCLUDED.map_pin_y,
  latitude = EXCLUDED.latitude,
  longitude = EXCLUDED.longitude,
  city = EXCLUDED.city,
  state = EXCLUDED.state,
  slug = EXCLUDED.slug;

-- Advance serial sequence to at least 15
SELECT setval(pg_get_serial_sequence('clinics', 'id'), GREATEST(15, (SELECT COALESCE(MAX(id), 15) FROM clinics)));

-- ══════════════════════════════════════════════════════════════
-- 2. CLINIC TAGS (For rich search matches)
-- ══════════════════════════════════════════════════════════════

-- Clinic 10: Rachel Eye Center
INSERT INTO clinic_tags (clinic_id, tag) VALUES
  (10, 'Eye Care'),
  (10, 'Ophthalmology'),
  (10, 'Optometry'),
  (10, 'Cataract Surgery'),
  (10, 'Glaucoma Treatment'),
  (10, 'Laser Eye Surgery'),
  (10, 'Optical Services')
ON CONFLICT (clinic_id, tag) DO NOTHING;

-- Clinic 11: Bethel Dental Clinic
INSERT INTO clinic_tags (clinic_id, tag) VALUES
  (11, 'Dental Care'),
  (11, 'Dentistry'),
  (11, 'Dentist'),
  (11, 'Cosmetic Dentistry'),
  (11, 'Teeth Whitening'),
  (11, 'Orthodontics'),
  (11, 'Dental Implants'),
  (11, 'Root Canal Therapy')
ON CONFLICT (clinic_id, tag) DO NOTHING;

-- Clinic 12: Brain & Spine Surgery Hospital
INSERT INTO clinic_tags (clinic_id, tag) VALUES
  (12, 'Neurology'),
  (12, 'Neurosurgery'),
  (12, 'Spine Care'),
  (12, 'Brain Health'),
  (12, 'Stroke Rehabilitation'),
  (12, 'Neurodiagnostics'),
  (12, 'Epilepsy Management')
ON CONFLICT (clinic_id, tag) DO NOTHING;

-- Clinic 13: H-Medix Pharmacy
INSERT INTO clinic_tags (clinic_id, tag) VALUES
  (13, 'Pharmacy'),
  (13, 'Pharmacies'),
  (13, 'Prescription Medication'),
  (13, 'Health & Wellness'),
  (13, 'Medical Supplies'),
  (13, 'Vaccination Center'),
  (13, '24/7 Pharmacy')
ON CONFLICT (clinic_id, tag) DO NOTHING;

-- Clinic 14: Cedarcrest Hospitals
INSERT INTO clinic_tags (clinic_id, tag) VALUES
  (14, 'Orthopedics'),
  (14, 'Orthopedic Surgery'),
  (14, 'Joint Replacement'),
  (14, 'Sports Medicine'),
  (14, 'Trauma Center'),
  (14, 'Spine Care'),
  (14, 'Physical Therapy')
ON CONFLICT (clinic_id, tag) DO NOTHING;

-- Clinic 15: Nisa Premier Hospital
INSERT INTO clinic_tags (clinic_id, tag) VALUES
  (15, 'Pediatrics'),
  (15, 'Pediatric Care'),
  (15, 'Neonatal ICU'),
  (15, 'Maternal Care'),
  (15, 'Obstetrics'),
  (15, 'Vaccinations'),
  (15, 'Child Health')
ON CONFLICT (clinic_id, tag) DO NOTHING;

-- ══════════════════════════════════════════════════════════════
-- 3. CLINIC SPECIALTIES
-- ══════════════════════════════════════════════════════════════

-- Clinic 10: Rachel Eye Center
INSERT INTO clinic_specialties (clinic_id, specialty) VALUES
  (10, 'Eye Care'),
  (10, 'Ophthalmology'),
  (10, 'Optometry'),
  (10, 'Pediatric Ophthalmology'),
  (10, 'Corneal Surgery')
ON CONFLICT (clinic_id, specialty) DO NOTHING;

-- Clinic 11: Bethel Dental Clinic
INSERT INTO clinic_specialties (clinic_id, specialty) VALUES
  (11, 'Dentistry'),
  (11, 'Orthodontics'),
  (11, 'Periodontics'),
  (11, 'Oral & Maxillofacial Surgery'),
  (11, 'Pediatric Dentistry'),
  (11, 'Prosthodontics')
ON CONFLICT (clinic_id, specialty) DO NOTHING;

-- Clinic 12: Brain & Spine Surgery Hospital
INSERT INTO clinic_specialties (clinic_id, specialty) VALUES
  (12, 'Neurology'),
  (12, 'Neurosurgery'),
  (12, 'Spine Surgery'),
  (12, 'Neurophysiology'),
  (12, 'Pediatric Neurology'),
  (12, 'Interventional Neuroradiology')
ON CONFLICT (clinic_id, specialty) DO NOTHING;

-- Clinic 13: H-Medix Pharmacy
INSERT INTO clinic_specialties (clinic_id, specialty) VALUES
  (13, 'Pharmaceutical Care'),
  (13, 'Medication Therapy Management'),
  (13, 'Chronic Disease Counseling'),
  (13, 'Compounding Pharmacy'),
  (13, 'Wellness Consultations')
ON CONFLICT (clinic_id, specialty) DO NOTHING;

-- Clinic 14: Cedarcrest Hospitals
INSERT INTO clinic_specialties (clinic_id, specialty) VALUES
  (14, 'Orthopedics'),
  (14, 'Orthopedic Surgery'),
  (14, 'Joint Reconstruction'),
  (14, 'Sports Medicine'),
  (14, 'Traumatology'),
  (14, 'Rheumatology')
ON CONFLICT (clinic_id, specialty) DO NOTHING;

-- Clinic 15: Nisa Premier Hospital
INSERT INTO clinic_specialties (clinic_id, specialty) VALUES
  (15, 'Pediatrics'),
  (15, 'Neonatology'),
  (15, 'Pediatric Surgery'),
  (15, 'Obstetrics & Gynecology'),
  (15, 'Pediatric Allergy & Immunology')
ON CONFLICT (clinic_id, specialty) DO NOTHING;

-- Also enrich existing clinics (3, 7, 8, 9) with accurate specialties
INSERT INTO clinic_specialties (clinic_id, specialty) VALUES
  (3, 'Pediatrics'),
  (3, 'Oncology'),
  (3, 'General Surgery'),
  (3, 'Internal Medicine'),
  (7, 'Pediatrics'),
  (7, 'General Medicine'),
  (7, 'Surgery'),
  (7, 'Emergency Medicine'),
  (8, 'Cardiology'),
  (8, 'Neurology'),
  (8, 'Neurosurgery'),
  (8, 'Orthopedic Surgery'),
  (9, 'Urology'),
  (9, 'Laparoscopic Surgery'),
  (9, 'General Surgery'),
  (9, 'Endoscopy')
ON CONFLICT (clinic_id, specialty) DO NOTHING;

-- ══════════════════════════════════════════════════════════════
-- 4. CLINIC EQUIPMENT & FACILITIES
-- ══════════════════════════════════════════════════════════════

-- Clinic 10: Rachel Eye Center
INSERT INTO clinic_equipment (clinic_id, equipment_name) VALUES
  (10, 'Slit Lamp Biomicroscope'),
  (10, 'Visual Field Analyzer (Humphrey)'),
  (10, 'Phacoemulsification Cataract System'),
  (10, 'OCT Retinal Scanner'),
  (10, 'Non-contact Tonometer')
ON CONFLICT (clinic_id, equipment_name) DO NOTHING;

-- Clinic 11: Bethel Dental Clinic
INSERT INTO clinic_equipment (clinic_id, equipment_name) VALUES
  (11, 'Digital Panoramic Dental X-Ray'),
  (11, '3D Intraoral Scanner'),
  (11, 'Class B Autoclave Sterilizer'),
  (11, 'Soft-tissue Dental Laser'),
  (11, 'Electronic Apex Locator'),
  (11, 'Ergonomic Surgical Dental Chairs')
ON CONFLICT (clinic_id, equipment_name) DO NOTHING;

-- Clinic 12: Brain & Spine Surgery Hospital
INSERT INTO clinic_equipment (clinic_id, equipment_name) VALUES
  (12, '1.5T High-field MRI Scanner'),
  (12, '64-Slice Diagnostic CT Scanner'),
  (12, 'Digital EEG Telemetry Unit'),
  (12, 'EMG/NCS Electromyograph'),
  (12, 'Intraoperative Neuro-monitoring (IONM)'),
  (12, 'Zeiss Surgical Neuro-Microscope')
ON CONFLICT (clinic_id, equipment_name) DO NOTHING;

-- Clinic 13: H-Medix Pharmacy
INSERT INTO clinic_equipment (clinic_id, equipment_name) VALUES
  (13, 'Automated Prescription Dispenser'),
  (13, 'Cold-Chain Vaccine Storage Freezers'),
  (13, 'Digital Blood Pressure & Glucose Station'),
  (13, 'Laminar Flow Compounding Hood'),
  (13, 'Point-of-Care Diagnostic Testing Hub')
ON CONFLICT (clinic_id, equipment_name) DO NOTHING;

-- Clinic 14: Cedarcrest Hospitals
INSERT INTO clinic_equipment (clinic_id, equipment_name) VALUES
  (14, 'C-Arm Surgical Fluoroscopy System'),
  (14, 'Direct Digital Radiography (DR)'),
  (14, 'High-Definition Arthroscopy Tower'),
  (14, 'Laminar Airflow Orthopedic Operating Suites'),
  (14, 'Hydrotherapy & Physical Rehabilitation Gym'),
  (14, 'Multislice Trauma CT Scanner')
ON CONFLICT (clinic_id, equipment_name) DO NOTHING;

-- Clinic 15: Nisa Premier Hospital
INSERT INTO clinic_equipment (clinic_id, equipment_name) VALUES
  (15, 'Level-3 Neonatal Intensive Care Unit (NICU)'),
  (15, 'Dräger Infant Incubators & Warmers'),
  (15, 'LED Neonatal Phototherapy Units'),
  (15, 'Pediatric Mechanical Ventilators'),
  (15, 'Voluson 4D Obstetric Ultrasound'),
  (15, 'Continuous Fetal Cardiotocography (CTG)')
ON CONFLICT (clinic_id, equipment_name) DO NOTHING;

-- ══════════════════════════════════════════════════════════════
-- 5. CLINIC ↔ HMO ASSOCIATIONS
-- ══════════════════════════════════════════════════════════════

INSERT INTO clinic_hmos (clinic_id, hmo_id)
SELECT 10, id FROM hmos WHERE name IN ('Hygeia HMO', 'Avon Healthcare', 'Reliance HMO', 'AXA Mansard', 'Leadway Health')
ON CONFLICT (clinic_id, hmo_id) DO NOTHING;

INSERT INTO clinic_hmos (clinic_id, hmo_id)
SELECT 11, id FROM hmos WHERE name IN ('Hygeia HMO', 'Avon Healthcare', 'Reliance HMO', 'AXA Mansard', 'MetroHealth HMO')
ON CONFLICT (clinic_id, hmo_id) DO NOTHING;

INSERT INTO clinic_hmos (clinic_id, hmo_id)
SELECT 12, id FROM hmos WHERE name IN ('Hygeia HMO', 'Avon Healthcare', 'AXA Mansard', 'Leadway Health', 'Total Health Trust')
ON CONFLICT (clinic_id, hmo_id) DO NOTHING;

INSERT INTO clinic_hmos (clinic_id, hmo_id)
SELECT 13, id FROM hmos WHERE name IN ('Hygeia HMO', 'Avon Healthcare', 'Reliance HMO', 'AXA Mansard', 'Leadway Health', 'Clearline HMO')
ON CONFLICT (clinic_id, hmo_id) DO NOTHING;

INSERT INTO clinic_hmos (clinic_id, hmo_id)
SELECT 14, id FROM hmos WHERE name IN ('Hygeia HMO', 'Avon Healthcare', 'Reliance HMO', 'AXA Mansard', 'Leadway Health', 'Total Health Trust')
ON CONFLICT (clinic_id, hmo_id) DO NOTHING;

INSERT INTO clinic_hmos (clinic_id, hmo_id)
SELECT 15, id FROM hmos WHERE name IN ('Hygeia HMO', 'Avon Healthcare', 'Reliance HMO', 'AXA Mansard', 'Leadway Health')
ON CONFLICT (clinic_id, hmo_id) DO NOTHING;

-- ══════════════════════════════════════════════════════════════
-- 6. REVIEWS & DETAILED CATEGORY RATINGS
-- ══════════════════════════════════════════════════════════════

INSERT INTO reviews (
  clinic_id,
  author_name,
  rating,
  review_text,
  review_date,
  is_verified,
  staff_friendliness_rating,
  wait_time_rating,
  quality_of_care_rating,
  facility_cleanliness_rating
)
VALUES
  -- Rachel Eye Center (Clinic 10)
  (
    10,
    'Dr. Kemi Adeleke',
    5,
    'Rachel Eye Center is by far the most thorough ophthalmology facility in Abuja. Dr. Onu examined my glaucoma condition with high-tech visual field equipment and explained my eye pressure readings clearly. Highly recommended!',
    'April 2026',
    true,
    5, 4, 5, 5
  ),
  (
    10,
    'Ibrahim Sanusi',
    5,
    'Had cataract surgery done here for both of my eyes. The precision of the procedure and post-op care was world class. My vision is sharper than it has been in ten years.',
    'March 2026',
    true,
    5, 5, 5, 5
  ),
  (
    10,
    'Amaka Obi',
    4,
    'Got my designer prescription glasses and complete eye exam here. The optometrist was very patient with my astigmatism test. Clean and serene atmosphere in Area 11.',
    'February 2026',
    true,
    5, 4, 4, 5
  ),

  -- Bethel Dental Clinic (Clinic 11)
  (
    11,
    'Damilola Daniels',
    5,
    'I used to dread visiting the dentist until I came to Bethel Dental Clinic in Wuse II. The root canal procedure was completely painless. Dr. Bethel and his team are exceptionally gentle and professional.',
    'April 2026',
    true,
    5, 5, 5, 5
  ),
  (
    11,
    'Nafisa Bello',
    5,
    'Did professional laser teeth whitening and orthodontic checkup. The results exceeded my expectations! Their dental chairs and digital imaging tools are ultra-modern.',
    'March 2026',
    true,
    5, 5, 5, 5
  ),
  (
    11,
    'Emeka Nwosu',
    4,
    'Brought my 8-year-old daughter for pediatric dental filling. The dentist was wonderful with kids and kept her relaxed throughout. Excellent sterilization standards.',
    'February 2026',
    true,
    5, 4, 5, 5
  ),

  -- Brain & Spine Surgery Hospital (Clinic 12)
  (
    12,
    'Engr. Farouk Usman',
    5,
    'BASS Hospital is a beacon of hope for neurological and spine conditions in Nigeria. Their neurosurgical team treated my lumbar spine disc herniation with minimally invasive surgery. I was back walking within 48 hours.',
    'April 2026',
    true,
    5, 4, 5, 5
  ),
  (
    12,
    'Victoria Chinedu',
    5,
    'My mother suffered an ischemic stroke and the rapid intervention from BASS Hospital''s neurology team saved her cognitive function. Outstanding ICU and neurodiagnostics on site.',
    'March 2026',
    true,
    5, 5, 5, 5
  ),
  (
    12,
    'Suleiman Aliyu',
    4,
    'Top neurologist consultation for chronic migraines and EEG study. Specialist was attentive and formulated a targeted medication strategy that finally worked.',
    'January 2026',
    true,
    4, 4, 5, 4
  ),

  -- H-Medix Pharmacy (Clinic 13)
  (
    13,
    'Hauwa Mohammed',
    5,
    'H-Medix is my one-stop healthcare and prescription hub in Wuse 2. They always have rare imported medications in stock and their pharmacists provide excellent dosage counseling.',
    'April 2026',
    true,
    5, 5, 5, 5
  ),
  (
    13,
    'Chukwudi Igwe',
    5,
    'The 24/7 service in Wuse II is a lifesaver during late-night emergencies. The pharmacist was very helpful in checking drug interactions with my prescription.',
    'March 2026',
    true,
    5, 5, 5, 5
  ),
  (
    13,
    'Bolaji Alabi',
    4,
    'Clean, spacious pharmacy with a wide variety of healthcare supplies, vitamins, and medical equipment. Quick service at the dispensary counters.',
    'February 2026',
    true,
    4, 4, 5, 5
  ),

  -- Cedarcrest Hospitals (Clinic 14)
  (
    14,
    'Brig. Gen. M. Danjuma (Rtd)',
    5,
    'Cedarcrest is undeniably the premier center for orthopedics and joint replacement in West Africa. Had my total hip replacement here; the surgical outcome and physiotherapy rehab were impeccable.',
    'April 2026',
    true,
    5, 5, 5, 5
  ),
  (
    14,
    'Blessing Ebere',
    5,
    'Tore my ACL during sports training and had arthroscopic reconstruction done at Cedarcrest Gudu. Dr. Felix and the orthopedic nurses gave me first-class care.',
    'March 2026',
    true,
    5, 4, 5, 5
  ),
  (
    14,
    'Tariq Mustapha',
    4,
    'Comprehensive trauma and orthopedic emergency care. Digital X-rays and CT imaging results were ready within 20 minutes.',
    'February 2026',
    true,
    4, 4, 5, 5
  ),

  -- Nisa Premier Hospital (Clinic 15)
  (
    15,
    'Aisha Garba',
    5,
    'Delivered my twin babies at Nisa Premier Hospital and the pediatric NICU team was extraordinary. The neonatologists monitored my premature twins 24/7 with the utmost dedication.',
    'April 2026',
    true,
    5, 5, 5, 5
  ),
  (
    15,
    'Dr. Ngozi Ezeh',
    5,
    'The best pediatric outpatient clinic in Abuja. The pediatricians take their time to examine children thoroughly and immunization records are tracked meticulously.',
    'March 2026',
    true,
    5, 4, 5, 5
  ),
  (
    15,
    'Umar Abdullahi',
    4,
    'Excellent maternal and child healthcare facility in Jabi. Clean wards, caring nurses, and a reassuring environment for young families.',
    'February 2026',
    true,
    5, 4, 5, 4
  );

-- ══════════════════════════════════════════════════════════════
-- 7. OPERATING HOURS (Mon-Sat for all new clinics)
-- ══════════════════════════════════════════════════════════════

INSERT INTO clinic_operating_hours (clinic_id, day, is_open, open_time, close_time)
SELECT c_id, d.day, d.is_open, d.open_time, d.close_time
FROM unnest(ARRAY[10, 11, 12, 13, 14, 15]) AS c_id
CROSS JOIN (VALUES
  ('Monday'::day_of_week,    true,  '08:00'::TIME, '17:00'::TIME),
  ('Tuesday'::day_of_week,   true,  '08:00'::TIME, '17:00'::TIME),
  ('Wednesday'::day_of_week, true,  '08:00'::TIME, '17:00'::TIME),
  ('Thursday'::day_of_week,  true,  '08:00'::TIME, '17:00'::TIME),
  ('Friday'::day_of_week,    true,  '08:00'::TIME, '17:00'::TIME),
  ('Saturday'::day_of_week,  true,  '09:00'::TIME, '15:00'::TIME),
  ('Sunday'::day_of_week,    false, NULL,           NULL)
) AS d(day, is_open, open_time, close_time)
ON CONFLICT (clinic_id, day) DO NOTHING;

-- ══════════════════════════════════════════════════════════════
-- 8. APPOINTMENT SLOTS (Next 3 days)
-- ══════════════════════════════════════════════════════════════

-- Today slots
INSERT INTO appointment_slots (clinic_id, slot_date, slot_time, duration_minutes)
SELECT c_id, CURRENT_DATE, t.slot_time, 30
FROM unnest(ARRAY[10, 11, 12, 13, 14, 15]) AS c_id
CROSS JOIN (VALUES
  ('14:00'::TIME), ('14:30'::TIME), ('15:00'::TIME), ('15:30'::TIME), ('16:00'::TIME), ('16:30'::TIME)
) AS t(slot_time);

-- Tomorrow slots
INSERT INTO appointment_slots (clinic_id, slot_date, slot_time, duration_minutes)
SELECT c_id, CURRENT_DATE + 1, t.slot_time, 30
FROM unnest(ARRAY[10, 11, 12, 13, 14, 15]) AS c_id
CROSS JOIN (VALUES
  ('09:00'::TIME), ('09:30'::TIME), ('10:00'::TIME), ('10:30'::TIME),
  ('11:00'::TIME), ('11:30'::TIME), ('13:00'::TIME), ('13:30'::TIME),
  ('14:00'::TIME), ('14:30'::TIME), ('15:00'::TIME), ('15:30'::TIME)
) AS t(slot_time);

-- Day after tomorrow slots
INSERT INTO appointment_slots (clinic_id, slot_date, slot_time, duration_minutes)
SELECT c_id, CURRENT_DATE + 2, t.slot_time, 30
FROM unnest(ARRAY[10, 11, 12, 13, 14, 15]) AS c_id
CROSS JOIN (VALUES
  ('09:00'::TIME), ('09:30'::TIME), ('10:00'::TIME), ('10:30'::TIME),
  ('11:00'::TIME), ('11:30'::TIME), ('13:00'::TIME), ('13:30'::TIME),
  ('14:00'::TIME), ('14:30'::TIME), ('15:00'::TIME), ('15:30'::TIME)
) AS t(slot_time);

COMMIT;
