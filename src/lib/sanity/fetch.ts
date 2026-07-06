import "server-only";

import type { QueryParams } from "@sanity/client";
import { ensureClient } from "./client";

export async function sanityFetch<QueryResponse>({
  query,
  params = {},
  tags,
}: {
  query: string;
  params?: QueryParams;
  tags?: string[];
}): Promise<QueryResponse | null> {
  try {
    const client = ensureClient();
    return client.fetch<QueryResponse>(query, params, {
      cache: "force-cache",
      next: { tags },
    });
  } catch {
    return null;
  }
}
