import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAdminGuard } from "@/lib/security/admin-guard";

export const GET = withAdminGuard(async ({ request }) => {
  const id = request.nextUrl.pathname.split("/").pop()!;
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: { include: { supplier: { select: { name: true } } } },
      customer: { select: { id: true, email: true, firstName: true, lastName: true, phone: true } },
    },
  });
  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
  return NextResponse.json(order);
}, { permission: "orders:read" });
