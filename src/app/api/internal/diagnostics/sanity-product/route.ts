import { NextResponse } from "next/server";
import { createClient } from "@sanity/client";

export const dynamic = "force-dynamic";

const DIAGNOSTIC_SECRET = "REDACTED_DIAGNOSTIC_SECRET";

function safeId(id: string | undefined): string {
  if (!id) return "none";
  return `${id.slice(0, 4)}...${id.slice(-4)}`;
}

export async function GET(request: Request) {
  const authHeader = request.headers.get("x-diagnostic-secret");
  if (authHeader !== DIAGNOSTIC_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
  const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION;
  const hasToken = !!process.env.SANITY_API_TOKEN;

  const diagInfo: Record<string, unknown> = {
    timestamp: new Date().toISOString(),
    node: process.version,
    env: {
      projectId: safeId(projectId),
      projectIdLength: projectId?.length ?? 0,
      dataset: dataset,
      apiVersion: apiVersion,
      hasToken,
      stega: process.env.NEXT_PUBLIC_SANITY_STEGA,
    },
  };

  if (!projectId) {
    return NextResponse.json({ ...diagInfo, error: "NEXT_PUBLIC_SANITY_PROJECT_ID not set" }, { status: 500 });
  }

  const client = createClient({
    projectId,
    dataset: dataset || "production",
    apiVersion: apiVersion || "2024-01-01",
    useCdn: false,
    perspective: "published",
  });

  const results: Record<string, unknown> = {};

  // Test A: Small published product list
  try {
    const testA = await client.fetch(
      '*[_type == "product"][0...5] { _id, title, "slug": slug.current }',
      {},
      { cache: "no-store" },
    );
    results.testA = {
      status: "ok",
      count: Array.isArray(testA) ? testA.length : 0,
      products: Array.isArray(testA)
        ? testA.map((p: Record<string, unknown>) => ({
            id: safeId(p._id as string),
            slug: p.slug,
            titleType: typeof p.title,
            titleSample:
              typeof p.title === "object"
                ? Object.keys(p.title as Record<string, unknown>)
                : typeof p.title === "string"
                  ? p.title.slice(0, 40)
                  : null,
          }))
        : [],
    };
  } catch (err) {
    results.testA = {
      status: "error",
      message: err instanceof Error ? err.message.slice(0, 200) : String(err).slice(0, 200),
    };
  }

  // Test B: Exact product by slug
  try {
    const testB = await client.fetch(
      '*[_type == "product" && slug.current == $slug][0] { _id, title, "slug": slug.current }',
      { slug: "hydrofoil-e-surfboard-elite" },
      { cache: "no-store" },
    );
    results.testB = {
      status: "ok",
      found: !!testB,
      slug: testB?.slug ?? null,
      id: testB?._id ? safeId(testB._id) : null,
      titleType: typeof testB?.title,
      titleSample:
        typeof testB?.title === "object"
          ? Object.keys(testB.title as Record<string, unknown>)
          : typeof testB?.title === "string"
            ? testB.title.slice(0, 40)
            : null,
    };
  } catch (err) {
    results.testB = {
      status: "error",
      message: err instanceof Error ? err.message.slice(0, 200) : String(err).slice(0, 200),
    };
  }

  // Test C: Full production query (same as application)
  const productFields = `_id, "slug": slug.current, title, shortDescription, sku, price, comparePrice, images[]{ "url": image.asset->url, alt, caption }, videos[]{ url, platform, "thumbnail": thumbnail.asset->url, title }, models3d[]{ url, format, "thumbnail": thumbnail.asset->url, fileSize, autoRotate, arEnabled }, "supplier": supplier->{ _id, name, code, country }, category->{ _id, "slug": slug.current, title }, tags, featured, hasVariants, "variants": variants[]{ _id, title, sku, attributes, price, comparePrice, stock, isActive }, seo, schemaProductType, availability, certifications[]{ name, customName, certificateUrl, issuingBody }, weightKg, dimensionsCm, material, color, ageRating, warnings, countryOfOrigin, hsCode, msdsRequired, msdsUrl, metadata`;

  try {
    const testC = await client.fetch(
      `*[_type == "product" && slug.current == $slug][0] { ${productFields} }`,
      { slug: "hydrofoil-e-surfboard-elite" },
      { cache: "no-store" },
    );
    results.testC = {
      status: "ok",
      found: !!testC,
      slug: testC?.slug ?? null,
      id: testC?._id ? safeId(testC._id) : null,
      hasImages: Array.isArray(testC?.images) ? testC.images.length : 0,
      hasPrice: !!testC?.price,
      priceKeys: testC?.price ? Object.keys(testC.price as Record<string, unknown>) : null,
    };
  } catch (err) {
    results.testC = {
      status: "error",
      message: err instanceof Error ? err.message.slice(0, 200) : String(err).slice(0, 200),
    };
  }

  // Test D: Same query without locale filter
  try {
    const testD = await client.fetch(
      `*[_type == "product"][0...3] { _id, "slug": slug.current, title }`,
      {},
      { cache: "no-store" },
    );
    results.testD = {
      status: "ok",
      count: Array.isArray(testD) ? testD.length : 0,
      slugs: Array.isArray(testD) ? testD.map((p: Record<string, unknown>) => p.slug) : [],
    };
  } catch (err) {
    results.testD = {
      status: "error",
      message: err instanceof Error ? err.message.slice(0, 200) : String(err).slice(0, 200),
    };
  }

  // Test E: Check published vs draft
  try {
    const slugs = [
      "hydrofoil-e-surfboard-elite",
      "luxury-carbon-fiber-jet-board",
      "premium-inflatable-jet-ski",
    ];
    const testE: Record<string, { publishedExists: boolean; draftExists: boolean; correctSlug: boolean }> = {};

    for (const slug of slugs) {
      const published = await client.fetch(
        '*[_type == "product" && slug.current == $slug && !(_id in path("drafts.**"))][0] { _id, "slug": slug.current }',
        { slug },
        { cache: "no-store" },
      );
      const draft = await client.fetch(
        '*[_type == "product" && slug.current == $slug && _id in path("drafts.**")][0] { _id, "slug": slug.current }',
        { slug },
        { cache: "no-store" },
      );
      testE[slug] = {
        publishedExists: !!published,
        draftExists: !!draft,
        correctSlug: published?.slug === slug || draft?.slug === slug,
      };
    }
    results.testE = { status: "ok", ...testE };
  } catch (err) {
    results.testE = {
      status: "error",
      message: err instanceof Error ? err.message.slice(0, 200) : String(err).slice(0, 200),
    };
  }

  return NextResponse.json({ ...diagInfo, results });
}
