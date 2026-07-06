import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/supabase/api";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAuth(request);
  if (auth.error) return auth.error;

  const { id } = await params;
  const customer = await prisma.customer.findUnique({ where: { authUserId: auth.user.id } });
  if (!customer) return NextResponse.json({ error: "Customer not found" }, { status: 404 });

  const order = await prisma.order.findFirst({
    where: { id, customerId: customer.id },
    include: {
      items: { include: { supplier: { select: { name: true } } } },
    },
  });
  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

  return NextResponse.json(order);
}
