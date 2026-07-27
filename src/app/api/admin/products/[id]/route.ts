import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAdminGuard } from "@/lib/security/admin-guard";

export const GET = withAdminGuard(async ({ request }) => {
  const id = request.nextUrl.pathname.split("/").pop()!;
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      supplier: true,
      variants: { orderBy: { sortOrder: "asc" } },
      inventory: { include: { supplier: { select: { name: true } } } },
      reviews: { orderBy: { createdAt: "desc" }, take: 20 },
    },
  });
  if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(product);
}, { permission: "products:read" });

export const PATCH = withAdminGuard(async ({ request }) => {
  const id = request.nextUrl.pathname.split("/").pop()!;
  const body = await request.json();
  const product = await prisma.product.update({ where: { id }, data: body });
  return NextResponse.json(product);
}, { permission: "products:update" });

export const DELETE = withAdminGuard(async ({ request }) => {
  const id = request.nextUrl.pathname.split("/").pop()!;
  await prisma.product.delete({ where: { id } });
  return new NextResponse(null, { status: 204 });
}, { permission: "products:delete" });
