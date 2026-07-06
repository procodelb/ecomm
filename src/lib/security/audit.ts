import { prisma } from "@/lib/prisma";
import type { NextRequest } from "next/server";

export type AuditAction =
  | "admin.login"
  | "admin.logout"
  | "order.update"
  | "order.delete"
  | "product.create"
  | "product.update"
  | "product.delete"
  | "customer.update"
  | "customer.delete"
  | "supplier.create"
  | "supplier.update"
  | "supplier.delete"
  | "review.moderate"
  | "review.delete"
  | "inventory.update"
  | "settings.update"
  | "webhook.delete"
  | "sync.run"
  | "admin.create"
  | "admin.update"
  | "admin.delete";

export async function logAuditAction(params: {
  action: AuditAction;
  entity: string;
  entityId?: string;
  adminId?: string;
  adminEmail?: string;
  request?: NextRequest;
  changes?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}) {
  try {
    const ip = params.request
      ? params.request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1"
      : undefined;
    const userAgent = params.request
      ? params.request.headers.get("user-agent") || undefined
      : undefined;

    await prisma.auditLog.create({
      data: {
        action: params.action,
        entity: params.entity,
        entityId: params.entityId,
        adminId: params.adminId,
        adminEmail: params.adminEmail,
        ipAddress: ip,
        userAgent,
        changes: params.changes ? JSON.parse(JSON.stringify(params.changes)) : undefined,
        metadata: params.metadata ? JSON.parse(JSON.stringify(params.metadata)) : undefined,
      },
    });
  } catch {
    // non-fatal
  }
}

export async function getAuditLogs(params: {
  action?: string;
  entity?: string;
  entityId?: string;
  adminId?: string;
  page?: number;
  limit?: number;
}) {
  const where: Record<string, unknown> = {};
  if (params.action) where.action = params.action;
  if (params.entity) where.entity = params.entity;
  if (params.entityId) where.entityId = params.entityId;
  if (params.adminId) where.adminId = params.adminId;

  const page = params.page || 1;
  const limit = Math.min(params.limit || 50, 100);

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.auditLog.count({ where }),
  ]);

  return { logs, total, page, limit, pages: Math.ceil(total / limit) };
}
