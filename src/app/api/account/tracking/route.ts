import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/supabase/api";

export async function GET(request: NextRequest) {
  const auth = await requireAuth(request);
  if (auth.error) return auth.error;

  const customer = await prisma.customer.findUnique({ where: { authUserId: auth.user.id } });
  if (!customer) return NextResponse.json({ error: "Customer not found" }, { status: 404 });

  const orders = await prisma.order.findMany({
    where: {
      customerId: customer.id,
      OR: [
        { trackingNumber: { not: null } },
        { trackingUrl: { not: null } },
      ],
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      orderNumber: true,
      status: true,
      shippingCarrier: true,
      trackingNumber: true,
      trackingUrl: true,
      createdAt: true,
      estimatedDelivery: true,
      deliveredAt: true,
      _count: { select: { items: true } },
    },
  });

  return NextResponse.json({ trackingOrders: orders });
}
