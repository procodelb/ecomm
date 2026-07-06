import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/supabase/api";

export async function GET(request: NextRequest) {
  const auth = await requireAuth(request);
  if (auth.error) return auth.error;

  const customer = await prisma.customer.findUnique({ where: { authUserId: auth.user.id } });
  if (!customer) return NextResponse.json({ error: "Customer not found" }, { status: 404 });

  const addresses = customer.addresses as unknown as Record<string, unknown>[];
  const defaultAddress = customer.defaultAddress as Record<string, unknown>;

  return NextResponse.json({ addresses, defaultAddress, total: addresses.length });
}

export async function POST(request: NextRequest) {
  const auth = await requireAuth(request);
  if (auth.error) return auth.error;

  const body = await request.json();
  const { line1, line2, city, state, postalCode, country, label, isDefault } = body;

  if (!line1 || !city || !country) {
    return NextResponse.json({ error: "line1, city, and country are required" }, { status: 400 });
  }

  const address = {
    line1, line2: line2 || "", city, state: state || "",
    postalCode: postalCode || "", country, label: label || "",
  };

  const customer = await prisma.customer.findUnique({ where: { authUserId: auth.user.id } });
  if (!customer) return NextResponse.json({ error: "Customer not found" }, { status: 404 });

  const currentAddresses = (customer.addresses as unknown as Record<string, unknown>[]) || [];

  if (isDefault) {
    await prisma.customer.update({
      where: { id: customer.id },
      data: { defaultAddress: address as never, addresses: [...currentAddresses, address] as never },
    });
  } else {
    await prisma.customer.update({
      where: { id: customer.id },
      data: { addresses: [...currentAddresses, address] as never },
    });
  }

  return NextResponse.json({ address, message: "Address added" });
}
