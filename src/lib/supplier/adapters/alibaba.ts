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
 * Alibaba / 1688 International REST API adapter.
 *
 * Auth: OAuth2 client credentials → Bearer token.
 * Base URL: https://api.alibaba.com/rest
 */
export class AlibabaAdapter extends BaseSupplierAdapter {
  readonly code = "ALIBABA";
  readonly name = "Alibaba";
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
    options: { method?: string; body?: unknown; params?: Record<string, string> } = {},
  ) {
    const supplier = await this.getSupplier(supplierId);
    if (!supplier.apiUrl) throw new Error(`Alibaba adapter: no apiUrl for supplier ${supplierId}`);

    const url = new URL(path, supplier.apiUrl);
    if (options.params) {
      for (const [k, v] of Object.entries(options.params)) url.searchParams.set(k, v);
    }

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

      if (!res.ok) throw new Error(`Alibaba API error ${res.status}: ${text}`);
      return JSON.parse(text);
    } catch (err) {
      if (!(err instanceof Error && err.message.startsWith("Alibaba API error"))) {
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
    const data = await this.request(supplierId, "/api/product/list", {
      params: { pageSize: "200", status: "active" },
    });
    return (data?.products ?? []).map(this.normalizeProduct.bind(this, supplierId));
  }

  async fetchProduct(supplierId: string, sku: string): Promise<NormalizedProduct | null> {
    try {
      const data = await this.request(supplierId, `/api/product/detail/${encodeURIComponent(sku)}`);
      return data?.product ? this.normalizeProduct(supplierId, data.product) : null;
    } catch {
      return null;
    }
  }

  async checkStock(supplierId: string, skus: string[]): Promise<Map<string, NormalizedStock>> {
    const data = await this.request(supplierId, "/api/product/stock", {
      method: "POST",
      body: { skus },
    });
    const map = new Map<string, NormalizedStock>();
    for (const item of data?.stock ?? []) {
      map.set(item.sku, {
        sku: item.sku,
        available: item.availableQuantity ?? 0,
        reserved: item.reservedQuantity ?? 0,
        price: item.price ?? 0,
        currency: "USD",
        updatedAt: new Date().toISOString(),
      });
    }
    return map;
  }

  async placeOrder(dispatch: SupplierOrderDispatch): Promise<SupplierOrderResult> {
    const data = await this.request(dispatch.supplierId, "/api/order/create", {
      method: "POST",
      body: {
        orderId: dispatch.orderNumber,
        items: dispatch.items.map((i) => ({
          sku: i.supplierSku,
          quantity: i.quantity,
          price: i.unitPrice,
        })),
        shipping: dispatch.shippingAddress,
      },
    });
    return {
      supplierOrderId: data?.orderId ?? "",
      status: data?.status === "confirmed" ? "confirmed" : "pending",
      trackingNumber: data?.trackingNumber ?? null,
      estimatedDelivery: data?.estimatedDelivery ?? null,
      errorMessage: data?.error ?? null,
      rawResponse: data ?? {},
    };
  }

  async checkOrderStatus(supplierOrderId: string): Promise<SupplierOrderStatus> {
    const data = await this.request(supplierOrderId, `/api/order/status/${encodeURIComponent(supplierOrderId)}`);
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
    const data = await this.request(supplierOrderId, `/api/order/tracking/${encodeURIComponent(supplierOrderId)}`);
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
      supplierSku: raw.sku as string,
      supplierId,
      title: raw.title as string,
      description: (raw.description as string) ?? "",
      price: parseFloat(String(raw.price ?? 0)),
      comparePrice: raw.comparePrice ? parseFloat(String(raw.comparePrice)) : null,
      currency: (raw.currency as string) ?? "USD",
      stock: parseInt(String(raw.stock ?? 0), 10),
      moq: parseInt(String(raw.moq ?? 1), 10),
      images: (raw.images as string[]) ?? [],
      category: (raw.category as string) ?? "",
      subcategory: (raw.subcategory as string) ?? null,
      tags: (raw.tags as string[]) ?? [],
      shippingMethods: ((raw.shippingMethods as Record<string, unknown>[]) ?? []).map((s) => ({
        name: s.name as string,
        code: s.code as string,
        price: parseFloat(String(s.price ?? 0)),
        currency: (s.currency as string) ?? "USD",
        estimatedDaysMin: parseInt(String(s.estimatedDaysMin ?? 5), 10),
        estimatedDaysMax: parseInt(String(s.estimatedDaysMax ?? 15), 10),
      })),
      leadTimeMin: parseInt(String(raw.leadTimeMin ?? 5), 10),
      leadTimeMax: parseInt(String(raw.leadTimeMax ?? 15), 10),
      weightKg: raw.weightKg ? parseFloat(String(raw.weightKg)) : null,
      dimensionsCm: raw.dimensionsCm
        ? (raw.dimensionsCm as { length: number; width: number; height: number })
        : null,
      attributes: (raw.attributes as Record<string, string>) ?? {},
      variants: ((raw.variants as Record<string, unknown>[]) ?? []).map((v) => ({
        supplierSku: v.sku as string,
        title: v.title as string,
        price: parseFloat(String(v.price ?? 0)),
        comparePrice: v.comparePrice ? parseFloat(String(v.comparePrice)) : null,
        stock: parseInt(String(v.stock ?? 0), 10),
        attributes: (v.attributes as Record<string, string>) ?? {},
        images: (v.images as string[]) ?? [],
        weightKg: v.weightKg ? parseFloat(String(v.weightKg)) : null,
      })),
      hsCode: (raw.hsCode as string) ?? null,
      countryOfOrigin: (raw.countryOfOrigin as string) ?? null,
    };
  }
}
