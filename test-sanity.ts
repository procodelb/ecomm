import { createClient } from "@sanity/client";

async function test() {
  const client = createClient({
    projectId: "wrl9moj5",
    dataset: "production",
    apiVersion: "2024-01-01",
    useCdn: false,
    perspective: "published",
  });

  try {
    const result = await client.fetch(
      '*[_type == "product"][0...5] { _id, title, "slug": slug.current }',
      {},
      { cache: "no-store" }
    );
    console.log("Result:", JSON.stringify(result, null, 2));
  } catch (err) {
    console.error("Error:", err);
  }
}

test();
