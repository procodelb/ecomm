import "server-only";

import { unstable_rethrow } from "next/navigation";
import type { QueryParams } from "@sanity/client";
import { ensureClient } from "./client";

export class SanityError extends Error {
  category:
    | "config"
    | "network"
    | "query"
    | "timeout"
    | "auth"
    | "nextjs"
    | "unknown";
  projectId?: string;
  dataset?: string;
  apiVersion?: string;
  httpStatus?: number;

  constructor(params: {
    message: string;
    category: SanityError["category"];
    projectId?: string;
    dataset?: string;
    apiVersion?: string;
    httpStatus?: number;
  }) {
    super(params.message);
    this.name = "SanityError";
    this.category = params.category;
    this.projectId = params.projectId;
    this.dataset = params.dataset;
    this.apiVersion = params.apiVersion;
    this.httpStatus = params.httpStatus;
  }

  toSanitizedLog(): Record<string, unknown> {
    return {
      category: this.category,
      projectId: this.projectId ? `${this.projectId.slice(0, 4)}...` : undefined,
      dataset: this.dataset,
      apiVersion: this.apiVersion,
      httpStatus: this.httpStatus,
      message: this.message,
    };
  }
}

export async function sanityFetch<QueryResponse>({
  query,
  params = {},
  tags,
  revalidate,
}: {
  query: string;
  params?: QueryParams;
  tags?: string[];
  revalidate?: number | false;
}): Promise<QueryResponse | null> {
  let client;
  try {
    client = ensureClient();
  } catch (err) {
    console.error("[sanity] Configuration error:", {
      category: "config",
      message: err instanceof Error ? err.message : "unknown",
    });
    throw new SanityError({
      message: `Sanity client config failed: ${err instanceof Error ? err.message : "unknown"}`,
      category: "config",
    });
  }

  const config = client.config();
  try {
    const result = await client.fetch<QueryResponse>(query, params, {
      next: { tags, revalidate: revalidate ?? 60 },
    });
    return result ?? null;
  } catch (err: unknown) {
    unstable_rethrow(err);

    const message = err instanceof Error ? err.message : String(err);

    const errObj = err as Record<string, unknown>;
    const statusCode =
      typeof errObj?.statusCode === "number"
        ? errObj.statusCode
        : typeof errObj?.status === "number"
          ? errObj.status
          : undefined;

    let category: SanityError["category"] = "unknown";
    if (statusCode === 401 || statusCode === 403) category = "auth";
    else if (statusCode === 408 || message.includes("timeout")) category = "timeout";
    else if (statusCode && statusCode >= 400 && statusCode < 500) category = "query";
    else if (statusCode && statusCode >= 500) category = "network";
    else if (message.includes("ENOTFOUND") || message.includes("ECONNREFUSED") || message.includes("fetch failed")) category = "network";
    else if (message.includes("projectId") || message.includes("dataset") || message.includes("not configured")) category = "config";

    const logInfo = {
      category,
      projectId: config.projectId ? `${String(config.projectId).slice(0, 4)}...` : "missing",
      dataset: config.dataset,
      apiVersion: config.apiVersion,
      httpStatus: statusCode,
      message: message.slice(0, 200),
    };
    console.error("[sanity] Query failed:", logInfo);

    throw new SanityError({
      message: `Sanity query failed (${category}): ${message.slice(0, 200)}`,
      category,
      projectId: config.projectId,
      dataset: config.dataset,
      apiVersion: config.apiVersion,
      httpStatus: statusCode,
    });
  }
}
