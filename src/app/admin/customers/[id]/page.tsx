"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

interface CustomerDetail {
  id: string; email: string; firstName: string | null; lastName: string | null;
  phone: string | null; company: string | null; totalOrders: number;
  totalSpentAed: number; totalSpentAud: number; preferredLocale: string;
  defaultAddress: Record<string, unknown>; addresses: unknown[];
  marketingConsent: boolean; notes: string | null; tags: string[];
  createdAt: string;
  orders: Array<{ id: string; orderNumber: string; status: string; total: number; currency: string; createdAt: string; _count: { items: number } }>;
  reviews: Array<{ id: string; rating: number; title: string | null; status: string; createdAt: string; product: { id: string; title: string; slug: string } }>;
}

export default function CustomerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [customer, setCustomer] = useState<CustomerDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/admin/customers/${params.id}`).then((r) => r.json()).then((c) => { setCustomer(c); setLoading(false); });
  }, [params.id]);

  if (loading) return <div className="flex h-48 items-center justify-center"><div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>;
  if (!customer) return <p className="text-sm text-destructive">Customer not found</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{customer.firstName ?? ""} {customer.lastName ?? ""}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{customer.email} · {customer.totalOrders} orders</p>
        </div>
        <button onClick={() => router.push("/admin/customers")} className="rounded-xl border border-border px-4 py-2 text-sm text-muted-foreground hover:bg-muted/50">Back</button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <section className="rounded-xl border border-border bg-muted/50 p-5">
            <h2 className="mb-4 text-sm font-semibold text-foreground">Orders ({customer.orders.length})</h2>
            <div className="divide-y divide-border">
              {customer.orders.map((o) => (
                <div key={o.id} className="flex items-center justify-between py-3">
                  <div>
                    <Link href={`/admin/orders/${o.id}`} className="font-mono text-xs text-primary hover:underline">{o.orderNumber}</Link>
                    <p className="text-xs text-muted-foreground">{new Date(o.createdAt).toLocaleDateString()} · {o._count.items} items</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-foreground/80">{new Intl.NumberFormat("en-AE", { style: "currency", currency: o.currency }).format(Number(o.total))}</p>
                    <p className="text-xs capitalize text-muted-foreground">{o.status.replace(/_/g, " ")}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-xl border border-border bg-muted/50 p-5">
            <h2 className="mb-4 text-sm font-semibold text-foreground">Reviews ({customer.reviews.length})</h2>
            <div className="divide-y divide-border">
              {customer.reviews.map((r) => (
                <div key={r.id} className="py-3">
                  <div className="flex items-center justify-between">
                    <Link href={`/admin/reviews?id=${r.id}`} className="text-sm text-foreground/70 hover:text-primary">{r.title ?? "Untitled"}</Link>
                    <span className="text-xs text-muted-foreground">{new Date(r.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">Product: {r.product.title} · Rating: {r.rating}/5 · Status: <span className="capitalize">{r.status}</span></p>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <section className="rounded-xl border border-border bg-muted/50 p-5">
            <h2 className="mb-3 text-sm font-semibold text-foreground">Details</h2>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between"><span className="text-muted-foreground">Phone</span><span className="text-foreground/70">{customer.phone ?? "—"}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Locale</span><span className="text-foreground/70">{customer.preferredLocale}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Marketing</span><span className={customer.marketingConsent ? "text-success" : "text-muted-foreground/40"}>{customer.marketingConsent ? "Consented" : "Opted out"}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Total Spent (AED)</span><span className="text-foreground/70">{new Intl.NumberFormat("en-AE", { style: "currency", currency: "AED", minimumFractionDigits: 0 }).format(Number(customer.totalSpentAed))}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Total Spent (AUD)</span><span className="text-foreground/70">{new Intl.NumberFormat("en-AU", { style: "currency", currency: "AUD", minimumFractionDigits: 0 }).format(Number(customer.totalSpentAud))}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Member Since</span><span className="text-foreground/70">{new Date(customer.createdAt).toLocaleDateString()}</span></div>
              {customer.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 pt-2">
                  {customer.tags.map((t) => <span key={t} className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-muted-foreground/70">{t}</span>)}
                </div>
              )}
            </div>
          </section>

          {customer.defaultAddress && Object.keys(customer.defaultAddress).length > 0 && (
            <section className="rounded-xl border border-border bg-muted/50 p-5">
              <h2 className="mb-3 text-sm font-semibold text-foreground">Default Address</h2>
              <pre className="text-xs text-muted-foreground/70">{JSON.stringify(customer.defaultAddress, null, 2)}</pre>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
