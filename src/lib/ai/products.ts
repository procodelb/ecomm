import { prisma } from "@/lib/prisma";
import type { SuggestedProduct } from "./types";

export async function searchProducts(query: string, locale: string, limit = 5): Promise<SuggestedProduct[]> {
  try {
    const products = await prisma.product.findMany({
      where: {
        status: "active",
        OR: [
          { title: { contains: query, mode: "insensitive" } },
          { description: { contains: query, mode: "insensitive" } },
          { category: { contains: query, mode: "insensitive" } },
          { tags: { hasSome: [query] } },
        ],
      },
      take: limit,
      orderBy: { createdAt: "desc" },
    });

    return products.map((p) => ({
      id: p.id,
      title: p.title,
      slug: p.slug,
      priceAed: Number(p.priceAed),
      priceAud: Number(p.priceAud),
      image: Array.isArray(p.images) ? (p.images[0] as { url?: string })?.url ?? undefined : undefined,
      category: p.category ?? undefined,
    }));
  } catch {
    return [];
  }
}

export async function getProductsByIds(ids: string[]): Promise<SuggestedProduct[]> {
  try {
    const products = await prisma.product.findMany({
      where: { id: { in: ids }, status: "active" },
      take: ids.length,
    });

    return products.map((p) => ({
      id: p.id,
      title: p.title,
      slug: p.slug,
      priceAed: Number(p.priceAed),
      priceAud: Number(p.priceAud),
      image: Array.isArray(p.images) ? (p.images[0] as { url?: string })?.url ?? undefined : undefined,
      category: p.category ?? undefined,
    }));
  } catch {
    return [];
  }
}

export async function getRandomProducts(limit = 5): Promise<SuggestedProduct[]> {
  try {
    const products = await prisma.product.findMany({
      where: { status: "active" },
      take: limit,
      orderBy: { createdAt: "desc" },
    });

    return products.map((p) => ({
      id: p.id,
      title: p.title,
      slug: p.slug,
      priceAed: Number(p.priceAed),
      priceAud: Number(p.priceAud),
      image: Array.isArray(p.images) ? (p.images[0] as { url?: string })?.url ?? undefined : undefined,
      category: p.category ?? undefined,
    }));
  } catch {
    return [];
  }
}
