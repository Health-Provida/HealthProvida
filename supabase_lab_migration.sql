-- ============================================================
-- HealthProvida — Laboratory Portal Database Migration
-- Run in the Supabase SQL Editor AFTER the base schema and
-- admin migration. This migration is ADDITIVE — it creates
-- new lab_ prefixed tables and functions without modifying
-- any existing database objects.
--
-- Generated: 2026-10-16
-- ============================================================

-- ==================== ORDER NUMBER SEQUENCE ====================
-- Generates sequential order numbers like HP-LAB-1001
CREATE SEQUENCE IF NOT EXISTS lab_order_number_seq START WITH 2000;

-- ==================== SAMPLE NUMBER SEQUENCE ====================
CREATE SEQUENCE IF NOT EXISTS lab_sample_number_seq START WITH 5000;

-- ==================== TABLES ====================

-- 1. Lab Organizations — multi-tenant laboratory profiles
CREATE TABLE IF NOT EXISTS lab_organizations (
  id                  BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  owner_id            UUID NOT NULL REFERENCES profiles(id),
  name                TEXT NOT NULL,
  slug                TEXT NOT NULL UNIQUE,
  registration_number TEXT,
  email               TEXT,
  phone               TEXT,
  about               TEXT,
  is_verified         BOOLEAN NOT NULL DEFAULT false,
  is_active           BOOLEAN NOT NULL DEFAULT true,
  settings            JSONB NOT NULL DEFAULT '{}',
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Lab Branches — physical locations
CREATE TABLE IF NOT EXISTS lab_branches (
  id         BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  lab_id     BIGINT NOT NULL REFERENCES lab_organizations(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  address    TEXT NOT NULL,
  phone      TEXT,
  is_active  BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Lab Operating Hours
CREATE TABLE IF NOT EXISTS lab_operating_hours (
  id         BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  lab_id     BIGINT NOT NULL REFERENCES lab_organizations(id) ON DELETE CASCADE,
  day        TEXT NOT NULL CHECK (day IN ('Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday')),
  is_open    BOOLEAN NOT NULL DEFAULT true,
  open_time  TIME,
  close_time TIME,
  UNIQUE (lab_id, day)
);

-- 4. Lab Staff — authorization nexus (NOT a modification of profiles.role)
CREATE TABLE IF NOT EXISTS lab_staff (
  id         BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  lab_id     BIGINT NOT NULL REFERENCES lab_organizations(id) ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role       TEXT NOT NULL DEFAULT 'lab_technician'
             CHECK (role IN ('lab_admin','lab_scientist','lab_technician','lab_phlebotomist')),
  is_active  BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (lab_id, user_id)
);

-- 5. Lab Test Catalog
CREATE TABLE IF NOT EXISTS lab_test_catalog (
  id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  lab_id          BIGINT NOT NULL REFERENCES lab_organizations(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  category        TEXT NOT NULL,
  lab_price       NUMERIC(10,2) NOT NULL CHECK (lab_price >= 0),
  hp_price        NUMERIC(10,2) NOT NULL CHECK (hp_price >= 0),
  home_collection BOOLEAN NOT NULL DEFAULT false,
  is_active       BOOLEAN NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (lab_id, name)
);

-- 6. Lab Orders — test requests
CREATE TABLE IF NOT EXISTS lab_orders (
  id                 BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  lab_id             BIGINT NOT NULL REFERENCES lab_organizations(id) ON DELETE CASCADE,
  order_number       TEXT NOT NULL UNIQUE,
  patient_id         UUID NOT NULL REFERENCES profiles(id),
  created_by         UUID NOT NULL REFERENCES auth.users(id),
  payer              TEXT,
  collection_type    TEXT NOT NULL DEFAULT 'walkin'
                     CHECK (collection_type IN ('home','walkin')),
  collection_address TEXT,
  branch_id          BIGINT REFERENCES lab_branches(id),
  collection_date    DATE,
  collection_time    TIME,
  instructions       TEXT,
  status             TEXT NOT NULL DEFAULT 'new'
                     CHECK (status IN ('new','awaiting_sample','processing','results_ready','completed','cancelled')),
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. Lab Order Tests — tests within an order (immutable snapshot)
CREATE TABLE IF NOT EXISTS lab_order_tests (
  id        BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  order_id  BIGINT NOT NULL REFERENCES lab_orders(id) ON DELETE CASCADE,
  test_id   BIGINT NOT NULL REFERENCES lab_test_catalog(id),
  test_name TEXT NOT NULL,
  price     NUMERIC(10,2) NOT NULL,
  UNIQUE (order_id, test_id)
);

-- 8. Lab Samples — sample tracking with chain of custody
CREATE TABLE IF NOT EXISTS lab_samples (
  id               BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  lab_id           BIGINT NOT NULL REFERENCES lab_organizations(id) ON DELETE CASCADE,
  order_id         BIGINT NOT NULL REFERENCES lab_orders(id) ON DELETE CASCADE,
  sample_number    TEXT NOT NULL UNIQUE,
  patient_id       UUID NOT NULL REFERENCES profiles(id),
  test_name        TEXT NOT NULL,
  collection_type  TEXT NOT NULL CHECK (collection_type IN ('home','walkin')),
  status           TEXT NOT NULL DEFAULT 'awaiting'
                   CHECK (status IN ('awaiting','collected','processing','completed','rejected')),
  collected_by     UUID REFERENCES auth.users(id),
  collected_at     TIMESTAMPTZ,
  rejection_reason TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 9. Lab Results
CREATE TABLE IF NOT EXISTS lab_results (
  id           BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  lab_id       BIGINT NOT NULL REFERENCES lab_organizations(id) ON DELETE CASCADE,
  order_id     BIGINT NOT NULL REFERENCES lab_orders(id) ON DELETE CASCADE,
  sample_id    BIGINT NOT NULL REFERENCES lab_samples(id),
  patient_id   UUID NOT NULL REFERENCES profiles(id),
  test_name    TEXT NOT NULL,
  status       TEXT NOT NULL DEFAULT 'pending'
               CHECK (status IN ('pending','processing','review','published')),
  summary      TEXT NOT NULL DEFAULT '',
  comment      TEXT NOT NULL DEFAULT '',
  entered_by   UUID REFERENCES auth.users(id),
  published_by UUID REFERENCES auth.users(id),
  published_at TIMESTAMPTZ,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 10. Lab Result Rows — individual analyte values
CREATE TABLE IF NOT EXISTS lab_result_rows (
  id         BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  result_id  BIGINT NOT NULL REFERENCES lab_results(id) ON DELETE CASCADE,
  analyte    TEXT NOT NULL,
  value      TEXT NOT NULL DEFAULT '',
  ref_range  TEXT NOT NULL DEFAULT '',
  flag       TEXT NOT NULL DEFAULT 'Normal'
             CHECK (flag IN ('Normal','High','Low','Critical')),
  sort_order INT NOT NULL DEFAULT 0
);

-- 11. Lab Notifications
CREATE TABLE IF NOT EXISTS lab_notifications (
  id             BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  lab_id         BIGINT NOT NULL REFERENCES lab_organizations(id) ON DELETE CASCADE,
  user_id        UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title          TEXT NOT NULL,
  body           TEXT NOT NULL DEFAULT '',
  type           TEXT NOT NULL DEFAULT 'info'
                 CHECK (type IN ('info','success','warning','error')),
  is_read        BOOLEAN NOT NULL DEFAULT false,
  reference_type TEXT,
  reference_id   BIGINT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 12. Lab Activity Log — immutable audit trail
CREATE TABLE IF NOT EXISTS lab_activity_log (
  id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  lab_id      BIGINT NOT NULL REFERENCES lab_organizations(id) ON DELETE CASCADE,
  user_id     UUID REFERENCES auth.users(id),
  action      TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id   BIGINT,
  metadata    JSONB NOT NULL DEFAULT '{}',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ==================== INDEXES ====================

CREATE INDEX IF NOT EXISTS idx_lab_org_owner ON lab_organizations(owner_id);
CREATE INDEX IF NOT EXISTS idx_lab_org_slug ON lab_organizations(slug);

CREATE INDEX IF NOT EXISTS idx_lab_branches_lab ON lab_branches(lab_id);

CREATE INDEX IF NOT EXISTS idx_lab_staff_user ON lab_staff(user_id);
CREATE INDEX IF NOT EXISTS idx_lab_staff_lab ON lab_staff(lab_id);
CREATE INDEX IF NOT EXISTS idx_lab_staff_active ON lab_staff(user_id, is_active) WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_lab_tests_lab ON lab_test_catalog(lab_id);
CREATE INDEX IF NOT EXISTS idx_lab_tests_active ON lab_test_catalog(lab_id, is_active) WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_lab_orders_lab ON lab_orders(lab_id);
CREATE INDEX IF NOT EXISTS idx_lab_orders_patient ON lab_orders(patient_id);
CREATE INDEX IF NOT EXISTS idx_lab_orders_status ON lab_orders(lab_id, status);
CREATE INDEX IF NOT EXISTS idx_lab_orders_number ON lab_orders(order_number);
CREATE INDEX IF NOT EXISTS idx_lab_orders_created ON lab_orders(lab_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_lab_order_tests_order ON lab_order_tests(order_id);

CREATE INDEX IF NOT EXISTS idx_lab_samples_lab ON lab_samples(lab_id);
CREATE INDEX IF NOT EXISTS idx_lab_samples_order ON lab_samples(order_id);
CREATE INDEX IF NOT EXISTS idx_lab_samples_status ON lab_samples(lab_id, status);

CREATE INDEX IF NOT EXISTS idx_lab_results_lab ON lab_results(lab_id);
CREATE INDEX IF NOT EXISTS idx_lab_results_order ON lab_results(order_id);
CREATE INDEX IF NOT EXISTS idx_lab_results_status ON lab_results(lab_id, status);
CREATE INDEX IF NOT EXISTS idx_lab_results_patient ON lab_results(patient_id);

CREATE INDEX IF NOT EXISTS idx_lab_result_rows_result ON lab_result_rows(result_id);

CREATE INDEX IF NOT EXISTS idx_lab_notifications_user ON lab_notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_lab_notifications_lab ON lab_notifications(lab_id);
CREATE INDEX IF NOT EXISTS idx_lab_notifications_created ON lab_notifications(lab_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_lab_activity_lab ON lab_activity_log(lab_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_lab_activity_entity ON lab_activity_log(entity_type, entity_id);

-- ==================== AUTO-UPDATE TRIGGERS ====================

CREATE TRIGGER trg_lab_org_updated_at
  BEFORE UPDATE ON lab_organizations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_lab_staff_updated_at
  BEFORE UPDATE ON lab_staff
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_lab_test_catalog_updated_at
  BEFORE UPDATE ON lab_test_catalog
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_lab_orders_updated_at
  BEFORE UPDATE ON lab_orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_lab_samples_updated_at
  BEFORE UPDATE ON lab_samples
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_lab_results_updated_at
  BEFORE UPDATE ON lab_results
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ==================== AUTHORIZATION HELPER FUNCTIONS ====================
-- These follow the same SECURITY DEFINER pattern as the existing
-- is_admin() / has_admin_write() functions.

-- Check if current user is active staff at ANY lab
CREATE OR REPLACE FUNCTION is_lab_staff()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM lab_staff
    WHERE user_id = auth.uid() AND is_active = true
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Check if current user is active staff at a specific lab
CREATE OR REPLACE FUNCTION is_staff_of_lab(p_lab_id BIGINT)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM lab_staff
    WHERE user_id = auth.uid() AND lab_id = p_lab_id AND is_active = true
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Check if current user is admin at a specific lab
CREATE OR REPLACE FUNCTION is_lab_admin(p_lab_id BIGINT)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM lab_staff
    WHERE user_id = auth.uid() AND lab_id = p_lab_id
      AND role = 'lab_admin' AND is_active = true
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Check if current user can publish results (scientist or admin)
CREATE OR REPLACE FUNCTION can_publish_results(p_lab_id BIGINT)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM lab_staff
    WHERE user_id = auth.uid() AND lab_id = p_lab_id
      AND role IN ('lab_admin', 'lab_scientist') AND is_active = true
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Get the user's lab_staff role at a specific lab (NULL if not staff)
CREATE OR REPLACE FUNCTION get_lab_staff_role(p_lab_id BIGINT)
RETURNS TEXT AS $$
  SELECT role FROM lab_staff
  WHERE user_id = auth.uid() AND lab_id = p_lab_id AND is_active = true
  LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Get all labs the current user is staff of (returns table)
CREATE OR REPLACE FUNCTION get_user_labs()
RETURNS TABLE(lab_id BIGINT, lab_role TEXT) AS $$
  SELECT ls.lab_id, ls.role
  FROM lab_staff ls
  WHERE ls.user_id = auth.uid() AND ls.is_active = true;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ==================== ORDER NUMBER GENERATOR ====================
CREATE OR REPLACE FUNCTION generate_lab_order_number()
RETURNS TEXT AS $$
  SELECT 'HP-LAB-' || nextval('lab_order_number_seq')::TEXT;
$$ LANGUAGE sql;

CREATE OR REPLACE FUNCTION generate_lab_sample_number()
RETURNS TEXT AS $$
  SELECT 'SMP-' || nextval('lab_sample_number_seq')::TEXT;
$$ LANGUAGE sql;

-- ==================== ENABLE ROW LEVEL SECURITY ====================

ALTER TABLE lab_organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE lab_branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE lab_operating_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE lab_staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE lab_test_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE lab_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE lab_order_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE lab_samples ENABLE ROW LEVEL SECURITY;
ALTER TABLE lab_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE lab_result_rows ENABLE ROW LEVEL SECURITY;
ALTER TABLE lab_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE lab_activity_log ENABLE ROW LEVEL SECURITY;

-- ==================== RLS POLICIES ====================

-- ── lab_organizations ──
-- Staff can read their own lab; platform admins can read all
CREATE POLICY lab_org_select ON lab_organizations FOR SELECT USING (
  is_staff_of_lab(id) OR is_admin()
);
CREATE POLICY lab_org_insert ON lab_organizations FOR INSERT WITH CHECK (
  auth.uid() = owner_id
);
CREATE POLICY lab_org_update ON lab_organizations FOR UPDATE USING (
  is_lab_admin(id) OR is_admin()
);

-- ── lab_branches ──
CREATE POLICY lab_branches_select ON lab_branches FOR SELECT USING (
  is_staff_of_lab(lab_id) OR is_admin()
);
CREATE POLICY lab_branches_insert ON lab_branches FOR INSERT WITH CHECK (
  is_lab_admin(lab_id)
);
CREATE POLICY lab_branches_update ON lab_branches FOR UPDATE USING (
  is_lab_admin(lab_id)
);
CREATE POLICY lab_branches_delete ON lab_branches FOR DELETE USING (
  is_lab_admin(lab_id)
);

-- ── lab_operating_hours ──
CREATE POLICY lab_hours_select ON lab_operating_hours FOR SELECT USING (
  is_staff_of_lab(lab_id) OR is_admin()
);
CREATE POLICY lab_hours_insert ON lab_operating_hours FOR INSERT WITH CHECK (
  is_lab_admin(lab_id)
);
CREATE POLICY lab_hours_update ON lab_operating_hours FOR UPDATE USING (
  is_lab_admin(lab_id)
);
CREATE POLICY lab_hours_delete ON lab_operating_hours FOR DELETE USING (
  is_lab_admin(lab_id)
);

-- ── lab_staff ──
-- Staff can see their own lab's staff list; lab_admin can manage
CREATE POLICY lab_staff_select ON lab_staff FOR SELECT USING (
  is_staff_of_lab(lab_id) OR is_admin()
);
CREATE POLICY lab_staff_insert ON lab_staff FOR INSERT WITH CHECK (
  is_lab_admin(lab_id) OR is_admin()
);
CREATE POLICY lab_staff_update ON lab_staff FOR UPDATE USING (
  is_lab_admin(lab_id) OR is_admin()
);
CREATE POLICY lab_staff_delete ON lab_staff FOR DELETE USING (
  is_lab_admin(lab_id) OR is_admin()
);

-- ── lab_test_catalog ──
-- Staff can read; lab_admin can manage; also readable for patient booking
CREATE POLICY lab_tests_select ON lab_test_catalog FOR SELECT USING (
  is_staff_of_lab(lab_id) OR is_admin() OR (is_active = true)
);
CREATE POLICY lab_tests_insert ON lab_test_catalog FOR INSERT WITH CHECK (
  is_lab_admin(lab_id)
);
CREATE POLICY lab_tests_update ON lab_test_catalog FOR UPDATE USING (
  is_lab_admin(lab_id)
);

-- ── lab_orders ──
-- Staff of the lab can read all orders for their lab;
-- Patients can read their own orders;
-- Staff can create orders for their lab;
-- Patients can create orders for themselves
CREATE POLICY lab_orders_staff_select ON lab_orders FOR SELECT USING (
  is_staff_of_lab(lab_id)
);
CREATE POLICY lab_orders_patient_select ON lab_orders FOR SELECT USING (
  auth.uid() = patient_id
);
CREATE POLICY lab_orders_admin_select ON lab_orders FOR SELECT USING (
  is_admin()
);
CREATE POLICY lab_orders_staff_insert ON lab_orders FOR INSERT WITH CHECK (
  is_staff_of_lab(lab_id)
);
CREATE POLICY lab_orders_patient_insert ON lab_orders FOR INSERT WITH CHECK (
  auth.uid() = patient_id AND auth.uid() = created_by
);
CREATE POLICY lab_orders_staff_update ON lab_orders FOR UPDATE USING (
  is_staff_of_lab(lab_id)
);

-- ── lab_order_tests ──
-- Readable if parent order is readable (use join check)
CREATE POLICY lab_order_tests_select ON lab_order_tests FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM lab_orders o
    WHERE o.id = order_id
      AND (is_staff_of_lab(o.lab_id) OR o.patient_id = auth.uid() OR is_admin())
  )
);
CREATE POLICY lab_order_tests_insert ON lab_order_tests FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM lab_orders o
    WHERE o.id = order_id
      AND (is_staff_of_lab(o.lab_id) OR (o.patient_id = auth.uid() AND o.created_by = auth.uid()))
  )
);

-- ── lab_samples ──
CREATE POLICY lab_samples_select ON lab_samples FOR SELECT USING (
  is_staff_of_lab(lab_id) OR is_admin()
);
CREATE POLICY lab_samples_insert ON lab_samples FOR INSERT WITH CHECK (
  is_staff_of_lab(lab_id)
);
CREATE POLICY lab_samples_update ON lab_samples FOR UPDATE USING (
  is_staff_of_lab(lab_id)
);

-- ── lab_results ──
-- Staff can read all results for their lab;
-- Patients can only read their own PUBLISHED results
CREATE POLICY lab_results_staff_select ON lab_results FOR SELECT USING (
  is_staff_of_lab(lab_id)
);
CREATE POLICY lab_results_patient_select ON lab_results FOR SELECT USING (
  auth.uid() = patient_id AND status = 'published'
);
CREATE POLICY lab_results_admin_select ON lab_results FOR SELECT USING (
  is_admin()
);
CREATE POLICY lab_results_insert ON lab_results FOR INSERT WITH CHECK (
  is_staff_of_lab(lab_id)
);
CREATE POLICY lab_results_update ON lab_results FOR UPDATE USING (
  is_staff_of_lab(lab_id)
);

-- ── lab_result_rows ──
CREATE POLICY lab_result_rows_select ON lab_result_rows FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM lab_results r
    WHERE r.id = result_id
      AND (is_staff_of_lab(r.lab_id) OR (r.patient_id = auth.uid() AND r.status = 'published') OR is_admin())
  )
);
CREATE POLICY lab_result_rows_insert ON lab_result_rows FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM lab_results r
    WHERE r.id = result_id AND is_staff_of_lab(r.lab_id)
  )
);
CREATE POLICY lab_result_rows_update ON lab_result_rows FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM lab_results r
    WHERE r.id = result_id AND is_staff_of_lab(r.lab_id)
  )
);
CREATE POLICY lab_result_rows_delete ON lab_result_rows FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM lab_results r
    WHERE r.id = result_id AND is_staff_of_lab(r.lab_id) AND r.status != 'published'
  )
);

-- ── lab_notifications ──
-- Users can only see and manage their own notifications
CREATE POLICY lab_notifications_select ON lab_notifications FOR SELECT USING (
  auth.uid() = user_id
);
CREATE POLICY lab_notifications_update ON lab_notifications FOR UPDATE USING (
  auth.uid() = user_id
);
CREATE POLICY lab_notifications_delete ON lab_notifications FOR DELETE USING (
  auth.uid() = user_id
);
-- Insert allowed by staff of the lab (for sending notifications to colleagues)
CREATE POLICY lab_notifications_insert ON lab_notifications FOR INSERT WITH CHECK (
  is_staff_of_lab(lab_id) OR is_admin()
);

-- ── lab_activity_log ──
-- Staff can read activity for their lab; nobody can modify (append-only via functions)
CREATE POLICY lab_activity_select ON lab_activity_log FOR SELECT USING (
  is_staff_of_lab(lab_id) OR is_admin()
);
CREATE POLICY lab_activity_insert ON lab_activity_log FOR INSERT WITH CHECK (
  is_staff_of_lab(lab_id) OR is_admin()
);

-- ==================== ACTIVITY LOGGING FUNCTION ====================
-- Convenience function to log lab activity from client or triggers
CREATE OR REPLACE FUNCTION log_lab_activity(
  p_lab_id BIGINT,
  p_action TEXT,
  p_entity_type TEXT,
  p_entity_id BIGINT DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO lab_activity_log (lab_id, user_id, action, entity_type, entity_id, metadata)
  VALUES (p_lab_id, auth.uid(), p_action, p_entity_type, p_entity_id, p_metadata);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
