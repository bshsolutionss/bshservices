import { NextResponse, type NextRequest } from "next/server";
import { requirePortalUser } from "@/lib/portal/session";
import { createServiceRoleClient } from "@/lib/supabase/service";

function csv(value: unknown): string {
  const s = String(value ?? "");
  // Leading = + - @ can be run as formulas by spreadsheet apps; neutralise them.
  const safe = /^[=+\-@]/.test(s) ? `'${s}` : s;
  return `"${safe.replace(/"/g, '""')}"`;
}

/** Payments received in one financial year (July 1 - June 30), as CSV. */
export async function GET(request: NextRequest) {
  const auth = await requirePortalUser();
  if (auth.unauthorized) return auth.unauthorized;

  const year = Number(request.nextUrl.searchParams.get("year"));
  if (!Number.isInteger(year) || year < 2000 || year > 2100) {
    return NextResponse.json({ ok: false, error: "Choose a valid year." }, { status: 400 });
  }
  const from = `${year}-07-01`;
  const to = `${year + 1}-06-30`;

  const service = createServiceRoleClient();
  const { data: invoices } = await service
    .from("invoices")
    .select("id, invoice_number, currency")
    .eq("client_id", auth.session.clientId)
    .neq("status", "draft");
  const byId = new Map((invoices ?? []).map((i) => [i.id as string, i]));
  const ids = [...byId.keys()];
  const { data: payments } = ids.length
    ? await service.from("payments").select("invoice_id, amount, paid_on, method, reference").in("invoice_id", ids).gte("paid_on", from).lte("paid_on", to).order("paid_on")
    : { data: [] };

  const lines = [["Date", "Invoice", "Amount", "Currency", "Method", "Reference"].join(",")];
  for (const p of payments ?? []) {
    const inv = byId.get(p.invoice_id);
    lines.push([p.paid_on, inv?.invoice_number, p.amount, inv?.currency, p.method, p.reference].map(csv).join(","));
  }
  return new NextResponse(lines.join("\r\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="statement-FY${year}-${String(year + 1).slice(2)}.csv"`,
      "Cache-Control": "private, no-store",
    },
  });
}
