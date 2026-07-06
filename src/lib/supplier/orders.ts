import "server-only";

import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email/send";

interface DispatchItem {
  orderItemId: string;
  productId: string | null;
  variantId: string | null;
  sku: string | null;
  title: string;
  quantity: number;
  supplierId: string;
  supplierName: string;
  supplierApiUrl: string | null;
  supplierApiKey: string | null;
}

/**
 * For each unique supplier in an order, build a dispatch payload and
 * POST to their API endpoint.  Falls back to email if no API URL is configured.
 */
export async function dispatchSupplierOrders(orderId: string): Promise<void> {
  let order;
  try {
    order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: { include: { supplier: true } },
          },
        },
      },
    });
  } catch {
    return;
  }
  if (!order?.items.length) return;

  // Group items by supplier
  const supplierMap = new Map<string, DispatchItem[]>();

  for (const item of order.items) {
    if (!item.product?.supplier) continue;
    const s = item.product.supplier;
    const existing = supplierMap.get(s.id) ?? [];
    existing.push({
      orderItemId: item.id,
      productId: item.productId,
      variantId: item.variantId,
      sku: item.sku,
      title: item.title,
      quantity: item.quantity,
      supplierId: s.id,
      supplierName: s.name,
      supplierApiUrl: s.apiUrl,
      supplierApiKey: s.apiKeyEncrypted,
    });
    supplierMap.set(s.id, existing);
  }

  for (const [supplierId, items] of supplierMap) {
    const first = items[0];
    const payload = {
      orderNumber: order.orderNumber,
      supplierId,
      items: items.map((i) => ({
        sku: i.sku ?? i.productId,
        title: i.title,
        quantity: i.quantity,
      })),
      shippingAddress: order.shippingAddress,
      locale: order.locale,
      currency: order.currency,
    };

    if (first.supplierApiUrl) {
      // API dispatch
      try {
        const start = Date.now();
        const res = await fetch(first.supplierApiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(first.supplierApiKey
              ? { Authorization: `Bearer ${first.supplierApiKey}` }
              : {}),
          },
          body: JSON.stringify(payload),
        });
        const responseTimeMs = Date.now() - start;
        const responseBody = await res.text();

        await prisma.supplierLog.create({
          data: {
            supplierId,
            eventType: "order_dispatch",
            status: res.ok ? "success" : "failed",
            requestUrl: first.supplierApiUrl,
            requestMethod: "POST",
            requestBody: JSON.stringify(payload),
            responseStatus: res.status,
            responseBody,
            responseTimeMs,
            metadata: { orderId: order.id, orderNumber: order.orderNumber },
          },
        });
      } catch (err) {
        await prisma.supplierLog.create({
          data: {
            supplierId,
            eventType: "order_dispatch",
            status: "error",
            requestUrl: first.supplierApiUrl,
            requestMethod: "POST",
            requestBody: JSON.stringify(payload),
            errorMessage: err instanceof Error ? err.message : "Unknown error",
            errorStack: err instanceof Error ? err.stack : undefined,
            metadata: { orderId: order.id, orderNumber: order.orderNumber },
          },
        });
      }
    } else {
      // Fallback: email supplier
      try {
        const supplierName = first.supplierName;
        await sendEmail({
          to: process.env.SUPPLIER_ORDERS_EMAIL ?? "",
          subject: `New Order #${order.orderNumber} — ${supplierName}`,
          html: `
<h2>New Order #${order.orderNumber}</h2>
<p>Supplier: ${supplierName}</p>
<table border="1" cellpadding="8" cellspacing="0" style="border-collapse:collapse;">
  <tr><th>SKU</th><th>Title</th><th>Qty</th></tr>
  ${items.map((i) => `<tr><td>${i.sku ?? i.productId ?? "—"}</td><td>${i.title}</td><td>${i.quantity}</td></tr>`).join("")}
</table>
<pre>${JSON.stringify(payload, null, 2)}</pre>`.trim(),
        });
      } catch {
        // Email fallback failure is non-fatal
      }
    }
  }
}
