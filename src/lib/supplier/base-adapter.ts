import "server-only";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import type {
  NormalizedProduct,
  NormalizedStock,
  NormalizedTracking,
  SupplierOrderDispatch,
  SupplierOrderResult,
  SupplierOrderStatus,
  SupplierAdapterCapabilities,
} from "./types";

export interface SupplierAdapter {
  readonly code: string;
  readonly name: string;
  readonly capabilities: SupplierAdapterCapabilities;

  /** Fetch all available products from supplier */
  fetchProducts(supplierId: string): Promise<NormalizedProduct[]>;

  /** Fetch a single product by supplier SKU */
  fetchProduct(supplierId: string, sku: string): Promise<NormalizedProduct | null>;

  /** Real-time stock + price for given SKUs */
  checkStock(supplierId: string, skus: string[]): Promise<Map<string, NormalizedStock>>;

  /** Place a new order with the supplier */
  placeOrder(dispatch: SupplierOrderDispatch): Promise<SupplierOrderResult>;

  /** Check status of a previously placed supplier order */
  checkOrderStatus(supplierOrderId: string): Promise<SupplierOrderStatus>;

  /** Fetch tracking information */
  getTracking(supplierOrderId: string): Promise<NormalizedTracking[]>;
}

export abstract class BaseSupplierAdapter implements SupplierAdapter {
  abstract readonly code: string;
  abstract readonly name: string;
  abstract readonly capabilities: SupplierAdapterCapabilities;

  protected async getSupplier(supplierId: string) {
    return prisma.supplier.findUniqueOrThrow({ where: { id: supplierId } });
  }

  protected async log(
    supplierId: string,
    eventType: string,
    status: string,
    data: {
      requestUrl?: string;
      requestMethod?: string;
      requestBody?: string;
      responseStatus?: number;
      responseBody?: string;
      responseTimeMs?: number;
      errorMessage?: string;
      errorStack?: string;
      metadata?: Record<string, unknown>;
    },
  ) {
    await prisma.supplierLog.create({
      data: {
        supplierId,
        eventType,
        status,
        requestUrl: data.requestUrl,
        requestMethod: data.requestMethod,
        requestBody: data.requestBody,
        responseStatus: data.responseStatus,
        responseBody: data.responseBody,
        responseTimeMs: data.responseTimeMs,
        errorMessage: data.errorMessage,
        errorStack: data.errorStack,
        metadata: (data.metadata ?? {}) as Prisma.InputJsonValue,
      },
    });
  }

  abstract fetchProducts(supplierId: string): Promise<NormalizedProduct[]>;
  abstract fetchProduct(supplierId: string, sku: string): Promise<NormalizedProduct | null>;
  abstract checkStock(supplierId: string, skus: string[]): Promise<Map<string, NormalizedStock>>;
  abstract placeOrder(dispatch: SupplierOrderDispatch): Promise<SupplierOrderResult>;
  abstract checkOrderStatus(supplierOrderId: string): Promise<SupplierOrderStatus>;
  abstract getTracking(supplierOrderId: string): Promise<NormalizedTracking[]>;
}

export type SupplierAdapterClass = new () => SupplierAdapter;
