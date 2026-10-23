import { NextResponse, type NextRequest } from "next/server";
import { requireAdminUser } from "@/lib/admin/api-auth";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { invalidateLeadStages, loadLeadStages } from "@/lib/admin/lead-stages";
import { newStageKey, type LeadStageKind } from "@/lib/lead-stages";

export async function GET() {
  const auth = await requireAdminUser();
  if (auth.unauthorized) return auth.unauthorized;
  return NextResponse.json({ ok: true, stages: await loadLeadStages() });
}

interface Incoming {
  key?: string;
  label?: string;
  color?: string;
  kind?: LeadStageKind;
}

/** Saves the whole list in one go: order, names, colours, new stages, removed stages. */
export async function PUT(request: NextRequest) {
  const auth = await requireAdminUser();
  if (auth.unauthorized) return auth.unauthorized;

  const payload = (await request.json().catch(() => null)) as { stages?: Incoming[] } | null;
  const incoming = payload?.stages;
  if (!Array.isArray(incoming) || incoming.length === 0 || incoming.length > 20) {
    return NextResponse.json({ ok: false, error: "Keep between 1 and 20 stages." }, { status: 400 });
  }

  const current = await loadLeadStages();
  const currentKeys = current.map((s) => s.key);
  const used: string[] = [];
  const next = incoming.map((s, position) => {
    const label = String(s.label ?? "").trim().slice(0, 40);
    const color = /^#[0-9a-fA-F]{6}$/.test(String(s.color)) ? String(s.color) : "#6366f1";
    const kind: LeadStageKind = s.kind === "won" || s.kind === "lost" ? s.kind : "open";
    // Existing keys are kept (leads point at them); a new stage gets a fresh key from its name.
    const key = s.key && currentKeys.includes(s.key) && !used.includes(s.key) ? s.key : newStageKey(label, [...currentKeys, ...used]);
    used.push(key);
    return { key, label, color, kind, position };
  });

  if (next.some((s) => !s.label)) return NextResponse.json({ ok: false, error: "Every stage needs a name." }, { status: 400 });
  if (!next.some((s) => s.kind === "won")) return NextResponse.json({ ok: false, error: "Keep a Won stage - it's what turns a lead into a client." }, { status: 400 });
  if (!next.some((s) => s.kind === "lost")) return NextResponse.json({ ok: false, error: "Keep a Lost stage so you can record why deals fell through." }, { status: 400 });
  if (!next.some((s) => s.kind === "open")) return NextResponse.json({ ok: false, error: "Keep at least one open stage." }, { status: 400 });

  const service = createServiceRoleClient();
  const removed = currentKeys.filter((k) => !used.includes(k));
  for (const key of removed) {
    const { count } = await service.from("leads").select("id", { count: "exact", head: true }).eq("status", key);
    if (count) {
      const label = current.find((s) => s.key === key)?.label ?? key;
      return NextResponse.json({ ok: false, error: `${count} lead${count === 1 ? " is" : "s are"} in "${label}". Move them to another stage before removing it.` }, { status: 409 });
    }
  }

  const { error } = await service.from("lead_stages").upsert(next);
  if (error) {
    console.error("[api/admin/lead-stages] save failed:", error);
    return NextResponse.json({ ok: false, error: "Could not save. Run supabase/migrations/0016_leads_pipeline.sql first." }, { status: 500 });
  }
  if (removed.length) await service.from("lead_stages").delete().in("key", removed);

  invalidateLeadStages();
  return NextResponse.json({ ok: true, stages: await loadLeadStages() });
}
