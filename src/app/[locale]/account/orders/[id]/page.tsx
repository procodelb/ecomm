"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ProductImage } from "@/lib/seo/image";

type OrderDetail = {
  id: string; orderNumber: string; status: string; total: number; subtotal: number;
  shippingCost: number; taxAmount: number; discountAmount: number; amountPaid: number;
  currency: string; locale: string; createdAt: string; paidAt: string | null;
  shippingCarrier: string | null; trackingNumber: string | null; trackingUrl: string | null;
  shippingAddress: Record<string, unknown>; billingAddress: Record<string, unknown>;
  paymentMethod: string | null; paymentStatus: string | null; customerNotes: string | null;
  estimatedDelivery: string | null; deliveredAt: string | null;
  items: { id: string; title: string; variantTitle: string | null; quantity: number; unitPrice: number; lineTotal: number; imageUrl: string | null }[];
};

export default function OrderDetail() {
  const { locale, id } = useParams<{ locale: string; id: string }>();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/account/orders/${id}`)
      .then((r) => r.json())
      .then((data) => { setOrder(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="flex items-center justify-center py-24"><div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>;
  if (!order) return <div className="py-24 text-center text-muted-foreground">Order not found</div>;

  const shipAddr = order.shippingAddress as Record<string, string>;

  const statusBadge = (s: string) => {
    const colors: Record<string, string> = {
      delivered: "bg-success/10 text-success",
      cancelled: "bg-destructive/10 text-destructive",
      refunded: "bg-warning/10 text-warning",
      shipped: "bg-primary/10 text-primary",
      in_transit: "bg-primary/10 text-primary",
    };
    return colors[s] || "bg-muted/50 text-muted-foreground";
  };

  return (
    <div>
      <Link href={`/${locale}/account/orders`} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground/60 transition-colors mb-4">← Back to orders</Link>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{order.orderNumber}</h1>
          <p className="text-sm text-muted-foreground mt-1">{new Date(order.createdAt).toLocaleDateString()}</p>
        </div>
        <span className={`rounded-full px-3 py-1 text-sm font-medium capitalize ${statusBadge(order.status)}`}>{order.status.replace(/_/g, " ")}</span>
      </div>

      {order.trackingNumber && (
        <div className="mb-6 rounded-xl border border-primary/20 bg-primary/5 p-4">
          <p className="text-sm text-muted-foreground mb-1">Tracking: <span className="text-foreground font-medium">{order.trackingNumber}</span></p>
          {order.shippingCarrier && <p className="text-xs text-muted-foreground mb-2">Carrier: {order.shippingCarrier}</p>}
          {order.trackingUrl && (
            <a href={order.trackingUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm text-primary hover:underline">
              Track Package →
            </a>
          )}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Items</h2>
            <div className="space-y-4">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-start gap-4 border-b border-border pb-4 last:border-0 last:pb-0">
                  <div className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-muted/50 text-xs text-muted-foreground overflow-hidden">
                    {item.imageUrl ? <ProductImage src={item.imageUrl} alt={item.title} fill sizes="64px" /> : "IMG"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{item.title}</p>
                    {item.variantTitle && <p className="text-xs text-muted-foreground">{item.variantTitle}</p>}
                    <p className="text-xs text-muted-foreground mt-1">Qty: {item.quantity}</p>
                  </div>
                  <p className="text-sm font-medium text-foreground">{order.currency} {Number(item.lineTotal).toFixed(2)}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Shipping Address</h2>
            {shipAddr && Object.keys(shipAddr).length > 0 ? (
              <div className="text-sm text-muted-foreground space-y-1">
                {shipAddr.line1 && <p className="text-foreground/80">{shipAddr.line1}</p>}
                {shipAddr.line2 && <p>{shipAddr.line2}</p>}
                <p>{[shipAddr.city, shipAddr.state, shipAddr.postalCode].filter(Boolean).join(", ")}</p>
                {shipAddr.country && <p>{shipAddr.country}</p>}
              </div>
            ) : <p className="text-sm text-muted-foreground">No shipping address</p>}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Order Summary</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-muted-foreground"><span>Subtotal</span><span>{order.currency} {Number(order.subtotal).toFixed(2)}</span></div>
              <div className="flex justify-between text-muted-foreground"><span>Shipping</span><span>{order.currency} {Number(order.shippingCost).toFixed(2)}</span></div>
              {Number(order.discountAmount) > 0 && <div className="flex justify-between text-success"><span>Discount</span><span>-{order.currency} {Number(order.discountAmount).toFixed(2)}</span></div>}
              <div className="flex justify-between text-muted-foreground"><span>Tax</span><span>{order.currency} {Number(order.taxAmount).toFixed(2)}</span></div>
              <div className="flex justify-between border-t border-border pt-2 text-base font-bold text-foreground"><span>Total</span><span>{order.currency} {Number(order.total).toFixed(2)}</span></div>
              <div className="flex justify-between text-xs text-muted-foreground pt-1"><span>Paid</span><span>{order.currency} {Number(order.amountPaid).toFixed(2)}</span></div>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Payment</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-muted-foreground"><span>Method</span><span className="text-foreground/80">{order.paymentMethod || "—"}</span></div>
              <div className="flex justify-between text-muted-foreground"><span>Status</span><span className="text-foreground/80 capitalize">{order.paymentStatus || order.status.replace(/_/g, " ")}</span></div>
            </div>
          </div>

          <div className="flex gap-3">
            <Link href={`/${locale}/account/returns`} className="flex-1 rounded-xl border border-border px-4 py-2.5 text-center text-sm font-medium text-muted-foreground hover:bg-muted/50 hover:text-foreground/90 transition-colors">
              Return Items
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
