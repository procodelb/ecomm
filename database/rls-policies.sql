-- RLS POLICIES — reference file
-- Source: supabase/migrations/00001_initial_schema.sql
-- Enable via: ALTER TABLE <name> ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- HELPER FUNCTIONS (defined in auth schema)
-- ============================================================================

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

-- ============================================================================
-- TABLE-LEVEL POLICIES
-- ============================================================================

-- SUPPLIERS
--   SELECT: all authenticated users
--   ALL:    admin users only
CREATE POLICY "Suppliers are viewable by all authenticated users"
  ON suppliers FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "Suppliers are manageable by admin users"
  ON suppliers FOR ALL TO authenticated USING (auth.is_admin()) WITH CHECK (auth.is_admin());

-- PRODUCTS
--   SELECT: everyone (active only), admins see all
--   ALL:    admin users only
CREATE POLICY "Active products are viewable by everyone"
  ON products FOR SELECT USING (status = 'active' OR auth.is_admin());
CREATE POLICY "Products are manageable by admin users"
  ON products FOR ALL TO authenticated USING (auth.is_admin()) WITH CHECK (auth.is_admin());

-- PRODUCT VARIANTS
--   SELECT: everyone (active only), admins see all
--   ALL:    admin users only
CREATE POLICY "Active variants are viewable by everyone"
  ON product_variants FOR SELECT USING (is_active = TRUE OR auth.is_admin());
CREATE POLICY "Variants are manageable by admin users"
  ON product_variants FOR ALL TO authenticated USING (auth.is_admin()) WITH CHECK (auth.is_admin());

-- INVENTORY
--   SELECT: admin users only
--   ALL:    admin users only
CREATE POLICY "Inventory is viewable by admin users"
  ON inventory FOR SELECT TO authenticated USING (auth.is_admin());
CREATE POLICY "Inventory is manageable by admin users"
  ON inventory FOR ALL TO authenticated USING (auth.is_admin()) WITH CHECK (auth.is_admin());

-- INVENTORY MOVEMENTS
--   SELECT: admin users only
--   INSERT: admin users only
CREATE POLICY "Inventory movements are viewable by admin users"
  ON inventory_movements FOR SELECT TO authenticated USING (auth.is_admin());
CREATE POLICY "Inventory movements are insertable by admin users"
  ON inventory_movements FOR INSERT TO authenticated WITH CHECK (auth.is_admin());

-- CUSTOMERS
--   SELECT: own data or admin
--   UPDATE: own data only
--   ALL:    admin users only
CREATE POLICY "Customers can view own data"
  ON customers FOR SELECT TO authenticated USING (auth_user_id = auth.uid() OR auth.is_admin());
CREATE POLICY "Customers can update own data"
  ON customers FOR UPDATE TO authenticated USING (auth_user_id = auth.uid())
  WITH CHECK (auth_user_id = auth.uid());
CREATE POLICY "Customers are manageable by admin users"
  ON customers FOR ALL TO authenticated USING (auth.is_admin()) WITH CHECK (auth.is_admin());

-- ADMIN USERS
--   SELECT: admin users only
--   ALL:    super_admin only
CREATE POLICY "Admin users are viewable by admin users"
  ON admin_users FOR SELECT TO authenticated USING (auth.is_admin());
CREATE POLICY "Admin users are manageable by super_admin only"
  ON admin_users FOR ALL TO authenticated USING (auth.has_permission('super_admin'))
  WITH CHECK (auth.has_permission('super_admin'));

-- ORDERS
--   SELECT: own orders (by email) or admin
--   INSERT: own orders or admin
--   ALL:    admin users only
CREATE POLICY "Customers can view own orders"
  ON orders FOR SELECT TO authenticated USING (
    customer_email = (SELECT email FROM auth.users WHERE id = auth.uid()) OR auth.is_admin());
CREATE POLICY "Customers can create own orders"
  ON orders FOR INSERT TO authenticated WITH CHECK (
    customer_email = (SELECT email FROM auth.users WHERE id = auth.uid()) OR auth.is_admin());
CREATE POLICY "Orders are manageable by admin users"
  ON orders FOR ALL TO authenticated USING (auth.is_admin()) WITH CHECK (auth.is_admin());

-- ORDER ITEMS
--   SELECT: own order items or admin
--   ALL:    admin users only
CREATE POLICY "Customers can view own order items"
  ON order_items FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM orders o WHERE o.id = order_items.order_id
      AND (o.customer_email = (SELECT email FROM auth.users WHERE id = auth.uid()) OR auth.is_admin())));
CREATE POLICY "Order items are manageable by admin users"
  ON order_items FOR ALL TO authenticated USING (auth.is_admin()) WITH CHECK (auth.is_admin());

-- SUPPLIER LOGS
--   SELECT: admin users only
--   INSERT: admin users only
CREATE POLICY "Supplier logs are viewable by admin users"
  ON supplier_logs FOR SELECT TO authenticated USING (auth.is_admin());
CREATE POLICY "Supplier logs are insertable by admin users"
  ON supplier_logs FOR INSERT TO authenticated WITH CHECK (auth.is_admin());

-- WEBHOOK LOGS
--   SELECT: admin users only
--   INSERT: service_role only
CREATE POLICY "Webhook logs are viewable by admin users"
  ON webhook_logs FOR SELECT TO authenticated USING (auth.is_admin());
CREATE POLICY "Webhook logs are insertable by service role"
  ON webhook_logs FOR INSERT TO service_role WITH CHECK (TRUE);

-- REVIEWS
--   SELECT: everyone (approved only), admins see all
--   INSERT: authenticated (own email)
--   UPDATE: own pending reviews only
--   ALL:    admin users only
CREATE POLICY "Approved reviews are viewable by everyone"
  ON reviews FOR SELECT USING (status = 'approved' OR auth.is_admin());
CREATE POLICY "Customers can create reviews"
  ON reviews FOR INSERT TO authenticated WITH CHECK (
    customer_email = (SELECT email FROM auth.users WHERE id = auth.uid()) OR auth.is_admin());
CREATE POLICY "Customers can update own pending reviews"
  ON reviews FOR UPDATE TO authenticated
  USING (customer_id = (SELECT id FROM customers WHERE auth_user_id = auth.uid()))
  WITH CHECK (status = 'pending');
CREATE POLICY "Reviews are manageable by admin users"
  ON reviews FOR ALL TO authenticated USING (auth.is_admin()) WITH CHECK (auth.is_admin());

-- SEO PAGES
--   SELECT: everyone
--   ALL:    admin users only
CREATE POLICY "SEO pages are viewable by everyone"
  ON seo_pages FOR SELECT USING (TRUE);
CREATE POLICY "SEO pages are manageable by admin users"
  ON seo_pages FOR ALL TO authenticated USING (auth.is_admin()) WITH CHECK (auth.is_admin());
