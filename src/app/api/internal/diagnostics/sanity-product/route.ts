import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const authHeader = request.headers.get("x-diagnostic-secret");
  if (authHeader !== "REDACTED_DIAGNOSTIC_SECRET") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
  const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION;
  const hasToken = !!process.env.SANITY_API_TOKEN;

  const info: Record<string, unknown> = {
    timestamp: new Date().toISOString(),
    node: process.version,
    env: {
      projectId: projectId ? `${projectId.slice(0, 4)}...${projectId.slice(-4)}` : "missing",
      projectIdLength: projectId?.length ?? 0,
      dataset: dataset,
      apiVersion: apiVersion,
      hasToken,
    },
  };

  if (!projectId) {
    return NextResponse.json({ ...info, error: "NEXT_PUBLIC_SANITY_PROJECT_ID not set" }, { status: 500 });
  }

  try {
    const sanityUrl = `https://${projectId}.api.sanity.io/v${apiVersion || "2024-01-01"}/data/query/${dataset || "production"}`;
    const query = encodeURIComponent('*[_type == "product"][0...5]{_id, title, "slug": slug.current}');
    const url = `${sanityUrl}?query=${query}`;

    const res = await fetch(url, {
      headers: hasToken
        ? { Authorization: `Bearer ${process.env.SANITY_API_TOKEN}` }
        : {},
    });

    const status = res.status;
    const text = await res.text();

    if (!res.ok) {
      return NextResponse.json({
        ...info,
        sanity: { status, body: text.slice(0, 500) },
      }, { status: 502 });
    }

    const data = JSON.parse(text);
    return NextResponse.json({
      ...info,
      sanity: { status, resultCount: data.result?.length ?? 0, result: data.result },
    });
  } catch (err) {
    return NextResponse.json({
      ...info,
      error: err instanceof Error ? err.message.slice(0, 300) : String(err).slice(0, 300),
    }, { status: 500 });
  }
}
