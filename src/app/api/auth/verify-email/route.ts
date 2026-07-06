import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const body = await request.json();
  const { token, type } = body;

  if (!token) {
    return NextResponse.json(
      { error: "Verification token is required" },
      { status: 400 },
    );
  }

  const supabase = await createServerSupabaseClient();

  const otpType = type === "email_change" ? "email_change" : "signup";

  const { error } = await supabase.auth.verifyOtp({
    token,
    type: otpType,
    email: "",
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
