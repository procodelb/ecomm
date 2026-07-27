"use client";

import { useEffect, useState, useCallback } from "react";
import { CsvExport } from "@/components/admin/csv-export";
import { Pagination } from "@/components/admin/pagination";

interface InvItem {
  id: string; quantity: number; reserved: number; lowStockThreshold: number;
  warehouse: string; locationCode: string | null; updatedAt: string;
  product: { id: string; sku: string; title: string; status: string; images: unknown };
  supplier: { id: string; name: string; code: string };
  variant: { id: string; sku: string; title: string; attributes: unknown } | null;
}

export default function InventoryPage() {
  const [data, setData] = useState<InvItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [search, setSearch] = useState("");
  const [lowStock, setLowStock] = useState(false);
  const [outOfStock, setOutOfStock] = useState(false);
  const [warehouse, setWarehouse] = useState("");
  const [warehouses, setWarehouses] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: "50" });
    if (search) params.set("search", search);
    if (lowStock) params.set("lowStock", "true");
    if (outOfStock) params.set("outOfStock", "true");
    if (warehouse) params.set("warehouse", warehouse);
    const res = await fetch(`/api/admin/inventory?${params}`);
    const json = await res.json();
    setData(json.items); setTotal(json.total); setPages(json.pages);
    setWarehouses(json.warehouses ?? []);
    setLoading(false);
  }, [page, search, lowStock, outOfStock, warehouse]);

  // eslint-disable-next-line react-hooks/set-state-in-effect -- Data fetching: setState inside effect for async data load
  useEffect(() => { fetchData(); }, [fetchData]);

  const updateQty = async (id: string, quantity: number) => {
    await fetch("/api/admin/inventory", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, quantity }) });
    fetchData();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-foreground">Inventory</h1><p className="mt-1 text-sm text-muted-foreground">{total} records</p></div>
        <CsvExport data={data} filename="inventory" columns={[{ key: "product.sku", label: "SKU" }, { key: "product.title", label: "Product" }, { key: "quantity", label: "Qty" }, { key: "reserved", label: "Reserved" }, { key: "warehouse", label: "Warehouse" }, { key: "supplier.name", label: "Supplier" }]} />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <input placeholder="Search by product..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="flex-1 min-w-[200px] rounded-xl border border-border bg-muted/50 px-4 py-2 text-sm text-foreground placeholder-muted-foreground/40 outline-none focus:border-primary/50" />
        <select value={warehouse} onChange={(e) => { setWarehouse(e.target.value); setPage(1); }}
          className="rounded-xl border border-border bg-muted/50 px-4 py-2 text-sm text-foreground/80 outline-none focus:border-primary/50">
          <option value="">All warehouses</option>
          {warehouses.map((w) => <option key={w} value={w}>{w}</option>)}
        </select>
        <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer"><input type="checkbox" checked={lowStock} onChange={(e) => { setLowStock(e.target.checked); setPage(1); }} className="rounded border-white/20 bg-muted/50" /> Low Stock (≤5)</label>
        <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer"><input type="checkbox" checked={outOfStock} onChange={(e) => { setOutOfStock(e.target.checked); setPage(1); }} className="rounded border-white/20 bg-muted/50" /> Out of Stock</label>
      </div>

      <div className="rounded-xl border border-border bg-muted/50">
        {loading ? (
          <div className="flex h-48 items-center justify-center"><div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                    <tr className="border-b border-border text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    <th className="px-5 py-3">Product</th>
                    <th className="px-5 py-3">SKU</th>
                    <th className="px-5 py-3">Supplier</th>
                    <th className="px-5 py-3 text-right">On Hand</th>
                    <th className="px-5 py-3 text-right">Reserved</th>
                    <th className="px-5 py-3 text-right">Available</th>
                    <th className="px-5 py-3">Warehouse</th>
                    <th className="px-5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((item) => {
                    const available = item.quantity - item.reserved;
                    const isLow = item.quantity <= item.lowStockThreshold;
                    return (
                      <tr key={item.id} className={`border-b border-border last:border-0 hover:bg-muted/10 ${isLow ? "bg-warning/[0.03]" : ""}`}>
                        <td className="px-5 py-3 text-foreground/80">{item.product.title}</td>
                        <td className="px-5 py-3 font-mono text-xs text-muted-foreground">{item.product.sku}</td>
                        <td className="px-5 py-3 text-xs text-muted-foreground">{item.supplier.name}</td>
                        <td className={`px-5 py-3 text-right font-mono ${item.quantity <= 0 ? "text-destructive" : isLow ? "text-warning" : "text-foreground/70"}`}>{item.quantity}</td>
                        <td className="px-5 py-3 text-right text-muted-foreground">{item.reserved}</td>
                        <td className={`px-5 py-3 text-right font-mono ${available <= 0 ? "text-destructive" : "text-success"}`}>{available}</td>
                        <td className="px-5 py-3 text-xs text-muted-foreground">{item.warehouse}{item.locationCode ? ` / ${item.locationCode}` : ""}</td>
                        <td className="px-5 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button onClick={() => updateQty(item.id, Math.max(0, item.quantity - 1))} className="rounded border border-border px-2 py-0.5 text-xs text-muted-foreground hover:bg-muted/50">−</button>
                            <button onClick={() => updateQty(item.id, item.quantity + 1)} className="rounded border border-border px-2 py-0.5 text-xs text-muted-foreground hover:bg-muted/50">+</button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <Pagination page={page} pages={pages} total={total} onPage={setPage} label="items" />
          </>
        )}
      </div>
    </div>
  );
}
