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
 * OEM Partner adapter — for custom manufacturing partners.
 *
 * These partners typically have custom APIs with varying auth schemes.
 * The adapter reads configuration from the Supplier record to determine
 * the specific protocol. Supports JSON REST and SOAP/XML endpoints.
 */
export class OemPartnerAdapter extends BaseSupplierAdapter {
  readonly code = "OEM_PARTNER";
  readonly name = "OEM Partner";
  readonly capabilities: SupplierAdapterCapabilities = {
    realtimeProducts: true,
    realtimeStock: false,
    realtimeOrders: true,
    realtimeTracking: true,
    supportedSync: ["products", "orders", "tracking"],
  };

  private async request(
    supplierId: string,
    path: string,
    options: { method?: string; body?: unknown; headers?: Record<string, string> } = {},
  ) {
    const supplier = await this.getSupplier(supplierId);
    if (!supplier.apiUrl) throw new Error(`OEM adapter: no apiUrl for supplier ${supplierId}`);

    const url = new URL(path, supplier.apiUrl);

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...options.headers,
    };

    // Decode auth from metadata
    const meta = (supplier.metadata ?? {}) as Record<string, unknown>;
    const authType = (meta.authType as string) ?? "bearer";

    if (supplier.apiKeyEncrypted) {
      if (authType === "basic") {
        headers["Authorization"] = `Basic ${supplier.apiKeyEncrypted}`;
      } else if (authType === "header") {
        const headerName = (meta.authHeaderName as string) ?? "X-Api-Key";
        headers[headerName] = supplier.apiKeyEncrypted;
      } else {
        headers["Authorization"] = `Bearer ${supplier.apiKeyEncrypted}`;
      }
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

      if (!res.ok) throw new Error(`OEM API error ${res.status}: ${text}`);

      const contentType = res.headers.get("content-type") ?? "";
      if (contentType.includes("xml") || contentType.includes("soap")) {
        return { rawXml: text };
      }
      return JSON.parse(text);
    } catch (err) {
      if (!(err instanceof Error && err.message.startsWith("OEM API error"))) {
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
    const data = await this.request(supplierId, "/products", { method: "GET" });
    return ((data?.products ?? data?.data ?? data?.result ?? []) as Record<string, unknown>[]).map(
      (p) => this.normalizeProduct(supplierId, p),
    );
  }

  async fetchProduct(supplierId: string, sku: string): Promise<NormalizedProduct | null> {
    try {
      const data = await this.request(supplierId, `/products/${encodeURIComponent(sku)}`);
      return data?.product ?? data?.data ?? data
        ? this.normalizeProduct(supplierId, data?.product ?? data?.data ?? data)
        : null;
    } catch {
      return null;
    }
  }

  async checkStock(_supplierId: string, _skus: string[]): Promise<Map<string, NormalizedStock>> {
    return new Map();
  }

  async placeOrder(dispatch: SupplierOrderDispatch): Promise<SupplierOrderResult> {
    const data = await this.request(dispatch.supplierId, "/orders", {
      method: "POST",
      body: {
        reference: dispatch.orderNumber,
        items: dispatch.items.map((i) => ({
          sku: i.supplierSku,
          qty: i.quantity,
          price: i.unitPrice,
        })),
        shipping: {
          address: dispatch.shippingAddress.line1,
          address2: dispatch.shippingAddress.line2,
          city: dispatch.shippingAddress.city,
          state: dispatch.shippingAddress.state,
          zip: dispatch.shippingAddress.postalCode,
          country: dispatch.shippingAddress.country,
        },
        locale: dispatch.locale,
        currency: dispatch.currency,
      },
    });
    return {
      supplierOrderId: String(data?.id ?? data?.orderId ?? data?.reference ?? ""),
      status: data?.status === "confirmed" || data?.status === "accepted" ? "confirmed" : "pending",
      trackingNumber: data?.trackingNumber ?? null,
      estimatedDelivery: data?.estimatedDelivery ?? data?.eta ?? null,
      errorMessage: data?.error ?? data?.message ?? null,
      rawResponse: (data ?? {}) as Record<string, unknown>,
    };
  }

  async checkOrderStatus(supplierOrderId: string): Promise<SupplierOrderStatus> {
    const data = await this.request(supplierOrderId, `/orders/${encodeURIComponent(supplierOrderId)}/status`);
    const result = data?.order ?? data?.data ?? data ?? {};
    return {
      supplierOrderId,
      status: (result.status as SupplierOrderStatus["status"]) ?? "pending",
      trackingNumber: result.trackingNumber ?? null,
      carrier: result.carrier ?? result.courier ?? null,
      estimatedDelivery: result.estimatedDelivery ?? result.eta ?? null,
      events: (result.events ?? result.statusHistory ?? []).map((e: Record<string, string>) => ({
        date: e.date ?? e.timestamp ?? "",
        status: e.status ?? "",
        description: e.description ?? e.note ?? "",
        location: e.location ?? null,
      })),
    };
  }

  async getTracking(supplierOrderId: string): Promise<NormalizedTracking[]> {
    const data = await this.request(supplierOrderId, `/orders/${encodeURIComponent(supplierOrderId)}/tracking`);
    const list = (data?.tracking ?? data?.shipments ?? []) as Record<string, unknown>[];
    return list.map((t) => ({
      trackingNumber: t.trackingNumber as string,
      carrier: (t.carrier ?? t.courier ?? "") as string,
      status: (t.status as NormalizedTracking["status"]) ?? "pending",
      events: ((t.events ?? t.checkpoints ?? []) as Record<string, string>[]).map((e) => ({
        date: (e.date ?? e.timestamp ?? "") as string,
        location: (e.location ?? "") as string,
        description: (e.description ?? e.message ?? "") as string,
        status: (e.status ?? "") as string,
      })),
      estimatedDelivery: (t.estimatedDelivery ?? t.eta ?? null) as string | null,
      origin: (t.origin ?? null) as string | null,
      destination: (t.destination ?? null) as string | null,
    }));
  }

  private normalizeProduct(supplierId: string, raw: Record<string, unknown>): NormalizedProduct {
    return {
      supplierSku: String(raw.id ?? raw.sku ?? raw.productCode ?? ""),
      supplierId,
      title: (raw.name ?? raw.title ?? raw.productName ?? "") as string,
      description: (raw.description ?? raw.desc ?? "") as string,
      price: parseFloat(String(raw.price ?? raw.unitPrice ?? raw.salePrice ?? 0)),
      comparePrice: raw.comparePrice ? parseFloat(String(raw.comparePrice)) : null,
      currency: (raw.currency as string) ?? "USD",
      stock: parseInt(String(raw.stock ?? raw.availableQuantity ?? 0), 10),
      moq: parseInt(String(raw.moq ?? raw.minOrderQty ?? 1), 10),
      images: (raw.images ?? raw.imageUrls ?? [raw.imageUrl].filter(Boolean)) as string[],
      category: (raw.category ?? raw.categoryName ?? "") as string,
      subcategory: (raw.subcategory as string) ?? null,
      tags: (raw.tags as string[]) ?? [],
      shippingMethods: ((raw.shippingMethods as Record<string, unknown>[]) ?? []).map((s) => ({
        name: s.name as string,
        code: s.code as string,
        price: parseFloat(String(s.price ?? 0)),
        currency: (s.currency as string) ?? "USD",
        estimatedDaysMin: parseInt(String(s.estimatedDaysMin ?? 5), 10),
        estimatedDaysMax: parseInt(String(s.estimatedDaysMax ?? 20), 10),
      })),
      leadTimeMin: parseInt(String(raw.leadTimeMin ?? raw.productionTimeMin ?? 10), 10),
      leadTimeMax: parseInt(String(raw.leadTimeMax ?? raw.productionTimeMax ?? 30), 10),
      weightKg: raw.weight ? parseFloat(String(raw.weight)) : null,
      dimensionsCm: raw.length
        ? {
            length: parseFloat(String(raw.length)),
            width: parseFloat(String(raw.width ?? 0)),
            height: parseFloat(String(raw.height ?? 0)),
          }
        : null,
      attributes: (raw.attributes ?? raw.specifications ?? {}) as Record<string, string>,
      variants: ((raw.variants ?? raw.options ?? []) as Record<string, unknown>[]).map((v) => ({
        supplierSku: String(v.id ?? v.sku ?? ""),
        title: (v.name ?? v.title ?? "") as string,
        price: parseFloat(String(v.price ?? v.unitPrice ?? 0)),
        comparePrice: v.comparePrice ? parseFloat(String(v.comparePrice)) : null,
        stock: parseInt(String(v.stock ?? 0), 10),
        attributes: (v.attributes as Record<string, string>) ?? {},
        images: (v.images as string[]) ?? [],
        weightKg: v.weight ? parseFloat(String(v.weight)) : null,
      })),
      hsCode: (raw.hsCode as string) ?? null,
      countryOfOrigin: (raw.countryOfOrigin as string) ?? null,
    };
  }
}
