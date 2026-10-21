import { readFile } from "node:fs/promises";
import path from "node:path";
import type { SupabaseClient } from "@supabase/supabase-js";
import { renderToBuffer } from "@react-pdf/renderer";
import { InvoiceDocument } from "@/lib/pdf/InvoiceDocument";
import { getInvoiceSettings } from "@/lib/admin/invoice-settings";
import { getCompanySettings } from "@/lib/admin/company-settings";
import { ensureStatusOverrides } from "@/lib/admin/status-overrides";
import type { Invoice, InvoiceBalance, InvoiceItem, Payment } from "@/lib/invoices";
import type { Client } from "@/lib/clients";

export interface RenderedInvoice {
  buffer: Buffer;
  invoice: Invoice;
  client: Client;
  balance: InvoiceBalance | null;
}

/**
 * Loads an invoice with everything the PDF needs and renders it. Shared by
 * the download route and the "email to client" route so the PDF a client
 * receives is byte-for-byte what you download. Returns null when the invoice
 * or its client no longer exists. Node runtime only (react-pdf, fs).
 */
export async function renderInvoicePdf(service: SupabaseClient, id: string): Promise<RenderedInvoice | null> {
  await ensureStatusOverrides();
  const { data: invoice } = await service.from("invoices").select("*").eq("id", id).single<Invoice>();
  if (!invoice) return null;

  const [{ data: client }, { data: paymentsData }, { data: balance }, { data: itemsData }, settings, company, logoBuffer] =
    await Promise.all([
      service.from("clients").select("*").eq("id", invoice.client_id).single<Client>(),
      service.from("payments").select("*").eq("invoice_id", id).order("paid_on", { ascending: false }),
      service.from("invoice_balances").select("*").eq("invoice_id", id).single<InvoiceBalance>(),
      // Absent (→ []) on a non-itemised invoice - the document falls back to the single-amount layout.
      service.from("invoice_items").select("*").eq("invoice_id", id).order("position"),
      getInvoiceSettings(),
      getCompanySettings(),
      readFile(path.join(process.cwd(), "public", "android-chrome-192x192.png")),
    ]);

  if (!client) return null;

  const paid = balance ? Number(balance.paid) : 0;
  const remaining = balance ? Number(balance.balance) : Number(invoice.total);

  const buffer = await renderToBuffer(
    InvoiceDocument({
      invoice,
      client,
      payments: (paymentsData ?? []) as Payment[],
      items: (itemsData ?? []) as InvoiceItem[],
      paid,
      balance: remaining,
      logoBuffer,
      paymentDetails: settings.payment_details,
      terms: invoice.terms || settings.default_terms,
      company,
    })
  );

  return { buffer, invoice, client, balance: balance ?? null };
}
