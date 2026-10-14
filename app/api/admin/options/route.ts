import { NextResponse, type NextRequest } from "next/server";
import { requireAdminUser } from "@/lib/admin/api-auth";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { getAllOptions, getOptions } from "@/lib/admin/options";
import { isOptionListKey } from "@/lib/option-lists";

/** GET ?list=key -> active options (for dropdowns). Add &all=1 for the Settings manager (includes switched-off items). */
export async function GET(request: NextRequest) {
  const auth = await requireAdminUser();
  if (auth.unauthorized) return auth.unauthorized;

  const list = request.nextUrl.searchParams.get("list");
  if (!isOptionListKey(list)) return NextResponse.json({ ok: false, error: "Unknown list." }, { status: 400 });

  if (request.nextUrl.searchParams.get("all") === "1") {
    return NextResponse.json({ ok: true, options: await getAllOptions(list) });
  }
  return NextResponse.json({ ok: true, options: await getOptions(list) });
}

interface CreatePayload {
  list: string;
  label: string;
  color?: string | null;
}

export async function POST(request: NextRequest) {
  const auth = await requireAdminUser();
  if (auth.unauthorized) return auth.unauthorized;

  const payload = (await request.json().catch(() => null)) as CreatePayload | null;
  if (!payload || !isOptionListKey(payload.list)) {
    return NextResponse.json({ ok: false, error: "Unknown list." }, { status: 400 });
  }
  const label = payload.label?.trim().slice(0, 80);
  if (!label) return NextResponse.json({ ok: false, error: "Enter a name." }, { status: 400 });

  const service = createServiceRoleClient();
  const existing = await getAllOptions(payload.list);
  if (existing.some((o) => o.label.toLowerCase() === label.toLowerCase() || o.value.toLowerCase() === label.toLowerCase())) {
    return NextResponse.json({ ok: false, error: `"${label}" is already in this list.` }, { status: 409 });
  }

  const { data, error } = await service
    .from("app_options")
    .insert({
      list_key: payload.list,
      value: label,
      label,
      color: payload.color && /^#[0-9a-fA-F]{6}$/.test(payload.color) ? payload.color : null,
      sort_order: existing.reduce((max, o) => Math.max(max, o.sort_order), 0) + 1,
    })
    .select("id")
    .single();
  if (error || !data) {
    console.error("[api/admin/options] insert failed:", error);
    return NextResponse.json(
      { ok: false, error: "Could not save. Run supabase/migrations/0013_modules_goals_settings.sql first." },
      { status: 500 }
    );
  }
  return NextResponse.json({ ok: true, id: data.id });
}

/** PUT { list, ids } -> saves the order of a list (ids in their new order). */
export async function PUT(request: NextRequest) {
  const auth = await requireAdminUser();
  if (auth.unauthorized) return auth.unauthorized;

  const payload = (await request.json().catch(() => null)) as { list?: string; ids?: string[] } | null;
  if (!payload || !isOptionListKey(payload.list) || !Array.isArray(payload.ids)) {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  const service = createServiceRoleClient();
  const results = await Promise.all(
    payload.ids.map((id, index) =>
      service.from("app_options").update({ sort_order: index + 1 }).eq("id", id).eq("list_key", payload.list!)
    )
  );
  if (results.some((r) => r.error)) {
    return NextResponse.json({ ok: false, error: "Could not save the order." }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
