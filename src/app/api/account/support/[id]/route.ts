import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/supabase/api";
import { sendEmail } from "@/lib/email/send";
import { buildAdminSupportNotificationHtml } from "@/lib/email/templates/support";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAuth(request);
  if (auth.error) return auth.error;

  const { id } = await params;
  const customer = await prisma.customer.findUnique({ where: { authUserId: auth.user.id } });
  if (!customer) return NextResponse.json({ error: "Customer not found" }, { status: 404 });

  const ticket = await prisma.supportTicket.findFirst({
    where: { id, customerId: customer.id },
    include: { messages: { orderBy: { createdAt: "asc" } } },
  });
  if (!ticket) return NextResponse.json({ error: "Ticket not found" }, { status: 404 });

  return NextResponse.json(ticket);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAuth(request);
  if (auth.error) return auth.error;

  const { id } = await params;
  const body = await request.json();
  const { message } = body;

  if (!message) {
    return NextResponse.json({ error: "message is required" }, { status: 400 });
  }

  const customer = await prisma.customer.findUnique({ where: { authUserId: auth.user.id } });
  if (!customer) return NextResponse.json({ error: "Customer not found" }, { status: 404 });

  const ticket = await prisma.supportTicket.findFirst({
    where: { id, customerId: customer.id },
  });
  if (!ticket) return NextResponse.json({ error: "Ticket not found" }, { status: 404 });

  const ticketMessage = await prisma.supportTicketMessage.create({
    data: {
      ticketId: id,
      authorType: "customer",
      message,
    },
  });

  if (ticket.status === "awaiting_customer") {
    await prisma.supportTicket.update({ where: { id }, data: { status: "open" } });
  }

  try {
    const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL;
    if (adminEmail) {
      const ticketNumber = ticket.id.slice(0, 8).toUpperCase();
      const adminHtml = buildAdminSupportNotificationHtml({
        customerName: customer.firstName || customer.email,
        customerEmail: customer.email,
        ticketNumber: ticket.id.slice(0, 8).toUpperCase(),
        subject: ticket.subject,
        priority: ticket.priority,
        message,
      });
      await sendEmail({ to: adminEmail, subject: `[Support] Reply on #${ticketNumber} — ${ticket.subject}`, html: adminHtml });
    }
  } catch {
    // Non-fatal
  }

  return NextResponse.json({ message: ticketMessage });
}
