-- ORDERS + ORDER ITEMS — domain DDL reference
-- Source: supabase/migrations/00001_initial_schema.sql
-- Prisma models: Order, OrderItem (prisma/schema.prisma)

CREATE TYPE order_status AS ENUM (
  'pending', 'payment_received', 'processing', 'shipped',
  'in_transit', 'delivered', 'cancelled', 'refunded', 'partially_refunded'
);

CREATE TYPE shipping_method AS ENUM (
  'standard', 'express', 'overnight', 'freight', 'pickup'
);

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

-- ── ORDER ITEMS ─────────────────────────────────────────────────────────

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
