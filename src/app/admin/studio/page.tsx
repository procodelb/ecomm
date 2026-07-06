"use client";

import dynamic from "next/dynamic";

const NextStudio = dynamic(
  () => import("next-sanity/studio").then((mod) => mod.NextStudio),
  { ssr: false },
);

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";

const config = projectId
  ? { name: "default", title: "ECOMM CMS", projectId, dataset, basePath: "/admin/studio" }
  : null;

export default function StudioPage() {
  if (!config) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <p className="text-sm text-muted-foreground">
          Sanity CMS is not configured. Set NEXT_PUBLIC_SANITY_PROJECT_ID.
        </p>
      </div>
    );
  }

  return <NextStudio config={config} />;
}
