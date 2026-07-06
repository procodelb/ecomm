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
 * Made-in-China.com REST API adapter.
 *
 * Auth: API key in query param or header.
 * Base URL: https://api.made-in-china.com
 */
export class MadeInChinaAdapter extends BaseSupplierAdapter {
  readonly code = "MADE_IN_CHINA";
  readonly name = "Made-in-China";
  readonly capabilities: SupplierAdapterCapabilities = {
    realtimeProducts: true,
    realtimeStock: false,
    realtimeOrders: true,
    realtimeTracking: false,
    supportedSync: ["products", "orders"],
  };

  private async request(
    supplierId: string,
    path: string,
    options: { method?: string; body?: unknown } = {},
  ) {
    const supplier = await this.getSupplier(supplierId);
    if (!supplier.apiUrl) throw new Error(`MIC adapter: no apiUrl for supplier ${supplierId}`);

    const url = new URL(path, supplier.apiUrl);
    url.searchParams.set("format", "json");

    const headers: Record<string, string> = {
      Accept: "application/json",
    };
    if (supplier.apiKeyEncrypted) {
      url.searchParams.set("key", supplier.apiKeyEncrypted);
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

      if (!res.ok) throw new Error(`MIC API error ${res.status}: ${text}`);
      return JSON.parse(text);
    } catch (err) {
      if (!(err instanceof Error && err.message.startsWith("MIC API error"))) {
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
      params: { pageSize: "200" },
    } as never);
    return (data?.products ?? []).map((p: Record<string, unknown>) => this.normalizeProduct(supplierId, p));
  }

  async fetchProduct(supplierId: string, sku: string): Promise<NormalizedProduct | null> {
    try {
      const data = await this.request(supplierId, `/product/detail/${encodeURIComponent(sku)}`);
      return data?.product ? this.normalizeProduct(supplierId, data.product) : null;
    } catch {
      return null;
    }
  }

  async checkStock(_supplierId: string, _skus: string[]): Promise<Map<string, NormalizedStock>> {
    return new Map();
  }

  async placeOrder(dispatch: SupplierOrderDispatch): Promise<SupplierOrderResult> {
    const data = await this.request(dispatch.supplierId, "/order/create", {
      method: "POST",
      body: {
        orderRef: dispatch.orderNumber,
        items: dispatch.items.map((i) => ({
          productSku: i.supplierSku,
          qty: i.quantity,
          unitPrice: i.unitPrice,
        })),
        shippingAddress: dispatch.shippingAddress,
      },
    });
    return {
      supplierOrderId: data?.orderId ?? "",
      status: data?.status === "confirmed" ? "confirmed" : "pending",
      trackingNumber: null,
      estimatedDelivery: null,
      errorMessage: data?.error ?? null,
      rawResponse: data ?? {},
    };
  }

  async checkOrderStatus(supplierOrderId: string): Promise<SupplierOrderStatus> {
    const data = await this.request(supplierOrderId, `/order/status/${encodeURIComponent(supplierOrderId)}`);
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

  async getTracking(_supplierOrderId: string): Promise<NormalizedTracking[]> {
    return [];
  }

  private normalizeProduct(supplierId: string, raw: Record<string, unknown>): NormalizedProduct {
    return {
      supplierSku: raw.sku as string,
      supplierId,
      title: raw.title as string,
      description: (raw.description as string) ?? "",
      price: parseFloat(String(raw.price ?? 0)),
      comparePrice: raw.comparePrice ? parseFloat(String(raw.comparePrice)) : null,
      currency: "USD",
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
        currency: "USD",
        estimatedDaysMin: parseInt(String(s.estimatedDaysMin ?? 7), 10),
        estimatedDaysMax: parseInt(String(s.estimatedDaysMax ?? 20), 10),
      })),
      leadTimeMin: parseInt(String(raw.leadTimeMin ?? 7), 10),
      leadTimeMax: parseInt(String(raw.leadTimeMax ?? 20), 10),
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
      countryOfOrigin: (raw.countryOfOrigin as string) ?? "China",
    };
  }
}
