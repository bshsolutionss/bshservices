import { NextResponse, type NextRequest } from "next/server";
import { requirePortalUser } from "@/lib/portal/session";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { getClientInvoice } from "@/lib/portal/data";
import { renderInvoicePdf } from "@/lib/pdf/render-invoice";

export const runtime = "nodejs";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requirePortalUser();
  if (auth.unauthorized) return auth.unauthorized;
  const { id } = await params;

  // Ownership check first: only the client's own, non-draft invoices are ever rendered.
  const owned = await getClientInvoice(auth.session.clientId, id);
  if (!owned) return NextResponse.json({ ok: false, error: "Invoice not found." }, { status: 404 });

  const rendered = await renderInvoicePdf(createServiceRoleClient(), id);
  if (!rendered) return NextResponse.json({ ok: false, error: "Invoice not found." }, { status: 404 });

  return new NextResponse(new Uint8Array(rendered.buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${rendered.invoice.invoice_number}.pdf"`,
      "Cache-Control": "private, no-store",
    },
  });
}
