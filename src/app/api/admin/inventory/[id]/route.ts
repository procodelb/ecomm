import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAdminGuard } from "@/lib/security/admin-guard";

export const GET = withAdminGuard(async ({ request }) => {
  const id = request.nextUrl.pathname.split("/").pop()!;
  const item = await prisma.inventory.findUnique({
    where: { id },
    include: {
      product: true,
      supplier: true,
      variant: true,
      movements: { orderBy: { createdAt: "desc" }, take: 100 },
    },
  });
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(item);
}, { permission: "inventory:read" });
