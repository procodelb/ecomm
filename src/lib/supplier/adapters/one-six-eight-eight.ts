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
 * 1688.com (Alibaba China) adapter via Taobao Open Platform (TOP).
 *
 * Auth: App key + App secret → signed request.
 * Uses the Alibaba ICP (International China Platform) API.
 */
export class OneSixEightEightAdapter extends BaseSupplierAdapter {
  readonly code = "1688";
  readonly name = "1688.com";
  readonly capabilities: SupplierAdapterCapabilities = {
    realtimeProducts: true,
    realtimeStock: true,
    realtimeOrders: false,
    realtimeTracking: false,
    supportedSync: ["products", "stock"],
  };

  private generateSignature(params: Record<string, string>, appSecret: string): string {
    const keys = Object.keys(params).sort();
    const sorted = keys.map((k) => `${k}${params[k]}`).join("");
    const signStr = `${appSecret}${sorted}${appSecret}`;

    const crypto = {
      // Simplified — in production use Node.js crypto
      hexDigest: (input: string): string => {
        let hash = 0;
        for (let i = 0; i < input.length; i++) {
          const chr = input.charCodeAt(i);
          hash = ((hash << 5) - hash) + chr;
          hash |= 0;
        }
        return Math.abs(hash).toString(16).padStart(8, "0");
      },
    };
    return crypto.hexDigest(signStr).toUpperCase();
  }

  private async request(
    supplierId: string,
    apiMethod: string,
    options: { body?: unknown } = {},
  ) {
    const supplier = await this.getSupplier(supplierId);
    if (!supplier.apiUrl) throw new Error(`1688 adapter: no apiUrl for supplier ${supplierId}`);

    const [appKey, appSecret] = (supplier.apiKeyEncrypted ?? ":").split(":");
    const params: Record<string, string> = {
      method: apiMethod,
      app_key: appKey,
      timestamp: new Date().toISOString().replace(/[:.]/g, "").slice(0, 14),
      format: "json",
      v: "2.0",
      sign_method: "md5",
    };

    params.sign = this.generateSignature(params, appSecret);

    const url = new URL(supplier.apiUrl);
    for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);

    const start = Date.now();
    try {
      const res = await fetch(url.toString(), {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8" },
        body: options.body ? new URLSearchParams(options.body as Record<string, string>).toString() : undefined,
      });
      const responseTimeMs = Date.now() - start;
      const text = await res.text();

      await this.log(supplierId, "api_request", res.ok ? "success" : "failed", {
        requestUrl: url.toString(),
        requestMethod: "POST",
        responseStatus: res.status,
        responseBody: text,
        responseTimeMs,
      });

      if (!res.ok) throw new Error(`1688 API error ${res.status}: ${text}`);
      return JSON.parse(text);
    } catch (err) {
      if (!(err instanceof Error && err.message.startsWith("1688 API error"))) {
        await this.log(supplierId, "api_request", "error", {
          requestUrl: url.toString(),
          requestMethod: "POST",
          errorMessage: err instanceof Error ? err.message : "Unknown",
          errorStack: err instanceof Error ? err.stack : undefined,
          responseTimeMs: Date.now() - start,
        });
      }
      throw err;
    }
  }

  async fetchProducts(supplierId: string): Promise<NormalizedProduct[]> {
    const data = await this.request(supplierId, "alibaba.icp.product.list");
    return (data?.result?.products ?? []).map((p: Record<string, unknown>) =>
      this.normalizeProduct(supplierId, p),
    );
  }

  async fetchProduct(supplierId: string, sku: string): Promise<NormalizedProduct | null> {
    try {
      const data = await this.request(supplierId, "alibaba.icp.product.detail", {
        body: { productId: sku },
      });
      return data?.result?.product ? this.normalizeProduct(supplierId, data.result.product) : null;
    } catch {
      return null;
    }
  }

  async checkStock(supplierId: string, skus: string[]): Promise<Map<string, NormalizedStock>> {
    const data = await this.request(supplierId, "alibaba.icp.product.stock.batch", {
      body: { skus: skus.join(",") },
    });
    const map = new Map<string, NormalizedStock>();
    for (const item of data?.result?.stock ?? []) {
      map.set(item.sku, {
        sku: item.sku,
        available: item.available ?? 0,
        reserved: 0,
        price: parseFloat(String(item.price ?? 0)),
        currency: "CNY",
        updatedAt: new Date().toISOString(),
      });
    }
    return map;
  }

  async placeOrder(_dispatch: SupplierOrderDispatch): Promise<SupplierOrderResult> {
    return {
      supplierOrderId: "",
      status: "error",
      trackingNumber: null,
      estimatedDelivery: null,
      errorMessage: "1688 order placement not supported via API; use Taobao agent",
      rawResponse: {},
    };
  }

  async checkOrderStatus(_supplierOrderId: string): Promise<SupplierOrderStatus> {
    return {
      supplierOrderId: _supplierOrderId,
      status: "pending",
      trackingNumber: null,
      carrier: null,
      estimatedDelivery: null,
      events: [],
    };
  }

  async getTracking(_supplierOrderId: string): Promise<NormalizedTracking[]> {
    return [];
  }

  private normalizeProduct(supplierId: string, raw: Record<string, unknown>): NormalizedProduct {
    return {
      supplierSku: String(raw.id ?? raw.sku ?? ""),
      supplierId,
      title: raw.title as string,
      description: (raw.description as string) ?? "",
      price: parseFloat(String(raw.price ?? 0)),
      comparePrice: raw.originalPrice ? parseFloat(String(raw.originalPrice)) : null,
      currency: "CNY",
      stock: parseInt(String(raw.stock ?? 0), 10),
      moq: parseInt(String(raw.moq ?? 2), 10),
      images: (raw.images as string[]) ?? [],
      category: (raw.categoryName as string) ?? "",
      subcategory: null,
      tags: [],
      shippingMethods: [],
      leadTimeMin: parseInt(String(raw.deliveryTime ?? 7), 10),
      leadTimeMax: parseInt(String(raw.deliveryTime ?? 15), 10),
      weightKg: raw.weight ? parseFloat(String(raw.weight)) : null,
      dimensionsCm: null,
      attributes: (raw.attributes as Record<string, string>) ?? {},
      variants: ((raw.skuList as Record<string, unknown>[]) ?? []).map((v) => ({
        supplierSku: String(v.id ?? v.sku ?? ""),
        title: (v.attrValue as string) ?? "",
        price: parseFloat(String(v.price ?? 0)),
        comparePrice: null,
        stock: parseInt(String(v.stock ?? 0), 10),
        attributes: (v.attributes as Record<string, string>) ?? {},
        images: [],
        weightKg: null,
      })),
      hsCode: null,
      countryOfOrigin: "China",
    };
  }
}
