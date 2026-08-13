import { NextResponse } from "next/server";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { renderToBuffer } from "@react-pdf/renderer";
import { requireAdminUser } from "@/lib/admin/api-auth";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { InvoiceDocument } from "@/lib/pdf/InvoiceDocument";
import type { Invoice, Payment, InvoiceBalance } from "@/lib/invoices";
import type { Client } from "@/lib/clients";

// react-pdf needs Node APIs (fs, Buffer) — not compatible with the edge runtime.
export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminUser();
  if (auth.unauthorized) return auth.unauthorized;

  const { id } = await params;
  const service = createServiceRoleClient();

  const { data: invoice } = await service.from("invoices").select("*").eq("id", id).single<Invoice>();
  if (!invoice) {
    return NextResponse.json({ ok: false, error: "Invoice not found." }, { status: 404 });
  }

  const [{ data: client }, { data: paymentsData }, { data: balance }] = await Promise.all([
    service.from("clients").select("*").eq("id", invoice.client_id).single<Client>(),
    service.from("payments").select("*").eq("invoice_id", id).order("paid_on", { ascending: false }),
    service.from("invoice_balances").select("*").eq("invoice_id", id).single<InvoiceBalance>(),
  ]);

  if (!client) {
    return NextResponse.json({ ok: false, error: "Client not found for this invoice." }, { status: 500 });
  }

  const payments = (paymentsData ?? []) as Payment[];
  const paid = balance ? Number(balance.paid) : 0;
  const remaining = balance ? Number(balance.balance) : Number(invoice.total);

  const logoBuffer = await readFile(path.join(process.cwd(), "public", "android-chrome-192x192.png"));

  const pdfBuffer = await renderToBuffer(
    InvoiceDocument({ invoice, client, payments, paid, balance: remaining, logoBuffer })
  );

  return new NextResponse(new Uint8Array(pdfBuffer), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${invoice.invoice_number}.pdf"`,
      "Cache-Control": "private, no-store",
    },
  });
}
