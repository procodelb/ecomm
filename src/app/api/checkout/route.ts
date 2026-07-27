import { NextResponse } from "next/server";
import { stripe, stripeTestMode } from "@/lib/stripe/server";
import { createOrder } from "@/lib/api/orders";
import { findOrCreateCustomer } from "@/lib/api/customers";
import { getLocaleConfig } from "@/lib/locale/config";
import { dispatchSupplierOrders } from "@/lib/supplier/orders";
import { trackServerPurchase } from "@/lib/analytics/server";
import { fireAndForget } from "@/lib/utils/fire-and-forget";

export async function POST(request: Request) {
  try {
    if (!stripe && !stripeTestMode) {
      return NextResponse.json(
        { error: "Payment service not configured" },
        { status: 503 },
      );
    }

    const body = await request.json();
    const { items, locale, currency, customerEmail, successUrl, cancelUrl } = body;

    if (!items?.length) {
      return NextResponse.json(
        { error: "Cart is empty" },
        { status: 400 },
      );
    }

    const config = getLocaleConfig(locale);
    const subtotal = items.reduce(
      (sum: number, i: { price: number; quantity: number }) => sum + i.price * i.quantity,
      0,
    );
    const shipping = subtotal >= (config.shippingZones[0]?.freeThreshold ?? 200) ? 0 : (config.shippingZones[0]?.rate ?? 0);
    const tax = subtotal * config.taxRate;
    const total = subtotal + shipping + tax;

    if (stripeTestMode) {
      // ── Test mode: create order directly, bypassing Stripe ──
      const customer = customerEmail
        ? await findOrCreateCustomer({
            email: customerEmail,
            locale,
            currency: currency as "AED" | "AUD",
          }).catch(() => null)
        : null;

      const order = await createOrder({
        customerEmail: customerEmail || "test@example.com",
        customerId: customer?.id ?? null,
        items: items.map((item: { id: string; productId?: string; variantId?: string | null; title: string; price: number; quantity: number; image?: string; variantTitle?: string | null }) => ({
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
        paymentIntentId: `pi_test_${Date.now()}`,
        paymentMethod: "test_mode",
        shippingAddress: {
          line1: "Test Address",
          line2: "",
          city: "Test City",
          state: "Test State",
          postalCode: "00000",
          country: currency === "AED" ? "AE" : "AU",
        },
        billingAddress: {
          line1: "Test Address",
          line2: "",
          city: "Test City",
          state: "Test State",
          postalCode: "00000",
          country: currency === "AED" ? "AE" : "AU",
        },
        shippingZone: "standard",
      });

      trackServerPurchase({
        transactionId: order.id,
        value: total,
        currency: currency as "AED" | "AUD",
        items: items.map((i: { id: string; title: string; price: number; quantity: number }) => ({
          id: i.id, name: i.title, price: i.price, quantity: i.quantity,
        })),
      }, customer?.id ?? undefined).catch(fireAndForget("trackServerPurchase"));

      dispatchSupplierOrders(order.id).catch(fireAndForget("dispatchSupplierOrders"));

      return NextResponse.json({
        url: `${successUrl?.split("?")[0] ?? `/${locale}/order/confirmation`}?order_id=${order.id}`,
        sessionId: `cs_test_${Date.now()}`,
      });
    }

    // ── Live mode: create Stripe Checkout Session ──
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

    return NextResponse.json({ url: session.url, sessionId: session.id });
  } catch {
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 },
    );
  }
}
