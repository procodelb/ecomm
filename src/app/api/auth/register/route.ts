import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { checkBruteForce, recordFailedAttempt, getBruteForceKey } from "@/lib/security/brute-force";

export async function POST(request: Request) {
  const body = await request.json();
  const { email, password, fullName } = body;

  if (!email || !password || !fullName) {
    return NextResponse.json(
      { error: "Email, password, and full name are required" },
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
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName } },
  });

  if (error) {
    recordFailedAttempt(bfKey);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  if (data.user) {
    await prisma.customer.upsert({
      where: { email },
      update: {
        authUserId: data.user.id,
        firstName: fullName.split(" ")[0] ?? "",
        lastName: fullName.split(" ").slice(1).join(" ") ?? "",
      },
      create: {
        email,
        authUserId: data.user.id,
        firstName: fullName.split(" ")[0] ?? "",
        lastName: fullName.split(" ").slice(1).join(" ") ?? "",
      },
    });
  }

  return NextResponse.json({
    user: data.user,
    session: data.session,
  });
}
