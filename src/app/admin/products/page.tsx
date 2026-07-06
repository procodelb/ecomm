"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { CsvExport } from "@/components/admin/csv-export";
import { Pagination } from "@/components/admin/pagination";

interface Product {
  id: string; sku: string; title: string; status: string; priceAed: number;
  featured: boolean; createdAt: string; category: string | null;
  supplier: { id: string; name: string; code: string };
  _count: { variants: number; inventory: number; reviews: number };
}

const STATUS_OPTIONS = ["", "draft", "active", "discontinued", "out_of_stock", "coming_soon"];

export default function ProductsPage() {
  const [data, setData] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [sort, setSort] = useState("createdAt");
  const [dir, setDir] = useState("desc");
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: "50", sort, dir });
    if (status) params.set("status", status);
    if (search) params.set("search", search);
    const res = await fetch(`/api/admin/products?${params}`);
    const json = await res.json();
    setData(json.products); setTotal(json.total); setPages(json.pages);
    setLoading(false);
  }, [page, search, status, sort, dir]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSort = (key: string) => {
    if (sort === key) setDir(dir === "asc" ? "desc" : "asc");
    else { setSort(key); setDir("desc"); }
  };

  const toggleFeatured = async (id: string, current: boolean) => {
    await fetch(`/api/admin/products/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ featured: !current }) });
    fetchData();
  };

  const deleteProduct = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
    fetchData();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-foreground">Products</h1><p className="mt-1 text-sm text-muted-foreground">{total} total</p></div>
        <div className="flex gap-2">
          <CsvExport data={data} filename="products" columns={[{ key: "sku", label: "SKU" }, { key: "title", label: "Title" }, { key: "status", label: "Status" }, { key: "priceAed", label: "Price AED" }, { key: "category", label: "Category" }, { key: "supplier.name", label: "Supplier" }, { key: "createdAt", label: "Created" }]} />
          <Link href="/admin/products/new" className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-black transition-colors hover:bg-primary/90">+ New</Link>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <input placeholder="Search products..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="flex-1 min-w-[200px] rounded-xl border border-border bg-muted/50 px-4 py-2 text-sm text-foreground placeholder-muted-foreground/40 outline-none focus:border-primary/50" />
        <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          className="rounded-xl border border-border bg-muted/50 px-4 py-2 text-sm text-foreground/80 outline-none focus:border-primary/50">
          {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s ? s.replace(/_/g, " ") : "All statuses"}</option>)}
        </select>
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
                    <th className="px-5 py-3 cursor-pointer select-none hover:text-foreground/50" onClick={() => handleSort("sku")}>SKU</th>
                    <th className="px-5 py-3 cursor-pointer select-none hover:text-foreground/50" onClick={() => handleSort("title")}>Title</th>
                    <th className="px-5 py-3 cursor-pointer select-none hover:text-foreground/50" onClick={() => handleSort("status")}>Status</th>
                    <th className="px-5 py-3 cursor-pointer select-none hover:text-foreground/50 text-right" onClick={() => handleSort("priceAed")}>Price AED</th>
                    <th className="px-5 py-3">Supplier</th>
                    <th className="px-5 py-3 text-center">Featured</th>
                    <th className="px-5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((p) => (
                    <tr key={p.id} className="border-b border-border last:border-0 hover:bg-muted/10">
                      <td className="px-5 py-3 font-mono text-xs text-muted-foreground/70">{p.sku}</td>
                      <td className="px-5 py-3"><Link href={`/admin/products/${p.id}`} className="text-foreground/80 hover:text-primary">{p.title}</Link></td>
                      <td className="px-5 py-3">
                        <span className={`text-xs capitalize ${p.status === "active" ? "text-success" : p.status === "draft" ? "text-warning" : "text-muted-foreground/40"}`}>{p.status.replace(/_/g, " ")}</span>
                      </td>
                      <td className="px-5 py-3 text-right text-foreground/70">{new Intl.NumberFormat("en-AE", { style: "currency", currency: "AED", minimumFractionDigits: 0 }).format(Number(p.priceAed))}</td>
                      <td className="px-5 py-3 text-xs text-muted-foreground">{p.supplier.name}</td>
                      <td className="px-5 py-3 text-center">
                        <button onClick={() => toggleFeatured(p.id, p.featured)} className={`text-sm ${p.featured ? "text-gold" : "text-muted-foreground/40 hover:text-muted-foreground/60"}`}>
                          {p.featured ? "★" : "☆"}
                        </button>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link href={`/admin/products/${p.id}`} className="text-xs text-primary hover:underline">Edit</Link>
                          <button onClick={() => deleteProduct(p.id)} className="text-xs text-destructive hover:underline">Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination page={page} pages={pages} total={total} onPage={setPage} label="products" />
          </>
        )}
      </div>
    </div>
  );
}
