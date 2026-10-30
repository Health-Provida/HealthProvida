-- =============================================================================
-- Super Admin Portal — Database Tables
-- =============================================================================
-- Tables for the governance console: providers, tariffs, encounters,
-- HMO accounts, transactions, campaigns, admin users, and audit log.
-- These support the super-admin-portal app and are prefixed with `admin_`
-- to avoid collisions with patient-portal tables.
-- =============================================================================

-- Drop existing tables if re-running (safe for initial setup only)
DROP TABLE IF EXISTS admin_dashboard_stats CASCADE;
DROP TABLE IF EXISTS admin_audit_log CASCADE;
DROP TABLE IF EXISTS admin_campaigns CASCADE;
DROP TABLE IF EXISTS admin_transactions CASCADE;
DROP TABLE IF EXISTS admin_hmo_accounts CASCADE;
DROP TABLE IF EXISTS admin_encounters CASCADE;
DROP TABLE IF EXISTS admin_tariffs CASCADE;
DROP TABLE IF EXISTS admin_users CASCADE;
DROP TABLE IF EXISTS admin_providers CASCADE;

-- ---------------------------------------------------------------------------
-- 1. Admin Providers (governance view of facilities)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS admin_providers (
  id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name            TEXT NOT NULL,
  type            TEXT NOT NULL DEFAULT 'General Hospital',
  city            TEXT NOT NULL,
  state           TEXT NOT NULL,
  region          TEXT NOT NULL DEFAULT 'South-West',
  address         TEXT NOT NULL DEFAULT '',
  phone           TEXT NOT NULL DEFAULT '',
  email           TEXT NOT NULL DEFAULT '',
  specialties     TEXT[] DEFAULT '{}',
  status          TEXT NOT NULL DEFAULT 'Pending',
  verification    TEXT NOT NULL DEFAULT 'Submitted',
  visibility      TEXT NOT NULL DEFAULT 'Public',
  hmo_networks    INTEGER NOT NULL DEFAULT 0,
  date_added      DATE NOT NULL DEFAULT CURRENT_DATE,
  submitted_at    DATE NOT NULL DEFAULT CURRENT_DATE,
  active_bookings      INTEGER NOT NULL DEFAULT 0,
  completed_encounters INTEGER NOT NULL DEFAULT 0,
  average_rating       NUMERIC(3,1) NOT NULL DEFAULT 0.0,
  review_count         INTEGER NOT NULL DEFAULT 0,
  popularity_score     NUMERIC(5,1) NOT NULL DEFAULT 0.0,
  audit_score          INTEGER NOT NULL DEFAULT 0,
  last_audited_at      DATE,
  rejection_reason     TEXT,
  admin_comments       TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for filtering by verification status (queue view)
CREATE INDEX IF NOT EXISTS idx_admin_providers_verification
  ON admin_providers (verification);

-- Index for filtering by status
CREATE INDEX IF NOT EXISTS idx_admin_providers_status
  ON admin_providers (status);

-- ---------------------------------------------------------------------------
-- 2. Admin Tariffs
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS admin_tariffs (
  id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  service         TEXT NOT NULL,
  code            TEXT NOT NULL,
  category        TEXT NOT NULL DEFAULT 'Consultation',
  region          TEXT NOT NULL DEFAULT 'South-West',
  state           TEXT NOT NULL DEFAULT 'Lagos',
  benchmark       INTEGER NOT NULL DEFAULT 0,
  min             INTEGER NOT NULL DEFAULT 0,
  max             INTEGER NOT NULL DEFAULT 0,
  status          TEXT NOT NULL DEFAULT 'Draft',
  effective_date  DATE NOT NULL DEFAULT CURRENT_DATE,
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by      TEXT NOT NULL DEFAULT '',
  providers_using INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_admin_tariffs_category
  ON admin_tariffs (category);

CREATE INDEX IF NOT EXISTS idx_admin_tariffs_region
  ON admin_tariffs (region);

-- ---------------------------------------------------------------------------
-- 3. Admin Encounters
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS admin_encounters (
  id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  hospital        TEXT NOT NULL,
  patient_ref     TEXT NOT NULL,
  type            TEXT NOT NULL DEFAULT 'General',
  payer           TEXT NOT NULL DEFAULT 'DIRECT PAY',
  hmo             TEXT,
  check_in_time   TIMESTAMPTZ NOT NULL DEFAULT now(),
  wait_minutes    INTEGER NOT NULL DEFAULT 0,
  status          TEXT NOT NULL DEFAULT 'Waiting'
);

CREATE INDEX IF NOT EXISTS idx_admin_encounters_status
  ON admin_encounters (status);

-- ---------------------------------------------------------------------------
-- 4. Admin HMO Accounts
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS admin_hmo_accounts (
  id                          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name                        TEXT NOT NULL,
  members                     INTEGER NOT NULL DEFAULT 0,
  network_providers           INTEGER NOT NULL DEFAULT 0,
  plan                        TEXT NOT NULL DEFAULT 'FREE',
  status                      TEXT NOT NULL DEFAULT 'Active',
  monthly_revenue             INTEGER NOT NULL DEFAULT 0,
  renewal_date                DATE NOT NULL DEFAULT CURRENT_DATE,
  contact                     TEXT NOT NULL DEFAULT '',
  authorization_latency_mins  INTEGER NOT NULL DEFAULT 0
);

-- ---------------------------------------------------------------------------
-- 5. Admin Transactions
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS admin_transactions (
  id                TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  reference         TEXT NOT NULL,
  counterparty      TEXT NOT NULL,
  channel           TEXT NOT NULL DEFAULT 'Consultation Commission',
  gross             INTEGER NOT NULL DEFAULT 0,
  platform_revenue  INTEGER NOT NULL DEFAULT 0,
  status            TEXT NOT NULL DEFAULT 'Pending',
  date              TIMESTAMPTZ NOT NULL DEFAULT now(),
  method            TEXT NOT NULL DEFAULT 'Card'
);

CREATE INDEX IF NOT EXISTS idx_admin_transactions_date
  ON admin_transactions (date DESC);

-- ---------------------------------------------------------------------------
-- 6. Admin Campaigns (promoted placements)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS admin_campaigns (
  id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  provider_id     TEXT NOT NULL,
  provider        TEXT NOT NULL,
  specialty       TEXT NOT NULL DEFAULT '',
  location        TEXT NOT NULL DEFAULT '',
  campaign        TEXT NOT NULL DEFAULT '',
  placement       TEXT NOT NULL DEFAULT 'Featured Top Placement',
  model           TEXT NOT NULL DEFAULT 'CPC',
  budget          INTEGER NOT NULL DEFAULT 0,
  bid             INTEGER NOT NULL DEFAULT 0,
  reserve_price   INTEGER NOT NULL DEFAULT 0,
  impressions     INTEGER NOT NULL DEFAULT 0,
  clicks          INTEGER NOT NULL DEFAULT 0,
  start_date      DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date        DATE,
  status          TEXT NOT NULL DEFAULT 'Pending'
);

-- ---------------------------------------------------------------------------
-- 7. Admin Users
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS admin_users (
  id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name            TEXT NOT NULL,
  email           TEXT NOT NULL UNIQUE,
  role            TEXT NOT NULL DEFAULT 'Governance Analyst',
  status          TEXT NOT NULL DEFAULT 'Invited',
  last_active     TIMESTAMPTZ
);

-- ---------------------------------------------------------------------------
-- 8. Admin Audit Log
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS admin_audit_log (
  id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  logged_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  admin           TEXT NOT NULL,
  action          TEXT NOT NULL,
  entity          TEXT NOT NULL DEFAULT '',
  entity_id       TEXT NOT NULL DEFAULT '',
  previous_status TEXT NOT NULL DEFAULT '',
  new_status      TEXT NOT NULL DEFAULT '',
  device          TEXT NOT NULL DEFAULT '',
  details         TEXT NOT NULL DEFAULT ''
);

CREATE INDEX IF NOT EXISTS idx_admin_audit_log_timestamp
  ON admin_audit_log (logged_at DESC);

-- ---------------------------------------------------------------------------
-- 9. Dashboard Stats (materialized view or simple table)
-- ---------------------------------------------------------------------------
-- For now, a simple single-row table that can be updated by a cron/trigger.
-- Replace with a materialized view when real data volume warrants it.
CREATE TABLE IF NOT EXISTS admin_dashboard_stats (
  id                       INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  total_providers          INTEGER NOT NULL DEFAULT 0,
  active_providers         INTEGER NOT NULL DEFAULT 0,
  pending_verification     INTEGER NOT NULL DEFAULT 0,
  total_bookings_today     INTEGER NOT NULL DEFAULT 0,
  total_encounters_today   INTEGER NOT NULL DEFAULT 0,
  platform_revenue_mtd     BIGINT NOT NULL DEFAULT 0,
  avg_hmo_latency_mins     INTEGER NOT NULL DEFAULT 0,
  updated_at               TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Seed the single stats row
INSERT INTO admin_dashboard_stats (id) VALUES (1)
  ON CONFLICT (id) DO NOTHING;

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
-- Enable RLS on all admin tables. Policies should be added based on your
-- auth setup (e.g. only authenticated admins with specific roles).

ALTER TABLE admin_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_tariffs ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_encounters ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_hmo_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_dashboard_stats ENABLE ROW LEVEL SECURITY;

-- Basic read policy for authenticated users (adjust roles as needed)
CREATE POLICY "Allow authenticated read on admin_providers"
  ON admin_providers FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated read on admin_tariffs"
  ON admin_tariffs FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated read on admin_encounters"
  ON admin_encounters FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated read on admin_hmo_accounts"
  ON admin_hmo_accounts FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated read on admin_transactions"
  ON admin_transactions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated read on admin_campaigns"
  ON admin_campaigns FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated read on admin_users"
  ON admin_users FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated read on admin_audit_log"
  ON admin_audit_log FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated read on admin_dashboard_stats"
  ON admin_dashboard_stats FOR SELECT
  TO authenticated
  USING (true);

-- Write policies for admin_providers (update verification/status)
CREATE POLICY "Allow authenticated update on admin_providers"
  ON admin_providers FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Write policies for admin_tariffs (upsert)
CREATE POLICY "Allow authenticated insert on admin_tariffs"
  ON admin_tariffs FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated update on admin_tariffs"
  ON admin_tariffs FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Write policies for admin_audit_log (insert only)
CREATE POLICY "Allow authenticated insert on admin_audit_log"
  ON admin_audit_log FOR INSERT
  TO authenticated
  WITH CHECK (true);
