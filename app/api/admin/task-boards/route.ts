import { NextResponse, type NextRequest } from "next/server";
import { requireAdminUser } from "@/lib/admin/api-auth";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { cleanText, isUuid } from "@/lib/portal/admin-input";

/** Creates an internal board - hiring, marketing, ops - optionally shared around one client. */
export async function POST(request: NextRequest) {
  const auth = await requireAdminUser();
  if (auth.unauthorized) return auth.unauthorized;

  const p = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  const name = cleanText(p?.name, 80);
  if (!name) return NextResponse.json({ ok: false, error: "Give the board a name." }, { status: 400 });
  const color = /^#[0-9a-fA-F]{6}$/.test(String(p?.color)) ? String(p?.color) : "#3B82F6";
  const clientId = isUuid(p?.clientId) ? String(p?.clientId) : null;

  const { data, error } = await createServiceRoleClient()
    .from("task_boards")
    .insert({ name, color, description: cleanText(p?.description, 500), client_id: clientId })
    .select("id")
    .single();
  if (error || !data) {
    console.error("[api/admin/task-boards] create failed:", error);
    return NextResponse.json({ ok: false, error: "Could not create the board. Run supabase/migrations/0017_retainers_payments_boards.sql first." }, { status: 500 });
  }
  return NextResponse.json({ ok: true, id: data.id });
}
