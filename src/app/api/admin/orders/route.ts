import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAdminGuard } from "@/lib/security/admin-guard";

export const GET = withAdminGuard(async ({ request }: { request: NextRequest }) => {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") ?? "1");
  const limit = parseInt(searchParams.get("limit") ?? "50");
  const status = searchParams.get("status");
  const search = searchParams.get("search");
  const sort = searchParams.get("sort") ?? "createdAt";
  const dir = searchParams.get("dir") ?? "desc";

  const where: Record<string, unknown> = {};
  if (status) where.status = status;
  if (search) {
    where.OR = [
      { orderNumber: { contains: search, mode: "insensitive" } },
      { customerEmail: { contains: search, mode: "insensitive" } },
    ];
  }

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy: { [sort]: dir },
      skip: (page - 1) * limit,
      take: limit,
      include: { _count: { select: { items: true } } },
    }),
    prisma.order.count({ where }),
  ]);

  return NextResponse.json({ orders, total, page, limit, pages: Math.ceil(total / limit) });
}, { permission: "orders:read" });

export const PATCH = withAdminGuard(async ({ request }) => {
  const body = await request.json();
  const { id, status, internalNotes, trackingNumber, trackingUrl, shippingCarrier } = body;
  if (!id) return NextResponse.json({ error: "Missing order id" }, { status: 400 });

  const data: Record<string, unknown> = {};
  if (status) data.status = status;
  if (internalNotes !== undefined) data.internalNotes = internalNotes;
  if (trackingNumber !== undefined) data.trackingNumber = trackingNumber;
  if (trackingUrl !== undefined) data.trackingUrl = trackingUrl;
  if (shippingCarrier !== undefined) data.shippingCarrier = shippingCarrier;
  if (status === "delivered") data.deliveredAt = new Date();

  const order = await prisma.order.update({ where: { id }, data });
  return NextResponse.json(order);
}, { permission: "orders:update" });
