import "server-only";

interface ItemData {
  title: string;
  variantTitle: string | null;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  imageUrl: string | null;
}

export function buildOrderConfirmationHtml(params: {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  items: ItemData[];
  subtotal: number;
  shippingCost: number;
  taxAmount: number;
  total: number;
  currencySymbol: string;
  shippingAddress: Record<string, unknown>;
  estimatedDelivery?: string | null;
}) {
  const rows = params.items
    .map(
      (item) => `
      <tr>
        <td style="padding:12px 0;border-bottom:1px solid #eee;">
          <div style="font-weight:600;">${escapeHtml(item.title)}${item.variantTitle ? ` — ${escapeHtml(item.variantTitle)}` : ""}</div>
          <div style="color:#888;font-size:13px;">Qty: ${item.quantity} × ${params.currencySymbol}${item.unitPrice.toFixed(2)}</div>
        </td>
        <td style="padding:12px 0;border-bottom:1px solid #eee;text-align:right;font-weight:600;">${params.currencySymbol}${item.lineTotal.toFixed(2)}</td>
      </tr>`,
    )
    .join("");

  const addr = params.shippingAddress;
  const addressLine = [addr.line1, addr.line2, addr.city, addr.state, addr.postalCode, addr.country]
    .filter(Boolean)
    .join(", ");

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;">
          <tr>
            <td style="background:#0B0B0B;padding:32px;text-align:center;">
              <h1 style="color:#00C2FF;margin:0;font-size:24px;letter-spacing:2px;">◈ ECOMM</h1>
              <p style="color:#fff;margin:8px 0 0;font-size:14px;">Order Confirmed</p>
            </td>
          </tr>
          <tr>
            <td style="padding:32px;">
              <p style="margin:0 0 4px;font-size:14px;color:#888;">Hello${params.customerName ? ` ${escapeHtml(params.customerName)}` : ""},</p>
              <p style="margin:0 0 24px;font-size:14px;color:#333;">Your order <strong>#${escapeHtml(params.orderNumber)}</strong> has been confirmed and is being processed.</p>

              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="font-size:14px;font-weight:600;padding-bottom:8px;border-bottom:2px solid #0B0B0B;">Items</td>
                  <td style="font-size:14px;font-weight:600;padding-bottom:8px;border-bottom:2px solid #0B0B0B;text-align:right;">Total</td>
                </tr>
                ${rows}
              </table>

              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:16px;">
                <tr>
                  <td style="font-size:14px;color:#888;padding:4px 0;">Subtotal</td>
                  <td style="font-size:14px;text-align:right;padding:4px 0;">${params.currencySymbol}${params.subtotal.toFixed(2)}</td>
                </tr>
                <tr>
                  <td style="font-size:14px;color:#888;padding:4px 0;">Shipping</td>
                  <td style="font-size:14px;text-align:right;padding:4px 0;">${params.shippingCost > 0 ? `${params.currencySymbol}${params.shippingCost.toFixed(2)}` : "Free"}</td>
                </tr>
                <tr>
                  <td style="font-size:14px;color:#888;padding:4px 0;">Tax</td>
                  <td style="font-size:14px;text-align:right;padding:4px 0;">${params.currencySymbol}${params.taxAmount.toFixed(2)}</td>
                </tr>
                <tr>
                  <td style="font-size:16px;font-weight:700;padding-top:12px;border-top:2px solid #0B0B0B;">Total</td>
                  <td style="font-size:16px;font-weight:700;text-align:right;padding-top:12px;border-top:2px solid #0B0B0B;">${params.currencySymbol}${params.total.toFixed(2)}</td>
                </tr>
              </table>

              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:24px;padding-top:24px;border-top:1px solid #eee;">
                <tr>
                  <td style="font-size:14px;font-weight:600;padding-bottom:8px;">Shipping To</td>
                </tr>
                <tr>
                  <td style="font-size:14px;color:#555;">${escapeHtml(addressLine)}</td>
                </tr>
              </table>

              ${params.estimatedDelivery ? `
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:16px;">
                <tr><td style="font-size:14px;font-weight:600;padding-bottom:4px;">Estimated Delivery</td></tr>
                <tr><td style="font-size:14px;color:#555;">${escapeHtml(params.estimatedDelivery)}</td></tr>
              </table>` : ""}
            </td>
          </tr>
          <tr>
            <td style="background:#f9f9f9;padding:20px 32px;text-align:center;border-top:1px solid #eee;">
              <p style="margin:0;font-size:12px;color:#888;">Need help? Contact our support team.</p>
              <p style="margin:4px 0 0;font-size:12px;color:#888;">© ${new Date().getFullYear()} ECOMM. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
