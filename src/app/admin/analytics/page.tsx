"use client";

import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, CartesianGrid } from "recharts";

interface AnalyticsData {
  overview: { orders30d: number; revenue30d: number; totalRevenue: number; totalProducts: number };
  ordersByStatus: Array<{ status: string; _count: number }>;
  ordersByDay: Array<{ date: string; orders: number; revenue: number }>;
  topProducts: Array<{ title: string; _sum: { quantity: number; lineTotal: number } }>;
  topCategories: Array<{ category: string | null; _count: number }>;
  productsByStatus: Array<{ status: string; _count: number }>;
}

const PIE_COLORS = ["#00C2FF", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899", "#FFD700"];

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-AE", { style: "currency", currency: "AED", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/analytics").then((r) => r.json()).then((d) => { setData(d); setLoading(false); });
  }, []);

  if (loading) return <div className="flex h-48 items-center justify-center"><div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>;
  if (!data) return <p className="text-sm text-destructive">Failed to load analytics</p>;

  const ordersByStatus = data.ordersByStatus.map((s) => ({ name: s.status.replace(/_/g, " "), value: s._count }));
  const productsByStatus = data.productsByStatus.map((s) => ({ name: s.status.replace(/_/g, " "), value: s._count }));
  const topProducts = data.topProducts.map((p) => ({ name: p.title.length > 30 ? p.title.slice(0, 30) + "…" : p.title, revenue: Number(p._sum.lineTotal) }));
  const revenueByDay = data.ordersByDay.map((d) => ({ date: d.date, revenue: Number(d.revenue), orders: d.orders }));

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-foreground">Analytics</h1><p className="mt-1 text-sm text-muted-foreground">Last 30 days</p></div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-border bg-muted/50 p-5">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">30-Day Revenue</p>
          <p className="mt-2 text-2xl font-bold text-primary">{formatCurrency(data.overview.revenue30d)}</p>
        </div>
        <div className="rounded-xl border border-border bg-muted/50 p-5">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">30-Day Orders</p>
          <p className="mt-2 text-2xl font-bold text-foreground">{data.overview.orders30d}</p>
        </div>
        <div className="rounded-xl border border-border bg-muted/50 p-5">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Total Revenue</p>
          <p className="mt-2 text-2xl font-bold text-gold">{formatCurrency(data.overview.totalRevenue)}</p>
        </div>
        <div className="rounded-xl border border-border bg-muted/50 p-5">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Active Products</p>
          <p className="mt-2 text-2xl font-bold text-foreground">{data.overview.totalProducts}</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-border bg-muted/50 p-5">
          <h2 className="mb-4 text-sm font-semibold text-foreground">Revenue (30 days)</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueByDay}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="date" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }} />
                <YAxis tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }} />
                <Tooltip contentStyle={{ background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 12 }} />
                <Line type="monotone" dataKey="revenue" stroke="#00C2FF" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="rounded-xl border border-border bg-muted/50 p-5">
          <h2 className="mb-4 text-sm font-semibold text-foreground">Orders by Status</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={ordersByStatus} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={(({ name, percent }: Record<string, unknown>) => `${String(name)} ${percent != null ? `${(Number(percent) * 100).toFixed(0)}%` : ""}`) as never}>
                  {ordersByStatus.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="rounded-xl border border-border bg-muted/50 p-5">
          <h2 className="mb-4 text-sm font-semibold text-foreground">Top Products by Revenue</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topProducts} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis type="number" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }} />
                <YAxis type="category" dataKey="name" width={150} tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 10 }} />
                <Tooltip contentStyle={{ background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="revenue" fill="#00C2FF" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="rounded-xl border border-border bg-muted/50 p-5">
          <h2 className="mb-4 text-sm font-semibold text-foreground">Products by Status</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={productsByStatus} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={(({ name, percent }: Record<string, unknown>) => `${String(name)} ${percent != null ? `${(Number(percent) * 100).toFixed(0)}%` : ""}`) as never}>
                  {productsByStatus.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>
    </div>
  );
}
