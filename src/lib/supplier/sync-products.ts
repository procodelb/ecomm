import "server-only";
import { prisma } from "@/lib/prisma";
import { getAdapterForSupplier } from "./registry";
import type { NormalizedProduct } from "./types";

interface SyncResult {
  supplierId: string;
  supplierCode: string;
  total: number;
  created: number;
  updated: number;
  skipped: number;
  errors: string[];
}

/**
 * Sync all products from a supplier into the local database.
 * Uses the adapter registered for the supplier's `code`.
 */
export async function syncSupplierProducts(supplierId: string): Promise<SyncResult> {
  const result: SyncResult = {
    supplierId,
    supplierCode: "",
    total: 0,
    created: 0,
    updated: 0,
    skipped: 0,
    errors: [],
  };

  const supplier = await prisma.supplier.findUnique({ where: { id: supplierId } });
  if (!supplier) {
    result.errors.push("Supplier not found");
    return result;
  }

  result.supplierCode = supplier.code;

  const adapter = getAdapterForSupplier(supplier.code);
  if (!adapter) {
    result.errors.push(`No adapter found for supplier code: ${supplier.code}`);
    return result;
  }

  let products: NormalizedProduct[];
  try {
    products = await adapter.fetchProducts(supplierId);
  } catch (err) {
    result.errors.push(`fetchProducts failed: ${err instanceof Error ? err.message : "Unknown"}`);
    return result;
  }

  result.total = products.length;

  for (const np of products) {
    try {
      await upsertProductFromNormalized(np, supplierId);
      result.created++;
    } catch (err) {
      result.errors.push(
        `SKU ${np.supplierSku}: ${err instanceof Error ? err.message : "Upsert error"}`,
      );
      result.skipped++;
    }
  }

  return result;
}

async function upsertProductFromNormalized(np: NormalizedProduct, supplierId: string) {
  const existing = await prisma.product.findFirst({
    where: { supplierId, sku: np.supplierSku },
  });

  const priceAed = convertToAed(np.price, np.currency);
  const priceAud = convertToAud(np.price, np.currency);

  const productData = {
    supplierId,
    sku: np.supplierSku,
    title: np.title,
    description: np.description,
    category: np.category,
    tags: np.tags,
    priceAed,
    priceAud,
    costPriceAed: convertToAed(np.price, np.currency),
    costPriceAud: convertToAud(np.price, np.currency),
    images: np.images,
    weightKg: np.weightKg ?? undefined,
    countryOfOrigin: np.countryOfOrigin,
    hsCode: np.hsCode,
    trackQuantity: true,
    status: "active" as const,
    metadata: {
      supplierSku: np.supplierSku,
      supplierCode: np.supplierSku,
      lastSyncedAt: new Date().toISOString(),
    },
  };

  if (existing) {
    await prisma.product.update({
      where: { id: existing.id },
      data: productData,
    });

    // Update existing variants
    if (np.variants.length > 0) {
      for (const v of np.variants) {
        const existingVariant = await prisma.productVariant.findFirst({
          where: { productId: existing.id, sku: v.supplierSku },
        });
        const vPriceAed = convertToAed(v.price, np.currency);
        const vPriceAud = convertToAud(v.price, np.currency);

        if (existingVariant) {
          await prisma.productVariant.update({
            where: { id: existingVariant.id },
            data: {
              title: v.title,
              priceAed: vPriceAed,
              priceAud: vPriceAud,
              stock: v.stock,
              attributes: v.attributes,
              images: v.images,
            },
          });
        } else {
          await prisma.productVariant.create({
            data: {
              productId: existing.id,
              sku: v.supplierSku,
              title: v.title,
              priceAed: vPriceAed,
              priceAud: vPriceAud,
              stock: v.stock,
              attributes: v.attributes,
              images: v.images,
            },
          });
        }
      }
    }

    // Upsert inventory
    const inv = await prisma.inventory.findFirst({
      where: { productId: existing.id, supplierId },
    });
    if (inv) {
      await prisma.inventory.update({
        where: { id: inv.id },
        data: { quantity: np.stock },
      });
    } else {
      await prisma.inventory.create({
        data: {
          productId: existing.id,
          supplierId,
          quantity: np.stock,
          warehouse: "default",
        },
      });
    }
  } else {
    const product = await prisma.product.create({
      data: {
        ...productData,
        slug: generateSlug(np.title, np.supplierSku),
      },
    });

    if (np.variants.length > 0) {
      for (const v of np.variants) {
        const vPriceAed = convertToAed(v.price, np.currency);
        const vPriceAud = convertToAud(v.price, np.currency);
        await prisma.productVariant.create({
          data: {
            productId: product.id,
            sku: v.supplierSku,
            title: v.title,
            priceAed: vPriceAed,
            priceAud: vPriceAud,
            stock: v.stock,
            attributes: v.attributes,
            images: v.images,
          },
        });
      }
    }

    await prisma.inventory.create({
      data: {
        productId: product.id,
        supplierId,
        quantity: np.stock,
        warehouse: "default",
      },
    });
  }
}

function generateSlug(title: string, sku: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || `product-${sku.toLowerCase().slice(0, 20)}`;
}

function convertToAed(price: number, currency: string): number {
  const rates: Record<string, number> = {
    USD: 3.67,
    CNY: 0.51,
    AED: 1,
    AUD: 2.45,
    EUR: 4.02,
    GBP: 4.67,
  };
  return Math.round(price * (rates[currency] ?? 1) * 100) / 100;
}

function convertToAud(price: number, currency: string): number {
  const rates: Record<string, number> = {
    USD: 1.50,
    CNY: 0.21,
    AED: 0.41,
    AUD: 1,
    EUR: 1.64,
    GBP: 1.91,
  };
  return Math.round(price * (rates[currency] ?? 1) * 100) / 100;
}
