-- SUPPLIERS — domain DDL reference
-- Source: supabase/migrations/00001_initial_schema.sql
-- Prisma model: Supplier (prisma/schema.prisma)

CREATE TYPE supplier_status AS ENUM (
  'active', 'inactive', 'suspended', 'pending_review'
);

CREATE TABLE suppliers (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code              VARCHAR(20) NOT NULL UNIQUE,
  name              VARCHAR(255) NOT NULL,
  company_name      VARCHAR(255),
  contact_name      VARCHAR(255),
  contact_email     VARCHAR(255),
  contact_phone     VARCHAR(50),
  website           VARCHAR(500),
  api_url           VARCHAR(500),
  api_key_encrypted TEXT,
  api_docs_url      VARCHAR(500),
  country           VARCHAR(100) NOT NULL,
  city              VARCHAR(100),
  address           TEXT,
  shipping_methods  shipping_method[] DEFAULT '{}',
  currencies        currency_code[] DEFAULT '{}',
  moq               INTEGER DEFAULT 1,
  lead_time_min     INTEGER,
  lead_time_max     INTEGER,
  returns_policy    TEXT,
  msds_available    BOOLEAN DEFAULT FALSE,
  msds_url          VARCHAR(500),
  certification     TEXT[],
  notes             TEXT,
  status            supplier_status DEFAULT 'active',
  rating            DECIMAL(2,1) DEFAULT 0.0 CHECK (rating >= 0 AND rating <= 5),
  metadata          JSONB DEFAULT '{}',
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_suppliers_status ON suppliers (status);
CREATE INDEX idx_suppliers_country ON suppliers (country);
CREATE INDEX idx_suppliers_code ON suppliers (code);
