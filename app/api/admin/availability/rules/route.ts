import { NextResponse, type NextRequest } from "next/server";
import { requireAdminUser } from "@/lib/admin/api-auth";
import { createServiceRoleClient } from "@/lib/supabase/service";

interface RuleInput {
  day_of_week: number;
  start_time: string;
  end_time: string;
  slot_duration_minutes: number;
  is_active: boolean;
}

function isValidRule(r: unknown): r is RuleInput {
  if (typeof r !== "object" || r === null) return false;
  const rule = r as Record<string, unknown>;
  return (
    typeof rule.day_of_week === "number" &&
    rule.day_of_week >= 0 &&
    rule.day_of_week <= 6 &&
    typeof rule.start_time === "string" &&
    typeof rule.end_time === "string" &&
    typeof rule.slot_duration_minutes === "number" &&
    rule.slot_duration_minutes > 0 &&
    typeof rule.is_active === "boolean"
  );
}

export async function GET() {
  const auth = await requireAdminUser();
  if (auth.unauthorized) return auth.unauthorized;

  const service = createServiceRoleClient();
  const { data, error } = await service.from("availability_rules").select("*").order("day_of_week");

  if (error) {
    console.error("[api/admin/availability/rules] fetch failed:", error);
    return NextResponse.json({ ok: false, error: "Could not load availability.", rules: [] }, { status: 500 });
  }

  return NextResponse.json({ ok: true, rules: data ?? [] });
}

/** Replace-all semantics: the admin UI always sends the full 7-day set. */
export async function PUT(request: NextRequest) {
  const auth = await requireAdminUser();
  if (auth.unauthorized) return auth.unauthorized;

  let payload: { rules?: unknown[] };
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON body." }, { status: 400 });
  }

  if (!Array.isArray(payload.rules) || !payload.rules.every(isValidRule)) {
    return NextResponse.json({ ok: false, error: "Invalid schedule data." }, { status: 400 });
  }
  const rules = payload.rules as RuleInput[];

  const service = createServiceRoleClient();

  const { error: deleteError } = await service
    .from("availability_rules")
    .delete()
    .gte("day_of_week", 0); // delete-all guard: Supabase requires a filter, day_of_week is always >= 0

  if (deleteError) {
    console.error("[api/admin/availability/rules] delete failed:", deleteError);
    return NextResponse.json({ ok: false, error: "Could not save schedule." }, { status: 500 });
  }

  const activeRules = rules.filter((r) => r.is_active);
  if (activeRules.length > 0) {
    const { error: insertError } = await service.from("availability_rules").insert(activeRules);
    if (insertError) {
      console.error("[api/admin/availability/rules] insert failed:", insertError);
      return NextResponse.json({ ok: false, error: "Could not save schedule." }, { status: 500 });
    }
  }

  return NextResponse.json({ ok: true });
}
