import { NextResponse, type NextRequest } from "next/server";
import { requireAdminUser } from "@/lib/admin/api-auth";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { refreshStatusOverrides } from "@/lib/admin/status-overrides";
import { STATUS_LISTS, describeStatuses, statusListId } from "@/lib/status-config";

function resolve(list: string | null, value: string | null) {
  const def = STATUS_LISTS.find((l) => l.key === list);
  if (!def || !value || !def.keys.includes(value)) return null;
  return { id: statusListId(def.key), value };
}

export async function GET() {
  const auth = await requireAdminUser();
  if (auth.unauthorized) return auth.unauthorized;
  return NextResponse.json({ ok: true, lists: describeStatuses(await refreshStatusOverrides()) });
}

/** Rename and/or recolour one status. The key itself never changes. */
export async function PUT(request: NextRequest) {
  const auth = await requireAdminUser();
  if (auth.unauthorized) return auth.unauthorized;

  const payload = (await request.json().catch(() => null)) as {
    list?: string;
    value?: string;
    label?: string;
    color?: string | null;
  } | null;
  const target = resolve(payload?.list ?? null, payload?.value ?? null);
  if (!payload || !target) return NextResponse.json({ ok: false, error: "Unknown status." }, { status: 400 });

  const label = payload.label?.trim().slice(0, 40) ?? "";
  if (!label) return NextResponse.json({ ok: false, error: "The name can't be empty." }, { status: 400 });
  const color = payload.color && /^#[0-9a-fA-F]{6}$/.test(payload.color) ? payload.color : null;

  const service = createServiceRoleClient();
  const { error } = await service
    .from("app_options")
    .upsert({ list_key: target.id, value: target.value, label, color, sort_order: 0, active: true }, { onConflict: "list_key,value" });
  if (error) {
    console.error("[api/admin/status-labels] save failed:", error);
    return NextResponse.json(
      { ok: false, error: "Could not save. Run supabase/migrations/0013_modules_goals_settings.sql first." },
      { status: 500 }
    );
  }
  await refreshStatusOverrides();
  return NextResponse.json({ ok: true });
}

/** DELETE ?list=…&value=… puts a status back to its built-in name and colour. */
export async function DELETE(request: NextRequest) {
  const auth = await requireAdminUser();
  if (auth.unauthorized) return auth.unauthorized;

  const target = resolve(request.nextUrl.searchParams.get("list"), request.nextUrl.searchParams.get("value"));
  if (!target) return NextResponse.json({ ok: false, error: "Unknown status." }, { status: 400 });

  const service = createServiceRoleClient();
  const { error } = await service.from("app_options").delete().eq("list_key", target.id).eq("value", target.value);
  if (error) return NextResponse.json({ ok: false, error: "Could not reset." }, { status: 500 });
  await refreshStatusOverrides();
  return NextResponse.json({ ok: true });
}
