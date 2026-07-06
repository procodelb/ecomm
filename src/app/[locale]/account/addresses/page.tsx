"use client";

import { useEffect, useState } from "react";

type Address = {
  line1: string; line2: string; city: string; state: string;
  postalCode: string; country: string; label: string;
};

export default function AccountAddresses() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [defaultAddress, setDefaultAddress] = useState<Address | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [form, setForm] = useState<Address>({ line1: "", line2: "", city: "", state: "", postalCode: "", country: "", label: "" });

  const fetchAddresses = () => {
    fetch("/api/account/addresses")
      .then((r) => r.json())
      .then((data) => { setAddresses(data.addresses || []); setDefaultAddress(data.defaultAddress || null); setLoading(false); });
  };

  useEffect(() => { fetchAddresses(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingIndex !== null) {
      await fetch(`/api/account/addresses/${editingIndex}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form),
      });
    } else {
      await fetch("/api/account/addresses", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form),
      });
    }
    setShowForm(false);
    setEditingIndex(null);
    setForm({ line1: "", line2: "", city: "", state: "", postalCode: "", country: "", label: "" });
    fetchAddresses();
  };

  const handleDelete = async (index: number) => {
    await fetch(`/api/account/addresses/${index}`, { method: "DELETE" });
    fetchAddresses();
  };

  const startEdit = (addr: Address, index: number) => {
    setForm(addr); setEditingIndex(index); setShowForm(true);
  };

  if (loading) return <div className="flex items-center justify-center py-24"><div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">Addresses</h1>
        <button onClick={() => { setShowForm(true); setEditingIndex(null); setForm({ line1: "", line2: "", city: "", state: "", postalCode: "", country: "", label: "" }); }} className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-black hover:bg-primary/90 transition-colors">
          + Add Address
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 rounded-xl border border-border bg-card p-6 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Label (e.g. Home)</label>
              <input value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} className="w-full rounded-lg border border-border bg-muted/50 px-3 py-2 text-sm text-foreground placeholder-muted-foreground/40 outline-none focus:border-primary" placeholder="Home" />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Country *</label>
              <input value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} required className="w-full rounded-lg border border-border bg-muted/50 px-3 py-2 text-sm text-foreground placeholder-muted-foreground/40 outline-none focus:border-primary" placeholder="United Arab Emirates" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-muted-foreground mb-1">Address Line 1 *</label>
              <input value={form.line1} onChange={(e) => setForm({ ...form, line1: e.target.value })} required className="w-full rounded-lg border border-border bg-muted/50 px-3 py-2 text-sm text-foreground placeholder-muted-foreground/40 outline-none focus:border-primary" placeholder="123 Main St" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-muted-foreground mb-1">Address Line 2</label>
              <input value={form.line2} onChange={(e) => setForm({ ...form, line2: e.target.value })} className="w-full rounded-lg border border-border bg-muted/50 px-3 py-2 text-sm text-foreground placeholder-muted-foreground/40 outline-none focus:border-primary" placeholder="Apt 4B" />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">City *</label>
              <input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} required className="w-full rounded-lg border border-border bg-muted/50 px-3 py-2 text-sm text-foreground placeholder-muted-foreground/40 outline-none focus:border-primary" placeholder="Dubai" />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">State</label>
              <input value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} className="w-full rounded-lg border border-border bg-muted/50 px-3 py-2 text-sm text-foreground placeholder-muted-foreground/40 outline-none focus:border-primary" placeholder="Dubai" />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Postal Code</label>
              <input value={form.postalCode} onChange={(e) => setForm({ ...form, postalCode: e.target.value })} className="w-full rounded-lg border border-border bg-muted/50 px-3 py-2 text-sm text-foreground placeholder-muted-foreground/40 outline-none focus:border-primary" placeholder="00000" />
            </div>
          </div>
          <div className="flex items-center gap-3 pt-2">
            <button type="submit" className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-black hover:bg-primary/90 transition-colors">
              {editingIndex !== null ? "Update Address" : "Save Address"}
            </button>
            <button type="button" onClick={() => { setShowForm(false); setEditingIndex(null); }} className="text-sm text-muted-foreground hover:text-foreground/60 transition-colors">
              Cancel
            </button>
          </div>
        </form>
      )}

      {addresses.length === 0 && !showForm ? (
        <div className="rounded-xl border border-border p-12 text-center">
          <p className="text-muted-foreground text-sm">No saved addresses</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {addresses.map((addr, i) => (
            <div key={i} className={`rounded-xl border p-5 ${defaultAddress === addr ? "border-primary/30 bg-primary/5" : "border-border bg-card"}`}>
              <div className="flex items-start justify-between mb-2">
                <div>
                  <span className="text-xs font-medium text-muted-foreground uppercase">{addr.label || "Address"}</span>
                  {defaultAddress === addr && <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">Default</span>}
                </div>
              </div>
              <div className="text-sm text-foreground/70 space-y-0.5">
                <p>{addr.line1}</p>
                {addr.line2 && <p>{addr.line2}</p>}
                <p>{[addr.city, addr.state, addr.postalCode].filter(Boolean).join(", ")}</p>
                <p>{addr.country}</p>
              </div>
              <div className="mt-3 flex items-center gap-3 text-xs">
                <button onClick={() => startEdit(addr, i)} className="text-primary hover:underline">Edit</button>
                <button onClick={() => handleDelete(i)} className="text-destructive hover:underline">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
