"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getCsrfHeader } from "@/lib/security/csrf-client";

const STATUS_FLOW = ["pending", "payment_received", "processing", "shipped", "in_transit", "delivered"];

interface OrderItem {
  id: string; sku: string | null; title: string; variantTitle: string | null;
  quantity: number; unitPrice: number; lineTotal: number; status: string;
  trackingNumber: string | null; carrier: string | null;
  supplier: { name: string } | null;
}

interface OrderDetail {
  id: string; orderNumber: string; customerEmail: string; status: string;
  currency: string; subtotal: number; shippingCost: number; taxAmount: number;
  discountAmount: number; total: number; amountPaid: number;
  paymentMethod: string | null; paymentIntentId: string | null;
  paymentStatus: string | null; paidAt: string | null;
  shippingMethod: string; shippingCarrier: string | null;
  trackingNumber: string | null; trackingUrl: string | null;
  shippingAddress: Record<string, unknown>;
  billingAddress: Record<string, unknown>;
  internalNotes: string | null; customerNotes: string | null;
  cancellationReason: string | null; createdAt: string; updatedAt: string;
  metadata: Record<string, unknown> | null;
  items: OrderItem[];
  customer: { id: string; email: string; firstName: string | null; lastName: string | null; phone: string | null } | null;
}

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [notes, setNotes] = useState("");
  const [trackingNum, setTrackingNum] = useState("");
  const [trackingUrl, setTrackingUrl] = useState("");
  const [carrier, setCarrier] = useState("");
  const [confirmingPayment, setConfirmingPayment] = useState(false);
  const [confirmError, setConfirmError] = useState("");

  useEffect(() => {
    fetch(`/api/admin/orders/${params.id}`).then((r) => r.json()).then((d) => {     setOrder(d); setNewStatus(d.status); setNotes(d.internalNotes ?? ""); setTrackingNum(d.trackingNumber ?? ""); setTrackingUrl(d.trackingUrl ?? ""); setCarrier(d.shippingCarrier ?? ""); setLoading(false); });
  }, [params.id]);

  const updateOrder = async (data: Record<string, unknown>) => {
    setStatusUpdating(true);
    await fetch("/api/admin/orders", { method: "PATCH", headers: { "Content-Type": "application/json", ...getCsrfHeader() }, body: JSON.stringify({ id: params.id, ...data }) });
    const res = await fetch(`/api/admin/orders/${params.id}`).then((r) => r.json());
    setOrder(res); setNewStatus(res.status); setNotes(res.internalNotes ?? "");
    setTrackingNum(res.trackingNumber ?? ""); setTrackingUrl(res.trackingUrl ?? ""); setCarrier(res.shippingCarrier ?? "");
    setStatusUpdating(false);
  };

  const confirmPayment = async () => {
    if (!order) return;
    setConfirmingPayment(true);
    setConfirmError("");
    try {
      const res = await fetch(`/api/admin/orders/${order.id}/confirm-payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getCsrfHeader() },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (!res.ok) {
        setConfirmError(data.error ?? "Failed to confirm payment");
        return;
      }
      // Refresh order data
      const updated = await fetch(`/api/admin/orders/${params.id}`).then((r) => r.json());
      setOrder(updated);
      setNewStatus(updated.status);
      setNotes(updated.internalNotes ?? "");
      setTrackingNum(updated.trackingNumber ?? "");
      setTrackingUrl(updated.trackingUrl ?? "");
      setCarrier(updated.shippingCarrier ?? "");
    } catch {
      setConfirmError("Failed to confirm payment");
    } finally {
      setConfirmingPayment(false);
    }
  };

  if (loading) return <div className="flex h-48 items-center justify-center"><div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>;
  if (!order) return <p className="text-sm text-destructive">Order not found</p>;

  const statusIndex = STATUS_FLOW.indexOf(order.status);
  const nextStatus = statusIndex >= 0 && statusIndex < STATUS_FLOW.length - 1 ? STATUS_FLOW[statusIndex + 1] : null;

  const canConfirmPayment =
    (order.paymentMethod === "alfan" || order.paymentMethod === "cash_on_delivery") &&
    order.paymentStatus !== "paid";

  const paymentMethodLabel = order.paymentMethod === "alfan"
    ? "Alfan"
    : order.paymentMethod === "cash_on_delivery"
      ? "Cash on Delivery"
      : order.paymentMethod === "card"
        ? "Card (Stripe)"
        : order.paymentMethod ?? "—";

  const paymentStatusLabel = order.paymentStatus === "paid"
    ? "Paid"
    : order.paymentStatus === "pending"
      ? "Pending"
      : order.paymentStatus === "failed"
        ? "Failed"
        : order.paymentStatus ?? "—";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{order.orderNumber}</h1>
          <p className="mt-1 text-sm text-muted-foreground">Created {new Date(order.createdAt).toLocaleString()}</p>
        </div>
        <button onClick={() => router.push("/admin/orders")} className="rounded-xl border border-border px-4 py-2 text-sm text-muted-foreground hover:bg-muted/50">Back</button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <section className="rounded-xl border border-border bg-muted/50 p-5">
            <h2 className="mb-4 text-sm font-semibold text-foreground">Order Items</h2>
            <div className="divide-y divide-border">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-foreground/80">{item.title}</p>
                    <p className="text-xs text-muted-foreground">{item.sku}{item.variantTitle ? ` · ${item.variantTitle}` : ""}{item.supplier ? ` · ${item.supplier.name}` : ""}</p>
                    {item.trackingNumber && <p className="mt-1 text-xs text-primary">&#x1F4E6; {item.carrier}: {item.trackingNumber}</p>}
                  </div>
                  <div className="ml-4 text-right">
                    <p className="text-sm text-foreground/80">{new Intl.NumberFormat("en-AE", { style: "currency", currency: order.currency }).format(Number(item.unitPrice))} &#215; {item.quantity}</p>
                    <p className="text-xs text-muted-foreground">{new Intl.NumberFormat("en-AE", { style: "currency", currency: order.currency }).format(Number(item.lineTotal))}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-xl border border-border bg-muted/50 p-5">
            <h2 className="mb-3 text-sm font-semibold text-foreground">Internal Notes</h2>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3}
              className="w-full rounded-xl border border-border bg-muted/50 p-3 text-sm text-foreground placeholder-muted-foreground/40 outline-none focus:border-primary/50"
              placeholder="Add internal notes..."
            />
            <button onClick={() => updateOrder({ internalNotes: notes })} disabled={statusUpdating}
              className="mt-2 rounded-xl bg-primary px-4 py-1.5 text-xs font-semibold text-black transition-colors hover:bg-primary/90 disabled:opacity-50"
            >Save Notes</button>
          </section>
        </div>

        <div className="space-y-6">
          <section className="rounded-xl border border-border bg-muted/50 p-5">
            <h2 className="mb-4 text-sm font-semibold text-foreground">Status</h2>
            <div className="flex items-center gap-2">
              <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)}
                className="flex-1 rounded-xl border border-border bg-muted/50 px-3 py-2 text-sm text-foreground outline-none focus:border-primary/50">
                {STATUS_FLOW.map((s) => <option key={s} value={s}>{s.replace(/_/g, " ")}</option>)}
                <option value="cancelled">Cancelled</option>
                <option value="refunded">Refunded</option>
              </select>
              <button onClick={() => updateOrder({ status: newStatus })} disabled={statusUpdating || newStatus === order.status}
                className="rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-black disabled:opacity-50"
              >Update</button>
            </div>
            {nextStatus && <p className="mt-2 text-xs text-muted-foreground">Suggested next: <button onClick={() => updateOrder({ status: nextStatus })} className="text-primary hover:underline">{nextStatus.replace(/_/g, " ")}</button></p>}
          </section>

          <section className="rounded-xl border border-border bg-muted/50 p-5">
            <h2 className="mb-3 text-sm font-semibold text-foreground">Shipping</h2>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between"><span className="text-muted-foreground">Method</span><span className="text-foreground/70">{order.shippingMethod}</span></div>
              <div>
                <label className="mb-1 block text-muted-foreground">Carrier</label>
                <input value={carrier} onChange={(e) => setCarrier(e.target.value)} className="w-full rounded-xl border border-border bg-muted/50 px-3 py-2 text-sm text-foreground outline-none focus:border-primary/50" placeholder="e.g. DHL, FedEx" />
              </div>
              <div>
                <label className="mb-1 block text-muted-foreground">Tracking Number</label>
                <input value={trackingNum} onChange={(e) => setTrackingNum(e.target.value)} className="w-full rounded-xl border border-border bg-muted/50 px-3 py-2 text-sm text-foreground outline-none focus:border-primary/50" placeholder="Tracking number" />
              </div>
              <div>
                <label className="mb-1 block text-muted-foreground">Tracking URL</label>
                <input value={trackingUrl} onChange={(e) => setTrackingUrl(e.target.value)} className="w-full rounded-xl border border-border bg-muted/50 px-3 py-2 text-sm text-foreground outline-none focus:border-primary/50" placeholder="https://..." />
              </div>
              <button onClick={() => updateOrder({ shippingCarrier: carrier, trackingNumber: trackingNum, trackingUrl })} disabled={statusUpdating}
                className="w-full rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-black disabled:opacity-50"
              >Update Tracking</button>
              <div>
                <p className="mb-1 text-muted-foreground">Shipping Address</p>
                <pre className="rounded bg-muted/50 p-2 text-xs text-muted-foreground/70">{JSON.stringify(order.shippingAddress, null, 2)}</pre>
              </div>
            </div>
          </section>

          <section className="rounded-xl border border-border bg-muted/50 p-5">
            <h2 className="mb-3 text-sm font-semibold text-foreground">Payment</h2>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between"><span className="text-muted-foreground">Provider</span><span className="text-foreground/70 capitalize">{paymentMethodLabel}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Status</span>
                <span className={order.paymentStatus === "paid" ? "text-success" : order.paymentStatus === "failed" ? "text-destructive" : "text-amber-500"}>
                  {paymentStatusLabel}
                </span>
              </div>
              {order.paymentIntentId && <div className="flex justify-between"><span className="text-muted-foreground">Reference</span><span className="font-mono text-muted-foreground/70 truncate max-w-[180px]">{order.paymentIntentId}</span></div>}
              {order.paidAt && <div className="flex justify-between"><span className="text-muted-foreground">Paid At</span><span className="text-foreground/70">{new Date(order.paidAt).toLocaleString()}</span></div>}
              {order.paymentMethod === "alfan" && order.metadata && typeof order.metadata === "object" && !!(order.metadata as Record<string, unknown>).confirmedBy && (
                <div className="flex justify-between"><span className="text-muted-foreground">Confirmed By</span><span className="text-foreground/70">{String((order.metadata as Record<string, unknown>).confirmedBy)}</span></div>
              )}
              <div className="flex justify-between border-t border-border pt-2"><span className="text-sm font-semibold text-foreground">Total</span><span className="text-sm font-semibold text-primary">{new Intl.NumberFormat("en-AE", { style: "currency", currency: order.currency }).format(Number(order.total))}</span></div>
            </div>

            {/* Alfan / COD manual payment confirmation */}
            {canConfirmPayment && (
              <div className="mt-4 pt-4 border-t border-border space-y-2">
                <p className="text-xs text-muted-foreground">
                  {order.paymentMethod === "alfan"
                    ? "Mark this Alfan payment as confirmed after verifying the transaction."
                    : "Mark this Cash on Delivery payment as confirmed after receiving payment."}
                </p>
                <button
                  onClick={confirmPayment}
                  disabled={confirmingPayment}
                  className="w-full rounded-xl bg-green-600 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-green-700 disabled:opacity-50"
                >
                  {confirmingPayment ? "Confirming..." : "Confirm Payment Received"}
                </button>
                {confirmError && (
                  <p className="text-xs text-destructive">{confirmError}</p>
                )}
              </div>
            )}
          </section>

          {order.customer && (
            <section className="rounded-xl border border-border bg-muted/50 p-5">
              <h2 className="mb-3 text-sm font-semibold text-foreground">Customer</h2>
              <div className="space-y-1 text-xs">
                <p className="text-foreground/70">{order.customer.firstName ?? ""} {order.customer.lastName ?? ""}</p>
                <p className="text-muted-foreground/70">{order.customer.email}</p>
                {order.customer.phone && <p className="text-muted-foreground/70">{order.customer.phone}</p>}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
