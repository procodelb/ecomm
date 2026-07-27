import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { requireAdmin } from "./rbac";
import type { Permission, AdminUserInfo } from "./rbac";
import { checkRateLimit, getRateLimitKey, RATE_LIMITS, type RateLimitConfig } from "./rate-limit";
import { sanitizeError } from "./sanitize";
import { logAuditAction, type AuditAction } from "./audit";

type AdminHandler<T = unknown> = (params: {
  request: NextRequest;
  admin: AdminUserInfo;
  body?: T;
}) => Promise<NextResponse>;

type AdminGuardOptions = {
  permission?: Permission;
  rateLimit?: RateLimitConfig;
};

export function withAdminGuard(handler: AdminHandler, options?: AdminGuardOptions) {
  return async (request: NextRequest, ..._args: unknown[]) => {
    try {
      const rlConfig = options?.rateLimit || RATE_LIMITS.admin;
      const rlKey = getRateLimitKey(request, "admin");
      const rlResult = checkRateLimit(rlKey, rlConfig);
      if (!rlResult.allowed) {
        return NextResponse.json(
          { error: "Too many requests" },
          {
            status: 429,
            headers: {
              "Retry-After": String(Math.ceil((rlResult.resetAt - Date.now()) / 1000)),
              "X-RateLimit-Remaining": "0",
            },
          },
        );
      }

      const result = await requireAdmin(request, options?.permission);
      if ("error" in result) return result.error;

      return await handler({ request, admin: result.admin });
    } catch (err) {
      const sanitized = sanitizeError(err);
      return NextResponse.json(
        { error: sanitized.error },
        { status: sanitized.status },
      );
    }
  };
}

export function withAdminAudit(
  handler: (params: { request: NextRequest; admin: AdminUserInfo; body?: unknown }) => Promise<NextResponse>,
  audit: { action: AuditAction; entity: string; getEntityId?: (body: unknown) => string | undefined },
) {
  return async (request: NextRequest) => {
    const guardResult = await withAdminGuard(async ({ request: req, admin }) => {
      let body: unknown;
      const contentType = request.headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        try {
          body = await request.clone().json();
        } catch { body = undefined; }
      }

      const response = await handler({ request: req, admin, body });

      const entityId = audit.getEntityId ? audit.getEntityId(body) : undefined;

      logAuditAction({
        action: audit.action,
        entity: audit.entity,
        entityId,
        adminId: admin.id,
        adminEmail: admin.email,
        request,
        changes: body ? JSON.parse(JSON.stringify(body)) : undefined,
      });

      return response;
    })(request);

    return guardResult;
  };
}
