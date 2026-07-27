import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { stripe, getUseRealStripe } from "@/lib/stripe/server";
import { prisma } from "@/lib/prisma";
import { markOrderPaid } from "@/lib/api/orders";
import { sendEmail } from "@/lib/email/send";
import { buildOrderConfirmationHtml } from "@/lib/email/templates/order-confirmation";
import { buildAdminNotificationHtml } from "@/lib/email/templates/admin-notification";
import { dispatchSupplierOrders } from "@/lib/supplier/orders";
import { deductInventoryForOrder } from "@/lib/api/inventory";
import { logWebhookEvent, updateWebhookLogStatus } from "@/lib/webhook/logger";
import { getLocaleConfig } from "@/lib/locale/config";
import { trackServerPurchase } from "@/lib/analytics/server";
import { fireAndForget } from "@/lib/utils/fire-and-forget";

// ── Route config: edge-compatible but rawBody needed, so Node.js runtime ──
export const runtime = "nodejs";

export async function POST(request: Request) {
  // 1. Read raw body + signature
  const rawBody = await request.text();
  const headersList = await headers();
  const signature = headersList.get("stripe-signature") ?? undefined;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  // 2. Verify signature — ALWAYS required when Stripe is configured
  let event: { id: string; type: string; data: { object: Record<string, unknown> }; api_version?: string; created?: number; livemode?: boolean };

  if (!getUseRealStripe()) {
    // Mock mode: no Stripe configured — reject webhook calls
    return NextResponse.json(
      { error: "Webhook endpoint not available in mock mode" },
      { status: 404 },
    );
  }

  if (!stripe) {
    return NextResponse.json(
      { error: "Payment service not configured" },
      { status: 503 },
    );
  }

  if (!signature) {
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 },
    );
  }

  if (!webhookSecret) {
    return NextResponse.json(
      { error: "Webhook secret not configured" },
      { status: 503 },
    );
  }

  try {
    const constructed = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
    event = {
      id: constructed.id,
      type: constructed.type,
      data: { object: constructed.data.object as unknown as Record<string, unknown> },
      api_version: constructed.api_version ?? undefined,
      created: constructed.created,
      livemode: constructed.livemode,
    };
  } catch (err) {
    console.error("[webhook] signature verification failed:", err instanceof Error ? err.message : err);
    return NextResponse.json(
      { error: "Webhook signature verification failed" },
      { status: 400 },
    );
  }

  // 3. Check idempotency — skip if this event was already processed
  let existingLog = false;
  try {
    const duplicate = await prisma.webhookLog.findFirst({
      where: {
        provider: "stripe",
        eventId: event.id,
        processingStatus: { in: ["completed", "processing"] },
      },
    });
    if (duplicate) {
      existingLog = true;
      return NextResponse.json({ received: true, duplicate: true });
    }
  } catch {
    // DB unavailable — continue
  }

  // 4. Log incoming event
  const webhookLogId = existingLog
    ? null
    : await logWebhookEvent({
        provider: "stripe",
        eventType: event.type,
        eventId: event.id,
        headers: Object.fromEntries(headersList.entries()),
        body: event.data.object as unknown as Record<string, unknown>,
        rawBody,
        signature,
        signatureValid: true,
        processingStatus: "processing",
        metadata: {
          api_version: event.api_version,
          created: event.created,
          livemode: event.livemode,
        },
      }).then((l) => l?.id ?? null);

  try {
    switch (event.type) {
      // ── checkout.session.completed ──────────────────────────────────
      case "checkout.session.completed": {
        const session = event.data.object as Record<string, unknown>;
        const paymentIntentId = session.payment_intent as string | null;
        const sessionId = session.id as string;

        // Parse metadata
        const metadata = (session.metadata ?? {}) as Record<string, string>;
        const orderId = metadata.orderId;
        const locale = metadata.locale ?? "en-AE";
        const currency = (metadata.currency ?? "AED") as "AED" | "AUD";
        const config = getLocaleConfig(locale);

        const rawItems: Array<{
          id: string;
          productId?: string;
          variantId?: string | null;
          title: string;
          price: number;
          quantity: number;
        }> = metadata.items ? JSON.parse(metadata.items) : [];

        // Stripe amounts are in cents
        const amountSubtotal = (session.amount_subtotal ?? 0) as number;
        const amountTotal = (session.amount_total ?? 0) as number;
        const shipping = (session.shipping_cost ?? {}) as Record<string, unknown>;
        const totalDetails = (session.total_details ?? {}) as Record<string, unknown>;

        const _subtotal = amountSubtotal / 100;
        const _shippingCost = ((shipping.amount_total ?? 0) as number) / 100;
        const total = amountTotal / 100;
        const _taxAmount = ((totalDetails.amount_tax ?? 0) as number) / 100;

        const custDetails = (session.customer_details ?? {}) as Record<string, unknown>;
        const customerEmail = (custDetails.email ?? "") as string;

        // ── a. Find or create customer ──
        let customerId: string | null = null;
        if (customerEmail) {
          try {
            const { findOrCreateCustomer } = await import("@/lib/api/customers");
            const customer = await findOrCreateCustomer({
              email: customerEmail,
              firstName: ((custDetails.name ?? "") as string).split(" ")[0] || undefined,
              lastName: ((custDetails.name ?? "") as string).split(" ").slice(1).join(" ") || undefined,
              phone: (custDetails.phone ?? undefined) as string | undefined,
              locale,
              currency,
            });
            customerId = customer.id;
          } catch {
            // Non-fatal
          }
        }

        // ── b. Update existing order to paid ──
        let order;
        if (orderId) {
          // Find the pending order created by checkout
          const existingOrder = await prisma.order.findUnique({ where: { id: orderId } });
          if (existingOrder && existingOrder.status === "pending") {
            order = await markOrderPaid(orderId, paymentIntentId ?? sessionId);
          } else if (existingOrder) {
            // Order already processed (duplicate webhook) — skip
            await updateWebhookLogStatus(webhookLogId ?? "", {
              processingStatus: "completed",
              responseStatus: 200,
            });
            return NextResponse.json({ received: true, duplicate: true });
          }
        }

        // Fallback: if order wasn't found by orderId, look up by session ID
        if (!order) {
          order = await prisma.order.findFirst({ where: { paymentIntentId: sessionId } });
          if (order && order.status === "pending") {
            order = await markOrderPaid(order.id, paymentIntentId ?? sessionId);
          }
        }

        if (!order) {
          // No matching order found — webhook is orphaned (maybe from a different session)
          await updateWebhookLogStatus(webhookLogId ?? "", {
            processingStatus: "completed",
            responseStatus: 200,
          });
          return NextResponse.json({ received: true, note: "no matching order" });
        }

        // ── c. Deduct inventory (fire-and-forget) ──
        if (order) {
          deductInventoryForOrder(order.id).catch(fireAndForget("deductInventory"));
        }

        // ── d. Track purchase server-side (fire-and-forget) ──
        if (order) {
          trackServerPurchase({
            transactionId: order.id,
            value: total || Number(order.total),
            currency,
            items: rawItems.map((i) => ({ id: i.id, name: i.title, price: i.price, quantity: i.quantity })),
          }, customerId ?? undefined).catch(fireAndForget("trackServerPurchase"));
        }

        // ── e. Dispatch supplier orders (fire-and-forget) ──
        if (order) {
          dispatchSupplierOrders(order.id).catch(fireAndForget("dispatchSupplierOrders"));
        }

        // ── f. Send customer confirmation email (fire-and-forget) ──
        if (order && customerEmail) {
          sendCustomerConfirmation(order.id, customerEmail, locale, config.currencySymbol).catch(fireAndForget("sendCustomerConfirmation"));
        }

        // ── g. Notify admin (fire-and-forget) ──
        if (order) {
          notifyAdmin(order.id, config.currencySymbol).catch(fireAndForget("notifyAdmin"));
        }

        // ── h. Mark webhook log as completed ──
        await updateWebhookLogStatus(webhookLogId ?? "", {
          processingStatus: "completed",
          responseStatus: 200,
          processedAt: new Date(),
        });

        return NextResponse.json({ received: true, orderId: order?.id });
      }

      // ── payment_intent.succeeded ────────────────────────────────────
      case "payment_intent.succeeded": {
        const pi = event.data.object as Record<string, unknown>;
        const succeededIntentId = (pi.id ?? "") as string;

        // Find order by paymentIntentId (might already be paid via checkout.session.completed)
        const order = await prisma.order.findFirst({
          where: { paymentIntentId: succeededIntentId },
        });

        if (order && order.status === "pending") {
          await markOrderPaid(order.id, succeededIntentId);
        }

        await updateWebhookLogStatus(webhookLogId ?? "", {
          processingStatus: "completed",
          responseStatus: 200,
          processedAt: new Date(),
        });

        return NextResponse.json({ received: true });
      }

      // ── payment_intent.payment_failed ──────────────────────────────
      case "payment_intent.payment_failed": {
        const pi = event.data.object as Record<string, unknown>;
        const failedIntentId = (pi.id ?? "") as string;
        const lastError = (pi.last_payment_error ?? {}) as Record<string, unknown>;

        // Mark order as failed
        try {
          await prisma.order.updateMany({
            where: { paymentIntentId: failedIntentId },
            data: {
              status: "cancelled",
              paymentStatus: "failed",
              internalNotes: `Payment failed: ${(lastError.message ?? "Unknown error") as string}`,
            },
          });
        } catch {
          // Order may not exist yet
        }

        await updateWebhookLogStatus(webhookLogId ?? "", {
          processingStatus: "completed",
          responseStatus: 200,
          processedAt: new Date(),
        });

        return NextResponse.json({ received: true });
      }

      // ── All other events — acknowledge ──────────────────────────────
      default:
        await updateWebhookLogStatus(webhookLogId ?? "", {
          processingStatus: "completed",
          responseStatus: 200,
          processedAt: new Date(),
        });

        return NextResponse.json({ received: true });
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error(`[webhook] handler error for ${event.type}:`, message);

    await updateWebhookLogStatus(webhookLogId ?? "", {
      processingStatus: "failed",
      errorMessage: message,
    }).catch(fireAndForget("updateWebhookLogStatus"));

    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 },
    );
  }
}

// ── Background helpers (fire-and-forget, errors handled internally) ───────

async function sendCustomerConfirmation(
  orderId: string,
  email: string,
  locale: string,
  currencySymbol: string,
) {
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });
    if (!order) return;

    const html = buildOrderConfirmationHtml({
      orderNumber: order.orderNumber,
      customerName: "",
      customerEmail: email,
      items: order.items.map((item) => ({
        title: item.title,
        variantTitle: item.variantTitle,
        quantity: item.quantity,
        unitPrice: Number(item.unitPrice),
        lineTotal: Number(item.lineTotal),
        imageUrl: item.imageUrl,
      })),
      subtotal: Number(order.subtotal),
      shippingCost: Number(order.shippingCost),
      taxAmount: Number(order.taxAmount),
      total: Number(order.total),
      currencySymbol,
      shippingAddress: order.shippingAddress as Record<string, unknown>,
      estimatedDelivery: order.estimatedDelivery?.toISOString() ?? null,
    });

    await sendEmail({
      to: email,
      subject: `Order Confirmed — #${order.orderNumber}`,
      html,
    });
  } catch {
    // Non-fatal
  }
}

async function notifyAdmin(orderId: string, currencySymbol: string) {
  const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL;
  if (!adminEmail) return;

  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });
    if (!order) return;

    const html = buildAdminNotificationHtml({
      orderNumber: order.orderNumber,
      customerEmail: order.customerEmail,
      customerName: null,
      total: Number(order.total),
      currencySymbol,
      itemCount: order.items.length,
      paymentMethod: order.paymentMethod ?? "card",
      paymentIntentId: order.paymentIntentId ?? "",
      locale: order.locale,
      createdAt: order.createdAt.toISOString(),
    });

    await sendEmail({
      to: adminEmail,
      subject: `New Order #${order.orderNumber} — ${order.customerEmail}`,
      html,
    });
  } catch {
    // Non-fatal
  }
}
