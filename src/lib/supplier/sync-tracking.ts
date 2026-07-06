import "server-only";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import { getAdapterForSupplier } from "./registry";

interface TrackingUpdate {
  orderItemId: string;
  trackingNumber: string;
  carrier: string;
  status: string;
}

/**
 * Fetch latest tracking for all order items that have a supplierOrderId
 * and update the database with current status and tracking events.
 */
export async function syncOrderTracking(): Promise<TrackingUpdate[]> {
  const updates: TrackingUpdate[] = [];

  const items = await prisma.orderItem.findMany({
    where: {
      supplierId: { not: null },
    },
    include: {
      order: { select: { id: true, orderNumber: true } },
      product: { include: { supplier: true } },
    },
    take: 100,
  });

  for (const item of items) {
    const supplier = item.product?.supplier;
    if (!supplier) continue;

    const meta = (item.metadata ?? {}) as Record<string, unknown>;
    const supplierOrderId = meta.supplierOrderId as string;
    if (!supplierOrderId) continue;

    const adapter = getAdapterForSupplier(supplier.code);
    if (!adapter) continue;

    function buildMeta(extra: Record<string, unknown>): Prisma.InputJsonValue {
      return { ...meta, ...extra } as Prisma.InputJsonValue;
    }

    try {
      const trackingList = await adapter.getTracking(supplierOrderId);

      for (const tracking of trackingList) {
        const currentTrackingNumber = item.trackingNumber;

        if (tracking.trackingNumber && tracking.trackingNumber !== currentTrackingNumber) {
          await prisma.orderItem.update({
            where: { id: item.id },
            data: {
              trackingNumber: tracking.trackingNumber,
              carrier: tracking.carrier,
              status: mapTrackingStatus(tracking.status),
              metadata: buildMeta({
                lastTrackingSync: new Date().toISOString(),
                trackingEvents: tracking.events,
                trackingStatus: tracking.status,
              }),
            },
          });
        } else if (tracking.events.length > 0) {
          await prisma.orderItem.update({
            where: { id: item.id },
            data: {
              status: mapTrackingStatus(tracking.status),
              metadata: buildMeta({
                lastTrackingSync: new Date().toISOString(),
                trackingEvents: tracking.events,
                trackingStatus: tracking.status,
              }),
            },
          });
        }

        updates.push({
          orderItemId: item.id,
          trackingNumber: tracking.trackingNumber,
          carrier: tracking.carrier,
          status: tracking.status,
        });
      }
    } catch {
      // Non-fatal per item
    }
  }

  return updates;
}

/**
 * Sync tracking for a specific order by looking up all its items.
 */
export async function syncOrderTrackingForOrder(orderId: string): Promise<TrackingUpdate[]> {
  const updates: TrackingUpdate[] = [];

  const items = await prisma.orderItem.findMany({
    where: { orderId },
    include: {
      product: { include: { supplier: true } },
    },
  });

  for (const item of items) {
    const supplier = item.product?.supplier;
    if (!supplier) continue;

    const meta = (item.metadata ?? {}) as Record<string, unknown>;
    const supplierOrderId = meta.supplierOrderId as string;
    if (!supplierOrderId) continue;

    const adapter = getAdapterForSupplier(supplier.code);
    if (!adapter) continue;

    try {
      const trackingList = await adapter.getTracking(supplierOrderId);

      for (const tracking of trackingList) {
        await prisma.orderItem.update({
          where: { id: item.id },
          data: {
            trackingNumber: tracking.trackingNumber ?? item.trackingNumber,
            carrier: tracking.carrier ?? item.carrier,
            status: mapTrackingStatus(tracking.status),
            metadata: {
              ...meta,
              lastTrackingSync: new Date().toISOString(),
              trackingEvents: tracking.events,
              trackingStatus: tracking.status,
            } as unknown as Prisma.InputJsonValue,
          },
        });

        updates.push({
          orderItemId: item.id,
          trackingNumber: tracking.trackingNumber,
          carrier: tracking.carrier,
          status: tracking.status,
        });
      }
    } catch {
      // Non-fatal
    }
  }

  return updates;
}

function mapTrackingStatus(status: string): "shipped" | "delivered" | "cancelled" | "pending" {
  switch (status) {
    case "delivered":
      return "delivered";
    case "in_transit":
    case "shipped":
      return "shipped";
    case "cancelled":
    case "returned":
      return "cancelled";
    default:
      return "pending";
  }
}
