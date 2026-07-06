import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/supabase/api";

export async function GET(request: NextRequest) {
  const auth = await requireAuth(request);
  if (auth.error) return auth.error;

  const customer = await prisma.customer.findUnique({ where: { authUserId: auth.user.id } });
  if (!customer) return NextResponse.json({ error: "Customer not found" }, { status: 404 });

  const returns = await prisma.returnRequest.findMany({
    where: { customerId: customer.id },
    orderBy: { createdAt: "desc" },
    include: { order: { select: { orderNumber: true } } },
  });

  return NextResponse.json({ returns });
}

export async function POST(request: NextRequest) {
  const auth = await requireAuth(request);
  if (auth.error) return auth.error;

  const body = await request.json();
  const { orderId, reason, items } = body;

  if (!orderId || !reason) {
    return NextResponse.json({ error: "orderId and reason are required" }, { status: 400 });
  }

  const customer = await prisma.customer.findUnique({ where: { authUserId: auth.user.id } });
  if (!customer) return NextResponse.json({ error: "Customer not found" }, { status: 404 });

  const order = await prisma.order.findFirst({
    where: { id: orderId, customerId: customer.id },
  });
  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

  const returnRequest = await prisma.returnRequest.create({
    data: {
      orderId,
      customerId: customer.id,
      reason,
      items: (items || []) as never,
    },
  });

  return NextResponse.json({ returnRequest, message: "Return request created" });
}
