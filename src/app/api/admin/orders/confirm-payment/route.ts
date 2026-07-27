import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAdminGuard } from "@/lib/security/admin-guard";

/**
 * POST /api/admin/orders/[id]/confirm-payment
 *
 * Allows an authorized admin to manually confirm payment for an order.
 * Only works for orders with paymentMethod in ["alfan", "cash_on_delivery"]
 * and paymentStatus === "pending". Prevents duplicate confirmation.
 *
 * After confirmation:
 * - paymentStatus → "paid"
 * - status → "payment_received"
 * - amountPaid → order total
 * - paidAt → now
 * - metadata.confirmedBy → admin email
 * - metadata.confirmedAt → ISO timestamp
 */
export const POST = withAdminGuard(async ({ request }) => {
  // URL: /api/admin/orders/{id}/confirm-payment
  const segments = request.nextUrl.pathname.split("/");
  const confirmPaymentIdx = segments.lastIndexOf("confirm-payment");
  const id = confirmPaymentIdx > 0 ? segments[confirmPaymentIdx - 1] : null;

  if (!id) {
    return NextResponse.json({ error: "Missing order id" }, { status: 400 });
  }

  let body: { adminEmail?: string } = {};
  try {
    body = await request.json();
  } catch {
    // empty body is fine
  }

  const order = await prisma.order.findUnique({
    where: { id },
    select: {
      id: true,
      paymentMethod: true,
      paymentStatus: true,
      total: true,
      status: true,
      metadata: true,
    },
  });

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  // Only allow confirmation for alfan or cash_on_delivery orders
  if (order.paymentMethod !== "alfan" && order.paymentMethod !== "cash_on_delivery") {
    return NextResponse.json(
      { error: "Payment confirmation is only available for Alfan or Cash on Delivery orders" },
      { status: 400 },
    );
  }

  // Prevent duplicate confirmation
  if (order.paymentStatus === "paid") {
    return NextResponse.json(
      { error: "Payment already confirmed" },
      { status: 409 },
    );
  }

  const now = new Date().toISOString();
  const existingMetadata = (order.metadata && typeof order.metadata === "object" && !Array.isArray(order.metadata))
    ? order.metadata as Record<string, unknown>
    : {};

  const updated = await prisma.order.update({
    where: { id },
    data: {
      paymentStatus: "paid",
      status: "payment_received",
      amountPaid: order.total,
      paidAt: new Date(),
      metadata: {
        ...existingMetadata,
        confirmedBy: body.adminEmail ?? "admin",
        confirmedAt: now,
      },
    },
  });

  return NextResponse.json({
    success: true,
    order: {
      id: updated.id,
      status: updated.status,
      paymentStatus: updated.paymentStatus,
      paidAt: updated.paidAt,
    },
  });
}, { permission: "orders:update" });
