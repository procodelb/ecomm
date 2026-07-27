"use client";

import { useEffect, useState, useCallback } from "react";
import { CsvExport } from "@/components/admin/csv-export";
import { Pagination } from "@/components/admin/pagination";

interface Review {
  id: string; rating: number; title: string | null; body: string | null;
  status: string; verifiedPurchase: boolean; helpfulCount: number;
  customerEmail: string | null; createdAt: string;
  product: { id: string; title: string; slug: string; sku: string };
  customer: { id: string; email: string; firstName: string | null; lastName: string | null } | null;
}

export default function ReviewsPage() {
  const [data, setData] = useState<Review[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [rating, setRating] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: "50" });
    if (search) params.set("search", search);
    if (status) params.set("status", status);
    if (rating) params.set("rating", rating);
    const res = await fetch(`/api/admin/reviews?${params}`);
    const json = await res.json();
    setData(json.reviews); setTotal(json.total); setPages(json.pages);
    setLoading(false);
  }, [page, search, status, rating]);

  // eslint-disable-next-line react-hooks/set-state-in-effect -- Data fetching: setState inside effect for async data load
  useEffect(() => { fetchData(); }, [fetchData]);

  const moderate = async (id: string, newStatus: string) => {
    await fetch("/api/admin/reviews", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, status: newStatus }) });
    fetchData();
  };

  const deleteReview = async (id: string) => {
    if (!confirm("Delete this review?")) return;
    await fetch(`/api/admin/reviews/${id}`, { method: "DELETE" });
    fetchData();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-foreground">Reviews</h1><p className="mt-1 text-sm text-muted-foreground">{total} total</p></div>
        <CsvExport data={data} filename="reviews" columns={[{ key: "product.title", label: "Product" }, { key: "rating", label: "Rating" }, { key: "title", label: "Title" }, { key: "status", label: "Status" }, { key: "customerEmail", label: "Customer" }, { key: "createdAt", label: "Date" }]} />
      </div>

      <div className="flex flex-wrap gap-3">
        <input placeholder="Search reviews..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="flex-1 min-w-[200px] rounded-xl border border-border bg-muted/50 px-4 py-2 text-sm text-foreground placeholder-muted-foreground/40 outline-none focus:border-primary/50" />
        <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          className="rounded-xl border border-border bg-muted/50 px-4 py-2 text-sm text-foreground/80 outline-none focus:border-primary/50">
          <option value="">All statuses</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="flagged">Flagged</option>
        </select>
        <select value={rating} onChange={(e) => { setRating(e.target.value); setPage(1); }}
          className="rounded-xl border border-border bg-muted/50 px-4 py-2 text-sm text-foreground/80 outline-none focus:border-primary/50">
          <option value="">All ratings</option>
          {[5, 4, 3, 2, 1].map((r) => <option key={r} value={r}>{r} ★</option>)}
        </select>
      </div>

      <div className="rounded-xl border border-border bg-muted/50">
        {loading ? (
          <div className="flex h-48 items-center justify-center"><div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>
        ) : (
          <>
            <div className="divide-y divide-border">
              {data.map((r) => (
                <div key={r.id} className="px-5 py-4">
                  <div className="flex items-start justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-gold">{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</span>
                        <span className="text-sm font-medium text-foreground/80">{r.title ?? "Untitled"}</span>
                        <span className={`rounded-full px-2 py-0.5 text-xs capitalize ${
                          r.status === "approved" ? "bg-success/10 text-success"
                            : r.status === "rejected" ? "bg-destructive/10 text-destructive"
                              : r.status === "flagged" ? "bg-rose-500/10 text-rose-400"
                                : "bg-warning/10 text-warning"
                        }`}>{r.status}</span>
                        {r.verifiedPurchase && <span className="text-xs text-success">✓ Verified</span>}
                      </div>
                      {r.body && <p className="mt-1 text-sm text-muted-foreground/70 line-clamp-2">{r.body}</p>}
                      <p className="mt-1 text-xs text-muted-foreground">
                        {r.product.title} · {r.customerEmail ?? "Anonymous"} · {new Date(r.createdAt).toLocaleDateString()}
                        {r.helpfulCount > 0 && ` · ${r.helpfulCount} helpful`}
                      </p>
                    </div>
                    <div className="ml-4 flex shrink-0 items-center gap-2">
                      {r.status !== "approved" && <button onClick={() => moderate(r.id, "approved")} className="rounded-lg bg-success/20 px-3 py-1 text-xs text-success hover:bg-success/30">Approve</button>}
                      <button onClick={() => moderate(r.id, "rejected")} className="rounded-lg bg-destructive/20 px-3 py-1 text-xs text-destructive hover:bg-destructive/30">Reject</button>
                      <button onClick={() => deleteReview(r.id)} className="text-xs text-muted-foreground hover:text-destructive">×</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <Pagination page={page} pages={pages} total={total} onPage={setPage} label="reviews" />
          </>
        )}
      </div>
    </div>
  );
}
