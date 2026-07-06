-- CUSTOMERS + ADMIN USERS — domain DDL reference
-- Source: supabase/migrations/00001_initial_schema.sql
-- Prisma models: Customer, AdminUser (prisma/schema.prisma)

CREATE TYPE admin_role AS ENUM (
  'super_admin', 'admin', 'manager', 'support', 'analyst'
);

CREATE TABLE customers (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_user_id      UUID UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL,
  email             VARCHAR(255) NOT NULL UNIQUE,
  phone             VARCHAR(50),
  first_name        VARCHAR(100),
  last_name         VARCHAR(100),
  company           VARCHAR(255),
  default_address   JSONB DEFAULT '{}',
  addresses         JSONB DEFAULT '[]',
  preferred_locale  VARCHAR(10) DEFAULT 'en-AE',
  preferred_currency currency_code DEFAULT 'AED',
  total_orders      INTEGER DEFAULT 0,
  total_spent_aed   DECIMAL(14,2) DEFAULT 0,
  total_spent_aud   DECIMAL(14,2) DEFAULT 0,
  last_order_at     TIMESTAMPTZ,
  marketing_consent BOOLEAN DEFAULT FALSE,
  tags              TEXT[] DEFAULT '{}',
  notes             TEXT,
  metadata          JSONB DEFAULT '{}',
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_customers_email ON customers (email);
CREATE INDEX idx_customers_auth ON customers (auth_user_id);
CREATE INDEX idx_customers_locale ON customers (preferred_locale);
CREATE INDEX idx_customers_tags ON customers USING GIN (tags);

-- ── ADMIN USERS ─────────────────────────────────────────────────────────

CREATE TABLE admin_users (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_user_id      UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email             VARCHAR(255) NOT NULL UNIQUE,
  first_name        VARCHAR(100) NOT NULL,
  last_name         VARCHAR(100) NOT NULL,
  role              admin_role NOT NULL DEFAULT 'admin',
  permissions       JSONB DEFAULT '{}',
  mfa_enabled       BOOLEAN DEFAULT FALSE,
  last_login_at     TIMESTAMPTZ,
  last_ip           INET,
  is_active         BOOLEAN DEFAULT TRUE,
  metadata          JSONB DEFAULT '{}',
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_admin_users_email ON admin_users (email);
CREATE INDEX idx_admin_users_role ON admin_users (role);
CREATE INDEX idx_admin_users_active ON admin_users (is_active) WHERE is_active = TRUE;
