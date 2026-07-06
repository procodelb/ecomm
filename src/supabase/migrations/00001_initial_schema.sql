-- ============================================================================
-- DROPSHIPPING WATER TOYS PLATFORM — SUPABASE POSTGRESQL SCHEMA
-- ============================================================================
-- Tables: suppliers, products, product_variants, inventory, orders, order_items,
--         customers, admin_users, supplier_logs, webhook_logs, reviews, seo_pages
-- ============================================================================

-- 0. EXTENSIONS

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. ENUMS

CREATE TYPE supplier_status AS ENUM (
  'active', 'inactive', 'suspended', 'pending_review'
);

CREATE TYPE product_status AS ENUM (
  'draft', 'active', 'discontinued', 'out_of_stock', 'coming_soon'
);

CREATE TYPE order_status AS ENUM (
  'pending', 'payment_received', 'processing', 'shipped',
  'in_transit', 'delivered', 'cancelled', 'refunded', 'partially_refunded'
);

CREATE TYPE shipping_method AS ENUM (
  'standard', 'express', 'overnight', 'freight', 'pickup'
);

CREATE TYPE currency_code AS ENUM (
  'AED', 'AUD', 'USD', 'EUR', 'GBP'
);

CREATE TYPE inventory_movement AS ENUM (
  'received', 'sold', 'returned', 'adjusted', 'transferred', 'damaged'
);

CREATE TYPE review_status AS ENUM (
  'pending', 'approved', 'rejected', 'flagged'
);

CREATE TYPE admin_role AS ENUM (
  'super_admin', 'admin', 'manager', 'support', 'analyst'
);

-- 2. SUPPLIERS

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

-- 3. PRODUCTS

CREATE TABLE products (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  supplier_id         UUID NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
  sku                 VARCHAR(100) NOT NULL,
  supplier_sku        VARCHAR(100),
  barcode             VARCHAR(100),
  title               VARCHAR(500) NOT NULL,
  slug                VARCHAR(500) NOT NULL,
  description         TEXT,
  short_description   TEXT,
  category            VARCHAR(255),
  subcategory         VARCHAR(255),
  tags                TEXT[] DEFAULT '{}',

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

-- 4. PRODUCT VARIANTS

CREATE TABLE product_variants (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id        UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  sku               VARCHAR(100) NOT NULL,
  barcode           VARCHAR(100),
  title             VARCHAR(500) NOT NULL,
  attributes        JSONB DEFAULT '{}',
  options_text      VARCHAR(255),

  -- Pricing
  price_aed         DECIMAL(12,2) NOT NULL CHECK (price_aed >= 0),
  price_aud         DECIMAL(12,2) NOT NULL CHECK (price_aud >= 0),
  compare_price_aed DECIMAL(12,2) CHECK (compare_price_aed >= 0),
  compare_price_aud DECIMAL(12,2) CHECK (compare_price_aud >= 0),
  cost_price_aed    DECIMAL(12,2),
  cost_price_aud    DECIMAL(12,2),

  -- Stock
  stock             INTEGER DEFAULT 0 CHECK (stock >= 0),
  low_stock_threshold INTEGER DEFAULT 5,
  track_quantity    BOOLEAN DEFAULT TRUE,
  allow_backorder   BOOLEAN DEFAULT FALSE,

  -- Media
  images            JSONB DEFAULT '[]',
  models_3d         JSONB DEFAULT '[]',

  -- Physical
  weight_kg         DECIMAL(8,2),
  dimensions_cm     JSONB DEFAULT '{}',

  -- Status
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

-- 5. INVENTORY

CREATE TABLE inventory (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id        UUID REFERENCES products(id) ON DELETE CASCADE,
  variant_id        UUID REFERENCES product_variants(id) ON DELETE CASCADE,
  supplier_id       UUID NOT NULL REFERENCES suppliers(id),

  -- Stock tracking
  quantity          INTEGER NOT NULL DEFAULT 0,
  reserved          INTEGER NOT NULL DEFAULT 0 CHECK (reserved >= 0),
  available         INTEGER GENERATED ALWAYS AS (quantity - reserved) STORED,
  low_stock_threshold INTEGER DEFAULT 5,
  reorder_point     INTEGER DEFAULT 10,
  reorder_quantity  INTEGER DEFAULT 50,

  -- Location
  warehouse         VARCHAR(100) DEFAULT 'default',
  location_code     VARCHAR(50),
  region            VARCHAR(50),

  -- Batch
  batch_number      VARCHAR(100),
  expiry_date       DATE,
  received_date     DATE DEFAULT CURRENT_DATE,

  metadata          JSONB DEFAULT '{}',
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT inventory_product_or_variant CHECK (
    (product_id IS NOT NULL AND variant_id IS NULL)
    OR (product_id IS NULL AND variant_id IS NOT NULL)
  )
);

CREATE INDEX idx_inventory_product ON inventory (product_id);
CREATE INDEX idx_inventory_variant ON inventory (variant_id);
CREATE INDEX idx_inventory_supplier ON inventory (supplier_id);
CREATE INDEX idx_inventory_region ON inventory (region);
CREATE INDEX idx_inventory_low_stock ON inventory (quantity) WHERE quantity <= low_stock_threshold;

-- 6. INVENTORY MOVEMENTS (audit log)

CREATE TABLE inventory_movements (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  inventory_id      UUID NOT NULL REFERENCES inventory(id) ON DELETE CASCADE,
  movement_type     inventory_movement NOT NULL,
  quantity          INTEGER NOT NULL,
  reference_type    VARCHAR(50),
  reference_id      VARCHAR(100),
  note              TEXT,
  performed_by      UUID,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_inventory_movements_inv ON inventory_movements (inventory_id);
CREATE INDEX idx_inventory_movements_type ON inventory_movements (movement_type);

-- 7. CUSTOMERS

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

-- 8. ADMIN USERS

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

-- 9. ORDERS

CREATE TABLE orders (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number      VARCHAR(30) NOT NULL UNIQUE,
  customer_id       UUID REFERENCES customers(id) ON DELETE SET NULL,
  customer_email    VARCHAR(255) NOT NULL,
  status            order_status DEFAULT 'pending',
  currency          currency_code NOT NULL DEFAULT 'AED',
  locale            VARCHAR(10) DEFAULT 'en-AE',
  subtotal          DECIMAL(14,2) NOT NULL CHECK (subtotal >= 0),
  shipping_cost     DECIMAL(12,2) DEFAULT 0 CHECK (shipping_cost >= 0),
  tax_amount        DECIMAL(12,2) DEFAULT 0 CHECK (tax_amount >= 0),
  tax_rate          DECIMAL(5,4) DEFAULT 0,
  discount_amount   DECIMAL(12,2) DEFAULT 0 CHECK (discount_amount >= 0),
  coupon_code       VARCHAR(50),
  total             DECIMAL(14,2) NOT NULL CHECK (total >= 0),
  amount_paid       DECIMAL(14,2) DEFAULT 0 CHECK (amount_paid >= 0),
  amount_due        DECIMAL(14,2) GENERATED ALWAYS AS (total - amount_paid) STORED,
  payment_method    VARCHAR(50),
  payment_intent_id VARCHAR(255),
  payment_status    VARCHAR(50),
  paid_at           TIMESTAMPTZ,
  shipping_method   shipping_method DEFAULT 'standard',
  shipping_carrier  VARCHAR(100),
  tracking_number   VARCHAR(255),
  tracking_url      VARCHAR(500),
  shipping_address  JSONB NOT NULL,
  billing_address   JSONB NOT NULL,
  shipping_zone     VARCHAR(100),
  estimated_delivery DATE,
  delivered_at      TIMESTAMPTZ,
  customer_notes    TEXT,
  internal_notes    TEXT,
  cancellation_reason TEXT,
  refund_amount     DECIMAL(14,2) DEFAULT 0,
  refunded_at       TIMESTAMPTZ,
  metadata          JSONB DEFAULT '{}',
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_orders_customer ON orders (customer_id);
CREATE INDEX idx_orders_email ON orders (customer_email);
CREATE INDEX idx_orders_status ON orders (status);
CREATE INDEX idx_orders_number ON orders (order_number);
CREATE INDEX idx_orders_payment ON orders (payment_intent_id);
CREATE INDEX idx_orders_created ON orders (created_at DESC);
CREATE INDEX idx_orders_currency ON orders (currency);

-- 10. ORDER ITEMS

CREATE TABLE order_items (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id          UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id        UUID REFERENCES products(id) ON DELETE SET NULL,
  variant_id        UUID REFERENCES product_variants(id) ON DELETE SET NULL,
  supplier_id       UUID REFERENCES suppliers(id) ON DELETE SET NULL,
  sku               VARCHAR(100),
  title             VARCHAR(500) NOT NULL,
  variant_title     VARCHAR(500),
  attributes        JSONB DEFAULT '{}',
  image_url         VARCHAR(500),
  unit_price        DECIMAL(12,2) NOT NULL CHECK (unit_price >= 0),
  quantity          INTEGER NOT NULL CHECK (quantity > 0),
  line_total        DECIMAL(14,2) NOT NULL CHECK (line_total >= 0),
  supplier_price    DECIMAL(12,2),
  supplier_currency currency_code,
  status            order_status DEFAULT 'pending',
  tracking_number   VARCHAR(255),
  tracking_url      VARCHAR(500),
  carrier           VARCHAR(100),
  shipped_at        TIMESTAMPTZ,
  delivered_at      TIMESTAMPTZ,
  metadata          JSONB DEFAULT '{}',
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_order_items_order ON order_items (order_id);
CREATE INDEX idx_order_items_product ON order_items (product_id);
CREATE INDEX idx_order_items_supplier ON order_items (supplier_id);
CREATE INDEX idx_order_items_status ON order_items (status);

-- 11. SUPPLIER LOGS

CREATE TABLE supplier_logs (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  supplier_id       UUID NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
  event_type        VARCHAR(100) NOT NULL,
  status            VARCHAR(50) NOT NULL,
  request_url       VARCHAR(500),
  request_method    VARCHAR(10),
  request_body      TEXT,
  response_status   INTEGER,
  response_body     TEXT,
  response_time_ms  INTEGER,
  error_message     TEXT,
  error_stack       TEXT,
  performed_by      UUID REFERENCES admin_users(id),
  metadata          JSONB DEFAULT '{}',
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_supplier_logs_supplier ON supplier_logs (supplier_id);
CREATE INDEX idx_supplier_logs_type ON supplier_logs (event_type);
CREATE INDEX idx_supplier_logs_status ON supplier_logs (status);
CREATE INDEX idx_supplier_logs_created ON supplier_logs (created_at DESC);

-- 12. WEBHOOK LOGS

CREATE TABLE webhook_logs (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider          VARCHAR(100) NOT NULL,
  event_type        VARCHAR(255) NOT NULL,
  event_id          VARCHAR(255),
  webhook_url       VARCHAR(500),
  headers           JSONB DEFAULT '{}',
  body              JSONB DEFAULT '{}',
  raw_body          TEXT,
  signature         VARCHAR(500),
  signature_valid   BOOLEAN,
  processing_status VARCHAR(50) DEFAULT 'received',
  response_status   INTEGER,
  response_body     TEXT,
  error_message     TEXT,
  retry_count       INTEGER DEFAULT 0,
  max_retries       INTEGER DEFAULT 3,
  processed_at      TIMESTAMPTZ,
  metadata          JSONB DEFAULT '{}',
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_webhook_logs_provider ON webhook_logs (provider);
CREATE INDEX idx_webhook_logs_event ON webhook_logs (event_type);
CREATE INDEX idx_webhook_logs_status ON webhook_logs (processing_status);
CREATE INDEX idx_webhook_logs_created ON webhook_logs (created_at DESC);

-- 13. REVIEWS

CREATE TABLE reviews (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id        UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  variant_id        UUID REFERENCES product_variants(id) ON DELETE SET NULL,
  customer_id       UUID REFERENCES customers(id) ON DELETE SET NULL,
  customer_name     VARCHAR(255),
  customer_email    VARCHAR(255),
  rating            INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title             VARCHAR(255),
  body              TEXT,
  pros              TEXT[] DEFAULT '{}',
  cons              TEXT[] DEFAULT '{}',
  images            JSONB DEFAULT '[]',
  videos            JSONB DEFAULT '[]',
  verified_purchase BOOLEAN DEFAULT FALSE,
  order_id          UUID REFERENCES orders(id) ON DELETE SET NULL,
  status            review_status DEFAULT 'pending',
  moderated_by      UUID REFERENCES admin_users(id),
  moderated_at      TIMESTAMPTZ,
  rejection_reason  TEXT,
  helpful_count     INTEGER DEFAULT 0,
  reported_count    INTEGER DEFAULT 0,
  metadata          JSONB DEFAULT '{}',
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_reviews_product ON reviews (product_id);
CREATE INDEX idx_reviews_customer ON reviews (customer_id);
CREATE INDEX idx_reviews_rating ON reviews (rating);
CREATE INDEX idx_reviews_status ON reviews (status);
CREATE INDEX idx_reviews_created ON reviews (created_at DESC);
CREATE INDEX idx_reviews_verified ON reviews (verified_purchase) WHERE verified_purchase = TRUE;

-- 14. SEO PAGES

CREATE TABLE seo_pages (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug              VARCHAR(500) NOT NULL,
  locale            VARCHAR(10) NOT NULL DEFAULT 'en-AE',
  title             VARCHAR(70) NOT NULL,
  description       VARCHAR(160),
  keywords          TEXT[] DEFAULT '{}',
  og_title          VARCHAR(70),
  og_description    VARCHAR(160),
  og_image          VARCHAR(500),
  twitter_card      VARCHAR(50) DEFAULT 'summary_large_image',
  canonical_url     VARCHAR(500),
  structured_data   JSONB DEFAULT '{}',
  h1_heading        VARCHAR(255),
  content_sections  JSONB DEFAULT '[]',
  is_indexable      BOOLEAN DEFAULT TRUE,
  priority          DECIMAL(2,1) DEFAULT 0.5,
  change_frequency  VARCHAR(20) DEFAULT 'monthly',
  metadata          JSONB DEFAULT '{}',
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE (slug, locale)
);

CREATE INDEX idx_seo_pages_slug ON seo_pages (slug);
CREATE INDEX idx_seo_pages_locale ON seo_pages (locale);
CREATE INDEX idx_seo_pages_indexable ON seo_pages (is_indexable) WHERE is_indexable = TRUE;

-- 15. AUTO-UPDATE updated_at TRIGGERS

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_suppliers_updated_at
  BEFORE UPDATE ON suppliers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_products_updated_at
  BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_product_variants_updated_at
  BEFORE UPDATE ON product_variants FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_inventory_updated_at
  BEFORE UPDATE ON inventory FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_customers_updated_at
  BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_admin_users_updated_at
  BEFORE UPDATE ON admin_users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_orders_updated_at
  BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_reviews_updated_at
  BEFORE UPDATE ON reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_seo_pages_updated_at
  BEFORE UPDATE ON seo_pages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 16. ORDER NUMBER GENERATION

CREATE SEQUENCE IF NOT EXISTS order_number_seq START 100000;

CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.order_number = 'WT-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || NEXTVAL('order_number_seq');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_order_number
  BEFORE INSERT ON orders FOR EACH ROW
  WHEN (NEW.order_number IS NULL)
  EXECUTE FUNCTION generate_order_number();

-- 17. CUSTOMER STATS UPDATE TRIGGER

CREATE OR REPLACE FUNCTION update_customer_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.customer_id IS NOT NULL THEN
    UPDATE customers SET
      total_orders = (SELECT COUNT(*) FROM orders WHERE customer_id = NEW.customer_id),
      total_spent_aed = (SELECT COALESCE(SUM(total), 0) FROM orders WHERE customer_id = NEW.customer_id AND currency = 'AED'),
      total_spent_aud = (SELECT COALESCE(SUM(total), 0) FROM orders WHERE customer_id = NEW.customer_id AND currency = 'AUD'),
      last_order_at = GREATEST(customers.last_order_at, NEW.created_at)
    WHERE id = NEW.customer_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_customer_stats
  AFTER INSERT OR UPDATE ON orders FOR EACH ROW
  EXECUTE FUNCTION update_customer_stats();

-- 18. HELPER FUNCTION: PRODUCT INVENTORY SUMMARY

CREATE OR REPLACE FUNCTION get_product_inventory_summary(p_product_id UUID)
RETURNS TABLE (
  total_quantity    INTEGER,
  total_reserved    INTEGER,
  total_available   INTEGER,
  low_stock         BOOLEAN,
  variant_count     INTEGER
) LANGUAGE plpgsql AS $$
BEGIN
  RETURN QUERY
  SELECT
    COALESCE(SUM(i.quantity), 0)::INTEGER AS total_quantity,
    COALESCE(SUM(i.reserved), 0)::INTEGER AS total_reserved,
    COALESCE(SUM(i.available), 0)::INTEGER AS total_available,
    BOOL_OR(i.quantity <= i.low_stock_threshold) AS low_stock,
    COUNT(DISTINCT pv.id)::INTEGER AS variant_count
  FROM products p
  LEFT JOIN product_variants pv ON pv.product_id = p.id
  LEFT JOIN inventory i ON (i.product_id = p.id OR i.variant_id = pv.id)
  WHERE p.id = p_product_id;
END;
$$;

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplier_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo_pages ENABLE ROW LEVEL SECURITY;

-- 19. ADMIN HELPER FUNCTIONS

CREATE OR REPLACE FUNCTION auth.is_admin()
RETURNS BOOLEAN LANGUAGE plpgsql STABLE SECURITY DEFINER AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admin_users
    WHERE auth_user_id = auth.uid()
    AND is_active = TRUE
  );
END;
$$;

CREATE OR REPLACE FUNCTION auth.admin_role()
RETURNS admin_role LANGUAGE plpgsql STABLE SECURITY DEFINER AS $$
DECLARE
  user_role admin_role;
BEGIN
  SELECT role INTO user_role FROM admin_users WHERE auth_user_id = auth.uid() AND is_active = TRUE;
  RETURN user_role;
END;
$$;

CREATE OR REPLACE FUNCTION auth.has_permission(required_role admin_role)
RETURNS BOOLEAN LANGUAGE plpgsql STABLE SECURITY DEFINER AS $$
DECLARE
  user_role admin_role;
BEGIN
  SELECT role INTO user_role FROM admin_users WHERE auth_user_id = auth.uid() AND is_active = TRUE;

  IF user_role IS NULL THEN RETURN FALSE; END IF;

  IF user_role = 'super_admin' THEN RETURN TRUE; END IF;

  CASE required_role
    WHEN 'super_admin' THEN RETURN user_role = 'super_admin';
    WHEN 'admin' THEN RETURN user_role IN ('super_admin', 'admin');
    WHEN 'manager' THEN RETURN user_role IN ('super_admin', 'admin', 'manager');
    WHEN 'support' THEN RETURN user_role IN ('super_admin', 'admin', 'manager', 'support');
    WHEN 'analyst' THEN RETURN TRUE;
  END CASE;
END;
$$;

-- 20. RLS POLICIES

-- SUPPLIERS
CREATE POLICY "Suppliers are viewable by all authenticated users"
  ON suppliers FOR SELECT TO authenticated USING (TRUE);

CREATE POLICY "Suppliers are manageable by admin users"
  ON suppliers FOR ALL TO authenticated
  USING (auth.is_admin())
  WITH CHECK (auth.is_admin());

-- PRODUCTS
CREATE POLICY "Active products are viewable by everyone"
  ON products FOR SELECT USING (
    status = 'active' OR auth.is_admin()
  );

CREATE POLICY "Products are manageable by admin users"
  ON products FOR ALL TO authenticated
  USING (auth.is_admin())
  WITH CHECK (auth.is_admin());

-- PRODUCT VARIANTS
CREATE POLICY "Active variants are viewable by everyone"
  ON product_variants FOR SELECT USING (
    is_active = TRUE OR auth.is_admin()
  );

CREATE POLICY "Variants are manageable by admin users"
  ON product_variants FOR ALL TO authenticated
  USING (auth.is_admin())
  WITH CHECK (auth.is_admin());

-- INVENTORY
CREATE POLICY "Inventory is viewable by admin users"
  ON inventory FOR SELECT TO authenticated
  USING (auth.is_admin());

CREATE POLICY "Inventory is manageable by admin users"
  ON inventory FOR ALL TO authenticated
  USING (auth.is_admin())
  WITH CHECK (auth.is_admin());

-- INVENTORY MOVEMENTS
CREATE POLICY "Inventory movements are viewable by admin users"
  ON inventory_movements FOR SELECT TO authenticated
  USING (auth.is_admin());

CREATE POLICY "Inventory movements are insertable by admin users"
  ON inventory_movements FOR INSERT TO authenticated
  WITH CHECK (auth.is_admin());

-- CUSTOMERS
CREATE POLICY "Customers can view own data"
  ON customers FOR SELECT TO authenticated
  USING (auth_user_id = auth.uid() OR auth.is_admin());

CREATE POLICY "Customers can update own data"
  ON customers FOR UPDATE TO authenticated
  USING (auth_user_id = auth.uid())
  WITH CHECK (auth_user_id = auth.uid());

CREATE POLICY "Customers are manageable by admin users"
  ON customers FOR ALL TO authenticated
  USING (auth.is_admin())
  WITH CHECK (auth.is_admin());

-- ADMIN USERS
CREATE POLICY "Admin users are viewable by admin users"
  ON admin_users FOR SELECT TO authenticated
  USING (auth.is_admin());

CREATE POLICY "Admin users are manageable by super_admin only"
  ON admin_users FOR ALL TO authenticated
  USING (auth.has_permission('super_admin'))
  WITH CHECK (auth.has_permission('super_admin'));

-- ORDERS
CREATE POLICY "Customers can view own orders"
  ON orders FOR SELECT TO authenticated
  USING (
    customer_email = (SELECT email FROM auth.users WHERE id = auth.uid())
    OR auth.is_admin()
  );

CREATE POLICY "Customers can create own orders"
  ON orders FOR INSERT TO authenticated
  WITH CHECK (
    customer_email = (SELECT email FROM auth.users WHERE id = auth.uid())
    OR auth.is_admin()
  );

CREATE POLICY "Orders are manageable by admin users"
  ON orders FOR ALL TO authenticated
  USING (auth.is_admin())
  WITH CHECK (auth.is_admin());

-- ORDER ITEMS
CREATE POLICY "Customers can view own order items"
  ON order_items FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders o
      WHERE o.id = order_items.order_id
      AND (o.customer_email = (SELECT email FROM auth.users WHERE id = auth.uid()) OR auth.is_admin())
    )
  );

CREATE POLICY "Order items are manageable by admin users"
  ON order_items FOR ALL TO authenticated
  USING (auth.is_admin())
  WITH CHECK (auth.is_admin());

-- SUPPLIER LOGS
CREATE POLICY "Supplier logs are viewable by admin users"
  ON supplier_logs FOR SELECT TO authenticated
  USING (auth.is_admin());

CREATE POLICY "Supplier logs are insertable by admin users"
  ON supplier_logs FOR INSERT TO authenticated
  WITH CHECK (auth.is_admin());

-- WEBHOOK LOGS
CREATE POLICY "Webhook logs are viewable by admin users"
  ON webhook_logs FOR SELECT TO authenticated
  USING (auth.is_admin());

CREATE POLICY "Webhook logs are insertable by service role"
  ON webhook_logs FOR INSERT TO service_role
  WITH CHECK (TRUE);

-- REVIEWS
CREATE POLICY "Approved reviews are viewable by everyone"
  ON reviews FOR SELECT USING (
    status = 'approved' OR auth.is_admin()
  );

CREATE POLICY "Customers can create reviews"
  ON reviews FOR INSERT TO authenticated
  WITH CHECK (
    customer_email = (SELECT email FROM auth.users WHERE id = auth.uid())
    OR auth.is_admin()
  );

CREATE POLICY "Customers can update own pending reviews"
  ON reviews FOR UPDATE TO authenticated
  USING (customer_id = (SELECT id FROM customers WHERE auth_user_id = auth.uid()))
  WITH CHECK (status = 'pending');

CREATE POLICY "Reviews are manageable by admin users"
  ON reviews FOR ALL TO authenticated
  USING (auth.is_admin())
  WITH CHECK (auth.is_admin());

-- SEO PAGES
CREATE POLICY "SEO pages are viewable by everyone"
  ON seo_pages FOR SELECT USING (TRUE);

CREATE POLICY "SEO pages are manageable by admin users"
  ON seo_pages FOR ALL TO authenticated
  USING (auth.is_admin())
  WITH CHECK (auth.is_admin());
