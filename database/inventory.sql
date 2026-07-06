-- INVENTORY + INVENTORY MOVEMENTS — domain DDL reference
-- Source: supabase/migrations/00001_initial_schema.sql
-- Prisma models: Inventory, InventoryMovement (prisma/schema.prisma)

CREATE TYPE inventory_movement AS ENUM (
  'received', 'sold', 'returned', 'adjusted', 'transferred', 'damaged'
);

CREATE TABLE inventory (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id        UUID REFERENCES products(id) ON DELETE CASCADE,
  variant_id        UUID REFERENCES product_variants(id) ON DELETE CASCADE,
  supplier_id       UUID NOT NULL REFERENCES suppliers(id),

  quantity          INTEGER NOT NULL DEFAULT 0,
  reserved          INTEGER NOT NULL DEFAULT 0 CHECK (reserved >= 0),
  available         INTEGER GENERATED ALWAYS AS (quantity - reserved) STORED,
  low_stock_threshold INTEGER DEFAULT 5,
  reorder_point     INTEGER DEFAULT 10,
  reorder_quantity  INTEGER DEFAULT 50,

  warehouse         VARCHAR(100) DEFAULT 'default',
  location_code     VARCHAR(50),
  region            VARCHAR(50),

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

-- ── INVENTORY MOVEMENTS (audit log) ─────────────────────────────────────

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
