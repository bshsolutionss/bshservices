import { NextResponse, type NextRequest } from "next/server";
import { requireAdminUser } from "@/lib/admin/api-auth";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { logActivity } from "@/lib/activity";
import { renderInvoicePdf } from "@/lib/pdf/render-invoice";
import { sendEmail } from "@/lib/email/send";
import { resolveEmailConfig } from "@/lib/email/settings";
import { invoiceEmail } from "@/lib/email/templates";
import { formatDate, formatMoney } from "@/lib/invoices";

export const runtime = "nodejs";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface Payload {
  /** Defaults to the client's contact email. */
  to?: string;
  subject?: string;
  message?: string;
}

/** Emails the invoice PDF to the client; a draft becomes "sent" (unless turned off in Settings > Email). */
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdminUser();
  if (auth.unauthorized) return auth.unauthorized;

  const { id } = await params;
  const payload = (await request.json().catch(() => ({}))) as Payload;

  const service = createServiceRoleClient();
  const [rendered, config] = await Promise.all([renderInvoicePdf(service, id), resolveEmailConfig()]);
  if (!rendered) return NextResponse.json({ ok: false, error: "Invoice not found." }, { status: 404 });

  const { invoice, client, buffer } = rendered;
  const to = (payload.to || client.contact_email || "").trim();
  if (!EMAIL_RE.test(to)) {
    return NextResponse.json({ ok: false, error: "Enter a valid email address to send to." }, { status: 400 });
  }

  const template = invoiceEmail({
    clientName: client.contact_name || client.company_name,
    invoiceNumber: invoice.invoice_number,
    totalLabel: formatMoney(invoice.total, invoice.currency),
    dueLabel: invoice.due_date ? formatDate(invoice.due_date) : null,
    message: payload.message?.trim() || null,
  });

  const result = await sendEmail({
    to,
    subject: payload.subject?.trim() || template.subject,
    html: template.html,
    attachments: [{ filename: `${invoice.invoice_number}.pdf`, content: buffer }],
    kind: "invoice",
    entityType: "invoice",
    entityId: invoice.id,
  });
  if (!result.ok) return NextResponse.json({ ok: false, error: result.error }, { status: 502 });

  const now = new Date().toISOString();
  const markSent = invoice.status === "draft" && config.settings.notify_invoice_sent;
  const update: Record<string, unknown> = { last_emailed_at: now };
  if (markSent) {
    update.status = "sent";
    update.sent_at = now;
  }
  await service.from("invoices").update(update).eq("id", id);

  await logActivity({
    entityType: "invoice",
    entityId: id,
    type: "invoice_emailed",
    description: `Emailed to ${to}${markSent ? " and marked as sent" : ""}`,
  });

  return NextResponse.json({ ok: true, sent_to: to, marked_sent: markSent });
}
