-- ============================================================================
-- CRON SYNC INFRASTRUCTURE
-- ============================================================================
-- 1. Extensions: pg_cron (scheduling) + pg_net (HTTP from SQL)
-- 2. notification_outbox table for async admin alerts
-- 3. revalidate_products() RPC for instant cache invalidation
-- 4. Cron schedule: every 30 minutes calls sync-suppliers edge function
-- ============================================================================

-- 0. EXTENSIONS

CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- 1. NOTIFICATION OUTBOX
-- Edge functions write to this table; a DB webhook or polling sends them.

CREATE TABLE IF NOT EXISTS notification_outbox (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type        VARCHAR(50) NOT NULL,
  title       VARCHAR(255) NOT NULL,
  body        TEXT NOT NULL,
  severity    VARCHAR(20) NOT NULL DEFAULT 'info'
              CHECK (severity IN ('info', 'warning', 'error', 'critical')),
  channel     VARCHAR(50) DEFAULT 'email',
  recipient   VARCHAR(255),
  sent_at     TIMESTAMPTZ,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notification_outbox_sent
  ON notification_outbox (sent_at) WHERE sent_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_notification_outbox_severity
  ON notification_outbox (severity);

ALTER TABLE notification_outbox ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Notification outbox is insertable by service role"
  ON notification_outbox FOR INSERT TO service_role
  WITH CHECK (TRUE);

CREATE POLICY "Notification outbox is viewable by admin users"
  ON notification_outbox FOR SELECT TO authenticated
  USING (auth.is_admin());

-- 2. REVALIDATE RPC
-- Called by the edge function after sync to trigger cache revalidation.
-- On Supabase, this sends a NOTIFY that a pg_listener in Next.js can pick up.
-- On Vercel, the `/api/sync/suppliers` route calls revalidateTag() directly.

CREATE OR REPLACE FUNCTION revalidate_products()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  NOTIFY "revalidate", '{"tag":"products"}';
END;
$$;

-- 3. SUPPLIER LAST_SYNC TRACKING
-- Add sync tracking columns to suppliers table.

ALTER TABLE suppliers
  ADD COLUMN IF NOT EXISTS last_sync_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS last_sync_status VARCHAR(50)
    CHECK (last_sync_status IN ('success', 'partial', 'failed', NULL)),
  ADD COLUMN IF NOT EXISTS last_sync_summary TEXT;

CREATE INDEX IF NOT EXISTS idx_suppliers_last_sync
  ON suppliers (last_sync_at DESC);

-- 4. CRON JOB — runs every 30 minutes
-- Requires `app.settings.service_role_key` to be set in Supabase Dashboard:
--   Database → Settings → Session reinitialization → add:
--     app.settings.service_role_key = '<your_service_role_key>'
-- Or run in SQL Editor as superuser:
--   SELECT set_config('app.settings.service_role_key',
--     current_setting('supabase.service_role_key'), false);

DO $$
BEGIN
  -- Remove old schedule if exists (idempotent)
  PERFORM cron.unschedule('sync-suppliers-30min');

  -- Schedule new job
  PERFORM cron.schedule(
    'sync-suppliers-30min',
    '*/30 * * * *',
    $$
      SELECT net.http_post(
        url := 'https://pwgadikpldbsxsyijxav.supabase.co/functions/v1/sync-suppliers',
        headers := jsonb_build_object(
          'Authorization',
          'Bearer ' || nullif(current_setting('app.settings.service_role_key', true), ''),
          'Content-Type',
          'application/json'
        ),
        body := '{}'::jsonb
      ) AS request_id;
    $$
  );
END;
$$;

-- 5. TRIGGER: Update last_sync_at on suppliers after supplier_logs insert
-- Keeps the supplier's last_sync_at column updated automatically.

CREATE OR REPLACE FUNCTION update_supplier_last_sync()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF NEW.event_type = 'product_sync' THEN
    UPDATE suppliers
    SET
      last_sync_at = NEW.created_at,
      last_sync_status = CASE
        WHEN NEW.status = 'success' THEN 'success'::VARCHAR
        WHEN NEW.status = 'partial' THEN 'partial'::VARCHAR
        ELSE 'failed'::VARCHAR
      END,
      last_sync_summary = jsonb_build_object(
        'response_status', NEW.response_status,
        'errors', NEW.error_message,
        'metadata', NEW.metadata
      )::TEXT
    WHERE id = NEW.supplier_id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_supplier_last_sync ON supplier_logs;
CREATE TRIGGER trg_supplier_last_sync
  AFTER INSERT ON supplier_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_supplier_last_sync();
