import "server-only";
import { BaseSupplierAdapter } from "../base-adapter";
import type {
  NormalizedProduct,
  NormalizedStock,
  NormalizedTracking,
  SupplierOrderDispatch,
  SupplierOrderResult,
  SupplierOrderStatus,
  SupplierAdapterCapabilities,
} from "../types";

/**
 * CJ Dropshipping REST API adapter.
 *
 * Auth: API key in header (CJ-Api-Key).
 * Base URL: https://developers.cjdropshipping.com/api2.0
 * CJ handles product sourcing, storage, packing, and shipping worldwide.
 */
export class CJDropshippingAdapter extends BaseSupplierAdapter {
  readonly code = "CJ_DROPSHIPPING";
  readonly name = "CJ Dropshipping";
  readonly capabilities: SupplierAdapterCapabilities = {
    realtimeProducts: true,
    realtimeStock: true,
    realtimeOrders: true,
    realtimeTracking: true,
    supportedSync: ["products", "stock", "orders", "tracking"],
  };

  private async request(
    supplierId: string,
    path: string,
    options: { method?: string; body?: unknown } = {},
  ) {
    const supplier = await this.getSupplier(supplierId);
    if (!supplier.apiUrl) throw new Error(`CJ adapter: no apiUrl for supplier ${supplierId}`);

    const url = new URL(path, supplier.apiUrl);

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "application/json",
    };
    if (supplier.apiKeyEncrypted) {
      headers["CJ-Api-Key"] = supplier.apiKeyEncrypted;
    }

    const start = Date.now();
    try {
      const res = await fetch(url.toString(), {
        method: options.method ?? "GET",
        headers,
        body: options.body ? JSON.stringify(options.body) : undefined,
      });
      const responseTimeMs = Date.now() - start;
      const text = await res.text();

      await this.log(supplierId, "api_request", res.ok ? "success" : "failed", {
        requestUrl: url.toString(),
        requestMethod: options.method ?? "GET",
        requestBody: options.body ? JSON.stringify(options.body) : undefined,
        responseStatus: res.status,
        responseBody: text,
        responseTimeMs,
      });

      if (!res.ok) throw new Error(`CJ API error ${res.status}: ${text}`);
      const parsed = JSON.parse(text);
      if (parsed.code !== "0" && parsed.code !== 0) {
        throw new Error(`CJ API business error: ${parsed.message ?? parsed.error ?? "Unknown"}`);
      }
      return parsed.data ?? parsed;
    } catch (err) {
      if (!(err instanceof Error && err.message.startsWith("CJ API"))) {
        await this.log(supplierId, "api_request", "error", {
          requestUrl: url.toString(),
          requestMethod: options.method ?? "GET",
          requestBody: options.body ? JSON.stringify(options.body) : undefined,
          errorMessage: err instanceof Error ? err.message : "Unknown",
          errorStack: err instanceof Error ? err.stack : undefined,
          responseTimeMs: Date.now() - start,
        });
      }
      throw err;
    }
  }

  async fetchProducts(supplierId: string): Promise<NormalizedProduct[]> {
    const data = await this.request(supplierId, "/product/list", {
      method: "POST",
      body: { page: 1, pageSize: 200, status: 1 },
    });
    return ((data?.list ?? data?.products ?? []) as Record<string, unknown>[]).map((p) =>
      this.normalizeProduct(supplierId, p),
    );
  }

  async fetchProduct(supplierId: string, sku: string): Promise<NormalizedProduct | null> {
    try {
      const data = await this.request(supplierId, "/product/detail", {
        method: "POST",
        body: { productId: sku },
      });
      return data ? this.normalizeProduct(supplierId, data) : null;
    } catch {
      return null;
    }
  }

  async checkStock(supplierId: string, skus: string[]): Promise<Map<string, NormalizedStock>> {
    const data = await this.request(supplierId, "/product/stock/batch", {
      method: "POST",
      body: { skus },
    });
    const map = new Map<string, NormalizedStock>();
    const list = (data?.list ?? data?.stock ?? []) as Record<string, unknown>[];
    for (const item of list) {
      map.set(item.sku as string, {
        sku: item.sku as string,
        available: parseInt(String(item.available ?? item.quantity ?? 0), 10),
        reserved: parseInt(String(item.reserved ?? 0), 10),
        price: parseFloat(String(item.price ?? item.unitPrice ?? 0)),
        currency: "USD",
        updatedAt: (item.updateTime as string) ?? new Date().toISOString(),
      });
    }
    return map;
  }

  async placeOrder(dispatch: SupplierOrderDispatch): Promise<SupplierOrderResult> {
    const data = await this.request(dispatch.supplierId, "/order/create", {
      method: "POST",
      body: {
        orderNumber: dispatch.orderNumber,
        products: dispatch.items.map((i) => ({
          productId: i.supplierSku,
          quantity: i.quantity,
          shippingMethod: "standard",
        })),
        shippingAddress: {
          firstName: dispatch.shippingAddress.line1,
          address: dispatch.shippingAddress.line1,
          address2: dispatch.shippingAddress.line2,
          city: dispatch.shippingAddress.city,
          state: dispatch.shippingAddress.state,
          zip: dispatch.shippingAddress.postalCode,
          country: dispatch.shippingAddress.country,
          phone: "",
        },
      },
    });
    return {
      supplierOrderId: data?.orderId ?? data?.id ?? "",
      status: "confirmed",
      trackingNumber: data?.trackingNumber ?? null,
      estimatedDelivery: null,
      errorMessage: null,
      rawResponse: (data ?? {}) as Record<string, unknown>,
    };
  }

  async checkOrderStatus(supplierOrderId: string): Promise<SupplierOrderStatus> {
    const data = await this.request(supplierOrderId, "/order/status", {
      method: "POST",
      body: { orderId: supplierOrderId },
    });
    return {
      supplierOrderId,
      status: (data?.status as SupplierOrderStatus["status"]) ?? "pending",
      trackingNumber: data?.trackingNumber ?? null,
      carrier: data?.carrier ?? null,
      estimatedDelivery: data?.estimatedDelivery ?? null,
      events: (data?.events ?? []).map((e: Record<string, string>) => ({
        date: e.date ?? "",
        status: e.status ?? "",
        description: e.description ?? "",
        location: e.location ?? null,
      })),
    };
  }

  async getTracking(supplierOrderId: string): Promise<NormalizedTracking[]> {
    const data = await this.request(supplierOrderId, "/order/tracking", {
      method: "POST",
      body: { orderId: supplierOrderId },
    });
    return (data?.tracking ?? []).map((t: Record<string, unknown>) => ({
      trackingNumber: t.trackingNumber as string,
      carrier: t.carrier as string,
      status: (t.status as NormalizedTracking["status"]) ?? "pending",
      events: ((t.events as Record<string, string>[]) ?? []).map((e) => ({
        date: e.date,
        location: e.location,
        description: e.description,
        status: e.status,
      })),
      estimatedDelivery: (t.estimatedDelivery as string) ?? null,
      origin: (t.origin as string) ?? null,
      destination: (t.destination as string) ?? null,
    }));
  }

  private normalizeProduct(supplierId: string, raw: Record<string, unknown>): NormalizedProduct {
    return {
      supplierSku: String(raw.id ?? raw.productId ?? raw.sku ?? raw.pid ?? ""),
      supplierId,
      title: (raw.name ?? raw.title ?? raw.productName ?? "") as string,
      description: (raw.description ?? raw.desc ?? "") as string,
      price: parseFloat(String(raw.sellPrice ?? raw.price ?? raw.unitPrice ?? 0)),
      comparePrice: raw.originalPrice ? parseFloat(String(raw.originalPrice)) : null,
      currency: "USD",
      stock: parseInt(String(raw.stock ?? raw.quantity ?? 999), 10),
      moq: parseInt(String(raw.moq ?? 1), 10),
      images: (raw.images ?? raw.imageList ?? []) as string[],
      category: (raw.categoryName ?? raw.category ?? "") as string,
      subcategory: null,
      tags: [],
      shippingMethods: ((raw.shippingMethods ?? []) as Record<string, unknown>[]).map((s) => ({
        name: s.name as string,
        code: s.code as string,
        price: parseFloat(String(s.price ?? 0)),
        currency: "USD",
        estimatedDaysMin: parseInt(String(s.estimatedDaysMin ?? 7), 10),
        estimatedDaysMax: parseInt(String(s.estimatedDaysMax ?? 20), 10),
      })),
      leadTimeMin: parseInt(String(raw.processingTimeMin ?? raw.leadTimeMin ?? 3), 10),
      leadTimeMax: parseInt(String(raw.processingTimeMax ?? raw.leadTimeMax ?? 10), 10),
      weightKg: raw.weight ? parseFloat(String(raw.weight)) : null,
      dimensionsCm: raw.length
        ? {
            length: parseFloat(String(raw.length)),
            width: parseFloat(String(raw.width ?? 0)),
            height: parseFloat(String(raw.height ?? 0)),
          }
        : null,
      attributes: (raw.attributes ?? raw.props ?? {}) as Record<string, string>,
      variants: ((raw.variants ?? raw.skuList ?? []) as Record<string, unknown>[]).map((v) => ({
        supplierSku: String(v.id ?? v.sku ?? ""),
        title: (v.name ?? v.title ?? "") as string,
        price: parseFloat(String(v.sellPrice ?? v.price ?? 0)),
        comparePrice: null,
        stock: parseInt(String(v.stock ?? v.quantity ?? 0), 10),
        attributes: (v.attributes as Record<string, string>) ?? {},
        images: (v.images as string[]) ?? [],
        weightKg: v.weight ? parseFloat(String(v.weight)) : null,
      })),
      hsCode: (raw.hsCode as string) ?? null,
      countryOfOrigin: (raw.countryOfOrigin as string) ?? "China",
    };
  }
}
