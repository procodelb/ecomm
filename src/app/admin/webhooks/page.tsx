"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Pagination } from "@/components/admin/pagination";

interface WebhookLog {
  id: string; provider: string; eventType: string; eventId: string | null;
  processingStatus: string; responseStatus: number | null;
  retryCount: number; createdAt: string;
  errorMessage: string | null;
}

export default function WebhooksPage() {
  const [data, setData] = useState<WebhookLog[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [provider, setProvider] = useState("");
  const [status, setStatus] = useState("");
  const [providers, setProviders] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: "50" });
    if (provider) params.set("provider", provider);
    if (status) params.set("status", status);
    const res = await fetch(`/api/admin/webhooks?${params}`);
    const json = await res.json();
    setData(json.logs); setTotal(json.total); setPages(json.pages);
    setProviders(json.providers ?? []);
    setLoading(false);
  }, [page, provider, status]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const retry = async (id: string) => {
    if (!confirm("Re-process this webhook event?")) return;
    await fetch(`/api/admin/webhooks/${id}`, { method: "GET" });
    fetchData();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-foreground">Webhook Logs</h1><p className="mt-1 text-sm text-muted-foreground">{total} events</p></div>
      </div>

      <div className="flex flex-wrap gap-3">
        <select value={provider} onChange={(e) => { setProvider(e.target.value); setPage(1); }}
          className="rounded-xl border border-border bg-muted/50 px-4 py-2 text-sm text-foreground/80 outline-none focus:border-primary/50">
          <option value="">All providers</option>
          {providers.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
        <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          className="rounded-xl border border-border bg-muted/50 px-4 py-2 text-sm text-foreground/80 outline-none focus:border-primary/50">
          <option value="">All statuses</option>
          <option value="received">Received</option>
          <option value="processing">Processing</option>
          <option value="completed">Completed</option>
          <option value="failed">Failed</option>
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
                    <th className="px-5 py-3">Provider</th>
                    <th className="px-5 py-3">Event Type</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3">Response</th>
                    <th className="px-5 py-3 text-right">Retries</th>
                    <th className="px-5 py-3 text-right">Date</th>
                    <th className="px-5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((log) => (
                    <tr key={log.id} className="border-b border-border last:border-0 hover:bg-muted/10">
                      <td className="px-5 py-3 font-mono text-xs text-primary">{log.provider}</td>
                      <td className="px-5 py-3 text-xs text-muted-foreground">{log.eventType}</td>
                      <td className="px-5 py-3">
                        <span className={`text-xs capitalize ${
                          log.processingStatus === "completed" ? "text-success"
                            : log.processingStatus === "failed" ? "text-destructive"
                              : log.processingStatus === "processing" ? "text-cyan-400"
                                : "text-warning"
                        }`}>{log.processingStatus}</span>
                      </td>
                      <td className="px-5 py-3 text-xs text-muted-foreground">{log.responseStatus ?? "—"}</td>
                      <td className="px-5 py-3 text-right text-xs text-muted-foreground">{log.retryCount}</td>
                      <td className="px-5 py-3 text-right text-xs text-muted-foreground">{new Date(log.createdAt).toLocaleString()}</td>
                      <td className="px-5 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link href={`/admin/webhooks/${log.id}`} className="text-xs text-primary hover:underline">View</Link>
                          <button onClick={() => retry(log.id)} className="text-xs text-muted-foreground hover:text-primary">Retry</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination page={page} pages={pages} total={total} onPage={setPage} label="webhook logs" />
          </>
        )}
      </div>
    </div>
  );
}
