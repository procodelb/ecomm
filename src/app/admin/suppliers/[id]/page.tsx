"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { CsvExport } from "@/components/admin/csv-export";

interface SupplierDetail {
  id: string; code: string; name: string; status: string; country: string; city: string | null;
  contactName: string | null; contactEmail: string | null; contactPhone: string | null;
  website: string | null; apiUrl: string | null; companyName: string | null;
  shippingMethods: string[]; currencies: string[]; moq: number;
  leadTimeMin: number | null; leadTimeMax: number | null;
  returnsPolicy: string | null; notes: string | null; certification: string[];
  lastSyncAt: string | null; lastSyncStatus: string | null; lastSyncSummary: unknown;
  createdAt: string; updatedAt: string;
  _count: { products: number; inventory: number; supplierLogs: number };
  supplierLogs: Array<{ id: string; eventType: string; status: string; createdAt: string; responseTimeMs: number | null; metadata: Record<string, unknown> }>;
}

export default function SupplierDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [supplier, setSupplier] = useState<SupplierDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<Record<string, string>>({});

  useEffect(() => {
    fetch(`/api/admin/suppliers/${params.id}`).then((r) => r.json()).then((s) => {
      setSupplier(s);
      setForm({
        name: s.name, status: s.status, country: s.country, city: s.city ?? "",
        contactName: s.contactName ?? "", contactEmail: s.contactEmail ?? "", contactPhone: s.contactPhone ?? "",
        website: s.website ?? "", apiUrl: s.apiUrl ?? "", notes: s.notes ?? "",
      });
      setLoading(false);
    });
  }, [params.id]);

  const handleSave = async () => {
    setSaving(true);
    await fetch(`/api/admin/suppliers/${params.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    const updated = await fetch(`/api/admin/suppliers/${params.id}`).then((r) => r.json());
    setSupplier(updated);
    setSaving(false);
  };

  if (loading) return <div className="flex h-48 items-center justify-center"><div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>;
  if (!supplier) return <p className="text-sm text-destructive">Supplier not found</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-foreground">{supplier.name}</h1><p className="mt-1 text-sm text-muted-foreground">Code: {supplier.code} · {supplier._count.products} products · {supplier._count.supplierLogs} syncs</p></div>
        <button onClick={() => router.push("/admin/suppliers")} className="rounded-xl border border-border px-4 py-2 text-sm text-muted-foreground hover:bg-muted/50">Back</button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-border bg-muted/50 p-5">
          <h2 className="mb-4 text-sm font-semibold text-foreground">Edit Details</h2>
          <div className="space-y-3">
            <div><label className="mb-1 block text-xs text-muted-foreground">Name</label><input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} className="w-full rounded-xl border border-border bg-muted/50 px-3 py-2 text-sm text-foreground outline-none focus:border-primary/50" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="mb-1 block text-xs text-muted-foreground">Status</label><select value={form.status} onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))} className="w-full rounded-xl border border-border bg-muted/50 px-3 py-2 text-sm text-foreground outline-none focus:border-primary/50">{["active", "inactive", "suspended", "pending_review"].map((s) => <option key={s} value={s}>{s.replace(/_/g, " ")}</option>)}</select></div>
              <div><label className="mb-1 block text-xs text-muted-foreground">Country</label><input value={form.country} onChange={(e) => setForm((p) => ({ ...p, country: e.target.value }))} className="w-full rounded-xl border border-border bg-muted/50 px-3 py-2 text-sm text-foreground outline-none focus:border-primary/50" /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="mb-1 block text-xs text-muted-foreground">Contact Name</label><input value={form.contactName} onChange={(e) => setForm((p) => ({ ...p, contactName: e.target.value }))} className="w-full rounded-xl border border-border bg-muted/50 px-3 py-2 text-sm text-foreground outline-none focus:border-primary/50" /></div>
              <div><label className="mb-1 block text-xs text-muted-foreground">Contact Email</label><input value={form.contactEmail} onChange={(e) => setForm((p) => ({ ...p, contactEmail: e.target.value }))} className="w-full rounded-xl border border-border bg-muted/50 px-3 py-2 text-sm text-foreground outline-none focus:border-primary/50" /></div>
            </div>
            <div><label className="mb-1 block text-xs text-muted-foreground">Notes</label><textarea value={form.notes} onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))} rows={3} className="w-full rounded-xl border border-border bg-muted/50 px-3 py-2 text-sm text-foreground outline-none focus:border-primary/50" /></div>
            <button onClick={handleSave} disabled={saving} className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-black disabled:opacity-50">{saving ? "Saving..." : "Save Changes"}</button>
          </div>
        </section>

        <section className="rounded-xl border border-border bg-muted/50 p-5">
          <h2 className="mb-3 text-sm font-semibold text-foreground">Sync Status</h2>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between"><span className="text-muted-foreground">Last Sync</span><span className="text-foreground/70">{supplier.lastSyncAt ? new Date(supplier.lastSyncAt).toLocaleString() : "Never"}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Status</span><span className={`capitalize ${supplier.lastSyncStatus === "success" ? "text-success" : "text-warning"}`}>{supplier.lastSyncStatus ?? "—"}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Products</span><span className="text-foreground/70">{supplier._count.products}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">API URL</span><span className="font-mono text-muted-foreground/70">{supplier.apiUrl ?? "—"}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">MOQ</span><span className="text-foreground/70">{supplier.moq}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Lead Time</span><span className="text-foreground/70">{supplier.leadTimeMin && supplier.leadTimeMax ? `${supplier.leadTimeMin}-${supplier.leadTimeMax} days` : "—"}</span></div>
          </div>
        </section>
      </div>

      <section className="rounded-xl border border-border bg-muted/50">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="text-sm font-semibold text-foreground">Sync Logs</h2>
          <CsvExport data={supplier.supplierLogs} filename={`${supplier.code}-sync-logs`} columns={[{ key: "eventType", label: "Event" }, { key: "status", label: "Status" }, { key: "createdAt", label: "Date" }, { key: "responseTimeMs", label: "Duration" }]} />
        </div>
        <div className="divide-y divide-border">
          {supplier.supplierLogs.map((log) => (
            <div key={log.id} className="flex items-center justify-between px-5 py-3">
              <div className="flex items-center gap-3">
                <span className={`h-2 w-2 rounded-full ${log.status === "success" ? "bg-success" : log.status === "partial" ? "bg-warning" : "bg-destructive"}`} />
                <span className="text-xs text-muted-foreground capitalize">{log.eventType.replace(/_/g, " ")}</span>
              </div>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="capitalize">{log.status}</span>
                {log.responseTimeMs != null && <span>{log.responseTimeMs}ms</span>}
                <span>{new Date(log.createdAt).toLocaleString()}</span>
              </div>
            </div>
          ))}
          {supplier.supplierLogs.length === 0 && <div className="px-5 py-8 text-center text-sm text-muted-foreground">No sync logs yet</div>}
        </div>
      </section>
    </div>
  );
}
