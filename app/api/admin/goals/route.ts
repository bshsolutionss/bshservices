import { NextResponse, type NextRequest } from "next/server";
import { requireAdminUser } from "@/lib/admin/api-auth";
import { createServiceRoleClient } from "@/lib/supabase/service";
import {
  GOAL_METRIC_BY_KEY,
  isValidPeriodKey,
  shiftPeriod,
  type GoalMetric,
  type GoalPeriodType,
} from "@/lib/goals";

interface CreatePayload {
  title?: string;
  metric: GoalMetric;
  period_type: GoalPeriodType;
  period_key: string;
  target_value: number;
  unit?: string;
  notes?: string;
  /** Monthly goals: also create the same target for every remaining month of the year. */
  repeat_through_year?: boolean;
  /** Yearly goals: also create monthly targets of target / 12 for each month of the year. */
  split_into_months?: boolean;
}

export async function POST(request: NextRequest) {
  const auth = await requireAdminUser();
  if (auth.unauthorized) return auth.unauthorized;

  const payload = (await request.json().catch(() => null)) as CreatePayload | null;
  if (!payload) return NextResponse.json({ ok: false, error: "Invalid JSON body." }, { status: 400 });

  const info = GOAL_METRIC_BY_KEY[payload.metric];
  if (!info) return NextResponse.json({ ok: false, error: "Choose what you want to measure." }, { status: 400 });
  if (payload.period_type !== "monthly" && payload.period_type !== "yearly") {
    return NextResponse.json({ ok: false, error: "Invalid period." }, { status: 400 });
  }
  if (!isValidPeriodKey(payload.period_type, payload.period_key)) {
    return NextResponse.json({ ok: false, error: "Invalid period." }, { status: 400 });
  }
  const target = Number(payload.target_value);
  if (!Number.isFinite(target) || target <= 0) {
    return NextResponse.json({ ok: false, error: "Enter a target greater than zero." }, { status: 400 });
  }
  const title = payload.title?.trim().slice(0, 120) || info.label;
  if (payload.metric === "custom" && !payload.title?.trim()) {
    return NextResponse.json({ ok: false, error: "Give the custom goal a name." }, { status: 400 });
  }

  const base = {
    title,
    metric: payload.metric,
    unit: payload.unit?.trim().slice(0, 30) || null,
    notes: payload.notes?.trim().slice(0, 2000) || null,
  };

  const rows: Record<string, unknown>[] = [
    { ...base, period_type: payload.period_type, period_key: payload.period_key, target_value: target },
  ];

  if (payload.period_type === "monthly" && payload.repeat_through_year) {
    const [year, month] = payload.period_key.split("-").map(Number);
    for (let m = month + 1; m <= 12; m++) {
      rows.push({
        ...base,
        period_type: "monthly",
        period_key: `${year}-${String(m).padStart(2, "0")}`,
        target_value: target,
      });
    }
  }
  if (payload.period_type === "yearly" && payload.split_into_months) {
    const monthly = Math.round((target / 12) * 100) / 100;
    for (let m = 1; m <= 12; m++) {
      rows.push({
        ...base,
        period_type: "monthly",
        period_key: `${payload.period_key}-${String(m).padStart(2, "0")}`,
        target_value: info.kind === "count" ? Math.max(Math.round(target / 12), 1) : monthly,
      });
    }
  }

  const service = createServiceRoleClient();

  // Built-in metrics are unique per period; skip rows that already exist rather than failing the whole request.
  let toInsert = rows;
  if (payload.metric !== "custom") {
    const { data: existing } = await service
      .from("goals")
      .select("period_key")
      .eq("metric", payload.metric)
      .in("period_key", rows.map((r) => r.period_key as string));
    const taken = new Set((existing ?? []).map((g: { period_key: string }) => g.period_key));
    if (taken.has(payload.period_key)) {
      return NextResponse.json(
        { ok: false, error: `You already have a ${info.label.toLowerCase()} goal for this period - edit it instead.` },
        { status: 409 }
      );
    }
    toInsert = rows.filter((r) => !taken.has(r.period_key as string));
  }

  const { error } = await service.from("goals").insert(toInsert);
  if (error) {
    console.error("[api/admin/goals] insert failed:", error);
    return NextResponse.json(
      { ok: false, error: "Could not save. Run supabase/migrations/0013_modules_goals_settings.sql first." },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true, created: toInsert.length, next_period: shiftPeriod(payload.period_type, payload.period_key, 0) });
}
