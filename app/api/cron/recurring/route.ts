import { NextResponse, type NextRequest } from "next/server";
import { runRecurringJobs } from "@/lib/admin/recurring";

function isAuthorized(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  if (request.headers.get("authorization") === `Bearer ${secret}`) return true;
  return request.nextUrl.searchParams.get("secret") === secret;
}

/** Daily: drafts due monthly retainer invoices and books due monthly expenses. Same auth as the follow-up cron. */
export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  const summary = await runRecurringJobs();
  return NextResponse.json({ ok: summary.errors.length === 0, ...summary });
}
