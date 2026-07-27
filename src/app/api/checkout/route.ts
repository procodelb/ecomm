import { NextResponse } from "next/server";
import { stripe, getUseRealStripe } from "@/lib/stripe/server";
import { createOrder } from "@/lib/api/orders";
import { findOrCreateCustomer } from "@/lib/api/customers";
import { getLocaleConfig } from "@/lib/locale/config";
import { fireAndForget } from "@/lib/utils/fire-and-forget";
import { dispatchSupplierOrders } from "@/lib/supplier/orders";
import { trackServerPurchase } from "@/lib/analytics/server";
import { getActivePaymentProvider } from "@/lib/utils/env";
import { getAlfanPaymentUrl } from "@/lib/payment/config";

type CheckoutItem = {
  id: string;
  productId?: string;
  variantId?: string | null;
  title: string;
  price: number;
  quantity: number;
  image?: string;
  variantTitle?: string | null;
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { items, locale, currency, customerEmail, successUrl, cancelUrl, paymentMethod } = body;

    if (!items?.length) {
      return NextResponse.json(
        { error: "Cart is empty" },
        { status: 400 },
      );
    }

    const provider = getActivePaymentProvider();

    // Validate payment method server-side
    const allowedMethods = provider === "alfan"
      ? ["cash_on_delivery", "alfan"]
      : provider === "stripe"
        ? ["card", "cash_on_delivery"]
        : ["cash_on_delivery"];

    const method = (paymentMethod as string) || (provider === "alfan" ? "alfan" : "cash_on_delivery");

    if (!allowedMethods.includes(method)) {
      return NextResponse.json(
        { error: "Payment method not available" },
        { status: 400 },
      );
    }

    const config = getLocaleConfig(locale);
    const subtotal = items.reduce(
      (sum: number, i: CheckoutItem) => sum + i.price * i.quantity,
      0,
    );
    const shipping = subtotal >= (config.shippingZones[0]?.freeThreshold ?? 200) ? 0 : (config.shippingZones[0]?.rate ?? 0);
    const tax = subtotal * config.taxRate;
    const total = subtotal + shipping + tax;

    // ── CASH ON DELIVERY ──
    if (method === "cash_on_delivery") {
      const customer = customerEmail
        ? await findOrCreateCustomer({
            email: customerEmail,
            locale,
            currency: currency as "AED" | "AUD",
          }).catch(() => null)
        : null;

      const order = await createOrder({
        customerEmail: customerEmail || "guest@example.com",
        customerId: customer?.id ?? null,
        items: items.map((item: CheckoutItem) => ({
          id: item.id,
          productId: item.productId ?? "",
          variantId: item.variantId ?? null,
          sku: null,
          title: item.title,
          variantTitle: item.variantTitle ?? null,
          attributes: {},
          price: item.price,
          quantity: item.quantity,
          image: item.image ?? null,
          locale,
          currency,
        })),
        subtotal,
        shippingCost: shipping,
        taxAmount: tax,
        taxRate: config.taxRate,
        total,
        currency,
        locale,
        paymentIntentId: null,
        paymentMethod: "cash_on_delivery",
        shippingAddress: {
          line1: "",
          line2: "",
          city: "",
          state: "",
          postalCode: "",
          country: currency === "AED" ? "AE" : "AU",
        },
        billingAddress: {
          line1: "",
          line2: "",
          city: "",
          state: "",
          postalCode: "",
          country: currency === "AED" ? "AE" : "AU",
        },
        shippingZone: "standard",
        initialStatus: "pending",
      });

      trackServerPurchase({
        transactionId: order.id,
        value: total,
        currency: currency as "AED" | "AUD",
        items: items.map((i: CheckoutItem) => ({
          id: i.id, name: i.title, price: i.price, quantity: i.quantity,
        })),
      }, customer?.id ?? undefined).catch(fireAndForget("trackServerPurchase"));

      dispatchSupplierOrders(order.id).catch(fireAndForget("dispatchSupplierOrders"));

      return NextResponse.json({
        url: `${successUrl?.split("?")[0] ?? `/${locale}/order/confirmation`}?order_id=${order.id}`,
        orderId: order.id,
        orderNumber: order.orderNumber,
        paymentMethod: "cash_on_delivery",
      });
    }

    // ── ALFAN ──
    if (method === "alfan") {
      const alfanUrl = getAlfanPaymentUrl();
      if (!alfanUrl) {
        return NextResponse.json(
          { error: "Alfan payment is not available" },
          { status: 503 },
        );
      }

      const customer = customerEmail
        ? await findOrCreateCustomer({
            email: customerEmail,
            locale,
            currency: currency as "AED" | "AUD",
          }).catch(() => null)
        : null;

      const order = await createOrder({
        customerEmail: customerEmail || "guest@example.com",
        customerId: customer?.id ?? null,
        items: items.map((item: CheckoutItem) => ({
          id: item.id,
          productId: item.productId ?? "",
          variantId: item.variantId ?? null,
          sku: null,
          title: item.title,
          variantTitle: item.variantTitle ?? null,
          attributes: {},
          price: item.price,
          quantity: item.quantity,
          image: item.image ?? null,
          locale,
          currency,
        })),
        subtotal,
        shippingCost: shipping,
        taxAmount: tax,
        taxRate: config.taxRate,
        total,
        currency,
        locale,
        paymentIntentId: null,
        paymentMethod: "alfan",
        shippingAddress: {
          line1: "",
          line2: "",
          city: "",
          state: "",
          postalCode: "",
          country: currency === "AED" ? "AE" : "AU",
        },
        billingAddress: {
          line1: "",
          line2: "",
          city: "",
          state: "",
          postalCode: "",
          country: currency === "AED" ? "AE" : "AU",
        },
        shippingZone: "standard",
        initialStatus: "pending",
      });

      trackServerPurchase({
        transactionId: order.id,
        value: total,
        currency: currency as "AED" | "AUD",
        items: items.map((i: CheckoutItem) => ({
          id: i.id, name: i.title, price: i.price, quantity: i.quantity,
        })),
      }, customer?.id ?? undefined).catch(fireAndForget("trackServerPurchase"));

      return NextResponse.json({
        url: alfanUrl,
        orderId: order.id,
        orderNumber: order.orderNumber,
        paymentMethod: "alfan",
      });
    }

    // ── STRIPE (existing logic, unchanged) ──
    if (getUseRealStripe() && !stripe) {
      return NextResponse.json(
        { error: "Payment service not configured" },
        { status: 503 },
      );
    }

    const customer = customerEmail
      ? await findOrCreateCustomer({
          email: customerEmail,
          locale,
          currency: currency as "AED" | "AUD",
        }).catch(() => null)
      : null;

    const tempOrderId = crypto.randomUUID();
    const order = await createOrder({
      customerEmail: customerEmail || "guest@example.com",
      customerId: customer?.id ?? null,
      items: items.map((item: CheckoutItem) => ({
        id: item.id,
        productId: item.productId ?? "",
        variantId: item.variantId ?? null,
        sku: null,
        title: item.title,
        variantTitle: item.variantTitle ?? null,
        attributes: {},
        price: item.price,
        quantity: item.quantity,
        image: item.image ?? null,
        locale,
        currency,
      })),
      subtotal,
      shippingCost: shipping,
      taxAmount: tax,
      taxRate: config.taxRate,
      total,
      currency,
      locale,
      paymentIntentId: tempOrderId,
      paymentMethod: "card",
      shippingAddress: {
        line1: "",
        line2: "",
        city: "",
        state: "",
        postalCode: "",
        country: currency === "AED" ? "AE" : "AU",
      },
      billingAddress: {
        line1: "",
        line2: "",
        city: "",
        state: "",
        postalCode: "",
        country: currency === "AED" ? "AE" : "AU",
      },
      shippingZone: "standard",
      initialStatus: "pending",
    });

    const currencyMap: Record<string, string> = {
      AED: "aed",
      AUD: "aud",
      USD: "usd",
    };
    const stripeCurrency = currencyMap[currency as string] ?? "aed";

    const session = await stripe!.checkout.sessions.create({
      mode: "payment",
      customer_email: customerEmail,
      submit_type: "pay",
      billing_address_collection: "required",
      shipping_address_collection: {
        allowed_countries: currency === "AED" ? ["AE"] : ["AU"],
      },
      line_items: items.map(
        (item: { title: string; price: number; quantity: number; image?: string }) => ({
          price_data: {
            currency: stripeCurrency,
            product_data: {
              name: item.title,
              ...(item.image ? { images: [item.image] } : {}),
            },
            unit_amount: Math.round(item.price * 100),
          },
          quantity: item.quantity,
        }),
      ),
      metadata: {
        orderId: order.id,
        locale,
        currency,
        itemCount: String(items.length),
        items: JSON.stringify(
          items.map((i: { id: string; productId: string; variantId: string | null; title: string; price: number; quantity: number }) => ({
            id: i.id,
            productId: i.productId,
            variantId: i.variantId,
            title: i.title,
            price: i.price,
            quantity: i.quantity,
          })),
        ),
      },
      success_url: successUrl,
      cancel_url: cancelUrl,
    });

    const { prisma } = await import("@/lib/prisma");
    await prisma.order.update({
      where: { id: order.id },
      data: { paymentIntentId: session.id },
    });

    return NextResponse.json({ url: session.url, sessionId: session.id });
  } catch (err) {
    console.error("[checkout] error:", err);
    return NextResponse.json(
      { error: "Failed to create checkout session", detail: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    );
  }
}
