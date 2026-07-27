import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { prisma } from "@/lib/prisma";
import { syncSupplierProducts } from "@/lib/supplier/sync-products";
import { withAdminGuard } from "@/lib/security/admin-guard";

export const POST = withAdminGuard(async () => {
  const startedAt = Date.now();

  try {
    const suppliers = await prisma.supplier.findMany({
      where: { status: "active" },
    });

    const results = [];

    for (const supplier of suppliers) {
      const supplierStartedAt = Date.now();
      try {
        const result = await syncSupplierProducts(supplier.id);
        const status = result.errors.length > 0 ? "partial" : "success";

        await prisma.supplierLog.create({
          data: {
            supplierId: supplier.id,
            eventType: "product_sync",
            status,
            requestMethod: "SYNC",
            requestBody: JSON.stringify({ triggeredBy: "admin_manual" }),
            responseStatus: 200,
            responseBody: JSON.stringify(result),
            responseTimeMs: Date.now() - supplierStartedAt,
            metadata: {
              total: result.total,
              created: result.created,
              updated: result.updated,
              skipped: result.skipped,
              errors: result.errors,
            },
          },
        });

        results.push({ code: supplier.code, ...result, status });
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        await prisma.supplierLog.create({
          data: {
            supplierId: supplier.id,
            eventType: "product_sync",
            status: "failure",
            requestMethod: "SYNC",
            requestBody: JSON.stringify({ triggeredBy: "admin_manual" }),
            responseStatus: 500,
            errorMessage: message,
            responseTimeMs: Date.now() - supplierStartedAt,
          },
        });
        results.push({ code: supplier.code, total: 0, created: 0, updated: 0, skipped: 0, errors: [message], status: "failure" });
      }
    }

    revalidateTag("products", "max");

    return NextResponse.json({
      durationMs: Date.now() - startedAt,
      suppliers: results,
      totals: {
        suppliers: results.length,
        created: results.reduce((a, r) => a + r.created, 0),
        updated: results.reduce((a, r) => a + r.updated, 0),
        errors: results.flatMap((r) => r.errors),
      },
    });
  } catch (err) {
    return NextResponse.json(
      { error: process.env.NODE_ENV === "production" ? "Sync failed" : err instanceof Error ? err.message : "Sync failed" },
      { status: 500 },
    );
  }
}, { permission: "sync:run" });
