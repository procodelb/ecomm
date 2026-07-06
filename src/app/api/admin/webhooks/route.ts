import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAdminGuard } from "@/lib/security/admin-guard";

export const GET = withAdminGuard(async ({ request }: { request: NextRequest }) => {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") ?? "1");
  const limit = parseInt(searchParams.get("limit") ?? "50");
  const provider = searchParams.get("provider");
  const status = searchParams.get("status");
  const eventType = searchParams.get("eventType");

  const where: Record<string, unknown> = {};
  if (provider) where.provider = provider;
  if (status) where.processingStatus = status;
  if (eventType) where.eventType = { contains: eventType, mode: "insensitive" };

  const [logs, total] = await Promise.all([
    prisma.webhookLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.webhookLog.count({ where }),
  ]);

  const providers = await prisma.webhookLog.findMany({
    select: { provider: true },
    distinct: ["provider"],
  });

  return NextResponse.json({ logs, total, page, limit, pages: Math.ceil(total / limit), providers: providers.map((p) => p.provider) });
}, { permission: "webhooks:read" });
