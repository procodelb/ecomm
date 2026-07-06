"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

type Message = { id: string; authorType: string; message: string; createdAt: string };
type TicketDetail = {
  id: string; subject: string; message: string; status: string; priority: string;
  createdAt: string; messages: Message[]; orderId: string | null;
};

export default function TicketDetail() {
  const { locale, id } = useParams<{ locale: string; id: string }>();
  const [ticket, setTicket] = useState<TicketDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);

  const fetchTicket = () => {
    fetch(`/api/account/support/${id}`)
      .then((r) => r.json())
      .then((data) => { setTicket(data); setLoading(false); });
  };

  useEffect(() => { fetchTicket(); }, [id]);

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    setSending(true);
    await fetch(`/api/account/support/${id}`, {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message: newMessage }),
    });
    setSending(false);
    setNewMessage("");
    fetchTicket();
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
  if (!ticket) return <div className="py-24 text-center text-muted-foreground">Ticket not found</div>;

  const allMessages: Message[] = [
    { id: "initial", authorType: "customer", message: ticket.message, createdAt: ticket.createdAt },
    ...ticket.messages,
  ];

  return (
    <div>
      <Link href={`/${locale}/account/support`} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground/60 transition-colors mb-4">← Back to tickets</Link>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{ticket.subject}</h1>
          <p className="text-sm text-muted-foreground mt-1">Created {new Date(ticket.createdAt).toLocaleDateString()}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${statusBadge(ticket.status)}`}>{ticket.status.replace(/_/g, " ")}</span>
          <span className="rounded-full bg-muted/50 px-2 py-0.5 text-xs font-medium text-muted-foreground uppercase">{ticket.priority}</span>
        </div>
      </div>

      {ticket.orderId && (
        <div className="mb-6 rounded-xl border border-border bg-card p-3 text-sm">
          <span className="text-muted-foreground">Related Order: </span>
          <Link href={`/${locale}/account/orders/${ticket.orderId}`} className="text-primary hover:underline">View Order</Link>
        </div>
      )}

      <div className="space-y-4 mb-6">
        {allMessages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.authorType === "customer" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-lg rounded-xl p-4 ${
              msg.authorType === "customer"
                ? "bg-primary/10 border border-primary/20"
                : "bg-muted/50 border border-border"
            }`}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-medium text-muted-foreground">{msg.authorType === "customer" ? "You" : "Support"}</span>
                <span className="text-[10px] text-muted-foreground/40">{new Date(msg.createdAt).toLocaleString()}</span>
              </div>
              <p className="text-sm text-foreground/80 whitespace-pre-wrap">{msg.message}</p>
            </div>
          </div>
        ))}
      </div>

      {ticket.status !== "resolved" && ticket.status !== "closed" && (
        <form onSubmit={handleReply} className="rounded-xl border border-border bg-card p-4">
          <textarea value={newMessage} onChange={(e) => setNewMessage(e.target.value)} rows={3} className="w-full rounded-lg border border-border bg-muted/50 px-3 py-2 text-sm text-foreground placeholder-muted-foreground/40 outline-none focus:border-primary mb-3" placeholder="Type your reply..." />
          <button type="submit" disabled={sending || !newMessage.trim()} className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-black hover:bg-primary/90 transition-colors disabled:opacity-50">
            {sending ? "Sending..." : "Send Reply"}
          </button>
        </form>
      )}
    </div>
  );
}
