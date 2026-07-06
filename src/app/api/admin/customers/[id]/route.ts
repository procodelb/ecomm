import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAdminGuard } from "@/lib/security/admin-guard";

export const GET = withAdminGuard(async ({ request }) => {
  const id = request.nextUrl.pathname.split("/").pop()!;
  const customer = await prisma.customer.findUnique({
    where: { id },
    include: {
      orders: { orderBy: { createdAt: "desc" }, take: 50, include: { _count: { select: { items: true } } } },
      reviews: { orderBy: { createdAt: "desc" }, take: 20, include: { product: { select: { id: true, title: true, slug: true } } } },
    },
  });
  if (!customer) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(customer);
}, { permission: "customers:read" });
