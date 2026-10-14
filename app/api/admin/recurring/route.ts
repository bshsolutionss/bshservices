import { NextResponse } from "next/server";
import { requireAdminUser } from "@/lib/admin/api-auth";
import { runRecurringJobs } from "@/lib/admin/recurring";

/** Manual "Sync recurring" - runs the same job as the daily cron, on demand. */
export async function POST() {
  const auth = await requireAdminUser();
  if (auth.unauthorized) return auth.unauthorized;
  const summary = await runRecurringJobs();
  return NextResponse.json({ ok: summary.errors.length === 0, ...summary });
}
