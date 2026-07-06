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
 * Private Factory adapter — for factories with no API.
 *
 * Since private factories typically communicate via email, WeChat, or file transfer,
 * this adapter relies on manual data entry into the database and sends order
 * notifications via email. Products are managed directly in the admin panel.
 */
export class PrivateFactoryAdapter extends BaseSupplierAdapter {
  readonly code = "PRIVATE_FACTORY";
  readonly name = "Private Factory";
  readonly capabilities: SupplierAdapterCapabilities = {
    realtimeProducts: false,
    realtimeStock: false,
    realtimeOrders: false,
    realtimeTracking: false,
    supportedSync: [],
  };

  async fetchProducts(_supplierId: string): Promise<NormalizedProduct[]> {
    return [];
  }

  async fetchProduct(_supplierId: string, _sku: string): Promise<NormalizedProduct | null> {
    return null;
  }

  async checkStock(_supplierId: string, _skus: string[]): Promise<Map<string, NormalizedStock>> {
    return new Map();
  }

  async placeOrder(dispatch: SupplierOrderDispatch): Promise<SupplierOrderResult> {
    try {
      const supplier = await this.getSupplier(dispatch.supplierId);
      const email = supplier.contactEmail ?? process.env.SUPPLIER_ORDERS_EMAIL;
      if (email) {
        const { sendEmail } = await import("@/lib/email/send");
        await sendEmail({
          to: email,
          subject: `New Factory Order — ${dispatch.orderNumber}`,
          html: this.buildOrderEmailHtml(dispatch, supplier.name),
        });
      }

      await this.log(dispatch.supplierId, "order_dispatch", "success", {
        requestBody: JSON.stringify(dispatch),
        metadata: { orderNumber: dispatch.orderNumber, method: "email", recipient: email },
      });

      return {
        supplierOrderId: dispatch.orderId,
        status: "pending",
        trackingNumber: null,
        estimatedDelivery: null,
        errorMessage: null,
        rawResponse: { method: "email", recipient: email },
      };
    } catch (err) {
      await this.log(dispatch.supplierId, "order_dispatch", "error", {
        requestBody: JSON.stringify(dispatch),
        errorMessage: err instanceof Error ? err.message : "Unknown",
        metadata: { orderNumber: dispatch.orderNumber, method: "email" },
      });
      return {
        supplierOrderId: dispatch.orderId,
        status: "error",
        trackingNumber: null,
        estimatedDelivery: null,
        errorMessage: err instanceof Error ? err.message : "Failed to send factory order",
        rawResponse: {},
      };
    }
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

  private buildOrderEmailHtml(dispatch: SupplierOrderDispatch, supplierName: string): string {
    const itemsHtml = dispatch.items
      .map(
        (i) =>
          `<tr><td>${i.supplierSku}</td><td>${i.title}</td><td>${i.quantity}</td><td>${i.unitPrice}</td></tr>`,
      )
      .join("");
    return `
<h2>New Order — ${dispatch.orderNumber}</h2>
<p><strong>Supplier:</strong> ${supplierName}</p>
<table border="1" cellpadding="6" cellspacing="0" style="border-collapse:collapse;width:100%;">
  <tr><th>SKU</th><th>Product</th><th>Qty</th><th>Unit Price</th></tr>
  ${itemsHtml}
</table>
<h3>Shipping Address</h3>
<pre>${JSON.stringify(dispatch.shippingAddress, null, 2)}</pre>
<p><strong>Locale:</strong> ${dispatch.locale} | <strong>Currency:</strong> ${dispatch.currency}</p>`.trim();
  }
}
