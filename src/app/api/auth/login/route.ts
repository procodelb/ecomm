import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { checkBruteForce, recordFailedAttempt, resetBruteForce, getBruteForceKey } from "@/lib/security/brute-force";

export async function POST(request: Request) {
  const body = await request.json();
  const { email, password } = body;

  if (!email || !password) {
    return NextResponse.json(
      { error: "Email and password are required" },
      { status: 400 },
    );
  }

  const bfKey = getBruteForceKey(email);
  const bfStatus = checkBruteForce(bfKey);
  if (!bfStatus.allowed) {
    return NextResponse.json(
      { error: "Too many attempts. Try again later." },
      { status: 429 },
    );
  }

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    recordFailedAttempt(bfKey);
    return NextResponse.json({ error: error.message }, { status: 401 });
  }

  resetBruteForce(bfKey);
  return NextResponse.json({
    user: data.user,
    session: data.session,
  });
}
