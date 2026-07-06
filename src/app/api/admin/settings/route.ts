import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAdminGuard } from "@/lib/security/admin-guard";

const DEFAULT_AI_SETTINGS = {
  enabled: true,
  welcomeMessage: {
    "en-AE": "👋 Hi! I'm your AI shopping assistant. How can I help you today?",
    "en-AU": "👋 G'day! I'm your AI shopping assistant. How can I help you today?",
    "ar-AE": "👋 مرحباً! أنا مساعد التسوق الذكي. كيف يمكنني مساعدتك اليوم؟",
  },
};

export const GET = withAdminGuard(async ({ request }) => {
  const [totalSuppliers, totalProducts, totalOrders, totalCustomers, adminUsers] = await Promise.all([
    prisma.supplier.count(),
    prisma.product.count(),
    prisma.order.count(),
    prisma.customer.count(),
    prisma.adminUser.findMany({ select: { id: true, email: true, firstName: true, lastName: true, role: true, isActive: true, mfaEnabled: true, lastLoginAt: true, createdAt: true } }),
  ]);

  const settings = {
    store: {
      name: "ECOMM",
      locales: ["en-AE", "en-AU", "ar-AE"],
      currencies: ["AED", "AUD"],
      defaultLocale: "en-AE",
      defaultCurrency: "AED",
    },
    counts: { suppliers: totalSuppliers, products: totalProducts, orders: totalOrders, customers: totalCustomers },
    adminUsers,
    env: {
      stripeConfigured: !!process.env.STRIPE_SECRET_KEY && process.env.STRIPE_SECRET_KEY !== "PLACEHOLDER",
      resendConfigured: !!process.env.RESEND_API_KEY,
      sanityConfigured: !!process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
      supabaseConfigured: !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY),
      cronConfigured: !!process.env.CRON_SECRET,
    },
  };

  const ai = {
    enabled: process.env.AI_ASSISTANT_ENABLED !== "false",
    openaiConfigured: !!process.env.OPENAI_API_KEY,
    welcomeMessage: DEFAULT_AI_SETTINGS.welcomeMessage,
  };

  return NextResponse.json({ ...settings, ai });
}, { permission: "settings:read" });

export const PATCH = withAdminGuard(async ({ request }) => {
  const body = await request.json();

  if (body.adminUserId && body.role) {
    await prisma.adminUser.update({ where: { id: body.adminUserId }, data: { role: body.role } });
  }
  if (body.adminUserId && body.isActive !== undefined) {
    await prisma.adminUser.update({ where: { id: body.adminUserId }, data: { isActive: body.isActive } });
  }

  return NextResponse.json({ success: true });
}, { permission: "settings:update" });
