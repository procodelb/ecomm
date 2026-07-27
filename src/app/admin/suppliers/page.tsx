"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api/client";
import { Pagination } from "@/components/admin/pagination";

interface Supplier {
  id: string; code: string; name: string; status: string; country: string;
  contactEmail: string | null; lastSyncAt: string | null; lastSyncStatus: string | null;
  createdAt: string; _count: { products: number; inventory: number };
}

export default function SuppliersPage() {
  const [data, setData] = useState<Supplier[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: "50" });
    if (status) params.set("status", status);
    if (search) params.set("search", search);
    const res = await fetch(`/api/admin/suppliers?${params}`);
    const json = await res.json();
    setData(json.suppliers); setTotal(json.total); setPages(json.pages);
    setLoading(false);
  }, [page, search, status]);

  // eslint-disable-next-line react-hooks/set-state-in-effect -- Data fetching: setState inside effect for async data load
  useEffect(() => { fetchData(); }, [fetchData]);

  const deleteSupplier = async (id: string) => {
    if (!confirm("Delete this supplier and all associated data?")) return;
    await apiFetch(`/api/admin/suppliers/${id}`, { method: "DELETE" });
    fetchData();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-foreground">Suppliers</h1><p className="mt-1 text-sm text-muted-foreground">{total} total</p></div>
        <Link href="/admin/suppliers/new" className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-black">+ New</Link>
      </div>

      <div className="flex flex-wrap gap-3">
        <input placeholder="Search suppliers..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="flex-1 min-w-[200px] rounded-xl border border-border bg-muted/50 px-4 py-2 text-sm text-foreground placeholder-muted-foreground/40 outline-none focus:border-primary/50" />
        <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          className="rounded-xl border border-border bg-muted/50 px-4 py-2 text-sm text-foreground/80 outline-none focus:border-primary/50">
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="suspended">Suspended</option>
          <option value="pending_review">Pending Review</option>
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
                    <th className="px-5 py-3">Code</th>
                    <th className="px-5 py-3">Name</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3">Country</th>
                    <th className="px-5 py-3">Products</th>
                    <th className="px-5 py-3">Last Sync</th>
                    <th className="px-5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((s) => (
                    <tr key={s.id} className="border-b border-border last:border-0 hover:bg-muted/10">
                      <td className="px-5 py-3 font-mono text-xs text-primary">{s.code}</td>
                      <td className="px-5 py-3"><Link href={`/admin/suppliers/${s.id}`} className="text-foreground/80 hover:text-primary">{s.name}</Link></td>
                      <td className="px-5 py-3"><span className={`text-xs capitalize ${s.status === "active" ? "text-success" : s.status === "inactive" ? "text-muted-foreground/40" : "text-warning"}`}>{s.status.replace(/_/g, " ")}</span></td>
                      <td className="px-5 py-3 text-xs text-muted-foreground">{s.country}</td>
                      <td className="px-5 py-3 text-muted-foreground">{s._count.products}</td>
                      <td className="px-5 py-3 text-xs text-muted-foreground">{s.lastSyncAt ? new Date(s.lastSyncAt).toLocaleString() : "Never"}</td>
                      <td className="px-5 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link href={`/admin/suppliers/${s.id}`} className="text-xs text-primary hover:underline">Edit</Link>
                          <button onClick={() => deleteSupplier(s.id)} className="text-xs text-destructive hover:underline">Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination page={page} pages={pages} total={total} onPage={setPage} label="suppliers" />
          </>
        )}
      </div>
    </div>
  );
}
