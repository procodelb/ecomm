"use client";

import { useEffect, useState } from "react";

interface AdminUser {
  id: string; email: string; firstName: string; lastName: string;
  role: string; isActive: boolean; mfaEnabled: boolean;
  lastLoginAt: string | null; createdAt: string;
}

interface SettingsData {
  store: { name: string; locales: string[]; currencies: string[]; defaultLocale: string; defaultCurrency: string };
  counts: { suppliers: number; products: number; orders: number; customers: number };
  adminUsers: AdminUser[];
  env: Record<string, boolean>;
  ai: { enabled: boolean; openaiConfigured: boolean; welcomeMessage: Record<string, string> };
}

export default function SettingsPage() {
  const [data, setData] = useState<SettingsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/admin/settings").then((r) => r.json()).then((d) => { setData(d); setLoading(false); });
  }, []);

  const updateRole = async (adminUserId: string, role: string) => {
    setSaving(true);
    await fetch("/api/admin/settings", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ adminUserId, role }) });
    const updated = await fetch("/api/admin/settings").then((r) => r.json());
    setData(updated);
    setSaving(false);
  };

  const toggleActive = async (adminUserId: string, isActive: boolean) => {
    setSaving(true);
    await fetch("/api/admin/settings", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ adminUserId, isActive: !isActive }) });
    const updated = await fetch("/api/admin/settings").then((r) => r.json());
    setData(updated);
    setSaving(false);
  };

  if (loading) return <div className="flex h-48 items-center justify-center"><div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>;
  if (!data) return <p className="text-sm text-destructive">Failed to load settings</p>;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div><h1 className="text-2xl font-bold text-foreground">Settings</h1></div>

      <section className="rounded-xl border border-border bg-muted/50 p-5">
        <h2 className="mb-4 text-sm font-semibold text-foreground">Store</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div><label className="mb-1 block text-xs text-muted-foreground">Store Name</label><input defaultValue={data.store.name} className="w-full rounded-xl border border-border bg-muted/50 px-3 py-2 text-sm text-foreground outline-none focus:border-primary/50" /></div>
          <div><label className="mb-1 block text-xs text-muted-foreground">Default Locale</label><input defaultValue={data.store.defaultLocale} className="w-full rounded-xl border border-border bg-muted/50 px-3 py-2 text-sm text-foreground outline-none focus:border-primary/50" /></div>
          <div><label className="mb-1 block text-xs text-muted-foreground">Locales</label><input defaultValue={data.store.locales.join(", ")} className="w-full rounded-xl border border-border bg-muted/50 px-3 py-2 text-sm text-foreground outline-none focus:border-primary/50" /></div>
          <div><label className="mb-1 block text-xs text-muted-foreground">Default Currency</label><input defaultValue={data.store.defaultCurrency} className="w-full rounded-xl border border-border bg-muted/50 px-3 py-2 text-sm text-foreground outline-none focus:border-primary/50" /></div>
        </div>
      </section>

      <section className="rounded-xl border border-border bg-muted/50 p-5">
        <h2 className="mb-4 text-sm font-semibold text-foreground">Database Overview</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-lg bg-muted/50 p-3 text-center"><p className="text-2xl font-bold text-foreground">{data.counts.products}</p><p className="text-xs text-muted-foreground">Products</p></div>
          <div className="rounded-lg bg-muted/50 p-3 text-center"><p className="text-2xl font-bold text-foreground">{data.counts.orders}</p><p className="text-xs text-muted-foreground">Orders</p></div>
          <div className="rounded-lg bg-muted/50 p-3 text-center"><p className="text-2xl font-bold text-foreground">{data.counts.customers}</p><p className="text-xs text-muted-foreground">Customers</p></div>
          <div className="rounded-lg bg-muted/50 p-3 text-center"><p className="text-2xl font-bold text-foreground">{data.counts.suppliers}</p><p className="text-xs text-muted-foreground">Suppliers</p></div>
        </div>
      </section>

      <section className="rounded-xl border border-border bg-muted/50 p-5">
        <h2 className="mb-4 text-sm font-semibold text-foreground">Admin Users</h2>
        <div className="divide-y divide-border">
          {data.adminUsers.map((u) => (
            <div key={u.id} className="flex items-center justify-between py-3">
              <div>
                <p className="text-sm text-foreground/80">{u.firstName} {u.lastName}</p>
                <p className="text-xs text-muted-foreground">{u.email} · Joined {new Date(u.createdAt).toLocaleDateString()}</p>
                {u.lastLoginAt && <p className="text-xs text-muted-foreground">Last login: {new Date(u.lastLoginAt).toLocaleString()}</p>}
              </div>
              <div className="flex items-center gap-3">
                <select
                  value={u.role}
                  onChange={(e) => updateRole(u.id, e.target.value)}
                  disabled={saving}
                  className="rounded-xl border border-border bg-muted/50 px-3 py-1.5 text-xs text-foreground/80 outline-none focus:border-primary/50"
                >
                  {["super_admin", "admin", "manager", "support", "analyst"].map((r) => (
                    <option key={r} value={r}>{r.replace(/_/g, " ")}</option>
                  ))}
                </select>
                <button
                  onClick={() => toggleActive(u.id, u.isActive)}
                  disabled={saving}
                  className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${u.isActive ? "bg-success/20 text-success" : "bg-destructive/20 text-destructive"}`}
                >
                  {u.isActive ? "Active" : "Inactive"}
                </button>
                {u.mfaEnabled && <span className="text-xs text-primary">MFA ✓</span>}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-border bg-muted/50 p-5">
        <h2 className="mb-4 text-sm font-semibold text-foreground">AI Assistant</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between rounded-lg bg-muted/50 px-4 py-3">
            <div>
              <span className="text-sm text-foreground/80">AI Assistant</span>
              <p className="text-xs text-muted-foreground mt-0.5">AI-powered chatbot for customer support and product recommendations</p>
            </div>
            <span className={`text-xs font-medium ${data.ai?.enabled ? "text-success" : "text-destructive"}`}>
              {data.ai?.enabled ? "Enabled" : "Disabled"}
            </span>
          </div>
          <div className="flex items-center justify-between rounded-lg bg-muted/50 px-4 py-3">
            <span className="text-sm text-muted-foreground/60">OpenAI</span>
            <span className={`text-xs font-medium ${data.ai?.openaiConfigured ? "text-success" : "text-warning"}`}>
              {data.ai?.openaiConfigured ? "Configured" : "Fallback Mode"}
            </span>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-border bg-muted/50 p-5">
        <h2 className="mb-4 text-sm font-semibold text-foreground">Integrations Status</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {Object.entries(data.env).map(([key, configured]) => (
            <div key={key} className="flex items-center justify-between rounded-lg bg-muted/50 px-4 py-3">
              <span className="text-sm text-muted-foreground/60">{key.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase())}</span>
              <span className={`text-xs font-medium ${configured ? "text-success" : "text-destructive"}`}>
                {configured ? "Configured" : "Not Set"}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
