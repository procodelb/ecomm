-- PRODUCTS + PRODUCT VARIANTS — domain DDL reference
-- Source: supabase/migrations/00001_initial_schema.sql
-- Prisma models: Product, ProductVariant (prisma/schema.prisma)

CREATE TYPE product_status AS ENUM (
  'draft', 'active', 'discontinued', 'out_of_stock', 'coming_soon'
);

CREATE TABLE products (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  supplier_id       UUID NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
  sku               VARCHAR(100) NOT NULL,
  supplier_sku      VARCHAR(100),
  barcode           VARCHAR(100),
  title             VARCHAR(500) NOT NULL,
  slug              VARCHAR(500) NOT NULL,
  description       TEXT,
  short_description TEXT,
  category          VARCHAR(255),
  subcategory       VARCHAR(255),
  tags              TEXT[] DEFAULT '{}',

  -- Pricing (AED / AUD base currencies)
  price_aed           DECIMAL(12,2) NOT NULL CHECK (price_aed >= 0),
  price_aud           DECIMAL(12,2) NOT NULL CHECK (price_aud >= 0),
  compare_price_aed   DECIMAL(12,2) CHECK (compare_price_aed >= 0),
  compare_price_aud   DECIMAL(12,2) CHECK (compare_price_aud >= 0),
  cost_price_aed      DECIMAL(12,2),
  cost_price_aud      DECIMAL(12,2),
  margin_percent      DECIMAL(5,2),

  -- Supplier info
  supplier_price      DECIMAL(12,2),
  supplier_currency   currency_code DEFAULT 'AED',
  moq                 INTEGER DEFAULT 1,
  lead_time           VARCHAR(100),

  -- Media
  images              JSONB DEFAULT '[]',
  videos              JSONB DEFAULT '[]',
  models_3d           JSONB DEFAULT '[]',

  -- Physical
  weight_kg           DECIMAL(8,2),
  dimensions_cm       JSONB DEFAULT '{}',
  country_of_origin   VARCHAR(100),
  hs_code             VARCHAR(20),

  -- SEO
  seo_title           VARCHAR(70),
  seo_description     VARCHAR(160),
  seo_keywords        TEXT[] DEFAULT '{}',
  seo_canonical_url   VARCHAR(500),

  -- Flags
  status              product_status DEFAULT 'draft',
  featured            BOOLEAN DEFAULT FALSE,
  taxable             BOOLEAN DEFAULT TRUE,
  track_quantity      BOOLEAN DEFAULT TRUE,
  allow_backorder     BOOLEAN DEFAULT FALSE,
  is_digital          BOOLEAN DEFAULT FALSE,

  -- Safety
  msds_required       BOOLEAN DEFAULT FALSE,
  msds_url            VARCHAR(500),
  safety_labels       TEXT[] DEFAULT '{}',
  age_rating          VARCHAR(20),
  warnings            TEXT,

  -- Meta
  metadata            JSONB DEFAULT '{}',
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE (supplier_id, sku)
);

CREATE INDEX idx_products_supplier ON products (supplier_id);
CREATE INDEX idx_products_status ON products (status);
CREATE INDEX idx_products_slug ON products (slug);
CREATE INDEX idx_products_category ON products (category);
CREATE INDEX idx_products_featured ON products (featured) WHERE featured = TRUE;
CREATE INDEX idx_products_sku ON products (sku);
CREATE INDEX idx_products_tags ON products USING GIN (tags);
CREATE INDEX idx_products_metadata ON products USING GIN (metadata);

-- ── VARIANTS ────────────────────────────────────────────────────────────

CREATE TABLE product_variants (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id        UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  sku               VARCHAR(100) NOT NULL,
  barcode           VARCHAR(100),
  title             VARCHAR(500) NOT NULL,
  attributes        JSONB DEFAULT '{}',
  options_text      VARCHAR(255),

  price_aed         DECIMAL(12,2) NOT NULL CHECK (price_aed >= 0),
  price_aud         DECIMAL(12,2) NOT NULL CHECK (price_aud >= 0),
  compare_price_aed DECIMAL(12,2) CHECK (compare_price_aed >= 0),
  compare_price_aud DECIMAL(12,2) CHECK (compare_price_aud >= 0),
  cost_price_aed    DECIMAL(12,2),
  cost_price_aud    DECIMAL(12,2),

  stock             INTEGER DEFAULT 0 CHECK (stock >= 0),
  low_stock_threshold INTEGER DEFAULT 5,
  track_quantity    BOOLEAN DEFAULT TRUE,
  allow_backorder   BOOLEAN DEFAULT FALSE,

  images            JSONB DEFAULT '[]',
  models_3d         JSONB DEFAULT '[]',

  weight_kg         DECIMAL(8,2),
  dimensions_cm     JSONB DEFAULT '{}',

  is_active         BOOLEAN DEFAULT TRUE,
  sort_order        INTEGER DEFAULT 0,

  metadata          JSONB DEFAULT '{}',
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE (product_id, sku)
);

CREATE INDEX idx_variants_product ON product_variants (product_id);
CREATE INDEX idx_variants_sku ON product_variants (sku);
CREATE INDEX idx_variants_active ON product_variants (is_active) WHERE is_active = TRUE;
CREATE INDEX idx_variants_attributes ON product_variants USING GIN (attributes);
