import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { sendEmail } from "@/lib/email/send";

export const runtime = "nodejs";

const contactSchema = z.object({
  fullName: z.string().trim().min(1, "Full name is required").max(200),
  email: z.string().trim().min(1, "Email is required").email("Invalid email").max(254),
  phone: z.string().trim().min(1, "Phone is required").max(50),
  country: z.string().trim().min(1, "Country is required").max(100),
  subject: z.string().trim().min(1, "Subject is required").max(200),
  orderNumber: z.string().trim().max(50).optional().default(""),
  message: z.string().trim().min(1, "Message is required").max(5000),
  contactMethod: z.enum(["email", "whatsapp", "phone"]).default("email"),
  website: z.string().optional().default(""),
});

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const result = contactSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const data = result.data;

    if (data.website) {
      return NextResponse.json({ success: true });
    }

    if (!process.env.RESEND_API_KEY) {
      console.error("[api/contact] RESEND_API_KEY not configured — email not sent");
      return NextResponse.json(
        { error: "Email service not configured. Please try again later." },
        { status: 503 },
      );
    }

    const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || "admin@ecomm-store.com";

    const html = `
      <div style="font-family:system-ui,sans-serif;max-width:600px;margin:0 auto;padding:24px">
        <h2 style="color:#0A0A0A;border-bottom:2px solid #00D4FF;padding-bottom:12px">New Contact Inquiry</h2>
        <table style="width:100%;border-collapse:collapse;font-size:14px">
          <tr><td style="padding:8px 0;color:#666;width:140px"><strong>Name</strong></td><td style="padding:8px 0;color:#0A0A0A">${escapeHtml(data.fullName)}</td></tr>
          <tr><td style="padding:8px 0;color:#666"><strong>Email</strong></td><td style="padding:8px 0;color:#0A0A0A">${escapeHtml(data.email)}</td></tr>
          <tr><td style="padding:8px 0;color:#666"><strong>Phone</strong></td><td style="padding:8px 0;color:#0A0A0A">${escapeHtml(data.phone)}</td></tr>
          <tr><td style="padding:8px 0;color:#666"><strong>Country</strong></td><td style="padding:8px 0;color:#0A0A0A">${escapeHtml(data.country)}</td></tr>
          <tr><td style="padding:8px 0;color:#666"><strong>Subject</strong></td><td style="padding:8px 0;color:#0A0A0A">${escapeHtml(data.subject)}</td></tr>
          ${data.orderNumber ? `<tr><td style="padding:8px 0;color:#666"><strong>Order #</strong></td><td style="padding:8px 0;color:#0A0A0A">${escapeHtml(data.orderNumber)}</td></tr>` : ""}
          <tr><td style="padding:8px 0;color:#666"><strong>Preferred Contact</strong></td><td style="padding:8px 0;color:#0A0A0A;text-transform:capitalize">${escapeHtml(data.contactMethod)}</td></tr>
          <tr><td style="padding:8px 0;color:#666;vertical-align:top"><strong>Message</strong></td><td style="padding:8px 0;color:#0A0A0A;white-space:pre-wrap">${escapeHtml(data.message)}</td></tr>
        </table>
      </div>
    `;

    await sendEmail({
      to: adminEmail,
      subject: `[ECOMM Contact] ${escapeHtml(data.subject)}`,
      html,
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
