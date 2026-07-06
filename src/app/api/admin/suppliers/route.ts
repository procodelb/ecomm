import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAdminGuard } from "@/lib/security/admin-guard";

export const GET = withAdminGuard(async ({ request }: { request: NextRequest }) => {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") ?? "1");
  const limit = parseInt(searchParams.get("limit") ?? "50");
  const status = searchParams.get("status");
  const search = searchParams.get("search");

  const where: Record<string, unknown> = {};
  if (status) where.status = status;
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { code: { contains: search, mode: "insensitive" } },
      { contactEmail: { contains: search, mode: "insensitive" } },
    ];
  }

  const [suppliers, total] = await Promise.all([
    prisma.supplier.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: { _count: { select: { products: true, inventory: true } } },
    }),
    prisma.supplier.count({ where }),
  ]);

  return NextResponse.json({ suppliers, total, page, limit, pages: Math.ceil(total / limit) });
}, { permission: "suppliers:read" });

export const POST = withAdminGuard(async ({ request }) => {
  const body = await request.json();
  const supplier = await prisma.supplier.create({
    data: {
      code: body.code,
      name: body.name,
      country: body.country,
      status: body.status ?? "active",
      companyName: body.companyName,
      contactName: body.contactName,
      contactEmail: body.contactEmail,
      contactPhone: body.contactPhone,
      website: body.website,
      apiUrl: body.apiUrl,
      city: body.city,
      address: body.address,
      shippingMethods: body.shippingMethods ?? ["standard"],
      currencies: body.currencies ?? ["AED"],
      moq: body.moq ?? 1,
      leadTimeMin: body.leadTimeMin,
      leadTimeMax: body.leadTimeMax,
      returnsPolicy: body.returnsPolicy,
      notes: body.notes,
      certification: body.certification ?? [],
    },
  });
  return NextResponse.json(supplier, { status: 201 });
}, { permission: "suppliers:create" });
