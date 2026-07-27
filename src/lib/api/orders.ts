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
  paymentIntentId: string | null;
  paymentMethod: string;
  shippingAddress: Prisma.InputJsonValue;
  billingAddress: Prisma.InputJsonValue;
  shippingZone: string;
  /** Start as 'pending' (default) or 'payment_received' (webhook-confirmed). */
  initialStatus?: "pending" | "payment_received";
}

export async function createOrder(params: CreateOrderParams) {
  const { items, initialStatus = "pending", ...orderData } = params;

  const isPaid = initialStatus === "payment_received";

  return prisma.order.create({
    data: {
      customerEmail: orderData.customerEmail,
      orderNumber: `ORD-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
      ...(orderData.customerId ? { customer: { connect: { id: orderData.customerId } } } : {}),
      status: initialStatus,
      currency: orderData.currency as "AED" | "AUD" | "USD" | "EUR" | "GBP",
      locale: orderData.locale,
      subtotal: orderData.subtotal,
      shippingCost: orderData.shippingCost,
      taxAmount: orderData.taxAmount,
      taxRate: orderData.taxRate,
      total: orderData.total,
      amountPaid: isPaid ? orderData.total : 0,
      paymentIntentId: orderData.paymentIntentId,
      paymentMethod: orderData.paymentMethod,
      paymentStatus: isPaid ? "paid" : "pending",
      paidAt: isPaid ? new Date() : null,
      shippingAddress: orderData.shippingAddress,
      billingAddress: orderData.billingAddress,
      shippingZone: orderData.shippingZone,
      metadata: { source: isPaid ? "stripe_webhook" : "checkout" },
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

export async function markOrderPaid(orderId: string, paymentIntentId: string) {
  const order = await prisma.order.findUnique({ where: { id: orderId }, select: { total: true } });
  if (!order) return null;

  return prisma.order.update({
    where: { id: orderId },
    data: {
      status: "payment_received",
      paymentStatus: "paid",
      amountPaid: order.total,
      paymentIntentId,
      paidAt: new Date(),
      metadata: { source: "stripe_webhook" },
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
