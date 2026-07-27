"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api/client";

export default function NewSupplierPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    code: "", name: "", companyName: "", contactName: "", contactEmail: "", contactPhone: "",
    website: "", apiUrl: "", country: "China", city: "", address: "",
    shippingMethods: "standard", currencies: "AED", moq: "1",
    leadTimeMin: "", leadTimeMax: "", returnsPolicy: "", notes: "", certification: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const body = {
      ...form,
      moq: parseInt(form.moq) || 1,
      leadTimeMin: form.leadTimeMin ? parseInt(form.leadTimeMin) : undefined,
      leadTimeMax: form.leadTimeMax ? parseInt(form.leadTimeMax) : undefined,
      shippingMethods: form.shippingMethods.split(",").map((s) => s.trim()),
      currencies: form.currencies.split(",").map((c) => c.trim()),
      certification: form.certification ? form.certification.split(",").map((c) => c.trim()) : [],
    };
    const res = await apiFetch<{ id?: string }>("/api/admin/suppliers", { method: "POST", body });
    if (res) router.push("/admin/suppliers");
    setSaving(false);
  };

  const update = (key: string, value: string) => setForm((prev) => ({ ...prev, [key]: value }));

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-2xl font-bold text-foreground">New Supplier</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <section className="rounded-xl border border-border bg-muted/50 p-5">
          <h2 className="mb-4 text-sm font-semibold text-foreground">General</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div><label className="mb-1 block text-xs text-muted-foreground">Code *</label><input value={form.code} onChange={(e) => update("code", e.target.value)} required placeholder="ALIBABA" className="w-full rounded-xl border border-border bg-muted/50 px-3 py-2 text-sm text-foreground outline-none focus:border-primary/50" /></div>
            <div><label className="mb-1 block text-xs text-muted-foreground">Name *</label><input value={form.name} onChange={(e) => update("name", e.target.value)} required className="w-full rounded-xl border border-border bg-muted/50 px-3 py-2 text-sm text-foreground outline-none focus:border-primary/50" /></div>
            <div><label className="mb-1 block text-xs text-muted-foreground">Company Name</label><input value={form.companyName} onChange={(e) => update("companyName", e.target.value)} className="w-full rounded-xl border border-border bg-muted/50 px-3 py-2 text-sm text-foreground outline-none focus:border-primary/50" /></div>
            <div><label className="mb-1 block text-xs text-muted-foreground">Country *</label><input value={form.country} onChange={(e) => update("country", e.target.value)} required className="w-full rounded-xl border border-border bg-muted/50 px-3 py-2 text-sm text-foreground outline-none focus:border-primary/50" /></div>
            <div><label className="mb-1 block text-xs text-muted-foreground">City</label><input value={form.city} onChange={(e) => update("city", e.target.value)} className="w-full rounded-xl border border-border bg-muted/50 px-3 py-2 text-sm text-foreground outline-none focus:border-primary/50" /></div>
            <div><label className="mb-1 block text-xs text-muted-foreground">Website</label><input value={form.website} onChange={(e) => update("website", e.target.value)} className="w-full rounded-xl border border-border bg-muted/50 px-3 py-2 text-sm text-foreground outline-none focus:border-primary/50" /></div>
          </div>
        </section>
        <section className="rounded-xl border border-border bg-muted/50 p-5">
          <h2 className="mb-4 text-sm font-semibold text-foreground">Contact</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div><label className="mb-1 block text-xs text-muted-foreground">Contact Name</label><input value={form.contactName} onChange={(e) => update("contactName", e.target.value)} className="w-full rounded-xl border border-border bg-muted/50 px-3 py-2 text-sm text-foreground outline-none focus:border-primary/50" /></div>
            <div><label className="mb-1 block text-xs text-muted-foreground">Contact Email</label><input type="email" value={form.contactEmail} onChange={(e) => update("contactEmail", e.target.value)} className="w-full rounded-xl border border-border bg-muted/50 px-3 py-2 text-sm text-foreground outline-none focus:border-primary/50" /></div>
            <div><label className="mb-1 block text-xs text-muted-foreground">Contact Phone</label><input value={form.contactPhone} onChange={(e) => update("contactPhone", e.target.value)} className="w-full rounded-xl border border-border bg-muted/50 px-3 py-2 text-sm text-foreground outline-none focus:border-primary/50" /></div>
            <div><label className="mb-1 block text-xs text-muted-foreground">API URL</label><input value={form.apiUrl} onChange={(e) => update("apiUrl", e.target.value)} className="w-full rounded-xl border border-border bg-muted/50 px-3 py-2 text-sm text-foreground outline-none focus:border-primary/50" /></div>
          </div>
        </section>
        <section className="rounded-xl border border-border bg-muted/50 p-5">
          <h2 className="mb-4 text-sm font-semibold text-foreground">Configuration</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div><label className="mb-1 block text-xs text-muted-foreground">Shipping Methods (comma sep)</label><input value={form.shippingMethods} onChange={(e) => update("shippingMethods", e.target.value)} className="w-full rounded-xl border border-border bg-muted/50 px-3 py-2 text-sm text-foreground outline-none focus:border-primary/50" /></div>
            <div><label className="mb-1 block text-xs text-muted-foreground">Currencies (comma sep)</label><input value={form.currencies} onChange={(e) => update("currencies", e.target.value)} className="w-full rounded-xl border border-border bg-muted/50 px-3 py-2 text-sm text-foreground outline-none focus:border-primary/50" /></div>
            <div><label className="mb-1 block text-xs text-muted-foreground">MOQ</label><input type="number" value={form.moq} onChange={(e) => update("moq", e.target.value)} className="w-full rounded-xl border border-border bg-muted/50 px-3 py-2 text-sm text-foreground outline-none focus:border-primary/50" /></div>
            <div><label className="mb-1 block text-xs text-muted-foreground">Lead Time Min (days)</label><input type="number" value={form.leadTimeMin} onChange={(e) => update("leadTimeMin", e.target.value)} className="w-full rounded-xl border border-border bg-muted/50 px-3 py-2 text-sm text-foreground outline-none focus:border-primary/50" /></div>
            <div><label className="mb-1 block text-xs text-muted-foreground">Lead Time Max (days)</label><input type="number" value={form.leadTimeMax} onChange={(e) => update("leadTimeMax", e.target.value)} className="w-full rounded-xl border border-border bg-muted/50 px-3 py-2 text-sm text-foreground outline-none focus:border-primary/50" /></div>
            <div><label className="mb-1 block text-xs text-muted-foreground">Certifications (comma sep)</label><input value={form.certification} onChange={(e) => update("certification", e.target.value)} className="w-full rounded-xl border border-border bg-muted/50 px-3 py-2 text-sm text-foreground outline-none focus:border-primary/50" /></div>
          </div>
          <div className="mt-4"><label className="mb-1 block text-xs text-muted-foreground">Returns Policy</label><textarea value={form.returnsPolicy} onChange={(e) => update("returnsPolicy", e.target.value)} rows={3} className="w-full rounded-xl border border-border bg-muted/50 px-3 py-2 text-sm text-foreground outline-none focus:border-primary/50" /></div>
          <div className="mt-4"><label className="mb-1 block text-xs text-muted-foreground">Notes</label><textarea value={form.notes} onChange={(e) => update("notes", e.target.value)} rows={3} className="w-full rounded-xl border border-border bg-muted/50 px-3 py-2 text-sm text-foreground outline-none focus:border-primary/50" /></div>
        </section>
        <div className="flex justify-end gap-3">
          <button type="button" onClick={() => router.back()} className="rounded-xl border border-border px-6 py-2.5 text-sm text-muted-foreground hover:bg-muted/50">Cancel</button>
          <button type="submit" disabled={saving} className="rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-black disabled:opacity-50">{saving ? "Saving..." : "Create Supplier"}</button>
        </div>
      </form>
    </div>
  );
}
