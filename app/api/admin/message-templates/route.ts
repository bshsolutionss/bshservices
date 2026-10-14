import { NextResponse, type NextRequest } from "next/server";
import { requireAdminUser } from "@/lib/admin/api-auth";
import { createServiceRoleClient } from "@/lib/supabase/service";

export async function POST(request: NextRequest) {
  const auth = await requireAdminUser();
  if (auth.unauthorized) return auth.unauthorized;

  const payload = (await request.json().catch(() => null)) as { name?: string; subject?: string; body?: string } | null;
  const name = payload?.name?.trim().slice(0, 100);
  const body = payload?.body?.trim().slice(0, 5000);
  if (!name) return NextResponse.json({ ok: false, error: "Give the template a name." }, { status: 400 });
  if (!body) return NextResponse.json({ ok: false, error: "Write the message." }, { status: 400 });

  const service = createServiceRoleClient();
  const { data: last } = await service.from("message_templates").select("sort_order").order("sort_order", { ascending: false }).limit(1);
  const { data, error } = await service
    .from("message_templates")
    .insert({
      name,
      subject: payload?.subject?.trim().slice(0, 200) || null,
      body,
      sort_order: ((last?.[0]?.sort_order as number | undefined) ?? 0) + 1,
    })
    .select("id")
    .single();
  if (error || !data) {
    console.error("[api/admin/message-templates] insert failed:", error);
    return NextResponse.json(
      { ok: false, error: "Could not save. Run supabase/migrations/0013_modules_goals_settings.sql first." },
      { status: 500 }
    );
  }
  return NextResponse.json({ ok: true, id: data.id });
}
