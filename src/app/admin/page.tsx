"use client";

import { useEffect, useState, useCallback } from "react";
import { apiFetch } from "@/lib/api/client";
import { StatusBadge } from "@/components/admin/status-badge";

interface Stats {
  totalProducts: number;
  totalOrders: number;
  totalCustomers: number;
  totalSuppliers: number;
  totalRevenue: number;
  todayOrders: number;
  todayRevenue: number;
  pendingOrders: number;
  lowStockCount: number;
  lowStockProducts: Array<{
    id: string;
    sku: string;
    title: string;
    status: string;
    inventory: { quantity: number } | null;
    supplier: { name: string } | null;
  }>;
  recentOrders: Array<{
    id: string;
    orderNumber: string;
    customerEmail: string;
    status: string;
    total: number;
    currency: string;
    itemCount: number;
    createdAt: string;
  }>;
  supplierStatuses: Array<{
    id: string;
    code: string;
    name: string;
    status: string;
    lastSyncAt: string | null;
    lastSyncStatus: string | null;
    lastSyncSummary: unknown;
    _count: { products: number };
  }>;
  lastSyncLogs: Array<{
    id: string;
    status: string;
    createdAt: string;
    responseTimeMs: number | null;
    metadata: Record<string, unknown>;
    supplier: { id: string; code: string; name: string };
  }>;
}

function formatPrice(value: number, currency = "AED"): string {
  return new Intl.NumberFormat("en-AE", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

function StatCard({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string;
  sub?: string;
  accent?: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-muted/50 p-5 transition-colors hover:border-border-hover">
      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className={`mt-2 text-3xl font-bold ${accent ?? "text-foreground"}`}>{value}</p>
      {sub && <p className="mt-1 text-xs text-muted-foreground">{sub}</p>}
    </div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<{ status: string; message: string } | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/admin/stats");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load stats");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Data fetching: setState inside effect for async data load
    fetchStats();
  }, [fetchStats]);

  const triggerSync = async () => {
    if (syncing) return;
    setSyncing(true);
    setSyncResult(null);
    try {
      const data = await apiFetch<{ totals: { suppliers: number; productsCreated: number; productsUpdated: number }; durationMs: number }>("/api/admin/sync", { method: "POST" });
      setSyncResult({
        status: "success",
        message: `Synced ${data.totals.suppliers} suppliers — ${data.totals.productsCreated} created, ${data.totals.productsUpdated} updated (${data.durationMs}ms)`,
      });
      fetchStats();
    } catch (err) {
      setSyncResult({ status: "error", message: (err as { message?: string })?.message ?? "Sync failed" });
    } finally {
      setSyncing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-4">
        <p className="text-sm text-destructive">{error}</p>
        <button onClick={fetchStats} className="rounded-xl border border-border px-4 py-2 text-sm text-muted-foreground hover:bg-muted/50">
          Retry
        </button>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="space-y-8">
      {/* Page heading */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {stats.totalOrders} total orders · {stats.totalProducts} products · {stats.totalCustomers} customers
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Revenue" value={formatPrice(stats.totalRevenue, "AED")} sub={`${stats.todayOrders} orders today · ${formatPrice(stats.todayRevenue, "AED")}`} accent="text-primary" />
        <StatCard label="Orders" value={String(stats.totalOrders)} sub={`${stats.pendingOrders} pending · ${stats.todayOrders} today`} />
        <StatCard label="Products" value={String(stats.totalProducts)} sub={`${stats.lowStockCount} low stock`} />
        <StatCard label="Customers" value={String(stats.totalCustomers)} />
      </div>

      {/* Two-column layout */}
      <div className="grid gap-8 xl:grid-cols-3">
        {/* Left column — Recent Orders + Low Stock */}
        <div className="space-y-8 xl:col-span-2">
          {/* Recent Orders */}
          <section className="rounded-xl border border-border bg-muted/50">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <h2 className="text-sm font-semibold text-foreground">Recent Orders</h2>
              <span className="text-xs text-muted-foreground">{stats.recentOrders.length} latest</span>
            </div>
            {stats.recentOrders.length === 0 ? (
              <div className="px-5 py-8 text-center text-sm text-muted-foreground">No orders yet</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      <th className="px-5 py-3">Order</th>
                      <th className="px-5 py-3">Customer</th>
                      <th className="px-5 py-3">Status</th>
                      <th className="px-5 py-3 text-right">Total</th>
                      <th className="px-5 py-3 text-right">Age</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recentOrders.map((order) => (
                      <tr key={order.id} className="border-b border-border last:border-0 hover:bg-muted/10">
                        <td className="px-5 py-3 font-mono text-xs text-muted-foreground">{order.orderNumber}</td>
                        <td className="px-5 py-3 text-foreground/70">{order.customerEmail}</td>
                        <td className="px-5 py-3"><StatusBadge status={order.status} /></td>
                        <td className="px-5 py-3 text-right text-foreground/80">{formatPrice(Number(order.total), order.currency)}</td>
                        <td className="px-5 py-3 text-right text-muted-foreground">{timeAgo(order.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* Low Stock Alerts */}
          {stats.lowStockProducts.length > 0 && (
            <section className="rounded-xl border border-warning/20 bg-warning/5">
              <div className="border-b border-warning/10 px-5 py-4">
                <h2 className="text-sm font-semibold text-warning">Low Stock Alert</h2>
                <p className="mt-0.5 text-xs text-warning/60">{stats.lowStockCount} products running low</p>
              </div>
              <div className="divide-y divide-warning/10">
                {stats.lowStockProducts.slice(0, 8).map((p) => (
                  <div key={p.id} className="flex items-center justify-between px-5 py-3">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm text-foreground/80">{p.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {p.sku} · {p.supplier?.name ?? "No supplier"}
                      </p>
                    </div>
                    <span className={`ml-4 shrink-0 rounded-full px-2.5 py-0.5 text-xs font-bold ${
                      (p.inventory?.quantity ?? 0) <= 0
                        ? "bg-destructive/20 text-destructive"
                        : "bg-warning/20 text-warning"
                    }`}>
                      {p.inventory?.quantity ?? 0} left
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Right column — Supplier Sync Panel */}
        <div className="space-y-6">
          {/* Manual Sync Trigger */}
          <section className="rounded-xl border border-border bg-muted/50 p-5">
            <h2 className="text-sm font-semibold text-foreground">Supplier Sync</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Triggers a product sync across all active suppliers
            </p>

            <button
              onClick={triggerSync}
              disabled={syncing}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-black transition-all hover:bg-primary/90 disabled:opacity-50"
            >
              {syncing ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-black border-t-transparent" />
                  Syncing...
                </>
              ) : (
                "Sync Now"
              )}
            </button>

            {syncResult && (
              <div className={`mt-3 rounded-xl px-3 py-2 text-xs ${
                syncResult.status === "success"
                  ? "bg-success/10 text-success"
                  : "bg-destructive/10 text-destructive"
              }`}>
                {syncResult.message}
              </div>
            )}
          </section>

          {/* Supplier Statuses */}
          <section className="rounded-xl border border-border bg-muted/50">
            <div className="border-b border-border px-5 py-4">
              <h2 className="text-sm font-semibold text-foreground">Suppliers</h2>
            </div>
            <div className="divide-y divide-border">
              {stats.supplierStatuses.map((s) => {
                const syncColor = !s.lastSyncAt
                  ? "text-muted-foreground/40"
                  : s.lastSyncStatus === "success"
                    ? "text-success"
                    : s.lastSyncStatus === "partial"
                      ? "text-warning"
                      : "text-destructive";
                return (
                  <div key={s.id} className="px-5 py-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-foreground/80">{s.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {s._count.products} products · {s.code}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`h-1.5 w-1.5 rounded-full ${syncColor}`} />
                        <span className="text-xs text-muted-foreground">
                          {s.lastSyncAt ? timeAgo(s.lastSyncAt) : "never"}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
              {stats.supplierStatuses.length === 0 && (
                <div className="px-5 py-8 text-center text-sm text-muted-foreground">No active suppliers</div>
              )}
            </div>
          </section>

          {/* Last Sync Logs */}
          <section className="rounded-xl border border-border bg-muted/50">
            <div className="border-b border-border px-5 py-4">
              <h2 className="text-sm font-semibold text-foreground">Recent Sync Logs</h2>
            </div>
            <div className="divide-y divide-border">
              {stats.lastSyncLogs.slice(0, 8).map((log) => (
                <div key={log.id} className="px-5 py-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`h-1.5 w-1.5 rounded-full ${
                        log.status === "success"
                          ? "bg-success"
                          : log.status === "partial"
                            ? "bg-warning"
                            : "bg-destructive"
                      }`} />
                      <span className="text-xs text-muted-foreground">{log.supplier.name}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{timeAgo(log.createdAt)}</span>
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    {log.status} · {log.responseTimeMs ? `${log.responseTimeMs}ms` : "—"}
                    {log.metadata && typeof log.metadata === "object" && "created" in log.metadata && (
                      <span> · {String(log.metadata.created)} created · {String(log.metadata.updated)} updated</span>
                    )}
                  </div>
                </div>
              ))}
              {stats.lastSyncLogs.length === 0 && (
                <div className="px-5 py-8 text-center text-sm text-muted-foreground">No sync logs yet</div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
