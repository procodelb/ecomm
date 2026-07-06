import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/supabase/api";

export async function GET(request: NextRequest) {
  const auth = await requireAuth(request);
  if (auth.error) return auth.error;

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") ?? "1");
  const limit = parseInt(searchParams.get("limit") ?? "20");
  const sort = searchParams.get("sort") ?? "createdAt";
  const dir = searchParams.get("dir") ?? "desc";

  const customer = await prisma.customer.findUnique({ where: { authUserId: auth.user.id } });
  if (!customer) return NextResponse.json({ error: "Customer not found" }, { status: 404 });

  const where = { customerId: customer.id };
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
}
