import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

interface SyncLog {
  supplier_id: string;
  supplier_name: string;
  status: "success" | "partial" | "failed";
  summary: string;
  products_total: number;
  products_created: number;
  products_updated: number;
  errors: string[];
  duration_ms: number;
}

serve(async (req) => {
  const startedAt = Date.now();

  try {
    // ── Verify cron invocation (optional auth header) ──
    const authHeader = req.headers.get("authorization");
    const expectedKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    if (authHeader !== `Bearer ${expectedKey}`) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // ── Initialize Supabase client ──
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const supabase = createClient(supabaseUrl, supabaseKey);

    // ── Fetch active suppliers ──
    const { data: suppliers, error: supplierErr } = await supabase
      .from("suppliers")
      .select("id, code, name, api_url, metadata")
      .eq("status", "active");

    if (supplierErr) throw supplierErr;
    if (!suppliers?.length) {
      return new Response(JSON.stringify({ message: "No active suppliers", suppliers: 0 }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    // ── Try calling the Next.js sync API ──
    const siteUrl = Deno.env.get("NEXT_PUBLIC_SITE_URL");
    const cronSecret = Deno.env.get("CRON_SECRET");

    if (siteUrl && cronSecret) {
      const nextRes = await fetch(`${siteUrl}/api/sync/suppliers`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-cron-secret": cronSecret,
        },
      });

      if (nextRes.ok) {
        const result = await nextRes.json();
        return new Response(JSON.stringify(result), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }
    }

    // ── Fallback: inline sync (when Next.js is unreachable) ──
    const logs: SyncLog[] = [];

    for (const supplier of suppliers) {
      const log: SyncLog = {
        supplier_id: supplier.id,
        supplier_name: supplier.name,
        status: "success",
        summary: "",
        products_total: 0,
        products_created: 0,
        products_updated: 0,
        errors: [],
        duration_ms: 0,
      };

      try {
        const apiUrl = supplier.api_url || supplier.metadata?.apiUrl;
        if (!apiUrl) {
          log.status = "failed";
          log.errors.push("No API URL configured");
          logs.push(log);
          continue;
        }

        // Generic HTTP fetch to supplier API
        const res = await fetch(apiUrl, {
          method: "GET",
          headers: {
            "Accept": "application/json",
            ...(supplier.metadata?.apiKey
              ? { Authorization: `Bearer ${supplier.metadata.apiKey}` }
              : {}),
          },
        });

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: ${await res.text()}`);
        }

        const data = await res.json();
        const products = Array.isArray(data) ? data : data.products ?? data.data ?? [];

        // Upsert each product
        for (const product of products) {
          const sku = product.sku || product.id;
          if (!sku) continue;

          const priceAed = Number(product.price_aed ?? product.price ?? 0);
          const priceAud = Number(product.price_aud ?? product.price ?? 0);

          // Check if product exists
          const { data: existing } = await supabase
            .from("products")
            .select("id, status")
            .eq("supplier_id", supplier.id)
            .eq("sku", sku)
            .maybeSingle();

          if (existing) {
            await supabase
              .from("products")
              .update({
                price_aed: priceAed,
                price_aud: priceAud,
                status: "active",
                metadata: {
                  ...(product.metadata ?? {}),
                  lastSyncedAt: new Date().toISOString(),
                  supplierStatus: product.status ?? "active",
                },
                updated_at: new Date().toISOString(),
              })
              .eq("id", existing.id);
            log.products_updated++;
          } else {
            await supabase.from("products").insert({
              supplier_id: supplier.id,
              sku,
              title: product.title ?? product.name ?? sku,
              slug: (product.title ?? product.name ?? sku)
                .toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, ""),
              price_aed: priceAed,
              price_aud: priceAud,
              status: "active",
              images: product.images ?? [],
              metadata: {
                ...(product.metadata ?? {}),
                lastSyncedAt: new Date().toISOString(),
                supplierStatus: product.status ?? "active",
              },
            });
            log.products_created++;
          }

          log.products_total++;
        }

        log.duration_ms = Date.now() - startedAt;
        log.summary = `${log.products_created} created, ${log.products_updated} updated`;
      } catch (err) {
        log.status = "failed";
        log.errors.push(err instanceof Error ? err.message : "Unknown error");
        log.duration_ms = Date.now() - startedAt;
      }

      logs.push(log);
    }

    // ── Log results to supplier_logs ──
    for (const log of logs) {
      await supabase.from("supplier_logs").insert({
        supplier_id: log.supplier_id,
        event_type: "product_sync",
        status: log.status,
        request_method: "SYNC",
        response_status: log.status === "failed" ? 500 : 200,
        response_body: JSON.stringify(log),
        error_message: log.errors.join("; "),
        metadata: { duration_ms: log.duration_ms },
      }).maybeSingle();
    }

    // ── Write to notification_outbox if issues found ──
    const failedLogs = logs.filter((l) => l.status === "failed" || l.errors.length > 0);
    if (failedLogs.length > 0) {
      await supabase.from("notification_outbox").insert({
        type: "sync_alert",
        title: "Supplier Sync Issues",
        body: JSON.stringify(failedLogs.map((l) => ({
          supplier: l.supplier_name,
          errors: l.errors,
        }))),
        severity: "warning",
      }).maybeSingle();
    }

    // ── Revalidate via Supabase NOTIFY ──
    await supabase.rpc("revalidate_products").maybeSingle();

    return new Response(JSON.stringify({ logs, total_duration_ms: Date.now() - startedAt }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
