import { NextResponse, type NextRequest } from "next/server";
import { requireTeamUser } from "@/lib/team/session";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { loadLeadStages } from "@/lib/admin/lead-stages";
import { logActivity } from "@/lib/activity";
import { cleanText, isUuid } from "@/lib/portal/admin-input";

const fail = (error: string, status = 400) => NextResponse.json({ ok: false, error }, { status });

/** Move a lead along the pipeline or leave a note. Won/Lost stay with an admin (they create clients or need a reason). */
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireTeamUser();
  if (auth.unauthorized) return auth.unauthorized;
  const { session } = auth;
  if (session.access.leads !== "edit") return fail("You can view leads but not change them.", 403);
  const { id } = await params;
  if (!isUuid(id)) return fail("Not found.", 404);

  const p = (await request.json().catch(() => null)) as { status?: string; note?: string } | null;
  if (!p) return fail("Invalid request.");

  const service = createServiceRoleClient();
  const { data: lead } = await service.from("leads").select("id, name, status, source").eq("id", id).maybeSingle();
  if (!lead || lead.source === "consultation_booking") return fail("Lead not found.", 404);

  if (p.status !== undefined) {
    const stages = await loadLeadStages();
    const stage = stages.find((s) => s.key === p.status);
    if (!stage) return fail("Choose a valid stage.");
    if (stage.kind !== "open") return fail(`Ask an admin to move this lead to "${stage.label}" - it creates a client or needs a reason.`, 403);
    if (stage.key !== lead.status) {
      const past = stages.findIndex((s) => s.key === stage.key) > 1;
      const { error } = await service.from("leads").update({ status: stage.key, status_updated_at: new Date().toISOString(), ...(past ? { follow_up_completed: true } : {}) }).eq("id", id);
      if (error) return fail("Could not move the lead.", 500);
      await logActivity({ entityType: "lead", entityId: id, type: "status_change", description: `${session.name} moved this lead to ${stage.label}` });
    }
  }

  const note = cleanText(p.note, 2000);
  if (note) await logActivity({ entityType: "lead", entityId: id, type: "note", description: `${session.name}: ${note}` });
  return NextResponse.json({ ok: true });
}
