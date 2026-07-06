"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

interface WebhookDetail {
  id: string; provider: string; eventType: string; eventId: string | null;
  webhookUrl: string | null; headers: Record<string, unknown>;
  body: Record<string, unknown>; rawBody: string | null;
  signature: string | null; signatureValid: boolean | null;
  processingStatus: string; responseStatus: number | null;
  responseBody: string | null; errorMessage: string | null;
  retryCount: number; maxRetries: number; processedAt: string | null;
  createdAt: string;
}

export default function WebhookDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [log, setLog] = useState<WebhookDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/admin/webhooks/${params.id}`).then((r) => r.json()).then((d) => { setLog(d); setLoading(false); });
  }, [params.id]);

  if (loading) return <div className="flex h-48 items-center justify-center"><div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>;
  if (!log) return <p className="text-sm text-destructive">Not found</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{log.provider} / {log.eventType}</h1>
          <p className="mt-1 text-sm text-muted-foreground">Event ID: {log.eventId ?? "—"} · {new Date(log.createdAt).toLocaleString()}</p>
        </div>
        <button onClick={() => router.push("/admin/webhooks")} className="rounded-xl border border-border px-4 py-2 text-sm text-muted-foreground hover:bg-muted/50">Back</button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <section className="rounded-xl border border-border bg-muted/50 p-5">
            <h2 className="mb-3 text-sm font-semibold text-foreground">Payload</h2>
            <pre className="max-h-96 overflow-auto rounded-lg bg-black/40 p-4 text-xs text-muted-foreground font-mono">{JSON.stringify(log.body, null, 2)}</pre>
          </section>

          {log.rawBody && (
            <section className="rounded-xl border border-border bg-muted/50 p-5">
              <h2 className="mb-3 text-sm font-semibold text-foreground">Raw Body</h2>
              <pre className="max-h-48 overflow-auto rounded-lg bg-black/40 p-4 text-xs text-muted-foreground font-mono">{log.rawBody}</pre>
            </section>
          )}

          {log.responseBody && (
            <section className="rounded-xl border border-border bg-muted/50 p-5">
              <h2 className="mb-3 text-sm font-semibold text-foreground">Response</h2>
              <pre className="max-h-48 overflow-auto rounded-lg bg-black/40 p-4 text-xs text-muted-foreground font-mono">{log.responseBody}</pre>
            </section>
          )}
        </div>

        <div className="space-y-6">
          <section className="rounded-xl border border-border bg-muted/50 p-5">
            <h2 className="mb-3 text-sm font-semibold text-foreground">Details</h2>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between"><span className="text-muted-foreground">Status</span><span className={`capitalize ${log.processingStatus === "completed" ? "text-success" : log.processingStatus === "failed" ? "text-destructive" : "text-warning"}`}>{log.processingStatus}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Response</span><span className="text-foreground/70">{log.responseStatus ?? "—"}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Retries</span><span className="text-foreground/70">{log.retryCount}/{log.maxRetries}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Processed</span><span className="text-foreground/70">{log.processedAt ? new Date(log.processedAt).toLocaleString() : "—"}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Signature</span><span className={log.signatureValid === true ? "text-success" : log.signatureValid === false ? "text-destructive" : "text-muted-foreground/40"}>{log.signatureValid === null ? "Not checked" : log.signatureValid ? "Valid" : "Invalid"}</span></div>
            </div>
          </section>

          <section className="rounded-xl border border-border bg-muted/50 p-5">
            <h2 className="mb-3 text-sm font-semibold text-foreground">Headers</h2>
            <pre className="max-h-48 overflow-auto text-xs text-muted-foreground/70 font-mono">{JSON.stringify(log.headers, null, 2)}</pre>
          </section>

          {log.errorMessage && (
            <section className="rounded-xl border border-destructive/20 bg-destructive/10 p-5">
              <h2 className="mb-2 text-sm font-semibold text-destructive">Error</h2>
              <p className="text-xs text-destructive/80">{log.errorMessage}</p>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
