import "server-only";

import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import type { CartItem } from "@/types";

interface CreateOrderParams {
  customerEmail: string;
  customerId?: string | null;
  items: CartItem[];
  subtotal: number;
  shippingCost: number;
  taxAmount: number;
  taxRate: number;
  total: number;
  currency: string;
  locale: string;
  paymentIntentId: string;
  paymentMethod: string;
  shippingAddress: Prisma.InputJsonValue;
  billingAddress: Prisma.InputJsonValue;
  shippingZone: string;
}

export async function createOrder(params: CreateOrderParams) {
  const { items, ...orderData } = params;

  return prisma.order.create({
    data: {
      customerEmail: orderData.customerEmail,
      orderNumber: `ORD-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
      ...(orderData.customerId ? { customer: { connect: { id: orderData.customerId } } } : {}),
      status: "payment_received",
      currency: orderData.currency as "AED" | "AUD" | "USD" | "EUR" | "GBP",
      locale: orderData.locale,
      subtotal: orderData.subtotal,
      shippingCost: orderData.shippingCost,
      taxAmount: orderData.taxAmount,
      taxRate: orderData.taxRate,
      total: orderData.total,
      amountPaid: orderData.total,
      paymentIntentId: orderData.paymentIntentId,
      paymentMethod: orderData.paymentMethod,
      paymentStatus: "paid",
      paidAt: new Date(),
      shippingAddress: orderData.shippingAddress,
      billingAddress: orderData.billingAddress,
      shippingZone: orderData.shippingZone,
      metadata: { source: "stripe_webhook" },
      items: {
        create: items.map((item) => ({
          ...(item.productId ? { productId: item.productId } : {}),
          ...(item.variantId ? { variantId: item.variantId } : {}),
          ...(item.sku ? { sku: item.sku } : {}),
          title: item.title,
          ...(item.variantTitle ? { variantTitle: item.variantTitle } : {}),
          attributes: item.attributes ?? {},
          ...(item.image ? { imageUrl: item.image } : {}),
          unitPrice: item.price,
          quantity: item.quantity,
          lineTotal: item.price * item.quantity,
        })),
      },
    },
    include: {
      items: true,
    },
  });
}

export async function updateOrderStatus(
  paymentIntentId: string,
  status: "payment_received" | "cancelled" | "refunded",
) {
  return prisma.order.updateMany({
    where: { paymentIntentId },
    data: {
      status,
      paymentStatus: status === "payment_received" ? "paid" : "failed",
      ...(status === "payment_received" ? { paidAt: new Date() } : {}),
    },
  });
}

export async function getOrderById(id: string) {
  return prisma.order.findUnique({
    where: { id },
    include: { items: true },
  });
}

export async function getOrderByPaymentIntent(paymentIntentId: string) {
  return prisma.order.findFirst({
    where: { paymentIntentId },
    include: { items: true },
  });
}
