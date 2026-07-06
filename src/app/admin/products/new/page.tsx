"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Supplier { id: string; code: string; name: string; }

export default function NewProductPage() {
  const router = useRouter();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    supplierId: "", sku: "", title: "", slug: "", description: "", category: "",
    priceAed: "", priceAud: "", comparePriceAed: "", comparePriceAud: "",
    status: "draft", featured: false, taxable: true, trackQuantity: true,
    weightKg: "", countryOfOrigin: "", hsCode: "", tags: "",
  });

  useEffect(() => {
    fetch("/api/admin/suppliers?limit=200").then((r) => r.json()).then((d) => setSuppliers(d.suppliers));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const body = {
      ...form,
      supplierId: form.supplierId || undefined,
      priceAed: form.priceAed ? parseFloat(form.priceAed) : 0,
      priceAud: form.priceAud ? parseFloat(form.priceAud) : 0,
      comparePriceAed: form.comparePriceAed ? parseFloat(form.comparePriceAed) : undefined,
      comparePriceAud: form.comparePriceAud ? parseFloat(form.comparePriceAud) : undefined,
      weightKg: form.weightKg ? parseFloat(form.weightKg) : undefined,
      tags: form.tags ? form.tags.split(",").map((t: string) => t.trim()).filter(Boolean) : [],
      slug: form.slug || form.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
    };
    const res = await fetch("/api/admin/products", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    if (res.ok) {
      const product = await res.json();
      router.push(`/admin/products/${product.id}`);
    }
    setSaving(false);
  };

  const update = (key: string, value: string | boolean) => setForm((prev) => ({ ...prev, [key]: value }));

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-2xl font-bold text-foreground">New Product</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <section className="rounded-xl border border-border bg-muted/50 p-5">
          <h2 className="mb-4 text-sm font-semibold text-foreground">Basic Info</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div><label className="mb-1 block text-xs text-muted-foreground">Title *</label><input value={form.title} onChange={(e) => update("title", e.target.value)} required className="w-full rounded-xl border border-border bg-muted/50 px-3 py-2 text-sm text-foreground outline-none focus:border-primary/50" /></div>
            <div><label className="mb-1 block text-xs text-muted-foreground">SKU *</label><input value={form.sku} onChange={(e) => update("sku", e.target.value)} required className="w-full rounded-xl border border-border bg-muted/50 px-3 py-2 text-sm text-foreground outline-none focus:border-primary/50" /></div>
            <div><label className="mb-1 block text-xs text-muted-foreground">Slug</label><input value={form.slug} onChange={(e) => update("slug", e.target.value)} className="w-full rounded-xl border border-border bg-muted/50 px-3 py-2 text-sm text-foreground outline-none focus:border-primary/50" /></div>
            <div><label className="mb-1 block text-xs text-muted-foreground">Category</label><input value={form.category} onChange={(e) => update("category", e.target.value)} className="w-full rounded-xl border border-border bg-muted/50 px-3 py-2 text-sm text-foreground outline-none focus:border-primary/50" /></div>
            <div><label className="mb-1 block text-xs text-muted-foreground">Supplier *</label><select value={form.supplierId} onChange={(e) => update("supplierId", e.target.value)} required className="w-full rounded-xl border border-border bg-muted/50 px-3 py-2 text-sm text-foreground outline-none focus:border-primary/50">{suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
            <div><label className="mb-1 block text-xs text-muted-foreground">Status</label><select value={form.status} onChange={(e) => update("status", e.target.value)} className="w-full rounded-xl border border-border bg-muted/50 px-3 py-2 text-sm text-foreground outline-none focus:border-primary/50">{["draft", "active", "discontinued", "out_of_stock", "coming_soon"].map((s) => <option key={s} value={s}>{s.replace(/_/g, " ")}</option>)}</select></div>
          </div>
          <div className="mt-4"><label className="mb-1 block text-xs text-muted-foreground">Description</label><textarea value={form.description} onChange={(e) => update("description", e.target.value)} rows={3} className="w-full rounded-xl border border-border bg-muted/50 px-3 py-2 text-sm text-foreground outline-none focus:border-primary/50" /></div>
          <div className="mt-4"><label className="mb-1 block text-xs text-muted-foreground">Tags (comma separated)</label><input value={form.tags} onChange={(e) => update("tags", e.target.value)} className="w-full rounded-xl border border-border bg-muted/50 px-3 py-2 text-sm text-foreground outline-none focus:border-primary/50" /></div>
        </section>

        <section className="rounded-xl border border-border bg-muted/50 p-5">
          <h2 className="mb-4 text-sm font-semibold text-foreground">Pricing</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div><label className="mb-1 block text-xs text-muted-foreground">Price AED *</label><input type="number" step="0.01" value={form.priceAed} onChange={(e) => update("priceAed", e.target.value)} required className="w-full rounded-xl border border-border bg-muted/50 px-3 py-2 text-sm text-foreground outline-none focus:border-primary/50" /></div>
            <div><label className="mb-1 block text-xs text-muted-foreground">Price AUD</label><input type="number" step="0.01" value={form.priceAud} onChange={(e) => update("priceAud", e.target.value)} className="w-full rounded-xl border border-border bg-muted/50 px-3 py-2 text-sm text-foreground outline-none focus:border-primary/50" /></div>
            <div><label className="mb-1 block text-xs text-muted-foreground">Compare Price AED</label><input type="number" step="0.01" value={form.comparePriceAed} onChange={(e) => update("comparePriceAed", e.target.value)} className="w-full rounded-xl border border-border bg-muted/50 px-3 py-2 text-sm text-foreground outline-none focus:border-primary/50" /></div>
            <div><label className="mb-1 block text-xs text-muted-foreground">Compare Price AUD</label><input type="number" step="0.01" value={form.comparePriceAud} onChange={(e) => update("comparePriceAud", e.target.value)} className="w-full rounded-xl border border-border bg-muted/50 px-3 py-2 text-sm text-foreground outline-none focus:border-primary/50" /></div>
          </div>
        </section>

        <section className="rounded-xl border border-border bg-muted/50 p-5">
          <h2 className="mb-4 text-sm font-semibold text-foreground">Shipping & Flags</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div><label className="mb-1 block text-xs text-muted-foreground">Weight (kg)</label><input type="number" step="0.01" value={form.weightKg} onChange={(e) => update("weightKg", e.target.value)} className="w-full rounded-xl border border-border bg-muted/50 px-3 py-2 text-sm text-foreground outline-none focus:border-primary/50" /></div>
            <div><label className="mb-1 block text-xs text-muted-foreground">Country of Origin</label><input value={form.countryOfOrigin} onChange={(e) => update("countryOfOrigin", e.target.value)} className="w-full rounded-xl border border-border bg-muted/50 px-3 py-2 text-sm text-foreground outline-none focus:border-primary/50" /></div>
            <div><label className="mb-1 block text-xs text-muted-foreground">HS Code</label><input value={form.hsCode} onChange={(e) => update("hsCode", e.target.value)} className="w-full rounded-xl border border-border bg-muted/50 px-3 py-2 text-sm text-foreground outline-none focus:border-primary/50" /></div>
            <div className="flex items-end gap-6 pb-2">
              <label className="flex items-center gap-2"><input type="checkbox" checked={form.featured} onChange={(e) => update("featured", e.target.checked)} className="rounded border-white/20 bg-muted/50" /><span className="text-xs text-muted-foreground">Featured</span></label>
              <label className="flex items-center gap-2"><input type="checkbox" checked={form.taxable} onChange={(e) => update("taxable", e.target.checked)} className="rounded border-white/20 bg-muted/50" /><span className="text-xs text-muted-foreground">Taxable</span></label>
              <label className="flex items-center gap-2"><input type="checkbox" checked={form.trackQuantity} onChange={(e) => update("trackQuantity", e.target.checked)} className="rounded border-white/20 bg-muted/50" /><span className="text-xs text-muted-foreground">Track Qty</span></label>
            </div>
          </div>
        </section>

        <div className="flex justify-end gap-3">
          <button type="button" onClick={() => router.back()} className="rounded-xl border border-border px-6 py-2.5 text-sm text-muted-foreground hover:bg-muted/50">Cancel</button>
          <button type="submit" disabled={saving} className="rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-black transition-colors hover:bg-primary/90 disabled:opacity-50">{saving ? "Saving..." : "Create Product"}</button>
        </div>
      </form>
    </div>
  );
}
