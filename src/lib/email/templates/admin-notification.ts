import "server-only";

interface AdminOrderData {
  orderNumber: string;
  customerEmail: string;
  customerName: string | null;
  total: number;
  currencySymbol: string;
  itemCount: number;
  paymentMethod: string;
  paymentIntentId: string;
  locale: string;
  createdAt: string;
}

export function buildAdminNotificationHtml(data: AdminOrderData) {
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
              <h1 style="color:#00C2FF;margin:0;font-size:24px;">📦 New Order Received</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:32px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr><td style="padding:6px 0;"><strong>Order:</strong> #${data.orderNumber}</td></tr>
                <tr><td style="padding:6px 0;"><strong>Customer:</strong> ${data.customerName ? `${data.customerName} (${data.customerEmail})` : data.customerEmail}</td></tr>
                <tr><td style="padding:6px 0;"><strong>Items:</strong> ${data.itemCount}</td></tr>
                <tr><td style="padding:6px 0;"><strong>Total:</strong> ${data.currencySymbol}${data.total.toFixed(2)}</td></tr>
                <tr><td style="padding:6px 0;"><strong>Payment:</strong> ${data.paymentMethod}</td></tr>
                <tr><td style="padding:6px 0;"><strong>Payment ID:</strong> ${data.paymentIntentId}</td></tr>
                <tr><td style="padding:6px 0;"><strong>Locale:</strong> ${data.locale}</td></tr>
                <tr><td style="padding:6px 0;"><strong>Time:</strong> ${data.createdAt}</td></tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
