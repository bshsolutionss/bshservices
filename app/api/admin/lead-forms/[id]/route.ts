import { NextResponse, type NextRequest } from "next/server";
import { requireAdminUser } from "@/lib/admin/api-auth";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { loadLeadStages } from "@/lib/admin/lead-stages";
import { sanitizeQuestions } from "@/lib/lead-forms";
import { cleanText, isUuid } from "@/lib/portal/admin-input";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdminUser();
  if (auth.unauthorized) return auth.unauthorized;
  const { id } = await params;
  if (!isUuid(id)) return NextResponse.json({ ok: false, error: "Not found." }, { status: 404 });

  const p = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  if (!p) return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });

  const updates: Record<string, unknown> = {};
  if (p.name !== undefined) {
    const name = cleanText(p.name, 80);
    if (!name) return NextResponse.json({ ok: false, error: "Give the form a name." }, { status: 400 });
    updates.name = name;
  }
  if (p.heading !== undefined) {
    const heading = cleanText(p.heading, 120);
    if (!heading) return NextResponse.json({ ok: false, error: "The heading can't be empty." }, { status: 400 });
    updates.heading = heading;
  }
  if (p.intro !== undefined) updates.intro = cleanText(p.intro, 600);
  if (p.thank_you !== undefined) updates.thank_you = cleanText(p.thank_you, 600);
  if (p.active !== undefined) updates.active = p.active === true;
  if (p.questions !== undefined) {
    const questions = sanitizeQuestions(p.questions);
    if (!questions.some((q) => q.type === "name")) return NextResponse.json({ ok: false, error: "Keep the name question." }, { status: 400 });
    if (!questions.some((q) => q.type === "phone" || q.type === "email")) {
      return NextResponse.json({ ok: false, error: "Ask for a phone number or an email so you can reach people." }, { status: 400 });
    }
    updates.questions = questions;
  }
  if (p.stage_key !== undefined) {
    if (p.stage_key === null || p.stage_key === "") updates.stage_key = null;
    else {
      const stage = (await loadLeadStages()).find((s) => s.key === p.stage_key && s.kind === "open");
      if (!stage) return NextResponse.json({ ok: false, error: "Pick one of your open stages." }, { status: 400 });
      updates.stage_key = stage.key;
    }
  }
  if (Object.keys(updates).length === 0) return NextResponse.json({ ok: false, error: "Nothing to update." }, { status: 400 });

  const { error } = await createServiceRoleClient().from("lead_forms").update(updates).eq("id", id);
  return error ? NextResponse.json({ ok: false, error: "Could not save." }, { status: 500 }) : NextResponse.json({ ok: true });
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdminUser();
  if (auth.unauthorized) return auth.unauthorized;
  const { id } = await params;
  if (!isUuid(id)) return NextResponse.json({ ok: false, error: "Not found." }, { status: 404 });
  // Leads it collected stay (form_id is set null); only the link stops working.
  const { error } = await createServiceRoleClient().from("lead_forms").delete().eq("id", id);
  return error ? NextResponse.json({ ok: false, error: "Could not delete." }, { status: 500 }) : NextResponse.json({ ok: true });
}
