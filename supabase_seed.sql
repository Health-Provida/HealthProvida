-- ============================================================
-- HealthProvida — Seed Data for 9 Existing Clinics
-- Run AFTER supabase_schema.sql
-- ============================================================

-- ==================== CLINICS ====================
INSERT INTO clinics (id, practitioner_name, practice_type, practitioner_category, address, phone, email, rating, number_of_reviews, distance_from_location, next_available, is_verified, map_pin_x, map_pin_y)
OVERRIDING SYSTEM VALUE
VALUES
  (1, 'Wellington Clinics', 'Multi-specialty Clinic / General Practice', 'Clinic',
   'Plot 321 Gidan Fulani Street, Lifecamp, Abuja 900108, Federal Capital Territory, Nigeria.',
   '+234 901 234 5678', 'info@wellingtonclinics.ng', 4.8, 245, '10 km', 'Tomorrow 10:00 AM', true, 28, 22),

  (2, 'Alliance Hospital', 'General Hospital / Specialist Care', 'Hospital',
   'No. 5 Malumfashi Close, Off Emeka Anyaoku Street, Area 11, Garki, F.C.T, Abuja.',
   '+234 902 345 6789', 'info@alliancehospital.ng', 4.8, 310, '5 km', 'Today 2:30 PM', true, 55, 38),

  (3, 'National Hospital Abuja', 'Tertiary Care Hospital / National Referral Center', 'Hospital',
   'PMB 425 Ali Muhammad Zarah Street, Central Business Dis, Abuja 900103, Federal Capital Territory, Nigeria.',
   '+234 903 456 7890', 'info@nationalhospital.gov.ng', 4.8, 550, '3 km', 'Today 2:30 PM', true, 50, 52),

  (4, 'Abuja Clinics', 'Private Multi-specialty Clinic', 'Clinic',
   '22 Amazon St, Maitama, Abuja 904101, Federal Capital Territory, Nigeria.',
   '+234 904 567 8901', 'info@abujaclinics.com', 4.8, 240, '10 km', 'Today 2:30 PM', true, 68, 25),

  (5, 'Aquila Clinic and Fertility', 'Fertility & Reproductive Health Clinic', 'Specialist Center',
   'Zone A, Apo Legislative Quarters, 21 Tatari Ali Cl, Garki, Abuja 900110, Federal Capital Territory, Nigeria.',
   '+234 905 678 9012', 'info@aquilafertility.ng', 4.8, 120, '8 km', 'Today 2:30 PM', true, 42, 68),

  (6, 'Marie Stopes Medical Centre, Abuja', 'Reproductive Health & Family Planning Clinic', 'Clinic',
   'Plot 45, Wuse II District, Abuja F.C.T, Nigeria.',
   '+234 906 789 0123', 'abuja@mariestopes.ng', 4.8, 95, '6 km', 'Today 2:30 PM', true, 72, 48),

  (7, 'Garki Hospital Abuja', 'General Private Hospital', 'Hospital',
   'Tafawa Balewa Way, Garki, Abuja.',
   '+234 907 890 1234', 'info@garkihospital.ng', 4.8, 280, '4 km', 'Today 2:30 PM', true, 60, 62),

  (8, 'Nizamiye Hospital (Life Camp)', 'Private General Hospital', 'Hospital',
   'Plot 101, Life Camp Junction, Abuja F.C.T, Nigeria.',
   '+234 908 901 2345', 'info@nizamiyehospital.ng', 4.8, 150, '11 km', 'Today 2:30 PM', true, 20, 45),

  (9, 'Kelina Hospital (Gwarimpa)', 'Specialist Surgical Hospital', 'Hospital',
   'Road 69, Gwarimpa Estate, Abuja F.C.T, Nigeria.',
   '+234 909 012 3456', 'info@kelinahospital.ng', 4.8, 110, '15 km', 'Today 2:30 PM', true, 15, 72);

-- Reset the identity sequence to continue after id=9
SELECT setval(pg_get_serial_sequence('clinics', 'id'), 9);

-- ==================== CLINIC TAGS ====================
-- Clinic 1: Wellington Clinics
INSERT INTO clinic_tags (clinic_id, tag) VALUES
  (1, 'General Practice'), (1, 'Family Medicine'), (1, 'Diagnostic Services'),
  (1, 'Preventative Care'), (1, 'Telehealth Available'), (1, 'Walk-in Clinic');

-- Clinic 2: Alliance Hospital
INSERT INTO clinic_tags (clinic_id, tag) VALUES
  (2, 'General Surgery'), (2, 'Cardiology'), (2, 'Orthopedics'),
  (2, 'Emergency Services'), (2, 'Intensive Care'), (2, 'Specialist Consultations');

-- Clinic 3: National Hospital Abuja
INSERT INTO clinic_tags (clinic_id, tag) VALUES
  (3, 'Tertiary Care'), (3, 'Research Hospital'), (3, 'Specialized Surgery'),
  (3, 'Pediatrics'), (3, 'Oncology'), (3, 'Public Health');

-- Clinic 4: Abuja Clinics
INSERT INTO clinic_tags (clinic_id, tag) VALUES
  (4, 'Premium Healthcare'), (4, 'Executive Check-ups'), (4, 'Diagnostic Imaging'),
  (4, 'Family Health'), (4, 'Women''s Health'), (4, 'Urgent Care');

-- Clinic 5: Aquila Clinic and Fertility
INSERT INTO clinic_tags (clinic_id, tag) VALUES
  (5, 'IVF'), (5, 'Reproductive Medicine'), (5, 'Gynecological Services'),
  (5, 'Male Fertility'), (5, 'Counseling Services'), (5, 'Women''s Health');

-- Clinic 6: Marie Stopes
INSERT INTO clinic_tags (clinic_id, tag) VALUES
  (6, 'Family Planning'), (6, 'Contraception'), (6, 'Women''s Health'),
  (6, 'Maternal Health'), (6, 'Sexual Health'), (6, 'Counseling Services');

-- Clinic 7: Garki Hospital
INSERT INTO clinic_tags (clinic_id, tag) VALUES
  (7, 'General Medicine'), (7, 'Pediatrics'), (7, 'Surgery'),
  (7, 'Diagnostics'), (7, 'Pharmacy Services'), (7, 'Emergency Department');

-- Clinic 8: Nizamiye Hospital
INSERT INTO clinic_tags (clinic_id, tag) VALUES
  (8, 'International Healthcare'), (8, 'Advanced Diagnostics'), (8, 'Cardiology'),
  (8, 'Neurosurgery'), (8, 'Orthopedic Surgery'), (8, 'Patient-Centric Care');

-- Clinic 9: Kelina Hospital
INSERT INTO clinic_tags (clinic_id, tag) VALUES
  (9, 'General Surgery'), (9, 'Urology'), (9, 'Laparoscopic Surgery'),
  (9, 'Endoscopy'), (9, 'Critical Care'), (9, 'Post-operative Rehabilitation');

-- ==================== CLINIC SPECIALTIES ====================
INSERT INTO clinic_specialties (clinic_id, specialty) VALUES
  -- Clinic 1
  (1, 'Family Medicine'), (1, 'Pediatrics'), (1, 'Women''s Health'),
  (1, 'Vaccinations'), (1, 'Health Screenings'),
  -- Clinic 2
  (2, 'Cardiology'), (2, 'Orthopedics'), (2, 'Surgery'),
  (2, 'Emergency Medicine'), (2, 'Radiology'),
  -- Clinic 3
  (3, 'Dermatology'), (3, 'Cosmetic Procedures'), (3, 'Acne Treatment'),
  (3, 'Skin Cancer Screening'),
  -- Clinic 4
  (4, 'Dermatology'), (4, 'Cosmetic Procedures'), (4, 'Acne Treatment'),
  (4, 'Skin Cancer Screening'),
  -- Clinic 5
  (5, 'Dermatology'), (5, 'Cosmetic Procedures'), (5, 'Acne Treatment'),
  (5, 'Skin Cancer Screening'),
  -- Clinic 6
  (6, 'Dermatology'), (6, 'Cosmetic Procedures'), (6, 'Acne Treatment'),
  (6, 'Skin Cancer Screening'),
  -- Clinic 7
  (7, 'Dermatology'), (7, 'Cosmetic Procedures'), (7, 'Acne Treatment'),
  (7, 'Skin Cancer Screening'),
  -- Clinic 8
  (8, 'Dermatology'), (8, 'Cosmetic Procedures'), (8, 'Acne Treatment'),
  (8, 'Skin Cancer Screening'),
  -- Clinic 9
  (9, 'Dermatology'), (9, 'Cosmetic Procedures'), (9, 'Acne Treatment'),
  (9, 'Skin Cancer Screening');

-- ==================== CLINIC EQUIPMENT ====================
INSERT INTO clinic_equipment (clinic_id, equipment_name) VALUES
  -- Clinic 1
  (1, 'X-Ray Machine'), (1, 'Ultrasound'), (1, 'ECG Monitor'),
  (1, 'Laboratory'), (1, 'Pharmacy'),
  -- Clinic 2
  (2, 'CT Scan'), (2, 'MRI Machine'), (2, 'Digital X-Ray'),
  (2, 'ICU Facilities'), (2, 'Operating Theaters'),
  -- Clinics 3-9 (shared equipment set)
  (3, 'Laser Equipment'), (3, 'Dermatoscope'), (3, 'Cryotherapy Unit'), (3, 'Phototherapy'),
  (4, 'Laser Equipment'), (4, 'Dermatoscope'), (4, 'Cryotherapy Unit'), (4, 'Phototherapy'),
  (5, 'Laser Equipment'), (5, 'Dermatoscope'), (5, 'Cryotherapy Unit'), (5, 'Phototherapy'),
  (6, 'Laser Equipment'), (6, 'Dermatoscope'), (6, 'Cryotherapy Unit'), (6, 'Phototherapy'),
  (7, 'Laser Equipment'), (7, 'Dermatoscope'), (7, 'Cryotherapy Unit'), (7, 'Phototherapy'),
  (8, 'Laser Equipment'), (8, 'Dermatoscope'), (8, 'Cryotherapy Unit'), (8, 'Phototherapy'),
  (9, 'Laser Equipment'), (9, 'Dermatoscope'), (9, 'Cryotherapy Unit'), (9, 'Phototherapy');

-- ==================== CLINIC ↔ HMO ASSOCIATIONS ====================
-- Get HMO IDs by name for the junction table
INSERT INTO clinic_hmos (clinic_id, hmo_id)
SELECT 1, id FROM hmos WHERE name IN ('Hygeia HMO', 'Avon Healthcare', 'Reliance HMO', 'AXA Mansard');

INSERT INTO clinic_hmos (clinic_id, hmo_id)
SELECT 2, id FROM hmos WHERE name IN ('Hygeia HMO', 'MetroHealth HMO', 'Apex Healthcare', 'Total Health Trust');

INSERT INTO clinic_hmos (clinic_id, hmo_id)
SELECT 3, id FROM hmos WHERE name IN ('Avon Healthcare', 'AXA Mansard', 'Hygeia HMO');

INSERT INTO clinic_hmos (clinic_id, hmo_id)
SELECT 4, id FROM hmos WHERE name IN ('Avon Healthcare', 'AXA Mansard', 'Hygeia HMO');

INSERT INTO clinic_hmos (clinic_id, hmo_id)
SELECT 5, id FROM hmos WHERE name IN ('Avon Healthcare', 'AXA Mansard', 'Hygeia HMO');

INSERT INTO clinic_hmos (clinic_id, hmo_id)
SELECT 6, id FROM hmos WHERE name IN ('Avon Healthcare', 'AXA Mansard', 'Hygeia HMO');

INSERT INTO clinic_hmos (clinic_id, hmo_id)
SELECT 7, id FROM hmos WHERE name IN ('Avon Healthcare', 'AXA Mansard', 'Hygeia HMO');

INSERT INTO clinic_hmos (clinic_id, hmo_id)
SELECT 8, id FROM hmos WHERE name IN ('Avon Healthcare', 'AXA Mansard', 'Hygeia HMO');

INSERT INTO clinic_hmos (clinic_id, hmo_id)
SELECT 9, id FROM hmos WHERE name IN ('Avon Healthcare', 'AXA Mansard', 'Hygeia HMO');

-- ==================== REVIEWS ====================
INSERT INTO reviews (clinic_id, author_name, rating, review_text, review_date, is_verified) VALUES
  -- Clinic 1: Wellington Clinics
  (1, 'Amina O.', 5, 'The staff at Wellington Clinics are incredibly warm and professional. Dr. Eze took time to explain everything about my condition and treatment options. The facility is spotless.', 'April 2026', true),
  (1, 'Chidi N.', 5, 'Best walk-in clinic experience I''ve had in Abuja. Minimal wait time and the diagnostic services are top-notch. Highly recommend for family medicine.', 'March 2026', true),
  (1, 'Fatima B.', 4, 'Very clean and organized. The pediatrics department is fantastic — my children feel comfortable here. Only wish the parking was bigger.', 'March 2026', true),

  -- Clinic 2: Alliance Hospital
  (2, 'Emeka A.', 5, 'Alliance Hospital saved my father''s life during a cardiac emergency. The cardiology team is world-class and the ICU facilities are state-of-the-art.', 'April 2026', true),
  (2, 'Grace I.', 5, 'Had my knee surgery here and the orthopedics department exceeded all expectations. Recovery room was comfortable and the nurses were attentive 24/7.', 'March 2026', true),
  (2, 'Yusuf M.', 4, 'Excellent emergency services. The CT scan and MRI results came back quickly. Staff communication could be slightly better during peak hours.', 'February 2026', true),

  -- Clinic 3: National Hospital Abuja
  (3, 'Dr. Okonkwo R.', 5, 'As a referring physician, I trust National Hospital for complex cases. Their tertiary care is unmatched in the FCT with excellent surgical outcomes.', 'April 2026', true),
  (3, 'Blessing U.', 5, 'The oncology department provided compassionate and thorough care for my mother. Every step of her treatment was explained clearly to our family.', 'March 2026', true),
  (3, 'Suleiman D.', 4, 'Great research hospital with knowledgeable specialists. Wait times can be long due to high patient volume, but the quality of care makes it worthwhile.', 'February 2026', true),

  -- Clinic 4: Abuja Clinics
  (4, 'Ngozi K.', 5, 'Premium healthcare at its finest. The executive check-up package was thorough — they caught an issue early that another clinic missed entirely.', 'April 2026', true),
  (4, 'Tunde S.', 5, 'Abuja Clinics'' Maitama branch is immaculate. The diagnostic imaging is fast and the doctors are very experienced. My family''s go-to clinic.', 'March 2026', true),
  (4, 'Halima J.', 4, 'The women''s health department is excellent. Felt very safe and cared for. Slightly pricey but absolutely worth it for the quality.', 'February 2026', true),

  -- Clinic 5: Aquila Clinic and Fertility
  (5, 'Chioma E.', 5, 'After years of struggling, Dr. Adeyemi at Aquila gave us hope. The IVF process was explained step by step and we finally have our miracle baby.', 'April 2026', true),
  (5, 'Ibrahim T.', 5, 'The male fertility counseling was handled with great sensitivity and professionalism. The lab facilities are modern and the results were accurate.', 'March 2026', true),
  (5, 'Aisha W.', 4, 'Excellent reproductive health clinic. The gynecological services are comprehensive. Appointments are sometimes hard to get due to high demand.', 'February 2026', true),

  -- Clinic 6: Marie Stopes
  (6, 'Funke A.', 5, 'Marie Stopes provided exceptional maternal care throughout my pregnancy. The family planning counseling was informative and non-judgmental.', 'April 2026', true),
  (6, 'Maryam L.', 5, 'Very professional and confidential service. The staff made me feel comfortable discussing sensitive health topics. Clean and well-organized facility.', 'March 2026', true),
  (6, 'Joy P.', 4, 'Affordable reproductive health services with caring staff. The Wuse II location is convenient. Would appreciate extended weekend hours.', 'February 2026', true),

  -- Clinic 7: Garki Hospital
  (7, 'Obinna C.', 5, 'Garki Hospital''s emergency department is outstanding. Was seen within minutes and the treatment was efficient. The pharmacy on-site is very convenient.', 'April 2026', true),
  (7, 'Zainab H.', 5, 'Brought my son to pediatrics and the doctors were wonderful with children. The diagnostics were thorough and we got results the same day.', 'March 2026', true),
  (7, 'Kenneth O.', 4, 'Reliable general hospital with good surgical outcomes. The facility is well-maintained and the location on Tafawa Balewa Way is very accessible.', 'February 2026', true),

  -- Clinic 8: Nizamiye Hospital
  (8, 'Adaeze M.', 5, 'Nizamiye Hospital feels like an international-standard facility right here in Abuja. The cardiology team performed my husband''s procedure flawlessly.', 'April 2026', true),
  (8, 'Rasheed B.', 5, 'Advanced diagnostics and patient-centric care. The neurosurgery department is staffed with experts. The Life Camp location has ample parking too.', 'March 2026', true),
  (8, 'Patricia N.', 4, 'Top-tier orthopedic surgery. My recovery was smooth thanks to excellent post-operative care. Slightly far from city center but worth the drive.', 'February 2026', true),

  -- Clinic 9: Kelina Hospital
  (9, 'Victor E.', 5, 'Kelina Hospital''s laparoscopic surgery team is exceptional. Minimally invasive, quick recovery, and the surgeons explained every step beforehand.', 'April 2026', true),
  (9, 'Comfort A.', 5, 'The urology department at Gwarimpa branch is very professional. Endoscopy was quick and painless. The post-operative rehab program was very helpful.', 'March 2026', true),
  (9, 'Daniel U.', 4, 'Good specialist surgical hospital. Critical care unit is well-equipped. The only downside is the distance from the city center — 15km away.', 'February 2026', true);

-- ==================== OPERATING HOURS (Default for all clinics) ====================
-- All clinics: Mon-Fri 8am-5pm, Sat 9am-2pm, Sun closed
INSERT INTO clinic_operating_hours (clinic_id, day, is_open, open_time, close_time)
SELECT c.id, d.day, d.is_open, d.open_time, d.close_time
FROM clinics c
CROSS JOIN (VALUES
  ('Monday'::day_of_week,    true,  '08:00'::TIME, '17:00'::TIME),
  ('Tuesday'::day_of_week,   true,  '08:00'::TIME, '17:00'::TIME),
  ('Wednesday'::day_of_week, true,  '08:00'::TIME, '17:00'::TIME),
  ('Thursday'::day_of_week,  true,  '08:00'::TIME, '17:00'::TIME),
  ('Friday'::day_of_week,    true,  '08:00'::TIME, '17:00'::TIME),
  ('Saturday'::day_of_week,  true,  '09:00'::TIME, '14:00'::TIME),
  ('Sunday'::day_of_week,    false, NULL,           NULL)
) AS d(day, is_open, open_time, close_time)
WHERE c.id BETWEEN 1 AND 9;

-- ==================== SAMPLE APPOINTMENT SLOTS ====================
-- Generate slots for the next 3 days for all clinics
-- Using CURRENT_DATE so the seed data is always relevant

-- Today slots
INSERT INTO appointment_slots (clinic_id, slot_date, slot_time, duration_minutes)
SELECT c.id, CURRENT_DATE, t.slot_time, 30
FROM clinics c
CROSS JOIN (VALUES
  ('14:00'::TIME), ('14:30'::TIME), ('15:00'::TIME), ('15:30'::TIME), ('16:00'::TIME), ('16:30'::TIME)
) AS t(slot_time)
WHERE c.id BETWEEN 1 AND 9;

-- Tomorrow slots
INSERT INTO appointment_slots (clinic_id, slot_date, slot_time, duration_minutes)
SELECT c.id, CURRENT_DATE + 1, t.slot_time, 30
FROM clinics c
CROSS JOIN (VALUES
  ('09:00'::TIME), ('09:30'::TIME), ('10:00'::TIME), ('10:30'::TIME),
  ('11:00'::TIME), ('11:30'::TIME), ('13:00'::TIME), ('13:30'::TIME),
  ('14:00'::TIME), ('14:30'::TIME), ('15:00'::TIME), ('15:30'::TIME)
) AS t(slot_time)
WHERE c.id BETWEEN 1 AND 9;

-- Day after tomorrow slots
INSERT INTO appointment_slots (clinic_id, slot_date, slot_time, duration_minutes)
SELECT c.id, CURRENT_DATE + 2, t.slot_time, 30
FROM clinics c
CROSS JOIN (VALUES
  ('09:00'::TIME), ('09:30'::TIME), ('10:00'::TIME), ('10:30'::TIME),
  ('11:00'::TIME), ('11:30'::TIME), ('13:00'::TIME), ('13:30'::TIME),
  ('14:00'::TIME), ('14:30'::TIME), ('15:00'::TIME), ('15:30'::TIME),
  ('16:00'::TIME)
) AS t(slot_time)
WHERE c.id BETWEEN 1 AND 9;

-- ==================== GALLERY IMAGES (Common/shared) ====================
-- These use external URLs matching the ones in commonGallery from ClinicGrid.jsx
-- In production, upload to Supabase Storage and update URLs

-- Reception
INSERT INTO gallery_images (ward_id, clinic_id, image_url, sort_order) VALUES
  ('reception', NULL, 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=800', 2),
  ('reception', NULL, 'https://images.unsplash.com/photo-1538108149393-fbbd81895907?auto=format&fit=crop&q=80&w=800', 3),
  ('reception', NULL, 'https://images.unsplash.com/photo-1519494080410-f9aa76cb4283?auto=format&fit=crop&q=80&w=800', 4);

-- Consulting Room
INSERT INTO gallery_images (ward_id, clinic_id, image_url, sort_order) VALUES
  ('consulting_room', NULL, 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&q=80&w=800', 1),
  ('consulting_room', NULL, 'https://images.unsplash.com/photo-1550831107-1553da8c8464?auto=format&fit=crop&q=80&w=800', 2),
  ('consulting_room', NULL, 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&q=80&w=800', 3);

-- Private Ward
INSERT INTO gallery_images (ward_id, clinic_id, image_url, sort_order) VALUES
  ('private_ward', NULL, 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&q=80&w=800', 2),
  ('private_ward', NULL, 'https://images.unsplash.com/photo-1505692952047-1a78307da8f2?auto=format&fit=crop&q=80&w=800', 3),
  ('private_ward', NULL, 'https://images.unsplash.com/photo-1512678080530-7760d81faba6?auto=format&fit=crop&q=80&w=800', 4);

-- Laboratory
INSERT INTO gallery_images (ward_id, clinic_id, image_url, sort_order) VALUES
  ('laboratory', NULL, 'https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&q=80&w=800', 1),
  ('laboratory', NULL, 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&q=80&w=800', 3);

-- Special Units
INSERT INTO gallery_images (ward_id, clinic_id, image_url, sort_order) VALUES
  ('special_units', NULL, 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=800', 2),
  ('special_units', NULL, 'https://images.unsplash.com/photo-1530497610245-94d3c16cda28?auto=format&fit=crop&q=80&w=800', 4);
