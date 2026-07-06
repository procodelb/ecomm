import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAdminGuard } from "@/lib/security/admin-guard";

export const GET = withAdminGuard(async ({ request }: { request: NextRequest }) => {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") ?? "1");
  const limit = parseInt(searchParams.get("limit") ?? "50");
  const status = searchParams.get("status");
  const rating = searchParams.get("rating");
  const search = searchParams.get("search");

  const where: Record<string, unknown> = {};
  if (status) where.status = status;
  if (rating) where.rating = parseInt(rating);
  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { body: { contains: search, mode: "insensitive" } },
      { customerEmail: { contains: search, mode: "insensitive" } },
    ];
  }

  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        product: { select: { id: true, title: true, slug: true, sku: true } },
        customer: { select: { id: true, email: true, firstName: true, lastName: true } },
      },
    }),
    prisma.review.count({ where }),
  ]);

  return NextResponse.json({ reviews, total, page, limit, pages: Math.ceil(total / limit) });
}, { permission: "reviews:read" });

export const PATCH = withAdminGuard(async ({ request }) => {
  const body = await request.json();
  const { id, status, rejectionReason } = body;
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const data: Record<string, unknown> = { status, moderatedAt: new Date(), moderatedBy: body.moderatedBy ?? "system" };
  if (rejectionReason !== undefined) data.rejectionReason = rejectionReason;

  const review = await prisma.review.update({ where: { id }, data });
  return NextResponse.json(review);
}, { permission: "reviews:moderate" });
