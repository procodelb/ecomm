"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api/client";

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<Record<string, string | boolean>>({});

  useEffect(() => {
    fetch(`/api/admin/products/${params.id}`).then((r) => r.json()).then((p) => {
      setForm({
        sku: p.sku, title: p.title, slug: p.slug, description: p.description ?? "", category: p.category ?? "",
        priceAed: String(p.priceAed), priceAud: String(p.priceAud),
        comparePriceAed: p.comparePriceAed ? String(p.comparePriceAed) : "",
        comparePriceAud: p.comparePriceAud ? String(p.comparePriceAud) : "",
        status: p.status, featured: p.featured, taxable: p.taxable, trackQuantity: p.trackQuantity,
        weightKg: p.weightKg ? String(p.weightKg) : "", countryOfOrigin: p.countryOfOrigin ?? "", hsCode: p.hsCode ?? "",
        tags: (p.tags ?? []).join(", "),
      });
      setLoading(false);
    });
  }, [params.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const body = {
      ...form,
      priceAed: parseFloat(form.priceAed as string) || 0,
      priceAud: parseFloat(form.priceAud as string) || 0,
      comparePriceAed: form.comparePriceAed ? parseFloat(form.comparePriceAed as string) : null,
      comparePriceAud: form.comparePriceAud ? parseFloat(form.comparePriceAud as string) : null,
      weightKg: form.weightKg ? parseFloat(form.weightKg as string) : null,
      tags: (form.tags as string).split(",").map((t: string) => t.trim()).filter(Boolean),
    };
    await apiFetch(`/api/admin/products/${params.id}`, { method: "PATCH", body });
    setSaving(false);
    router.push("/admin/products");
  };

  const update = (key: string, value: string | boolean) => setForm((prev) => ({ ...prev, [key]: value }));

  if (loading) return <div className="flex h-48 items-center justify-center"><div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Edit Product</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <section className="rounded-xl border border-border bg-muted/50 p-5">
          <h2 className="mb-4 text-sm font-semibold text-foreground">Basic Info</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div><label className="mb-1 block text-xs text-muted-foreground">Title *</label><input value={form.title as string} onChange={(e) => update("title", e.target.value)} required className="w-full rounded-xl border border-border bg-muted/50 px-3 py-2 text-sm text-foreground outline-none focus:border-primary/50" /></div>
            <div><label className="mb-1 block text-xs text-muted-foreground">SKU *</label><input value={form.sku as string} onChange={(e) => update("sku", e.target.value)} required className="w-full rounded-xl border border-border bg-muted/50 px-3 py-2 text-sm text-foreground outline-none focus:border-primary/50" /></div>
            <div><label className="mb-1 block text-xs text-muted-foreground">Slug</label><input value={form.slug as string} onChange={(e) => update("slug", e.target.value)} className="w-full rounded-xl border border-border bg-muted/50 px-3 py-2 text-sm text-foreground outline-none focus:border-primary/50" /></div>
            <div><label className="mb-1 block text-xs text-muted-foreground">Category</label><input value={form.category as string} onChange={(e) => update("category", e.target.value)} className="w-full rounded-xl border border-border bg-muted/50 px-3 py-2 text-sm text-foreground outline-none focus:border-primary/50" /></div>
            <div><label className="mb-1 block text-xs text-muted-foreground">Status</label><select value={form.status as string} onChange={(e) => update("status", e.target.value)} className="w-full rounded-xl border border-border bg-muted/50 px-3 py-2 text-sm text-foreground outline-none focus:border-primary/50">{["draft", "active", "discontinued", "out_of_stock", "coming_soon"].map((s) => <option key={s} value={s}>{s.replace(/_/g, " ")}</option>)}</select></div>
          </div>
          <div className="mt-4"><label className="mb-1 block text-xs text-muted-foreground">Description</label><textarea value={form.description as string} onChange={(e) => update("description", e.target.value)} rows={3} className="w-full rounded-xl border border-border bg-muted/50 px-3 py-2 text-sm text-foreground outline-none focus:border-primary/50" /></div>
          <div className="mt-4"><label className="mb-1 block text-xs text-muted-foreground">Tags (comma separated)</label><input value={form.tags as string} onChange={(e) => update("tags", e.target.value)} className="w-full rounded-xl border border-border bg-muted/50 px-3 py-2 text-sm text-foreground outline-none focus:border-primary/50" /></div>
        </section>
        <section className="rounded-xl border border-border bg-muted/50 p-5">
          <h2 className="mb-4 text-sm font-semibold text-foreground">Pricing</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div><label className="mb-1 block text-xs text-muted-foreground">Price AED *</label><input type="number" step="0.01" value={form.priceAed as string} onChange={(e) => update("priceAed", e.target.value)} required className="w-full rounded-xl border border-border bg-muted/50 px-3 py-2 text-sm text-foreground outline-none focus:border-primary/50" /></div>
            <div><label className="mb-1 block text-xs text-muted-foreground">Price AUD</label><input type="number" step="0.01" value={form.priceAud as string} onChange={(e) => update("priceAud", e.target.value)} className="w-full rounded-xl border border-border bg-muted/50 px-3 py-2 text-sm text-foreground outline-none focus:border-primary/50" /></div>
            <div><label className="mb-1 block text-xs text-muted-foreground">Compare Price AED</label><input type="number" step="0.01" value={form.comparePriceAed as string} onChange={(e) => update("comparePriceAed", e.target.value)} className="w-full rounded-xl border border-border bg-muted/50 px-3 py-2 text-sm text-foreground outline-none focus:border-primary/50" /></div>
            <div><label className="mb-1 block text-xs text-muted-foreground">Compare Price AUD</label><input type="number" step="0.01" value={form.comparePriceAud as string} onChange={(e) => update("comparePriceAud", e.target.value)} className="w-full rounded-xl border border-border bg-muted/50 px-3 py-2 text-sm text-foreground outline-none focus:border-primary/50" /></div>
          </div>
        </section>
        <section className="rounded-xl border border-border bg-muted/50 p-5">
          <h2 className="mb-4 text-sm font-semibold text-foreground">Shipping & Flags</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div><label className="mb-1 block text-xs text-muted-foreground">Weight (kg)</label><input type="number" step="0.01" value={form.weightKg as string} onChange={(e) => update("weightKg", e.target.value)} className="w-full rounded-xl border border-border bg-muted/50 px-3 py-2 text-sm text-foreground outline-none focus:border-primary/50" /></div>
            <div><label className="mb-1 block text-xs text-muted-foreground">Country of Origin</label><input value={form.countryOfOrigin as string} onChange={(e) => update("countryOfOrigin", e.target.value)} className="w-full rounded-xl border border-border bg-muted/50 px-3 py-2 text-sm text-foreground outline-none focus:border-primary/50" /></div>
            <div className="flex items-end gap-6 pb-2">
              <label className="flex items-center gap-2"><input type="checkbox" checked={form.featured as boolean} onChange={(e) => update("featured", e.target.checked)} className="rounded border-white/20 bg-muted/50" /><span className="text-xs text-muted-foreground">Featured</span></label>
              <label className="flex items-center gap-2"><input type="checkbox" checked={form.taxable as boolean} onChange={(e) => update("taxable", e.target.checked)} className="rounded border-white/20 bg-muted/50" /><span className="text-xs text-muted-foreground">Taxable</span></label>
              <label className="flex items-center gap-2"><input type="checkbox" checked={form.trackQuantity as boolean} onChange={(e) => update("trackQuantity", e.target.checked)} className="rounded border-white/20 bg-muted/50" /><span className="text-xs text-muted-foreground">Track Qty</span></label>
            </div>
          </div>
        </section>
        <div className="flex justify-end gap-3">
          <button type="button" onClick={() => router.back()} className="rounded-xl border border-border px-6 py-2.5 text-sm text-muted-foreground hover:bg-muted/50">Cancel</button>
          <button type="submit" disabled={saving} className="rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-black transition-colors hover:bg-primary/90 disabled:opacity-50">{saving ? "Saving..." : "Save Changes"}</button>
        </div>
      </form>
    </div>
  );
}
