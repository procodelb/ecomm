"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";

type Order = {
  id: string; orderNumber: string; status: string; total: number; currency: string;
  createdAt: string; customerEmail: string; _count: { items: number };
};

export default function AccountOrders() {
  const { locale } = useParams<{ locale: string }>();
  const searchParams = useSearchParams();
  const [orders, setOrders] = useState<Order[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const page = parseInt(searchParams.get("page") ?? "1");
  const limit = 10;

  useEffect(() => {
    fetch(`/api/account/orders?page=${page}&limit=${limit}&sort=createdAt&dir=desc`)
      .then((r) => r.json())
      .then((data) => { setOrders(data.orders || []); setTotal(data.total || 0); setLoading(false); })
      .catch(() => setLoading(false));
  }, [page]);

  const pages = Math.ceil(total / limit);

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      delivered: "bg-success/10 text-success",
      cancelled: "bg-destructive/10 text-destructive",
      refunded: "bg-warning/10 text-warning",
      shipped: "bg-primary/10 text-primary",
      in_transit: "bg-primary/10 text-primary",
      processing: "bg-muted/50 text-muted-foreground",
      payment_received: "bg-muted/50 text-muted-foreground",
      pending: "bg-muted/50 text-muted-foreground",
    };
    return map[status] || "bg-muted/50 text-muted-foreground";
  };

  if (loading) return <div className="flex items-center justify-center py-24"><div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-6">Order History</h1>

      {orders.length === 0 ? (
        <div className="rounded-xl border border-border p-12 text-center">
          <p className="text-muted-foreground text-sm mb-3">No orders yet</p>
          <Link href={`/${locale}`} className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-black hover:bg-primary/90 transition-colors">
            Start Shopping
          </Link>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {orders.map((order) => (
              <Link key={order.id} href={`/${locale}/account/orders/${order.id}`} className="flex items-center justify-between rounded-xl border border-border bg-card p-5 hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted/50 text-sm font-bold text-muted-foreground">
                    {order._count.items}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{order.orderNumber}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{new Date(order.createdAt).toLocaleDateString()} · {order._count.items} item{order._count.items !== 1 ? "s" : ""}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-foreground">{order.currency} {Number(order.total).toFixed(2)}</p>
                  <span className={`inline-block mt-1 rounded-full px-2 py-0.5 text-xs font-medium capitalize ${statusBadge(order.status)}`}>
                    {order.status.replace(/_/g, " ")}
                  </span>
                </div>
              </Link>
            ))}
          </div>

          {pages > 1 && (
            <div className="mt-6 flex items-center justify-center gap-2">
              {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
                <Link key={p} href={`/${locale}/account/orders?page=${p}`} className={`flex h-9 w-9 items-center justify-center rounded-xl text-sm font-medium transition-colors ${
                  p === page ? "bg-primary text-black" : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground/90"
                }`}>{p}</Link>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
