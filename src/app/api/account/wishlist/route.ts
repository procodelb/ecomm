import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/supabase/api";

export async function GET(request: NextRequest) {
  const auth = await requireAuth(request);
  if (auth.error) return auth.error;

  const customer = await prisma.customer.findUnique({
    where: { authUserId: auth.user.id },
    include: {
      wishlistItems: {
        include: {
          product: {
            select: { id: true, title: true, slug: true, images: true, status: true, priceAed: true, priceAud: true },
          },
          variant: {
            select: { id: true, title: true, sku: true, priceAed: true, priceAud: true, stock: true, images: true },
          },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });
  if (!customer) return NextResponse.json({ error: "Customer not found" }, { status: 404 });

  return NextResponse.json({ items: customer.wishlistItems, total: customer.wishlistItems.length });
}

export async function POST(request: NextRequest) {
  const auth = await requireAuth(request);
  if (auth.error) return auth.error;

  const body = await request.json();
  const { productId, variantId } = body;

  if (!productId) {
    return NextResponse.json({ error: "productId is required" }, { status: 400 });
  }

  const customer = await prisma.customer.findUnique({ where: { authUserId: auth.user.id } });
  if (!customer) return NextResponse.json({ error: "Customer not found" }, { status: 404 });

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });

  const existing = await prisma.customerWishlistItem.findUnique({
    where: { customerId_productId_variantId: { customerId: customer.id, productId, variantId: variantId || null } },
  });
  if (existing) return NextResponse.json({ message: "Already in wishlist" });

  const item = await prisma.customerWishlistItem.create({
    data: { customerId: customer.id, productId, variantId: variantId || null },
    include: {
      product: { select: { id: true, title: true, slug: true, images: true } },
    },
  });

  return NextResponse.json({ item, message: "Added to wishlist" });
}

export async function DELETE(request: NextRequest) {
  const auth = await requireAuth(request);
  if (auth.error) return auth.error;

  const { searchParams } = new URL(request.url);
  const productId = searchParams.get("productId");
  const variantId = searchParams.get("variantId");

  if (!productId) {
    return NextResponse.json({ error: "productId query param is required" }, { status: 400 });
  }

  const customer = await prisma.customer.findUnique({ where: { authUserId: auth.user.id } });
  if (!customer) return NextResponse.json({ error: "Customer not found" }, { status: 404 });

  await prisma.customerWishlistItem.deleteMany({
    where: { customerId: customer.id, productId, variantId: variantId || null },
  });

  return NextResponse.json({ message: "Removed from wishlist" });
}
