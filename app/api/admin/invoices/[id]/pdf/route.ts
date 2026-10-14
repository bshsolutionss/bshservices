import { NextResponse } from "next/server";
import { requireAdminUser } from "@/lib/admin/api-auth";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { renderInvoicePdf } from "@/lib/pdf/render-invoice";

// react-pdf needs Node APIs (fs, Buffer) — not compatible with the edge runtime.
export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminUser();
  if (auth.unauthorized) return auth.unauthorized;

  const { id } = await params;
  const rendered = await renderInvoicePdf(createServiceRoleClient(), id);
  if (!rendered) {
    return NextResponse.json({ ok: false, error: "Invoice not found." }, { status: 404 });
  }

  return new NextResponse(new Uint8Array(rendered.buffer), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${rendered.invoice.invoice_number}.pdf"`,
      "Cache-Control": "private, no-store",
    },
  });
}
