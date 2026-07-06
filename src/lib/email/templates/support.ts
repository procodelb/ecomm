import "server-only";

export function buildSupportConfirmationHtml(params: {
  customerName: string;
  ticketNumber: string;
  subject: string;
  priority: string;
}) {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;">
          <tr>
            <td style="background:#0B0B0B;padding:32px;text-align:center;">
              <h1 style="color:#00C2FF;margin:0;font-size:22px;letter-spacing:2px;">◈ ECOMM</h1>
              <p style="color:#fff;margin:8px 0 0;font-size:14px;">Support Ticket Received</p>
            </td>
          </tr>
          <tr>
            <td style="padding:32px;">
              <p style="margin:0 0 4px;font-size:14px;color:#888;">Hello ${params.customerName},</p>
              <p style="margin:0 0 20px;font-size:14px;color:#333;">Your support ticket has been created. Our team will respond within 24 hours.</p>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f9f9f9;border-radius:8px;padding:16px;">
                <tr>
                  <td style="font-size:13px;color:#888;padding:4px 0;">Ticket</td>
                  <td style="font-size:13px;text-align:right;font-weight:600;">#${params.ticketNumber}</td>
                </tr>
                <tr>
                  <td style="font-size:13px;color:#888;padding:4px 0;">Subject</td>
                  <td style="font-size:13px;text-align:right;">${params.subject}</td>
                </tr>
                <tr>
                  <td style="font-size:13px;color:#888;padding:4px 0;">Priority</td>
                  <td style="font-size:13px;text-align:right;text-transform:capitalize;color:${params.priority === "urgent" ? "#ef4444" : params.priority === "high" ? "#f59e0b" : "#6b7280"};">${params.priority}</td>
                </tr>
              </table>
              <p style="margin:20px 0 0;font-size:12px;color:#888;">Track your ticket status anytime in your account dashboard.</p>
            </td>
          </tr>
          <tr>
            <td style="background:#f9f9f9;padding:20px 32px;text-align:center;border-top:1px solid #eee;">
              <p style="margin:0;font-size:12px;color:#888;">© ${new Date().getFullYear()} ECOMM. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function buildAdminSupportNotificationHtml(params: {
  customerName: string;
  customerEmail: string;
  ticketNumber: string;
  subject: string;
  priority: string;
  message: string;
}) {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;">
          <tr>
            <td style="background:#0B0B0B;padding:32px;text-align:center;">
              <h1 style="color:#00C2FF;margin:0;font-size:24px;">🎫 New Support Ticket</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:32px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr><td style="padding:6px 0;"><strong>Ticket:</strong> #${params.ticketNumber}</td></tr>
                <tr><td style="padding:6px 0;"><strong>Customer:</strong> ${params.customerName} (${params.customerEmail})</td></tr>
                <tr><td style="padding:6px 0;"><strong>Subject:</strong> ${params.subject}</td></tr>
                <tr><td style="padding:6px 0;"><strong>Priority:</strong> ${params.priority}</td></tr>
              </table>
              <div style="margin-top:16px;padding:16px;background:#f9f9f9;border-radius:8px;font-size:14px;color:#333;line-height:1.5;">${params.message}</div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
