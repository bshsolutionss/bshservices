import { NextResponse, type NextRequest } from "next/server";
import { requireAdminUser } from "@/lib/admin/api-auth";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { recomputeInvoiceStatus } from "@/lib/admin/recompute-invoice-status";
import { getCompanySettings } from "@/lib/admin/company-settings";
import { logActivity } from "@/lib/activity";
import { cleanText, isUuid } from "@/lib/portal/admin-input";
import { formatMoney, type Currency } from "@/lib/invoices";

const TYPES = ["advance", "milestone", "regular", "final"];
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const fail = (error: string, status = 400) => NextResponse.json({ ok: false, error }, { status });

/**
 * One endpoint for the "Add payment" dialog.
 *  - received: money from a client against a project. Applied to a chosen open invoice,
 *    or - when there isn't one - recorded on a fresh receipt invoice, so every report,
 *    the client portal and the PDF receipt keep working off the same invoice/payment data.
 *  - paid_out: a payout to a team member or anyone else, stored as an expense.
 */
export async function POST(request: NextRequest) {
  const auth = await requireAdminUser();
  if (auth.unauthorized) return auth.unauthorized;

  const p = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  if (!p) return fail("Invalid request.");
  const amount = Number(p.amount);
  if (!Number.isFinite(amount) || amount <= 0) return fail("Enter an amount greater than zero.");
  const date = typeof p.date === "string" && DATE_RE.test(p.date) ? p.date : new Date().toISOString().slice(0, 10);
  const service = createServiceRoleClient();

  if (p.kind === "received") {
    if (!isUuid(p.projectId)) return fail("Choose the project this payment is for.");
    const type = TYPES.includes(String(p.paymentType)) ? String(p.paymentType) : "regular";
    const notes = cleanText(p.notes, 500);

    const { data: project } = await service.from("projects").select("id, name, client_id, currency").eq("id", p.projectId).maybeSingle();
    if (!project) return fail("Project not found.", 404);

    let invoiceId: string;
    if (isUuid(p.invoiceId)) {
      const { data: balance } = await service.from("invoice_balances").select("invoice_id, balance, currency").eq("invoice_id", p.invoiceId).eq("project_id", project.id).maybeSingle();
      if (!balance) return fail("That invoice doesn't belong to this project.");
      if (amount > Number(balance.balance) + 0.005) {
        return fail(`That's more than the ${formatMoney(Number(balance.balance), balance.currency as Currency)} still owed on this invoice. Enter a smaller amount, or record it as a new receipt.`);
      }
      invoiceId = balance.invoice_id;
    } else {
      const { data: number, error: numberError } = await service.rpc("next_invoice_number");
      if (numberError || !number) return fail("Could not generate a receipt number.", 500);
      const { data: invoice, error: invoiceError } = await service
        .from("invoices")
        .insert({
          invoice_number: number,
          client_id: project.client_id,
          project_id: project.id,
          amount,
          tax_rate: 0,
          currency: project.currency,
          issue_date: date,
          status: "sent",
          notes: `Payment received (${type})${notes ? ` - ${notes}` : ""}`,
        })
        .select("id")
        .single();
      if (invoiceError || !invoice) {
        console.error("[api/admin/payments] receipt invoice failed:", invoiceError);
        return fail("Could not record the payment.", 500);
      }
      const { error: itemError } = await service.from("invoice_items").insert({ invoice_id: invoice.id, position: 0, description: `Payment received - ${project.name} (${type})`, quantity: 1, unit_price: amount });
      if (itemError) {
        await service.from("invoices").delete().eq("id", invoice.id);
        return fail("Could not record the payment.", 500);
      }
      invoiceId = invoice.id;
    }

    const { error } = await service.from("payments").insert({ invoice_id: invoiceId, amount, paid_on: date, payment_type: type, notes });
    if (error) {
      console.error("[api/admin/payments] insert failed:", error);
      return fail("Could not record the payment. Run supabase/migrations/0017_retainers_payments_boards.sql first.", 500);
    }
    await recomputeInvoiceStatus(service, invoiceId);
    await logActivity({ entityType: "invoice", entityId: invoiceId, type: "payment_received", description: `Payment of ${formatMoney(amount, project.currency as Currency)} received (${type})` });
    return NextResponse.json({ ok: true, invoiceId });
  }

  if (p.kind === "paid_out") {
    const title = cleanText(p.title, 200);
    if (!title) return fail("Add a title for this payout.");
    let vendor = cleanText(p.vendor, 200);
    let employeeId: string | null = null;
    if (isUuid(p.employeeId)) {
      const { data: emp } = await service.from("employees").select("id, name").eq("id", p.employeeId).maybeSingle();
      if (!emp) return fail("That team member no longer exists.");
      employeeId = emp.id;
      vendor = emp.name;
    } else if (p.payee === "team") {
      return fail("Choose the team member who was paid.");
    }
    let projectId: string | null = null;
    let currency: Currency | undefined;
    if (isUuid(p.projectId)) {
      const { data: project } = await service.from("projects").select("id, currency").eq("id", p.projectId).maybeSingle();
      if (!project) return fail("Project not found.", 404);
      projectId = project.id;
      currency = project.currency as Currency;
    }
    const company = await getCompanySettings();

    const { error } = await service.from("expenses").insert({
      category: employeeId ? "Salaries" : "Other",
      amount,
      currency: currency ?? company.default_currency,
      expense_date: date,
      vendor,
      description: title,
      expense_type: "one_time",
      project_id: projectId,
      employee_id: employeeId,
    });
    if (error) {
      console.error("[api/admin/payments] payout failed:", error);
      return fail("Could not record the payout. Run supabase/migrations/0017_retainers_payments_boards.sql first.", 500);
    }
    return NextResponse.json({ ok: true });
  }

  return fail("Choose Received or Paid out.");
}
