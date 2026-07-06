import { createClient } from "@sanity/client";
import { createImageUrlBuilder } from "@sanity/image-url";
import type { SanityImageSource } from "@sanity/image-url";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2024-01-01";

function getClient() {
  if (!projectId) {
    throw new Error("NEXT_PUBLIC_SANITY_PROJECT_ID is not configured");
  }
  return createClient({
    projectId,
    dataset,
    apiVersion,
    useCdn: false,
    perspective: "published",
    stega: {
      enabled: process.env.NEXT_PUBLIC_SANITY_STEGA === "true",
      studioUrl: "/admin",
    },
  });
}

const imageBuilder = projectId
  ? createImageUrlBuilder({ projectId, dataset })
  : null;

export function urlFor(source: SanityImageSource) {
  return imageBuilder?.image(source);
}

let client: ReturnType<typeof createClient> | null = null;

export { client };

export function ensureClient() {
  if (!client) {
    client = getClient();
  }
  return client;
}
