import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAdminGuard } from "@/lib/security/admin-guard";

export const GET = withAdminGuard(async ({ request }: { request: NextRequest }) => {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") ?? "1");
  const limit = parseInt(searchParams.get("limit") ?? "50");
  const lowStock = searchParams.get("lowStock") === "true";
  const outOfStock = searchParams.get("outOfStock") === "true";
  const supplierId = searchParams.get("supplierId");
  const warehouse = searchParams.get("warehouse");
  const search = searchParams.get("search");

  const where: Record<string, unknown> = {};
  if (supplierId) where.supplierId = supplierId;
  if (warehouse) where.warehouse = warehouse;
  if (lowStock) where.quantity = { lte: 5 };
  if (outOfStock) where.quantity = 0;
  if (search) {
    where.product = { OR: [{ title: { contains: search, mode: "insensitive" } }, { sku: { contains: search, mode: "insensitive" } }] };
  }

  const [items, total] = await Promise.all([
    prisma.inventory.findMany({
      where,
      orderBy: { quantity: "asc" },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        product: { select: { id: true, sku: true, title: true, status: true, images: true } },
        supplier: { select: { id: true, name: true, code: true } },
        variant: { select: { id: true, sku: true, title: true, attributes: true } },
      },
    }),
    prisma.inventory.count({ where }),
  ]);

  const warehouses = await prisma.inventory.findMany({
    select: { warehouse: true },
    distinct: ["warehouse"],
  });

  return NextResponse.json({ items, total, page, limit, pages: Math.ceil(total / limit), warehouses: warehouses.map((w) => w.warehouse) });
}, { permission: "inventory:read" });

export const PATCH = withAdminGuard(async ({ request }) => {
  const body = await request.json();
  const { id, quantity, lowStockThreshold, reorderPoint, reorderQuantity, warehouse, locationCode } = body;
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const data: Record<string, unknown> = {};
  if (quantity !== undefined) data.quantity = quantity;
  if (lowStockThreshold !== undefined) data.lowStockThreshold = lowStockThreshold;
  if (reorderPoint !== undefined) data.reorderPoint = reorderPoint;
  if (reorderQuantity !== undefined) data.reorderQuantity = reorderQuantity;
  if (warehouse !== undefined) data.warehouse = warehouse;
  if (locationCode !== undefined) data.locationCode = locationCode;

  const item = await prisma.inventory.update({ where: { id }, data });
  return NextResponse.json(item);
}, { permission: "inventory:update" });
