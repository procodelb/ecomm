import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAdminGuard } from "@/lib/security/admin-guard";

export const GET = withAdminGuard(async () => {
  try {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 86400000);

    const [orders30d, revenue30d, ordersByStatus, ordersByDay, topProducts, topCategories, productsByStatus, revenueByDay] = await Promise.all([
      prisma.order.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
      prisma.order.aggregate({
        _sum: { total: true },
        where: { createdAt: { gte: thirtyDaysAgo }, status: { notIn: ["cancelled", "refunded"] } },
      }),
      prisma.order.groupBy({ by: ["status"], _count: true }),
      Promise.all(
        Array.from({ length: 30 }, (_, i) => {
          const d = new Date(now.getTime() - (29 - i) * 86400000);
          const start = new Date(d.getFullYear(), d.getMonth(), d.getDate());
          const end = new Date(start.getTime() + 86400000);
          return prisma.order.aggregate({
            _count: true,
            _sum: { total: true },
            where: { createdAt: { gte: start, lt: end }, status: { notIn: ["cancelled", "refunded"] } },
          }).then((r) => ({ date: start.toISOString().slice(0, 10), orders: r._count, revenue: r._sum.total ?? 0 }));
        }),
      ),
      prisma.orderItem.groupBy({
        by: ["title"],
        _sum: { quantity: true, lineTotal: true },
        orderBy: { _sum: { lineTotal: "desc" } },
        take: 10,
        where: { order: { createdAt: { gte: thirtyDaysAgo }, status: { notIn: ["cancelled", "refunded"] } } },
      }),
      prisma.product.groupBy({ by: ["category"], _count: true, where: { status: "active" } }),
      prisma.product.groupBy({ by: ["status"], _count: true }),
      prisma.order.aggregate({
        _sum: { total: true },
        where: { status: { notIn: ["cancelled", "refunded"] } },
      }),
    ]);

    const totalProducts = await prisma.product.count({ where: { status: "active" } });

    return NextResponse.json({
      overview: {
        orders30d,
        revenue30d: revenue30d._sum.total ?? 0,
        totalRevenue: revenueByDay._sum.total ?? 0,
        totalProducts,
      },
      ordersByStatus,
      ordersByDay,
      topProducts,
      topCategories,
      productsByStatus,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Analytics error";
    return NextResponse.json({ error: process.env.NODE_ENV === "production" ? "Internal server error" : message }, { status: 500 });
  }
}, { permission: "analytics:read" });
