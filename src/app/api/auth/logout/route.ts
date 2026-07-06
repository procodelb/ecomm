import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.signOut();

  const contentType = request.headers.get("accept") ?? "";
  if (contentType.includes("application/json")) {
    return NextResponse.json(
      error ? { error: error.message } : { success: true },
      { status: error ? 400 : 200 },
    );
  }

  return NextResponse.redirect(new URL("/", request.url), 302);
}
