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
 * AliExpress REST API (AliExpress Open Platform).
 *
 * Auth: OAuth2 access token.
 * Uses the AE DSP / Drop Shipping Provider API.
 */
export class AliExpressAdapter extends BaseSupplierAdapter {
  readonly code = "ALIEXPRESS";
  readonly name = "AliExpress";
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
    if (!supplier.apiUrl) throw new Error(`AliExpress adapter: no apiUrl for supplier ${supplierId}`);

    const url = new URL(path, supplier.apiUrl);

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "application/json",
    };
    if (supplier.apiKeyEncrypted) {
      headers["Authorization"] = `Bearer ${supplier.apiKeyEncrypted}`;
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

      if (!res.ok) throw new Error(`AliExpress API error ${res.status}: ${text}`);
      return JSON.parse(text);
    } catch (err) {
      if (!(err instanceof Error && err.message.startsWith("AliExpress API error"))) {
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
    const data = await this.request(supplierId, "/api/dsp/product/list", {
      method: "POST",
      body: { pageSize: 200, status: "online" },
    });
    return (data?.result?.products ?? []).map((p: Record<string, unknown>) =>
      this.normalizeProduct(supplierId, p),
    );
  }

  async fetchProduct(supplierId: string, sku: string): Promise<NormalizedProduct | null> {
    try {
      const data = await this.request(supplierId, "/api/dsp/product/detail", {
        method: "POST",
        body: { productId: sku },
      });
      return data?.result?.product ? this.normalizeProduct(supplierId, data.result.product) : null;
    } catch {
      return null;
    }
  }

  async checkStock(supplierId: string, skus: string[]): Promise<Map<string, NormalizedStock>> {
    const data = await this.request(supplierId, "/api/dsp/product/stock", {
      method: "POST",
      body: { skus },
    });
    const map = new Map<string, NormalizedStock>();
    for (const item of data?.result?.stock ?? []) {
      map.set(item.sku, {
        sku: item.sku,
        available: item.available ?? 0,
        reserved: 0,
        price: parseFloat(String(item.unitPrice ?? 0)),
        currency: "USD",
        updatedAt: new Date().toISOString(),
      });
    }
    return map;
  }

  async placeOrder(dispatch: SupplierOrderDispatch): Promise<SupplierOrderResult> {
    const data = await this.request(dispatch.supplierId, "/api/dsp/order/create", {
      method: "POST",
      body: {
        externalOrderId: dispatch.orderNumber,
        productItems: dispatch.items.map((i) => ({
          productId: i.supplierSku,
          quantity: i.quantity,
          price: i.unitPrice,
        })),
        shippingAddress: {
          fullName: dispatch.shippingAddress.line1 as string,
          addressLine1: dispatch.shippingAddress.line1,
          addressLine2: dispatch.shippingAddress.line2,
          city: dispatch.shippingAddress.city,
          state: dispatch.shippingAddress.state,
          zip: dispatch.shippingAddress.postalCode,
          country: dispatch.shippingAddress.country,
        },
      },
    });
    return {
      supplierOrderId: data?.result?.orderId ?? "",
      status: data?.result?.status === "success" ? "confirmed" : "pending",
      trackingNumber: data?.result?.trackingNumber ?? null,
      estimatedDelivery: data?.result?.estimatedDelivery ?? null,
      errorMessage: data?.result?.error ?? null,
      rawResponse: data ?? {},
    };
  }

  async checkOrderStatus(supplierOrderId: string): Promise<SupplierOrderStatus> {
    const data = await this.request(supplierOrderId, "/api/dsp/order/status", {
      method: "POST",
      body: { orderId: supplierOrderId },
    });
    const result = data?.result ?? {};
    return {
      supplierOrderId,
      status: (result.status as SupplierOrderStatus["status"]) ?? "pending",
      trackingNumber: result.trackingNumber ?? null,
      carrier: result.carrier ?? null,
      estimatedDelivery: result.estimatedDelivery ?? null,
      events: (result.events ?? []).map((e: Record<string, string>) => ({
        date: e.date ?? "",
        status: e.status ?? "",
        description: e.description ?? "",
        location: e.location ?? null,
      })),
    };
  }

  async getTracking(supplierOrderId: string): Promise<NormalizedTracking[]> {
    const data = await this.request(supplierOrderId, "/api/dsp/order/tracking", {
      method: "POST",
      body: { orderId: supplierOrderId },
    });
    return (data?.result?.tracking ?? []).map((t: Record<string, unknown>) => ({
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
      supplierSku: String(raw.id ?? raw.productId ?? raw.sku ?? ""),
      supplierId,
      title: raw.title as string,
      description: (raw.description as string) ?? "",
      price: parseFloat(String(raw.salePrice ?? raw.price ?? 0)),
      comparePrice: raw.originalPrice ? parseFloat(String(raw.originalPrice)) : null,
      currency: "USD",
      stock: parseInt(String(raw.stock ?? raw.totalAvailableQuantity ?? 0), 10),
      moq: parseInt(String(raw.moq ?? raw.minOrderQuantity ?? 1), 10),
      images: (raw.images ?? raw.imageUrls ?? []) as string[],
      category: (raw.categoryName as string) ?? "",
      subcategory: (raw.subcategoryName as string) ?? null,
      tags: (raw.tags as string[]) ?? [],
      shippingMethods: ((raw.shippingMethods as Record<string, unknown>[]) ?? []).map((s) => ({
        name: s.name as string,
        code: s.code as string,
        price: parseFloat(String(s.price ?? 0)),
        currency: "USD",
        estimatedDaysMin: parseInt(String(s.estimatedDaysMin ?? 7), 10),
        estimatedDaysMax: parseInt(String(s.estimatedDaysMax ?? 25), 10),
      })),
      leadTimeMin: parseInt(String(raw.leadTimeMin ?? raw.deliveryTimeMin ?? 7), 10),
      leadTimeMax: parseInt(String(raw.leadTimeMax ?? raw.deliveryTimeMax ?? 20), 10),
      weightKg: raw.weight ? parseFloat(String(raw.weight)) : null,
      dimensionsCm: null,
      attributes: (raw.attributes as Record<string, string>) ?? {},
      variants: ((raw.skuList ?? raw.variants ?? []) as Record<string, unknown>[]).map((v) => ({
        supplierSku: String(v.id ?? v.sku ?? ""),
        title: (v.name ?? v.title ?? "") as string,
        price: parseFloat(String(v.salePrice ?? v.price ?? 0)),
        comparePrice: null,
        stock: parseInt(String(v.stock ?? v.availableQuantity ?? 0), 10),
        attributes: (v.attributes as Record<string, string>) ?? {},
        images: (v.images as string[]) ?? [],
        weightKg: v.weight ? parseFloat(String(v.weight)) : null,
      })),
      hsCode: (raw.hsCode as string) ?? null,
      countryOfOrigin: (raw.countryOfOrigin as string) ?? null,
    };
  }
}
