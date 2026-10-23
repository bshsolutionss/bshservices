import { NextResponse, type NextRequest } from "next/server";
import { requireAdminUser } from "@/lib/admin/api-auth";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { loadLeadStages } from "@/lib/admin/lead-stages";
import { logActivity } from "@/lib/activity";
import { isUuid } from "@/lib/portal/admin-input";

interface Payload {
  ids?: string[];
  action?: "move" | "assign" | "delete";
  status?: string;
  assigned_to?: string | null;
}

/** Acts on several leads at once from the board's Select mode. */
export async function POST(request: NextRequest) {
  const auth = await requireAdminUser();
  if (auth.unauthorized) return auth.unauthorized;

  const p = (await request.json().catch(() => null)) as Payload | null;
  const ids = Array.isArray(p?.ids) ? p.ids.filter(isUuid).slice(0, 200) : [];
  if (!p || ids.length === 0) return NextResponse.json({ ok: false, error: "Select at least one lead." }, { status: 400 });

  const service = createServiceRoleClient();

  if (p.action === "delete") {
    const { error } = await service.from("leads").delete().in("id", ids);
    return error ? NextResponse.json({ ok: false, error: "Could not delete." }, { status: 500 }) : NextResponse.json({ ok: true, count: ids.length });
  }

  if (p.action === "assign") {
    if (p.assigned_to) {
      const { data: emp } = await service.from("employees").select("id").eq("id", p.assigned_to).maybeSingle();
      if (!emp) return NextResponse.json({ ok: false, error: "That team member no longer exists." }, { status: 400 });
    }
    const { error } = await service.from("leads").update({ assigned_to: p.assigned_to || null }).in("id", ids);
    return error ? NextResponse.json({ ok: false, error: "Could not assign." }, { status: 500 }) : NextResponse.json({ ok: true, count: ids.length });
  }

  if (p.action === "move") {
    const stages = await loadLeadStages();
    const stage = stages.find((s) => s.key === p.status);
    if (!stage) return NextResponse.json({ ok: false, error: "Choose a stage." }, { status: 400 });
    // Won converts a lead into a client + project and Lost needs a reason - both are one-at-a-time actions.
    if (stage.kind !== "open") {
      return NextResponse.json({ ok: false, error: `Move leads to "${stage.label}" one at a time - it converts the lead or asks for a reason.` }, { status: 400 });
    }
    const pastSecond = stages.findIndex((s) => s.key === stage.key) > 1;
    const { error } = await service
      .from("leads")
      .update({ status: stage.key, status_updated_at: new Date().toISOString(), ...(pastSecond ? { follow_up_completed: true } : {}) })
      .in("id", ids);
    if (error) return NextResponse.json({ ok: false, error: "Could not move the leads." }, { status: 500 });
    await Promise.all(ids.slice(0, 50).map((id) => logActivity({ entityType: "lead", entityId: id, type: "status_change", description: `Moved to ${stage.label}` })));
    return NextResponse.json({ ok: true, count: ids.length });
  }

  return NextResponse.json({ ok: false, error: "Unknown action." }, { status: 400 });
}
