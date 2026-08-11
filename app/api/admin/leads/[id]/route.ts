import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { LEAD_STATUSES, type LeadStatus } from "@/lib/leads";

interface UpdatePayload {
  status?: LeadStatus;
  notes?: string;
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Independent auth check — proxy.ts already guards the /admin *pages*, but
  // this mutation endpoint re-checks itself rather than relying on that
  // (proxy's matcher explicitly excludes /api).
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  let payload: UpdatePayload;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON body." }, { status: 400 });
  }

  const updates: Record<string, unknown> = {};

  if (payload.status !== undefined) {
    if (!LEAD_STATUSES.includes(payload.status)) {
      return NextResponse.json({ ok: false, error: "Invalid status." }, { status: 400 });
    }
    updates.status = payload.status;
    updates.status_updated_at = new Date().toISOString();
    // Anything past "contacted" stops the automated follow-up loop — the
    // cron route's query already excludes completed leads, so this is all
    // that's needed, no separate "cancel" branch.
    if (payload.status !== "new" && payload.status !== "contacted") {
      updates.follow_up_completed = true;
    }
  }

  if (payload.notes !== undefined) {
    updates.notes = String(payload.notes).slice(0, 5000);
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ ok: false, error: "Nothing to update." }, { status: 400 });
  }

  const service = createServiceRoleClient();
  const { error } = await service.from("leads").update(updates).eq("id", id);

  if (error) {
    console.error("[api/admin/leads] update failed:", error);
    return NextResponse.json({ ok: false, error: "Update failed." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
