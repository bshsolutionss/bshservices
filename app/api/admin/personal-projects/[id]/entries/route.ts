import { NextResponse, type NextRequest } from "next/server";
import { requireAdminUser } from "@/lib/admin/api-auth";
import { createServiceRoleClient } from "@/lib/supabase/service";

/** Log money going out (cost) or coming in (revenue) for one of your own projects. */
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdminUser();
  if (auth.unauthorized) return auth.unauthorized;

  const { id } = await params;
  const payload = (await request.json().catch(() => null)) as {
    kind?: string;
    amount?: number;
    entry_date?: string;
    description?: string;
  } | null;

  if (!payload || (payload.kind !== "cost" && payload.kind !== "revenue")) {
    return NextResponse.json({ ok: false, error: "Choose cost or revenue." }, { status: 400 });
  }
  const amount = Number(payload.amount);
  if (!Number.isFinite(amount) || amount <= 0) {
    return NextResponse.json({ ok: false, error: "Enter an amount greater than zero." }, { status: 400 });
  }
  if (payload.entry_date && !/^\d{4}-\d{2}-\d{2}$/.test(payload.entry_date)) {
    return NextResponse.json({ ok: false, error: "Invalid date." }, { status: 400 });
  }

  const service = createServiceRoleClient();
  const { error } = await service.from("personal_project_entries").insert({
    project_id: id,
    kind: payload.kind,
    amount,
    entry_date: payload.entry_date || new Date().toISOString().slice(0, 10),
    description: payload.description?.trim().slice(0, 500) || null,
  });
  if (error) {
    console.error("[api/admin/personal-projects/entries] insert failed:", error);
    return NextResponse.json({ ok: false, error: "Could not save the entry." }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
