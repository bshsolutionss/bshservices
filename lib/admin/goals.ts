import { createServiceRoleClient } from "@/lib/supabase/service";
import { getExchangeRates } from "@/lib/admin/exchange-rates";
import { sumToPKR } from "@/lib/currency";
import { todayInPkt } from "@/lib/availability";
import {
  GOAL_METRIC_BY_KEY,
  periodRange,
  type Goal,
  type GoalMetric,
  type GoalProgress,
  type GoalState,
} from "@/lib/goals";
import type { Currency } from "@/lib/invoices";
import { loadLeadStages } from "@/lib/admin/lead-stages";
import { stageKeys } from "@/lib/lead-stages";

interface PeriodStats {
  revenue: number;
  expenses: number;
  profit: number;
  new_leads: number;
  leads_won: number;
  new_clients: number;
  new_projects: number;
}

type RatesPromise = ReturnType<typeof getExchangeRates>;

async function statsForRange(from: string, to: string, rates: Awaited<RatesPromise>): Promise<PeriodStats> {
  const supabase = createServiceRoleClient();
  const fromTs = `${from}T00:00:00Z`;
  const toTs = `${to}T00:00:00Z`;
  const wonKeys = stageKeys(await loadLeadStages(), "won");

  const [payments, expenses, leads, won, clients, projects] = await Promise.all([
    supabase.from("payments").select("amount, invoices(currency)").gte("paid_on", from).lt("paid_on", to),
    supabase.from("expenses").select("amount, currency").gte("expense_date", from).lt("expense_date", to),
    supabase
      .from("leads")
      .select("id", { count: "exact", head: true })
      .neq("source", "consultation_booking")
      .gte("created_at", fromTs)
      .lt("created_at", toTs),
    supabase
      .from("leads")
      .select("id", { count: "exact", head: true })
      .in("status", wonKeys)
      .gte("status_updated_at", fromTs)
      .lt("status_updated_at", toTs),
    supabase.from("clients").select("id", { count: "exact", head: true }).gte("created_at", fromTs).lt("created_at", toTs),
    supabase.from("projects").select("id", { count: "exact", head: true }).gte("created_at", fromTs).lt("created_at", toTs),
  ]);

  type PaymentRow = { amount: number; invoices: { currency: Currency } | { currency: Currency }[] | null };
  const revenue = sumToPKR(
    ((payments.data ?? []) as unknown as PaymentRow[]).map((p) => {
      const invoice = Array.isArray(p.invoices) ? p.invoices[0] : p.invoices;
      return { amount: Number(p.amount), currency: invoice?.currency ?? "PKR" };
    }),
    rates
  );
  const spent = sumToPKR(
    ((expenses.data ?? []) as { amount: number; currency: Currency | null }[]).map((e) => ({
      amount: Number(e.amount),
      currency: e.currency ?? "PKR",
    })),
    rates
  );

  return {
    revenue,
    expenses: spent,
    profit: revenue - spent,
    new_leads: leads.count ?? 0,
    leads_won: won.count ?? 0,
    new_clients: clients.count ?? 0,
    new_projects: projects.count ?? 0,
  };
}

function elapsedFraction(from: string, to: string, today: string): number {
  const start = Date.parse(`${from}T00:00:00Z`);
  const end = Date.parse(`${to}T00:00:00Z`);
  const now = Date.parse(`${today}T00:00:00Z`) + 24 * 60 * 60 * 1000; // count today as elapsed
  return Math.min(Math.max((now - start) / (end - start), 0), 1);
}

/** Measures every goal against real data. One stats query-set per distinct period, however many goals share it. */
export async function computeGoalProgress(goals: Goal[]): Promise<GoalProgress[]> {
  if (goals.length === 0) return [];
  const today = todayInPkt();
  const rates = await getExchangeRates();

  const periods = new Map<string, Promise<PeriodStats>>();
  const statsFor = (goal: Goal) => {
    const id = `${goal.period_type}:${goal.period_key}`;
    let pending = periods.get(id);
    if (!pending) {
      const { from, to } = periodRange(goal.period_type, goal.period_key);
      pending = statsForRange(from, to, rates);
      periods.set(id, pending);
    }
    return pending;
  };

  return Promise.all(
    goals.map(async (goal): Promise<GoalProgress> => {
      const info = GOAL_METRIC_BY_KEY[goal.metric] ?? GOAL_METRIC_BY_KEY.custom;
      const { from, to } = periodRange(goal.period_type, goal.period_key);
      const elapsed = elapsedFraction(from, to, today);
      const target = Number(goal.target_value);

      const actual =
        goal.metric === "custom"
          ? Number(goal.current_value)
          : (await statsFor(goal))[goal.metric as Exclude<GoalMetric, "custom">];

      const percent = target > 0 ? Math.round((actual / target) * 100) : actual > 0 ? 100 : 0;
      const ended = today >= to;
      let state: GoalState;
      if (info.lowerIsBetter) {
        state = actual > target ? "over_limit" : ended ? "achieved" : "on_track";
      } else if (actual >= target && target > 0) {
        state = "achieved";
      } else if (elapsed === 0) {
        state = "upcoming";
      } else if (ended) {
        state = "missed";
      } else {
        // Behind when we are clearly slower than the straight-line pace through the period.
        state = actual / (target || 1) >= elapsed * 0.85 ? "on_track" : "behind";
      }

      return { ...goal, actual, percent, state, elapsed };
    })
  );
}

export async function listGoals(type: Goal["period_type"], key: string): Promise<Goal[]> {
  const supabase = createServiceRoleClient();
  const { data } = await supabase
    .from("goals")
    .select("*")
    .eq("period_type", type)
    .eq("period_key", key)
    .order("created_at");
  return (data ?? []) as Goal[];
}
