-- TRIGGERS & HELPER FUNCTIONS — reference file
-- Source: supabase/migrations/00001_initial_schema.sql

-- ============================================================================
-- AUTO-UPDATE updated_at TRIGGER (applied to all tables with updated_at)
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to each table:
-- CREATE TRIGGER set_<table>_updated_at
--   BEFORE UPDATE ON <table> FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- ORDER NUMBER GENERATION
-- ============================================================================
-- Generates: WT-YYYYMMDD-NNNNNN

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

-- ============================================================================
-- CUSTOMER STATS UPDATE
-- ============================================================================
-- Updates total_orders, total_spent_aed/aud, last_order_at on customer

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

-- ============================================================================
-- PRODUCT INVENTORY SUMMARY (read-only helper)
-- ============================================================================

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
