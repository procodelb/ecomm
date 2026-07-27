import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { stripe } from "@/lib/stripe/server";
import { prisma } from "@/lib/prisma";
import { createOrder } from "@/lib/api/orders";
import { findOrCreateCustomer } from "@/lib/api/customers";
import { sendEmail } from "@/lib/email/send";
import { buildOrderConfirmationHtml } from "@/lib/email/templates/order-confirmation";
import { buildAdminNotificationHtml } from "@/lib/email/templates/admin-notification";
import { dispatchSupplierOrders } from "@/lib/supplier/orders";
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

  // 2. Verify signature (skip in test mode)
  let event: { id: string; type: string; data: { object: Record<string, unknown> }; api_version?: string; created?: number; livemode?: boolean };

  if (process.env.STRIPE_SECRET_KEY === "PLACEHOLDER") {
    // Test mode — parse JSON directly, no signature check
    try {
      const parsed = JSON.parse(rawBody);
      event = {
        id: parsed.id ?? `evt_test_${Date.now()}`,
        type: parsed.type ?? "checkout.session.completed",
        data: { object: parsed.data?.object ?? {} },
      };
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON body" },
        { status: 400 },
      );
    }
  } else {
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
      return NextResponse.json(
        {
          error: "Webhook signature verification failed",
          detail: err instanceof Error ? err.message : undefined,
        },
        { status: 400 },
      );
    }
  }

  // 4. Check idempotency — skip if this event was already processed
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
    // DB unavailable — continue;
  }

  // 5. Log incoming event
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

        if (!paymentIntentId) {
          await updateWebhookLogStatus(webhookLogId ?? "", {
            processingStatus: "completed",
            responseStatus: 200,
          });
          return NextResponse.json({ received: true });
        }

        // Parse metadata
        const metadata = (session.metadata ?? {}) as Record<string, string>;
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

        if (!rawItems.length) {
          await updateWebhookLogStatus(webhookLogId ?? "", {
            processingStatus: "completed",
            responseStatus: 200,
          });
          return NextResponse.json({ received: true });
        }

        // Addresses
        const collectedInfo = (session.collected_information ?? null) as Record<string, unknown> | null;
        const shippingInfo = (collectedInfo?.shipping_details ?? null) as Record<string, unknown> | null;
        const shippingAddr = (shippingInfo?.address ?? {}) as Record<string, unknown>;
        const custDetails = (session.customer_details ?? {}) as Record<string, unknown>;
        const custAddr = (custDetails?.address ?? {}) as Record<string, unknown>;

        const shippingAddress = {
          line1: (shippingAddr.line1 as string) ?? "",
          line2: (shippingAddr.line2 as string) ?? "",
          city: (shippingAddr.city as string) ?? "",
          state: (shippingAddr.state as string) ?? "",
          postalCode: (shippingAddr.postal_code as string) ?? "",
          country: (shippingAddr.country as string) ?? "",
        };

        const billingAddress = {
          line1: (custAddr.line1 as string) ?? "",
          line2: (custAddr.line2 as string) ?? "",
          city: (custAddr.city as string) ?? "",
          state: (custAddr.state as string) ?? "",
          postalCode: (custAddr.postal_code as string) ?? "",
          country: (custAddr.country as string) ?? "",
        };

        // Stripe amounts are in cents
        const amountSubtotal = (session.amount_subtotal ?? 0) as number;
        const amountTotal = (session.amount_total ?? 0) as number;
        const shipping = (session.shipping_cost ?? {}) as Record<string, unknown>;
        const totalDetails = (session.total_details ?? {}) as Record<string, unknown>;

        const subtotal = amountSubtotal / 100;
        const shippingCost = ((shipping.amount_total ?? 0) as number) / 100;
        const total = amountTotal / 100;
        const taxAmount = ((totalDetails.amount_tax ?? 0) as number) / 100;
        const taxRate = subtotal > 0 ? taxAmount / subtotal : 0;

        const customerEmail = (custDetails.email ?? "") as string;

        // ── a. Find or upsert customer ──────────────────────────────────
        let customerId: string | null = null;
        if (customerEmail) {
          try {
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

        // ── b. Create order + items ────────────────────────────────────
        const order = await createOrder({
          customerEmail: customerEmail || "guest@example.com",
          customerId,
          items: rawItems.map((item) => ({
            id: item.id,
            productId: item.productId ?? "",
            variantId: item.variantId ?? null,
            sku: null,
            title: item.title,
            variantTitle: null,
            attributes: {},
            price: item.price,
            quantity: item.quantity,
            image: null,
            locale,
            currency,
          })),
          subtotal,
          shippingCost,
          taxAmount,
          taxRate,
          total,
          currency,
          locale,
          paymentIntentId,
          paymentMethod: "card",
          shippingAddress,
          billingAddress,
          shippingZone: "standard",
        });

        // ── c. Deduct inventory (fire-and-forget) ──────────────────────
        if (customerEmail) {
          deductInventory(order.id).catch(fireAndForget("deductInventory"));
        }

        // ── d. Track purchase server-side (fire-and-forget) ───────────
        trackServerPurchase({
          transactionId: order.id,
          value: total,
          currency,
          items: rawItems.map((i) => ({ id: i.id, name: i.title, price: i.price, quantity: i.quantity })),
        }, customerId ?? undefined).catch(fireAndForget("trackServerPurchase"));

        // ── e. Dispatch supplier orders (fire-and-forget) ──────────────
        dispatchSupplierOrders(order.id).catch(fireAndForget("dispatchSupplierOrders"));

        // ── f. Send customer confirmation email (fire-and-forget) ──────
        if (customerEmail) {
          sendCustomerConfirmation(order.id, customerEmail, locale, config.currencySymbol).catch(fireAndForget("sendCustomerConfirmation"));
        }

        // ── g. Notify admin (fire-and-forget) ──────────────────────────
        notifyAdmin(order.id, config.currencySymbol).catch(fireAndForget("notifyAdmin"));

        // ── h. Mark webhook log as completed ──────────────────────────
        await updateWebhookLogStatus(webhookLogId ?? "", {
          processingStatus: "completed",
          responseStatus: 200,
          processedAt: new Date(),
        });

        return NextResponse.json({ received: true, orderId: order.id });
      }

      // ── payment_intent.payment_failed ──────────────────────────────
      case "payment_intent.payment_failed": {
        const pi = event.data.object as Record<string, unknown>;
        const failedIntentId = (pi.id ?? "") as string;
        const lastError = (pi.last_payment_error ?? {}) as Record<string, unknown>;

        // Attempt to mark the order as failed
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

    await updateWebhookLogStatus(webhookLogId ?? "", {
      processingStatus: "failed",
      errorMessage: message,
    }).catch(fireAndForget("updateWebhookLogStatus"));

    return NextResponse.json(
      { error: "Webhook handler failed", detail: message },
      { status: 500 },
    );
  }
}

// ── Background helpers (fire-and-forget, errors handled internally) ───────

async function deductInventory(orderId: string) {
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });
    if (!order) return;

    for (const item of order.items) {
      if (item.productId) {
        // Deduct product-level inventory
        const inventory = await prisma.inventory.findFirst({
          where: { productId: item.productId },
        });
        if (inventory) {
          const newQty = Math.max(0, inventory.quantity - item.quantity);
          await prisma.inventory.update({
            where: { id: inventory.id },
            data: {
              quantity: newQty,
              reserved: inventory.reserved + item.quantity,
            },
          });
          await prisma.inventoryMovement.create({
            data: {
              inventoryId: inventory.id,
              movementType: "sold",
              quantity: item.quantity,
              referenceType: "order",
              referenceId: orderId,
              note: `Order #${order.orderNumber}`,
            },
          });
        }

        // Deduct variant-level inventory
        if (item.variantId) {
          const variantInv = await prisma.inventory.findFirst({
            where: { variantId: item.variantId },
          });
          if (variantInv) {
            const newQty = Math.max(0, variantInv.quantity - item.quantity);
            await prisma.inventory.update({
              where: { id: variantInv.id },
              data: { quantity: newQty },
            });
            await prisma.inventoryMovement.create({
              data: {
                inventoryId: variantInv.id,
                movementType: "sold",
                quantity: item.quantity,
                referenceType: "order",
                referenceId: orderId,
                note: `Order #${order.orderNumber}`,
              },
            });
          }
        }
      }
    }
  } catch {
    // Non-fatal
  }
}

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
