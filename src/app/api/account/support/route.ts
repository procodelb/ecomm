import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/supabase/api";
import { sendEmail } from "@/lib/email/send";
import { buildSupportConfirmationHtml, buildAdminSupportNotificationHtml } from "@/lib/email/templates/support";

export async function GET(request: NextRequest) {
  const auth = await requireAuth(request);
  if (auth.error) return auth.error;

  const customer = await prisma.customer.findUnique({ where: { authUserId: auth.user.id } });
  if (!customer) return NextResponse.json({ error: "Customer not found" }, { status: 404 });

  const tickets = await prisma.supportTicket.findMany({
    where: { customerId: customer.id },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { messages: true } } },
  });

  return NextResponse.json({ tickets });
}

export async function POST(request: NextRequest) {
  const auth = await requireAuth(request);
  if (auth.error) return auth.error;

  const body = await request.json();
  const { subject, message, orderId, priority } = body;

  if (!subject || !message) {
    return NextResponse.json({ error: "subject and message are required" }, { status: 400 });
  }

  const customer = await prisma.customer.findUnique({ where: { authUserId: auth.user.id } });
  if (!customer) return NextResponse.json({ error: "Customer not found" }, { status: 404 });

  const ticket = await prisma.supportTicket.create({
    data: {
      customerId: customer.id,
      subject,
      message,
      orderId: orderId || null,
      priority: priority || "normal",
    },
  });

  try {
    const ticketNumber = ticket.id.slice(0, 8).toUpperCase();
    const customerHtml = buildSupportConfirmationHtml({
      customerName: customer.firstName || customer.email,
      ticketNumber,
      subject,
      priority: priority || "normal",
    });
    await sendEmail({ to: customer.email, subject: `Support Ticket Received — #${ticketNumber}`, html: customerHtml });

    const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL;
    if (adminEmail) {
      const adminHtml = buildAdminSupportNotificationHtml({
        customerName: customer.firstName || customer.email,
        customerEmail: customer.email,
        ticketNumber,
        subject,
        priority: priority || "normal",
        message,
      });
      await sendEmail({ to: adminEmail, subject: `[Support] New Ticket #${ticketNumber} — ${subject}`, html: adminHtml });
    }
  } catch {
    // Non-fatal — ticket created regardless
  }

  return NextResponse.json({ ticket, message: "Support ticket created" });
}
