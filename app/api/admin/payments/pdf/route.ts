import { NextResponse, type NextRequest } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { requireAdminUser } from "@/lib/admin/api-auth";
import { getCompanySettings } from "@/lib/admin/company-settings";
import { loadRecords, resolvePeriod, totalsPKR } from "@/lib/admin/payments-hub";
import { formatMoney } from "@/lib/invoices";
import { PaymentsDocument } from "@/lib/pdf/PaymentsDocument";

// react-pdf needs Node APIs.
export const runtime = "nodejs";

/** The payments timeline for a period as a PDF - same filters as the page. */
export async function GET(request: NextRequest) {
  const auth = await requireAdminUser();
  if (auth.unauthorized) return auth.unauthorized;

  const q = request.nextUrl.searchParams;
  const period = resolvePeriod(q.get("period") ?? undefined, q.get("from") ?? undefined, q.get("to") ?? undefined);
  const kind = q.get("kind");
  const [all, company] = await Promise.all([loadRecords(period), getCompanySettings()]);
  const records = kind === "received" || kind === "paid_out" ? all.filter((r) => r.kind === kind) : all;
  const totals = await totalsPKR(records);

  const buffer = await renderToBuffer(
    PaymentsDocument({
      companyName: company.name,
      periodLabel: period.label,
      records,
      totals: { received: formatMoney(totals.received, "PKR"), paidOut: formatMoney(totals.paidOut, "PKR"), net: formatMoney(totals.net, "PKR") },
    })
  );
  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="payments-${period.key}.pdf"`,
      "Cache-Control": "private, no-store",
    },
  });
}
