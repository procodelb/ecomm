import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getServiceRoleClient } from "@/lib/supabase/service-role";
import { ensureBuckets, STORAGE_BUCKETS } from "@/lib/supabase/storage";

interface SetupStatus {
  supabase: { connected: boolean; error?: string };
  auth: { configured: boolean; error?: string };
  storage: { buckets: Record<string, "created" | "exists" | "error">; error?: string };
  environment: Record<string, boolean>;
}

export async function GET() {
  const status: SetupStatus = {
    supabase: { connected: false },
    auth: { configured: false },
    storage: { buckets: {} },
    environment: {},
  };

  // Check env vars
  status.environment = {
    NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    DATABASE_URL: !!process.env.DATABASE_URL,
  };

  // Test Supabase connectivity (anon)
  try {
    const supabase = await createServerSupabaseClient();
    const { error } = await supabase.auth.getSession();
    status.supabase.connected = !error;
    if (error) status.supabase.error = error.message;
  } catch (e) {
    status.supabase.error = e instanceof Error ? e.message : "Unknown error";
  }

  // Test auth config
  try {
    const supabase = await createServerSupabaseClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: "test@placeholder.com",
      password: "placeholder",
    });
    status.auth.configured = true;
    if (error && !error.message.includes("Invalid login credentials")) {
      status.auth.error = error.message;
    }
  } catch (e) {
    status.auth.error = e instanceof Error ? e.message : "Unknown error";
  }

  // Test storage buckets
  if (status.environment.SUPABASE_SERVICE_ROLE_KEY) {
    try {
      for (const [key, name] of Object.entries(STORAGE_BUCKETS)) {
        const { data: existing } = await getServiceRoleClient().storage.getBucket(name);
        status.storage.buckets[key] = existing ? "exists" : "error";
      }
    } catch (e) {
      status.storage.error = e instanceof Error ? e.message : "Unknown error";
    }
  } else {
    status.storage.error = "SUPABASE_SERVICE_ROLE_KEY not set — cannot check storage";
  }

  return NextResponse.json(status);
}

export async function POST() {
  const results: Record<string, unknown> = {};

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json(
      { error: "SUPABASE_SERVICE_ROLE_KEY is not set — cannot perform setup" },
      { status: 400 },
    );
  }

  // Create storage buckets
  try {
    await ensureBuckets();
    const bucketStatus: Record<string, string> = {};
    for (const [key, name] of Object.entries(STORAGE_BUCKETS)) {
      const { data } = await getServiceRoleClient().storage.getBucket(name);
      bucketStatus[key] = data ? "ready" : "error";
    }
    results.buckets = bucketStatus;
  } catch (e) {
    results.buckets = { error: e instanceof Error ? e.message : "Unknown error" };
  }

  return NextResponse.json({
    success: true,
    results,
  });
}
