import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const STORAGE_BUCKETS = [
  { id: "product-images", public: true, maxSize: 10 * 1024 * 1024, mimes: ["image/jpeg", "image/png", "image/webp", "image/avif"] },
  { id: "product-videos", public: true, maxSize: 100 * 1024 * 1024, mimes: ["video/mp4", "video/webm", "video/quicktime"] },
  { id: "product-3d-models", public: true, maxSize: 50 * 1024 * 1024, mimes: ["model/gltf+json", "model/gltf-binary", "application/octet-stream"] },
  { id: "avatars", public: true, maxSize: 2 * 1024 * 1024, mimes: ["image/jpeg", "image/png", "image/webp"] },
  { id: "review-images", public: true, maxSize: 5 * 1024 * 1024, mimes: ["image/jpeg", "image/png", "image/webp", "image/avif"] },
];

async function main() {
  const missing: string[] = [];
  if (!supabaseUrl) missing.push("NEXT_PUBLIC_SUPABASE_URL");
  if (!serviceRoleKey) missing.push("SUPABASE_SERVICE_ROLE_KEY");

  if (missing.length > 0) {
    console.error(`Missing environment variables: ${missing.join(", ")}`);
    console.error("Create a .env file with these variables or export them.");
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl!, serviceRoleKey!, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // 1. Verify connection
  console.log("Checking Supabase connection...");
  const { data: buckets, error: listErr } = await supabase.storage.listBuckets();
  if (listErr) {
    console.error("Failed to connect:", listErr.message);
    process.exit(1);
  }
  console.log(`Connected. Existing buckets: ${buckets?.map((b) => b.name).join(", ") || "none"}`);

  // 2. Create storage buckets
  console.log("\nCreating storage buckets...");
  const existingNames = new Set(buckets?.map((b) => b.name) ?? []);

  for (const bucket of STORAGE_BUCKETS) {
    if (existingNames.has(bucket.id)) {
      console.log(`  ${bucket.id} — already exists, skipping`);
      continue;
    }

    const { error } = await supabase.storage.createBucket(bucket.id, {
      public: bucket.public,
      fileSizeLimit: bucket.maxSize,
      allowedMimeTypes: bucket.mimes,
    });

    if (error) {
      console.error(`  ${bucket.id} — FAILED: ${error.message}`);
    } else {
      console.log(`  ${bucket.id} — created`);
    }
  }

  // 3. Verify final state
  console.log("\nVerifying final state...");
  const { data: finalBuckets } = await supabase.storage.listBuckets();
  console.log(`Total buckets: ${finalBuckets?.length ?? 0}`);
  for (const b of finalBuckets ?? []) {
    console.log(`  - ${b.name} (public: ${b.public})`);
  }

  console.log("\nSetup complete!");
}

main().catch((e) => {
  console.error("Unexpected error:", e);
  process.exit(1);
});
