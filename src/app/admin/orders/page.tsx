"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { CsvExport } from "@/components/admin/csv-export";
import { Pagination } from "@/components/admin/pagination";

const STATUS_OPTIONS = ["", "pending", "payment_received", "processing", "shipped", "in_transit", "delivered", "cancelled", "refunded"];
const STATUS_COLORS: Record<string, string> = {
  pending: "text-warning", payment_received: "text-info", processing: "text-cyan-400",
  shipped: "text-purple-400", in_transit: "text-indigo-400", delivered: "text-success",
  cancelled: "text-destructive", refunded: "text-rose-400",
};

interface Order {
  id: string; orderNumber: string; customerEmail: string; status: string;
  total: number; currency: string; createdAt: string; _count: { items: number };
}

export default function OrdersPage() {
  const [data, setData] = useState<Order[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("createdAt");
  const [dir, setDir] = useState("desc");
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: "50", sort, dir });
    if (status) params.set("status", status);
    if (search) params.set("search", search);
    const res = await fetch(`/api/admin/orders?${params}`);
    const json = await res.json();
    setData(json.orders);
    setTotal(json.total);
    setPages(json.pages);
    setLoading(false);
  }, [page, status, search, sort, dir]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSort = (key: string) => {
    if (sort === key) setDir(dir === "asc" ? "desc" : "asc");
    else { setSort(key); setDir("desc"); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-foreground">Orders</h1><p className="mt-1 text-sm text-muted-foreground">{total} total</p></div>
        <CsvExport data={data} filename="orders" columns={[{ key: "orderNumber", label: "Order" }, { key: "customerEmail", label: "Customer" }, { key: "status", label: "Status" }, { key: "total", label: "Total" }, { key: "createdAt", label: "Date" }, { key: "_count.items", label: "Items" }]} />
      </div>

      <div className="flex flex-wrap gap-3">
        <input
          placeholder="Search orders..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="flex-1 min-w-[200px] rounded-xl border border-border bg-muted/50 px-4 py-2 text-sm text-foreground placeholder-muted-foreground/40 outline-none focus:border-primary/50"
        />
        <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          className="rounded-xl border border-border bg-muted/50 px-4 py-2 text-sm text-foreground/80 outline-none focus:border-primary/50">
          <option value="">All statuses</option>
          {STATUS_OPTIONS.filter(Boolean).map((s) => <option key={s} value={s}>{s.replace(/_/g, " ")}</option>)}
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
                    <th className="px-5 py-3 cursor-pointer select-none hover:text-foreground/50" onClick={() => handleSort("orderNumber")}>Order {sort === "orderNumber" && <span className="text-primary">{dir === "asc" ? " ↑" : " ↓"}</span>}</th>
                    <th className="px-5 py-3 cursor-pointer select-none hover:text-foreground/50" onClick={() => handleSort("customerEmail")}>Customer</th>
                    <th className="px-5 py-3 cursor-pointer select-none hover:text-foreground/50" onClick={() => handleSort("status")}>Status</th>
                    <th className="px-5 py-3 cursor-pointer select-none hover:text-foreground/50 text-right" onClick={() => handleSort("total")}>Total</th>
                    <th className="px-5 py-3">Items</th>
                    <th className="px-5 py-3 cursor-pointer select-none hover:text-foreground/50 text-right" onClick={() => handleSort("createdAt")}>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((o) => (
                    <tr key={o.id} className="border-b border-border last:border-0 hover:bg-muted/10">
                      <td className="px-5 py-3"><Link href={`/admin/orders/${o.id}`} className="font-mono text-xs text-primary hover:underline">{o.orderNumber}</Link></td>
                      <td className="px-5 py-3 text-foreground/70">{o.customerEmail}</td>
                      <td className="px-5 py-3"><span className={`${STATUS_COLORS[o.status] ?? "text-muted-foreground"} capitalize`}>{o.status.replace(/_/g, " ")}</span></td>
                      <td className="px-5 py-3 text-right text-foreground/80">{new Intl.NumberFormat("en-AE", { style: "currency", currency: o.currency, minimumFractionDigits: 0 }).format(Number(o.total))}</td>
                      <td className="px-5 py-3 text-muted-foreground">{o._count.items}</td>
                      <td className="px-5 py-3 text-right text-muted-foreground">{new Date(o.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination page={page} pages={pages} total={total} onPage={setPage} label="orders" />
          </>
        )}
      </div>
    </div>
  );
}
