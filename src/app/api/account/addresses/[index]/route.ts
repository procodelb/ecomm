import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/supabase/api";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ index: string }> },
) {
  const auth = await requireAuth(request);
  if (auth.error) return auth.error;

  const { index: indexStr } = await params;
  const index = parseInt(indexStr);

  const body = await request.json();
  const { line1, line2, city, state, postalCode, country, label, isDefault } = body;

  const customer = await prisma.customer.findUnique({ where: { authUserId: auth.user.id } });
  if (!customer) return NextResponse.json({ error: "Customer not found" }, { status: 404 });

  const addresses = [...((customer.addresses as unknown as Record<string, unknown>[]) || [])];
  if (index < 0 || index >= addresses.length) {
    return NextResponse.json({ error: "Address not found" }, { status: 404 });
  }

  addresses[index] = {
    line1: line1 ?? addresses[index].line1,
    line2: line2 ?? addresses[index].line2,
    city: city ?? addresses[index].city,
    state: state ?? addresses[index].state,
    postalCode: postalCode ?? addresses[index].postalCode,
    country: country ?? addresses[index].country,
    label: label ?? addresses[index].label,
  };

  const data: Record<string, unknown> = { addresses: addresses as never };
  if (isDefault) {
    data.defaultAddress = addresses[index] as never;
  }

  await prisma.customer.update({ where: { id: customer.id }, data });

  return NextResponse.json({ address: addresses[index], message: "Address updated" });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ index: string }> },
) {
  const auth = await requireAuth(request);
  if (auth.error) return auth.error;

  const { index: indexStr } = await params;
  const index = parseInt(indexStr);

  const customer = await prisma.customer.findUnique({ where: { authUserId: auth.user.id } });
  if (!customer) return NextResponse.json({ error: "Customer not found" }, { status: 404 });

  const addresses = [...((customer.addresses as unknown as Record<string, unknown>[]) || [])];
  if (index < 0 || index >= addresses.length) {
    return NextResponse.json({ error: "Address not found" }, { status: 404 });
  }

  addresses.splice(index, 1);
  await prisma.customer.update({ where: { id: customer.id }, data: { addresses: addresses as never } });

  return NextResponse.json({ message: "Address deleted" });
}
