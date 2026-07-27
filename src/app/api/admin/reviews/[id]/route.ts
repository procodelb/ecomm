import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAdminGuard } from "@/lib/security/admin-guard";

export const GET = withAdminGuard(async ({ request }) => {
  const id = request.nextUrl.pathname.split("/").pop()!;
  const review = await prisma.review.findUnique({ where: { id }, include: { product: true, customer: true } });
  if (!review) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(review);
}, { permission: "reviews:read" });

export const PATCH = withAdminGuard(async ({ request }) => {
  const id = request.nextUrl.pathname.split("/").pop()!;
  const body = await request.json();
  const review = await prisma.review.update({ where: { id }, data: { ...body, moderatedAt: new Date() } });
  return NextResponse.json(review);
}, { permission: "reviews:moderate" });

export const DELETE = withAdminGuard(async ({ request }) => {
  const id = request.nextUrl.pathname.split("/").pop()!;
  await prisma.review.delete({ where: { id } });
  return new NextResponse(null, { status: 204 });
}, { permission: "reviews:delete" });
