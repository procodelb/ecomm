"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { trackEvent } from "@/lib/analytics/client";

type Ticket = {
  id: string; subject: string; status: string; priority: string;
  createdAt: string; _count: { messages: number };
};

export default function AccountSupport() {
  const { locale } = useParams<{ locale: string }>();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ subject: "", message: "", orderId: "" });
  const [submitting, setSubmitting] = useState(false);

  const fetchTickets = () => {
    fetch("/api/account/support")
      .then((r) => r.json())
      .then((data) => { setTickets(data.tickets || []); setLoading(false); });
  };

  useEffect(() => { fetchTickets(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    await fetch("/api/account/support", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({
        subject: form.subject, message: form.message, orderId: form.orderId || undefined,
      }),
    });
    trackEvent("support_ticket_created", { subject: form.subject });
    setSubmitting(false);
    setShowForm(false);
    setForm({ subject: "", message: "", orderId: "" });
    fetchTickets();
  };

  const statusBadge = (s: string) => {
    const map: Record<string, string> = {
      open: "bg-warning/10 text-warning",
      in_progress: "bg-primary/10 text-primary",
      awaiting_customer: "bg-warning/10 text-warning",
      resolved: "bg-success/10 text-success",
      closed: "bg-muted/50 text-muted-foreground",
    };
    return map[s] || "bg-muted/50 text-muted-foreground";
  };

  if (loading) return <div className="flex items-center justify-center py-24"><div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">Support Tickets</h1>
        <button onClick={() => setShowForm(true)} className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-black hover:bg-primary/90 transition-colors">
          + New Ticket
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 rounded-xl border border-border bg-card p-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Subject *</label>
            <input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} required className="w-full rounded-lg border border-border bg-muted/50 px-3 py-2 text-sm text-foreground placeholder-muted-foreground/40 outline-none focus:border-primary" placeholder="Brief title for your issue" />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Message *</label>
            <textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} required rows={4} className="w-full rounded-lg border border-border bg-muted/50 px-3 py-2 text-sm text-foreground placeholder-muted-foreground/40 outline-none focus:border-primary" placeholder="Describe your issue in detail..." />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Related Order (optional)</label>
            <input value={form.orderId} onChange={(e) => setForm({ ...form, orderId: e.target.value })} className="w-full rounded-lg border border-border bg-muted/50 px-3 py-2 text-sm text-foreground placeholder-muted-foreground/40 outline-none focus:border-primary" placeholder="Order ID" />
          </div>
          <div className="flex items-center gap-3">
            <button type="submit" disabled={submitting} className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-black hover:bg-primary/90 transition-colors disabled:opacity-50">
              {submitting ? "Sending..." : "Submit Ticket"}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="text-sm text-muted-foreground hover:text-foreground/60 transition-colors">Cancel</button>
          </div>
        </form>
      )}

      {tickets.length === 0 ? (
        <div className="rounded-xl border border-border p-12 text-center">
          <p className="text-muted-foreground text-sm">No support tickets</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tickets.map((ticket) => (
            <Link key={ticket.id} href={`/${locale}/account/support/${ticket.id}`} className="flex items-center justify-between rounded-xl border border-border bg-card p-5 hover:bg-muted/50 transition-colors">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-foreground truncate">{ticket.subject}</p>
                  <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-medium uppercase ${
                    ticket.priority === "urgent" ? "bg-destructive/10 text-destructive" :
                    ticket.priority === "high" ? "bg-warning/10 text-warning" :
                    "bg-muted/50 text-muted-foreground"
                  }`}>{ticket.priority}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">{new Date(ticket.createdAt).toLocaleDateString()} · {ticket._count.messages} message{ticket._count.messages !== 1 ? "s" : ""}</p>
              </div>
              <span className={`ml-4 shrink-0 rounded-full px-2 py-0.5 text-xs font-medium capitalize ${statusBadge(ticket.status)}`}>{ticket.status.replace(/_/g, " ")}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
