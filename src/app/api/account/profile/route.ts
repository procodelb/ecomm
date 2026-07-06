import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/supabase/api";

export async function GET(request: NextRequest) {
  const auth = await requireAuth(request);
  if (auth.error) return auth.error;

  const customer = await prisma.customer.findUnique({ where: { authUserId: auth.user.id } });
  if (!customer) return NextResponse.json({ error: "Customer not found" }, { status: 404 });

  const { preferredLocale, preferredCurrency, firstName, lastName, phone, email, marketingConsent, defaultAddress, addresses } = customer;

  return NextResponse.json({
    profile: {
      email, firstName, lastName, phone,
      preferredLocale, preferredCurrency,
      marketingConsent, defaultAddress, addresses,
    },
  });
}

export async function PATCH(request: NextRequest) {
  const auth = await requireAuth(request);
  if (auth.error) return auth.error;

  const body = await request.json();
  const { firstName, lastName, phone, preferredLocale, preferredCurrency, marketingConsent, defaultAddress } = body;

  const customer = await prisma.customer.findUnique({ where: { authUserId: auth.user.id } });
  if (!customer) return NextResponse.json({ error: "Customer not found" }, { status: 404 });

  const data: Record<string, unknown> = {};
  if (firstName !== undefined) data.firstName = firstName;
  if (lastName !== undefined) data.lastName = lastName;
  if (phone !== undefined) data.phone = phone;
  if (preferredLocale !== undefined) data.preferredLocale = preferredLocale;
  if (preferredCurrency !== undefined) data.preferredCurrency = preferredCurrency;
  if (marketingConsent !== undefined) data.marketingConsent = marketingConsent;
  if (defaultAddress !== undefined) data.defaultAddress = defaultAddress as never;

  const updated = await prisma.customer.update({ where: { id: customer.id }, data });

  return NextResponse.json({ profile: updated, message: "Profile updated" });
}
