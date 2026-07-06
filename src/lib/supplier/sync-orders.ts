import "server-only";
import { prisma } from "@/lib/prisma";
import { getAdapterForSupplier } from "./registry";
import type { SupplierOrderDispatch, SupplierOrderResult } from "./types";

interface DispatchResult {
  supplierId: string;
  supplierCode: string;
  success: boolean;
  supplierOrderId: string | null;
  status: string;
  error: string | null;
}

/**
 * Dispatch an order to its suppliers using the appropriate adapters.
 * Groups items by supplier and dispatches to each.
 *
 * Called from the Stripe webhook after payment confirmation.
 */
export async function dispatchOrderToSuppliers(orderId: string): Promise<DispatchResult[]> {
  const results: DispatchResult[] = [];

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: {
        include: {
          product: { include: { supplier: true } },
        },
      },
    },
  });

  if (!order) return results;

  // Group items by supplier
  const supplierGroups = new Map<
    string,
    { supplier: { id: string; code: string; name: string }; items: typeof order.items }
  >();

  for (const item of order.items) {
    if (!item.product?.supplier) continue;
    const s = item.product.supplier;
    const existing = supplierGroups.get(s.id);
    if (existing) {
      existing.items.push(item);
    } else {
      supplierGroups.set(s.id, { supplier: s, items: [item] });
    }
  }

  for (const [, group] of supplierGroups) {
    const { supplier, items } = group;
    const adapter = getAdapterForSupplier(supplier.code);

    if (!adapter) {
      results.push({
        supplierId: supplier.id,
        supplierCode: supplier.code,
        success: false,
        supplierOrderId: null,
        status: "error",
        error: `No adapter for supplier code: ${supplier.code}`,
      });
      continue;
    }

    const dispatch: SupplierOrderDispatch = {
      orderId: order.id,
      orderNumber: order.orderNumber,
      supplierId: supplier.id,
      items: items.map((item) => ({
        supplierSku: item.product?.sku ?? item.sku ?? "",
        title: item.title,
        quantity: item.quantity,
        unitPrice: Number(item.unitPrice),
      })),
      shippingAddress: order.shippingAddress as Record<string, unknown>,
      locale: order.locale,
      currency: order.currency,
    };

    let result: SupplierOrderResult;
    try {
      result = await adapter.placeOrder(dispatch);
    } catch (err) {
      results.push({
        supplierId: supplier.id,
        supplierCode: supplier.code,
        success: false,
        supplierOrderId: null,
        status: "error",
        error: err instanceof Error ? err.message : "Adapter placeOrder failed",
      });
      continue;
    }

    // Save supplier order ID on each order item for tracking
    if (result.supplierOrderId) {
      for (const item of items) {
        await prisma.orderItem.update({
          where: { id: item.id },
          data: {
            metadata: {
              ...((item.metadata ?? {}) as Record<string, unknown>),
              supplierOrderId: result.supplierOrderId,
              supplierCode: supplier.code,
            },
          },
        });
      }
    }

    results.push({
      supplierId: supplier.id,
      supplierCode: supplier.code,
      success: result.status !== "error",
      supplierOrderId: result.supplierOrderId,
      status: result.status,
      error: result.errorMessage,
    });
  }

  return results;
}

/**
 * Poll all order items that have a supplierOrderId but no tracking yet,
 * and update their tracking + status from the supplier adapter.
 */
export async function syncOutstandingOrderTracking(): Promise<number> {
  const items = await prisma.orderItem.findMany({
    where: {
      trackingNumber: null,
      supplierId: { not: null },
    },
    include: {
      product: { include: { supplier: true } },
    },
    take: 50,
  });

  let updated = 0;

  for (const item of items) {
    const meta = item.metadata as Record<string, unknown>;
    const supplierOrderId = meta.supplierOrderId as string;
    const supplier = item.product?.supplier;
    if (!supplier || !supplierOrderId) continue;

    const adapter = getAdapterForSupplier(supplier.code);
    if (!adapter) continue;

    try {
      const status = await adapter.checkOrderStatus(supplierOrderId);
      if (status.trackingNumber) {
        await prisma.orderItem.update({
          where: { id: item.id },
          data: {
            trackingNumber: status.trackingNumber,
            carrier: status.carrier,
            status: status.status === "shipped" ? "shipped" as const : undefined,
            metadata: {
              ...meta,
              lastStatusCheck: new Date().toISOString(),
              supplierStatus: status.status,
            },
          },
        });
        updated++;
      }
    } catch {
      // Non-fatal
    }
  }

  return updated;
}
