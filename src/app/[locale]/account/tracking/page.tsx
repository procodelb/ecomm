"use client";

import { useEffect, useState } from "react";

type TrackingOrder = {
  id: string; orderNumber: string; status: string;
  shippingCarrier: string | null; trackingNumber: string | null;
  trackingUrl: string | null; createdAt: string;
  estimatedDelivery: string | null; deliveredAt: string | null;
  _count: { items: number };
};

export default function AccountTracking() {
  const [orders, setOrders] = useState<TrackingOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/account/tracking")
      .then((r) => r.json())
      .then((data) => { setOrders(data.trackingOrders || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center py-24"><div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-6">Live Tracking</h1>

      {orders.length === 0 ? (
        <div className="rounded-xl border border-border p-12 text-center">
          <div className="text-4xl mb-3">🚚</div>
          <p className="text-muted-foreground text-sm">No active shipments</p>
          <p className="text-muted-foreground/40 text-xs mt-1">Tracking information appears once an order has been shipped</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const isDelivered = order.status === "delivered";
            const isInTransit = order.status === "shipped" || order.status === "in_transit";

            return (
              <div key={order.id} className="rounded-xl border border-border bg-card p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-sm font-medium text-foreground">{order.orderNumber}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{order._count.items} item{order._count.items !== 1 ? "s" : ""}</p>
                  </div>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${
                    isDelivered ? "bg-success/10 text-success" :
                    isInTransit ? "bg-primary/10 text-primary" : "bg-muted/50 text-muted-foreground"
                  }`}>{order.status.replace(/_/g, " ")}</span>
                </div>

                {order.shippingCarrier && (
                  <div className="mb-3 flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground">Carrier:</span>
                    <span className="text-foreground/80">{order.shippingCarrier}</span>
                  </div>
                )}

                {order.trackingNumber && (
                  <div className="mb-3 rounded-xl bg-muted/50 p-3">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-muted-foreground">Tracking #:</span>
                      <span className="font-mono text-foreground/80">{order.trackingNumber}</span>
                    </div>
                    {order.trackingUrl && (
                      <a href={order.trackingUrl} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-1 text-sm text-primary hover:underline">
                        Track on carrier site →
                      </a>
                    )}
                  </div>
                )}

                {order.estimatedDelivery && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground">Est. Delivery:</span>
                    <span className="text-foreground/70">{new Date(order.estimatedDelivery).toLocaleDateString()}</span>
                  </div>
                )}
                {order.deliveredAt && (
                  <div className="flex items-center gap-2 text-sm text-success">
                    <span>✓ Delivered:</span>
                    <span>{new Date(order.deliveredAt).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
