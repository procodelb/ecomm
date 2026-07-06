import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/supabase/api";

export async function GET(request: NextRequest) {
  const auth = await requireAuth(request);
  if (auth.error) return auth.error;

  const customer = await prisma.customer.findUnique({ where: { authUserId: auth.user.id } });
  if (!customer) return NextResponse.json({ error: "Customer not found" }, { status: 404 });

  const reviews = await prisma.review.findMany({
    where: { customerId: customer.id },
    orderBy: { createdAt: "desc" },
    include: {
      product: { select: { id: true, title: true, slug: true, images: true } },
    },
  });

  return NextResponse.json({ reviews, total: reviews.length });
}

export async function POST(request: NextRequest) {
  const auth = await requireAuth(request);
  if (auth.error) return auth.error;

  const body = await request.json();
  const { productId, orderId, variantId, rating, title, body: reviewBody, pros, cons } = body;

  if (!productId || !rating || !reviewBody) {
    return NextResponse.json({ error: "productId, rating, and body are required" }, { status: 400 });
  }

  if (rating < 1 || rating > 5) {
    return NextResponse.json({ error: "rating must be between 1 and 5" }, { status: 400 });
  }

  const customer = await prisma.customer.findUnique({ where: { authUserId: auth.user.id } });
  if (!customer) return NextResponse.json({ error: "Customer not found" }, { status: 404 });

  const existing = await prisma.review.findFirst({
    where: { customerId: customer.id, productId, orderId: orderId || undefined },
  });
  if (existing) return NextResponse.json({ error: "You have already reviewed this product for this order" }, { status: 409 });

  const order = orderId ? await prisma.order.findFirst({
    where: { id: orderId, customerId: customer.id },
  }) : null;

  const review = await prisma.review.create({
    data: {
      productId,
      orderId: orderId || null,
      variantId: variantId || null,
      customerId: customer.id,
      customerName: `${customer.firstName || ""} ${customer.lastName || ""}`.trim() || customer.email,
      customerEmail: customer.email,
      rating,
      title: title || null,
      body: reviewBody,
      pros: pros || [],
      cons: cons || [],
      verifiedPurchase: !!order,
      status: "pending",
    },
  });

  return NextResponse.json({ review, message: "Review submitted for moderation" });
}
