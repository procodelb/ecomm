"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { CsvExport } from "@/components/admin/csv-export";
import { Pagination } from "@/components/admin/pagination";

interface Customer {
  id: string; email: string; firstName: string | null; lastName: string | null;
  phone: string | null; totalOrders: number; totalSpentAed: number;
  preferredLocale: string; preferredCurrency: string; createdAt: string;
  _count: { orders: number; reviews: number };
}

export default function CustomersPage() {
  const [data, setData] = useState<Customer[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("totalOrders");
  const [dir, setDir] = useState("desc");
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: "50", sort, dir });
    if (search) params.set("search", search);
    const res = await fetch(`/api/admin/customers?${params}`);
    const json = await res.json();
    setData(json.customers); setTotal(json.total); setPages(json.pages);
    setLoading(false);
  }, [page, search, sort, dir]);

  // eslint-disable-next-line react-hooks/set-state-in-effect -- Data fetching: setState inside effect for async data load
  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSort = (key: string) => {
    if (sort === key) setDir(dir === "asc" ? "desc" : "asc");
    else { setSort(key); setDir("desc"); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-foreground">Customers</h1><p className="mt-1 text-sm text-muted-foreground">{total} total</p></div>
        <CsvExport data={data} filename="customers" columns={[{ key: "email", label: "Email" }, { key: "firstName", label: "First Name" }, { key: "lastName", label: "Last Name" }, { key: "totalOrders", label: "Orders" }, { key: "totalSpentAed", label: "Total Spent" }, { key: "createdAt", label: "Date" }]} />
      </div>

      <div className="flex flex-wrap gap-3">
        <input placeholder="Search by email or name..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="flex-1 min-w-[200px] rounded-xl border border-border bg-muted/50 px-4 py-2 text-sm text-foreground placeholder-muted-foreground/40 outline-none focus:border-primary/50" />
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
                    <th className="px-5 py-3">Name</th>
                    <th className="px-5 py-3">Email</th>
                    <th className="px-5 py-3 cursor-pointer select-none hover:text-foreground/50 text-right" onClick={() => handleSort("totalOrders")}>Orders {sort === "totalOrders" && <span className="text-primary">{dir === "asc" ? " ↑" : " ↓"}</span>}</th>
                    <th className="px-5 py-3 cursor-pointer select-none hover:text-foreground/50 text-right" onClick={() => handleSort("totalSpentAed")}>Total Spent</th>
                    <th className="px-5 py-3 cursor-pointer select-none hover:text-foreground/50 text-right" onClick={() => handleSort("createdAt")}>Since</th>
                    <th className="px-5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((c) => (
                    <tr key={c.id} className="border-b border-border last:border-0 hover:bg-muted/10">
                      <td className="px-5 py-3 text-foreground/80">{c.firstName ?? ""} {c.lastName ?? ""}</td>
                      <td className="px-5 py-3 text-muted-foreground">{c.email}</td>
                      <td className="px-5 py-3 text-right text-foreground/70">{c.totalOrders}</td>
                      <td className="px-5 py-3 text-right text-foreground/70">{new Intl.NumberFormat("en-AE", { style: "currency", currency: "AED", minimumFractionDigits: 0 }).format(Number(c.totalSpentAed))}</td>
                      <td className="px-5 py-3 text-right text-muted-foreground">{new Date(c.createdAt).toLocaleDateString()}</td>
                      <td className="px-5 py-3 text-right"><Link href={`/admin/customers/${c.id}`} className="text-xs text-primary hover:underline">View</Link></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination page={page} pages={pages} total={total} onPage={setPage} label="customers" />
          </>
        )}
      </div>
    </div>
  );
}
