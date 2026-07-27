import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export type Role = "super_admin" | "admin" | "manager" | "support" | "analyst";

export type Permission =
  | "products:read" | "products:create" | "products:update" | "products:delete"
  | "orders:read" | "orders:update" | "orders:delete"
  | "customers:read" | "customers:update" | "customers:delete"
  | "suppliers:read" | "suppliers:create" | "suppliers:update" | "suppliers:delete"
  | "reviews:read" | "reviews:moderate" | "reviews:delete"
  | "inventory:read" | "inventory:update"
  | "analytics:read"
  | "settings:read" | "settings:update"
  | "webhooks:read" | "webhooks:delete"
  | "admins:manage"
  | "sync:run"
  | "audit:read";

const rolePermissions: Record<Role, Permission[]> = {
  super_admin: [
    "products:read", "products:create", "products:update", "products:delete",
    "orders:read", "orders:update", "orders:delete",
    "customers:read", "customers:update", "customers:delete",
    "suppliers:read", "suppliers:create", "suppliers:update", "suppliers:delete",
    "reviews:read", "reviews:moderate", "reviews:delete",
    "inventory:read", "inventory:update",
    "analytics:read",
    "settings:read", "settings:update",
    "webhooks:read", "webhooks:delete",
    "admins:manage",
    "sync:run",
    "audit:read",
  ],
  admin: [
    "products:read", "products:create", "products:update", "products:delete",
    "orders:read", "orders:update",
    "customers:read", "customers:update",
    "suppliers:read", "suppliers:create", "suppliers:update",
    "reviews:read", "reviews:moderate", "reviews:delete",
    "inventory:read", "inventory:update",
    "analytics:read",
    "settings:read",
    "webhooks:read",
    "sync:run",
    "audit:read",
  ],
  manager: [
    "products:read", "products:create", "products:update",
    "orders:read", "orders:update",
    "customers:read", "customers:update",
    "suppliers:read", "suppliers:update",
    "reviews:read", "reviews:moderate",
    "inventory:read", "inventory:update",
    "analytics:read",
    "settings:read",
  ],
  support: [
    "orders:read", "orders:update",
    "customers:read", "customers:update",
    "reviews:read", "reviews:moderate",
    "inventory:read",
  ],
  analyst: [
    "products:read",
    "orders:read",
    "customers:read",
    "suppliers:read",
    "reviews:read",
    "inventory:read",
    "analytics:read",
    "audit:read",
  ],
};

export function getPermissions(role: Role): Permission[] {
  return rolePermissions[role] ?? [];
}

export function hasPermission(role: Role, permission: Permission): boolean {
  return getPermissions(role).includes(permission);
}

export function requirePermission(permission: Permission, role: Role | null, _adminEmail?: string) {
  if (!role || !hasPermission(role, permission)) {
    return NextResponse.json(
      { error: "Forbidden: insufficient permissions" },
      { status: 403 },
    );
  }
  return null;
}

export type AdminUserInfo = {
  id: string;
  email: string;
  role: Role;
  permissions: Record<string, boolean>;
  mfaEnabled: boolean;
};

export async function getAdminUser(request: NextRequest): Promise<AdminUserInfo | null> {
  try {
    const { createServerClient } = await import("@supabase/ssr");
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
      {
        cookies: {
          getAll() { return request.cookies.getAll(); },
          setAll() {},
        },
      },
    );
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { prisma } = await import("@/lib/prisma");
    const admin = await prisma.adminUser.findUnique({
      where: { authUserId: user.id },
      select: { id: true, email: true, role: true, permissions: true, mfaEnabled: true, isActive: true },
    });

    if (!admin || !admin.isActive) return null;

    return {
      id: admin.id,
      email: admin.email,
      role: admin.role as Role,
      permissions: admin.permissions as Record<string, boolean>,
      mfaEnabled: admin.mfaEnabled,
    };
  } catch {
    return null;
  }
}

export async function requireAdmin(
  request: NextRequest,
  requiredPermission?: Permission,
): Promise<{ admin: AdminUserInfo } | { error: NextResponse }> {
  const admin = await getAdminUser(request);
  if (!admin) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  if (requiredPermission) {
    const forbidden = requirePermission(requiredPermission, admin.role, admin.email);
    if (forbidden) return { error: forbidden };
  }

  return { admin };
}
