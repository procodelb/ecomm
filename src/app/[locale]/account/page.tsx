"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { StatCard } from "@/components/admin/stat-card";
import { ShoppingBag, Star, Heart, MessageSquare } from "lucide-react";

type DashboardData = {
  orderCount: number;
  reviewCount: number;
  wishlistCount: number;
  returnCount: number;
  ticketCount: number;
  totalSpent: number;
  recentOrders: { id: string; orderNumber: string; status: string; total: number; currency: string; createdAt: string }[];
  lowStockItems: number;
};

export default function AccountDashboard() {
  const { locale } = useParams<{ locale: string }>();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/account/orders?limit=5&sort=createdAt&dir=desc").then((r) => r.json()),
      fetch("/api/account/reviews").then((r) => r.json()),
      fetch("/api/account/wishlist").then((r) => r.json()),
      fetch("/api/account/returns").then((r) => r.json()),
      fetch("/api/account/support").then((r) => r.json()),
      fetch("/api/account/profile").then((r) => r.json()),
    ]).then(([orders, reviews, wishlist, returns, support, profile]) => {
      setData({
        orderCount: orders.total || 0,
        reviewCount: reviews.total || 0,
        wishlistCount: wishlist.total || 0,
        returnCount: returns.returns?.length || 0,
        ticketCount: support.tickets?.length || 0,
        totalSpent: Number(profile.profile?.totalSpentAed || 0),
        recentOrders: orders.orders?.slice(0, 5) || [],
        lowStockItems: 0,
      });
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  const stats = [
    { label: "Orders", value: data?.orderCount ?? 0, href: `/${locale}/account/orders`, accent: "primary" as const, icon: ShoppingBag },
    { label: "Reviews", value: data?.reviewCount ?? 0, href: `/${locale}/account/reviews`, accent: "gold" as const, icon: Star },
    { label: "Wishlist", value: data?.wishlistCount ?? 0, href: `/${locale}/account/wishlist`, accent: "rose" as const, icon: Heart },
    { label: "Support", value: data?.ticketCount ?? 0, href: `/${locale}/account/support`, accent: "violet" as const, icon: MessageSquare },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-1">My Account</h1>
      <p className="text-sm text-muted-foreground mb-8">Welcome back</p>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {stats.map((stat) => (
          <StatCard key={stat.label} label={stat.label} value={stat.value} href={stat.href} icon={stat.icon} accent={stat.accent} />
        ))}
      </div>

      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">Recent Orders</h2>
          <Link href={`/${locale}/account/orders`} className="text-sm text-primary hover:underline">
            View all
          </Link>
        </div>
        {data?.recentOrders && data.recentOrders.length > 0 ? (
          <div className="space-y-3">
            {data.recentOrders.map((order) => (
              <Link key={order.id} href={`/${locale}/account/orders/${order.id}`} className="flex items-center justify-between rounded-xl border border-border p-4 hover:bg-muted/50 transition-colors">
                <div>
                  <p className="text-sm font-medium text-foreground">{order.orderNumber}</p>
                  <p className="text-xs text-muted-foreground">{new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-foreground">{order.currency} {Number(order.total).toFixed(2)}</p>
                  <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium capitalize ${
                    order.status === "delivered" ? "bg-success/10 text-success" :
                    order.status === "cancelled" ? "bg-destructive/10 text-destructive" :
                    order.status === "shipped" || order.status === "in_transit" ? "bg-primary/10 text-primary" :
                    "bg-muted/50 text-muted-foreground"
                  }`}>{order.status.replace(/_/g, " ")}</span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center">
            <p className="text-muted-foreground text-sm mb-3">No orders yet</p>
            <Link href={`/${locale}`} className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-black hover:bg-primary/90 transition-colors">
              Start Shopping
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
