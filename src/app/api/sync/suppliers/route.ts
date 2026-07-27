import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { prisma } from "@/lib/prisma";
import { syncSupplierProducts } from "@/lib/supplier/sync-products";
import { sendEmail } from "@/lib/email/send";
import { buildAdminNotificationHtml } from "@/lib/email/templates/admin-notification";
import { fireAndForget } from "@/lib/utils/fire-and-forget";

type TriggerSource = "cron_vercel" | "cron_supabase" | "admin_manual";

interface Changes {
  pricesUpdated: number;
  stockUpdated: number;
  discontinued: string[];
  backInStock: string[];
}

interface SupplierResult {
  total: number;
  created: number;
  updated: number;
  skipped: number;
  errors: string[];
}

interface SyncSummary {
  id?: string;
  startedAt: string;
  finishedAt: string;
  durationMs: number;
  triggeredBy: TriggerSource;
  suppliers: Array<{
    id: string;
    code: string;
    name: string;
    total: number;
    created: number;
    updated: number;
    skipped: number;
    errors: string[];
    changes: Changes;
  }>;
  totals: {
    suppliers: number;
    productsTotal: number;
    productsCreated: number;
    productsUpdated: number;
    productsSkipped: number;
    discontinuedCount: number;
    errors: string[];
  };
}

function authGuard(request: NextRequest): TriggerSource | null {
  // Vercel cron: auto-sets x-vercel-cron header (signed internally, no secret in URL)
  if (request.headers.get("x-vercel-cron") === "1") {
    return "cron_vercel";
  }

  // Supabase pg_cron: send x-cron-secret header matching CRON_SECRET
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && request.headers.get("x-cron-secret") === cronSecret) {
    return "cron_supabase";
  }

  // No CRON_SECRET configured — allow in dev
  if (!cronSecret) return "admin_manual";

  return null;
}

// ── GET: status / last sync info ─────────────────────────────────────────
export async function GET(_request: NextRequest) {
  try {
    const lastSyncs = await prisma.supplierLog.findMany({
      where: { eventType: "product_sync" },
      orderBy: { createdAt: "desc" },
      take: 50,
      include: { supplier: { select: { id: true, code: true, name: true } } },
    });

    const suppliers = await prisma.supplier.findMany({
      select: {
        id: true,
        code: true,
        name: true,
        status: true,
        lastSyncAt: true,
        lastSyncStatus: true,
        lastSyncSummary: true,
        _count: { select: { products: true } },
      },
    });

    return NextResponse.json({
      lastSyncs,
      suppliers,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to fetch sync status" },
      { status: 500 },
    );
  }
}

// ── POST: trigger sync ───────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  const startedAt = Date.now();
  const triggeredBy = authGuard(request);
  if (!triggeredBy) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const suppliers = await prisma.supplier.findMany({
      where: { status: "active" },
    });

    const summary: SyncSummary = {
      startedAt: new Date(startedAt).toISOString(),
      finishedAt: "",
      durationMs: 0,
      triggeredBy,
      suppliers: [],
      totals: {
        suppliers: suppliers.length,
        productsTotal: 0,
        productsCreated: 0,
        productsUpdated: 0,
        productsSkipped: 0,
        discontinuedCount: 0,
        errors: [],
      },
    };

    for (const supplier of suppliers) {
      const supplierStartedAt = Date.now();
      let result: SupplierResult;
      let status: string;

      try {
        result = await syncSupplierProducts(supplier.id);
        status = result.errors.length > 0 ? "partial" : "success";
      } catch (err) {
        result = { total: 0, created: 0, updated: 0, skipped: 0, errors: [err instanceof Error ? err.message : "Unknown error"] };
        status = "failure";
      }

      const changes = await detectChanges(supplier.id, result);
      const supplierDurationMs = Date.now() - supplierStartedAt;

      await prisma.supplierLog.create({
        data: {
          supplierId: supplier.id,
          eventType: "product_sync",
          status,
          requestUrl: supplier.apiUrl,
          requestMethod: "SYNC",
          requestBody: JSON.stringify({ triggeredBy }),
          responseStatus: status === "failure" ? 500 : 200,
          responseBody: JSON.stringify(result),
          responseTimeMs: supplierDurationMs,
          metadata: {
            total: result.total,
            created: result.created,
            updated: result.updated,
            skipped: result.skipped,
            errors: result.errors,
            changes: { ...changes },
          } as never,
        },
      });

      summary.suppliers.push({
        id: supplier.id,
        code: supplier.code,
        name: supplier.name,
        ...result,
        changes,
      });

      summary.totals.productsTotal += result.total;

      await prisma.supplier.update({
        where: { id: supplier.id },
        data: {
          lastSyncAt: new Date(),
          lastSyncStatus: status,
          lastSyncSummary: JSON.parse(JSON.stringify({ total: result.total, created: result.created, updated: result.updated, skipped: result.skipped, errors: result.errors })),
        },
      }).catch(fireAndForget("supplierUpdate"));
      summary.totals.productsCreated += result.created;
      summary.totals.productsUpdated += result.updated;
      summary.totals.productsSkipped += result.skipped;
      summary.totals.discontinuedCount += changes.discontinued.length;
      summary.totals.errors.push(...result.errors);
    }

    summary.finishedAt = new Date().toISOString();
    summary.durationMs = Date.now() - startedAt;

    if (summary.totals.discontinuedCount > 0 || summary.totals.errors.length > 0) {
      notifyAdmin(summary).catch(fireAndForget("notifyAdminSync"));
    }

    revalidateTag("products", "max");
    revalidateTag(`supplier-${summary.totals.suppliers}`, "max");

    return NextResponse.json(summary);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Sync failed" },
      { status: 500 },
    );
  }
}

async function detectChanges(
  supplierId: string,
  syncResult: { total: number; created: number; updated: number; skipped: number; errors: string[] },
): Promise<Changes> {
  const pricesUpdated = 0;
  const stockUpdated = 0;
  const discontinued: string[] = [];
  const backInStock: string[] = [];

  if (syncResult.total > 0) {
    // TODO: compare synced SKUs vs dbProducts to detect discontinuations
  }

  return { pricesUpdated, stockUpdated, discontinued, backInStock };
}

async function notifyAdmin(summary: SyncSummary) {
  const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL;
  if (!adminEmail) return;

  try {
    const html = buildAdminNotificationHtml({
      orderNumber: "SYNC",
      customerEmail: "system@ecomm-store.com",
      customerName: null,
      total: 0,
      currencySymbol: "",
      itemCount: 0,
      paymentMethod: "sync",
      paymentIntentId: "",
      locale: "en-AE",
      createdAt: summary.startedAt,
    });

    const details = [
      `Sync completed in ${summary.durationMs}ms`,
      `Trigger: ${summary.triggeredBy}`,
      `Suppliers: ${summary.totals.suppliers}`,
      `Products: ${summary.totals.productsTotal} total, ${summary.totals.productsCreated} created, ${summary.totals.productsUpdated} updated`,
      `Discontinued: ${summary.totals.discontinuedCount}`,
      summary.totals.errors.length > 0
        ? `Errors: ${summary.totals.errors.join(", ")}`
        : "No errors",
    ].join("\n");

    await sendEmail({
      to: adminEmail,
      subject: `Supplier Sync — ${summary.totals.productsCreated + summary.totals.productsUpdated} changes`,
      html: html.replace("</body>", `<pre style="margin-top:16px;font-size:12px;color:#666;">${details}</pre></body>`),
    });
  } catch {
    // Non-fatal
  }
}
