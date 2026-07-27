"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { apiFetch } from "@/lib/api/client";

type ReturnRequest = {
  id: string; reason: string; status: string; createdAt: string;
  refundAmount: number | null; adminNotes: string | null;
  order: { orderNumber: string };
};

export default function AccountReturns() {
  useParams<{ locale: string }>();
  const [returns, setReturns] = useState<ReturnRequest[]>([]);
  const [orders, setOrders] = useState<{ id: string; orderNumber: string; status: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ orderId: "", reason: "" });
  const [submitting, setSubmitting] = useState(false);

  const fetchData = () => {
    Promise.all([
      fetch("/api/account/returns").then((r) => r.json()),
      fetch("/api/account/orders?limit=50").then((r) => r.json()),
    ]).then(([returnsData, ordersData]) => {
      setReturns(returnsData.returns || []);
      setOrders((ordersData.orders || []).filter((o: { status: string }) =>
        ["delivered", "shipped", "in_transit"].includes(o.status)
      ));
      setLoading(false);
    });
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    await apiFetch("/api/account/returns", {
      method: "POST", body: form,
    });
    setSubmitting(false);
    setShowForm(false);
    setForm({ orderId: "", reason: "" });
    fetchData();
  };

  const statusBadge = (s: string) => {
    const map: Record<string, string> = {
      pending: "bg-warning/10 text-warning",
      approved: "bg-primary/10 text-primary",
      rejected: "bg-destructive/10 text-destructive",
      items_received: "bg-muted/50 text-muted-foreground",
      refund_issued: "bg-success/10 text-success",
    };
    return map[s] || "bg-muted/50 text-muted-foreground";
  };

  if (loading) return <div className="flex items-center justify-center py-24"><div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">Returns</h1>
        {orders.length > 0 && (
          <button onClick={() => setShowForm(true)} className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-black hover:bg-primary/90 transition-colors">
            + Request Return
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 rounded-xl border border-border bg-card p-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Order *</label>
            <select value={form.orderId} onChange={(e) => setForm({ ...form, orderId: e.target.value })} required className="w-full rounded-lg border border-border bg-muted/50 px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary">
              <option value="">Select an order</option>
              {orders.map((o) => <option key={o.id} value={o.id}>{o.orderNumber}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Reason *</label>
            <textarea value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} required rows={3} className="w-full rounded-lg border border-border bg-muted/50 px-3 py-2 text-sm text-foreground placeholder-muted-foreground/40 outline-none focus:border-primary" placeholder="Tell us why you're returning this item..." />
          </div>
          <div className="flex items-center gap-3">
            <button type="submit" disabled={submitting} className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-black hover:bg-primary/90 transition-colors disabled:opacity-50">
              {submitting ? "Submitting..." : "Submit Request"}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="text-sm text-muted-foreground hover:text-foreground/60 transition-colors">Cancel</button>
          </div>
        </form>
      )}

      {returns.length === 0 ? (
        <div className="rounded-xl border border-border p-12 text-center">
          <p className="text-muted-foreground text-sm">No return requests</p>
        </div>
      ) : (
        <div className="space-y-3">
          {returns.map((ret) => (
            <div key={ret.id} className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="text-sm font-medium text-foreground">{ret.order.orderNumber}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{new Date(ret.createdAt).toLocaleDateString()}</p>
                </div>
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${statusBadge(ret.status)}`}>{ret.status.replace(/_/g, " ")}</span>
              </div>
              <p className="text-sm text-muted-foreground mt-2">{ret.reason}</p>
              {ret.refundAmount && <p className="text-sm text-success mt-2">Refund: {Number(ret.refundAmount).toFixed(2)}</p>}
              {ret.adminNotes && <p className="text-xs text-muted-foreground mt-2 italic">Note: {ret.adminNotes}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
