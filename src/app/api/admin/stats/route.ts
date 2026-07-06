import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAdminGuard } from "@/lib/security/admin-guard";

export const GET = withAdminGuard(async () => {
  try {
    const [
      totalProducts,
      totalOrders,
      totalCustomers,
      totalSuppliers,
      revenueAgg,
      recentOrders,
      lowStockProducts,
      pendingOrders,
      lastSyncLogs,
    ] = await Promise.all([
      prisma.product.count({ where: { status: "active" } }),
      prisma.order.count(),
      prisma.customer.count(),
      prisma.supplier.count({ where: { status: "active" } }),
      prisma.order.aggregate({
        _sum: { total: true },
        where: { status: { notIn: ["cancelled", "refunded"] } },
      }),
      prisma.order.findMany({
        orderBy: { createdAt: "desc" },
        take: 10,
        include: { _count: { select: { items: true } } },
      }),
      prisma.inventory.findMany({
        where: { quantity: { lte: 5 }, product: { status: "active" } },
        include: { product: { select: { id: true, sku: true, title: true, status: true } }, supplier: { select: { name: true } } },
        take: 20,
      }),
      prisma.order.count({
        where: { status: { in: ["pending", "payment_received", "processing"] } },
      }),
      prisma.supplierLog.findMany({
        where: { eventType: "product_sync" },
        orderBy: { createdAt: "desc" },
        take: 20,
        include: { supplier: { select: { id: true, code: true, name: true } } },
      }),
    ]);

    const supplierStatuses = await prisma.supplier.findMany({
      select: {
        id: true,
        code: true,
        name: true,
        status: true,
        lastSyncAt: true,
        lastSyncStatus: true,
        lastSyncSummary: true,
        _count: { select: { products: true } },
      },
    });

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayOrders = await prisma.order.count({
      where: { createdAt: { gte: todayStart } },
    });
    const todayRevenue = await prisma.order.aggregate({
      _sum: { total: true },
      where: { createdAt: { gte: todayStart }, status: { notIn: ["cancelled", "refunded"] } },
    });

    return NextResponse.json({
      totalProducts,
      totalOrders,
      totalCustomers,
      totalSuppliers,
      totalRevenue: revenueAgg._sum.total ?? 0,
      todayOrders,
      todayRevenue: todayRevenue._sum.total ?? 0,
      pendingOrders,
      lowStockCount: lowStockProducts.length,
      lowStockProducts: lowStockProducts.flatMap((inv) => {
        if (!inv.product) return [];
        return [{
          id: inv.product.id,
          sku: inv.product.sku,
          title: inv.product.title,
          status: inv.product.status,
          inventory: { quantity: inv.quantity },
          supplier: { name: inv.supplier.name },
        }];
      }),
      recentOrders: recentOrders.map((o) => ({
        id: o.id,
        orderNumber: o.orderNumber,
        customerEmail: o.customerEmail,
        status: o.status,
        total: o.total,
        currency: o.currency,
        itemCount: o._count.items,
        createdAt: o.createdAt,
      })),
      supplierStatuses,
      lastSyncLogs,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to fetch stats";
    return NextResponse.json(
      { error: process.env.NODE_ENV === "production" ? "Internal server error" : message },
      { status: 500 },
    );
  }
}, { permission: "analytics:read" });
