import "server-only";

import { prisma } from "@/lib/prisma";
import type { CurrencyCode } from "@prisma/client";

interface FindOrCreateParams {
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  locale: string;
  currency: string;
}

export async function findOrCreateCustomer(params: FindOrCreateParams) {
  const existing = await prisma.customer.findUnique({
    where: { email: params.email },
  });

  if (existing) {
    const updates: Record<string, unknown> = {};
    if (params.firstName && !existing.firstName) updates.firstName = params.firstName;
    if (params.lastName && !existing.lastName) updates.lastName = params.lastName;
    if (params.phone && !existing.phone) updates.phone = params.phone;
    updates.totalOrders = { increment: 1 };
    updates.lastOrderAt = new Date();
    updates.preferredCurrency = params.currency as CurrencyCode;

    if (Object.keys(updates).length > 0) {
      return prisma.customer.update({
        where: { id: existing.id },
        data: updates,
      });
    }
    return existing;
  }

  return prisma.customer.create({
    data: {
      email: params.email,
      firstName: params.firstName ?? null,
      lastName: params.lastName ?? null,
      phone: params.phone ?? null,
      preferredLocale: params.locale,
      preferredCurrency: params.currency as CurrencyCode,
      totalOrders: 1,
      lastOrderAt: new Date(),
    },
  });
}
