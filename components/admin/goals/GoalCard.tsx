"use client";

import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge, ConfirmButton } from "@/components/admin/ui";
import GoalFormModal from "@/components/admin/goals/GoalFormModal";
import { formatMoney } from "@/lib/invoices";
import { GOAL_METRIC_BY_KEY, type GoalProgress, type GoalState } from "@/lib/goals";

const STATE_STYLE: Record<GoalState, { label: string; bar: string; badge: { bg: string; text: string } }> = {
  achieved: { label: "Achieved", bar: "#059669", badge: { bg: "#D1FAE5", text: "#065F46" } },
  on_track: { label: "On track", bar: "#1A14A5", badge: { bg: "#E8E7FB", text: "#1A14A5" } },
  behind: { label: "Behind pace", bar: "#F59E0B", badge: { bg: "#FEF3C7", text: "#92400E" } },
  over_limit: { label: "Over limit", bar: "#DC2626", badge: { bg: "#FEE2E2", text: "#991B1B" } },
  upcoming: { label: "Not started", bar: "#9CA3AF", badge: { bg: "#F1F1F1", text: "#4B5563" } },
  missed: { label: "Missed", bar: "#DC2626", badge: { bg: "#FEE2E2", text: "#991B1B" } },
};

function fmt(value: number, kind: "money" | "count", unit: string | null): string {
  if (kind === "money") return formatMoney(value, "PKR");
  const n = Math.round(value * 100) / 100;
  return unit ? `${n.toLocaleString()} ${unit}` : n.toLocaleString();
}

/** One goal: live progress against its target, with pace, and edit/delete. */
export default function GoalCard({ goal, compact = false }: { goal: GoalProgress; compact?: boolean }) {
  const router = useRouter();
  const info = GOAL_METRIC_BY_KEY[goal.metric] ?? GOAL_METRIC_BY_KEY.custom;
  const style = STATE_STYLE[goal.state];
  const remaining = Math.max(Number(goal.target_value) - goal.actual, 0);

  return (
    <div className="rounded-2xl border border-[#1A14A5]/10 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-bold text-[#231F20]">{goal.title}</p>
          <p className="text-xs text-[#231F20]/50">{info.label}</p>
        </div>
        <Badge label={style.label} colors={style.badge} />
      </div>

      <div className="mt-4 flex items-end justify-between gap-3">
        <p className="text-2xl font-extrabold text-[#231F20]">{fmt(goal.actual, info.kind, goal.unit)}</p>
        <p className="text-sm text-[#231F20]/55">of {fmt(Number(goal.target_value), info.kind, goal.unit)}</p>
      </div>

      <div className="relative mt-3 h-2.5 overflow-hidden rounded-full bg-[#F4F7FE]">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${Math.min(goal.percent, 100)}%`, background: style.bar }}
        />
        {/* Where you "should" be if progress were even through the period */}
        {goal.elapsed > 0 && goal.elapsed < 1 && !info.lowerIsBetter && (
          <span
            className="absolute top-0 h-full w-0.5 bg-[#231F20]/40"
            style={{ left: `${goal.elapsed * 100}%` }}
            title="Expected progress by today"
          />
        )}
      </div>

      <div className="mt-2 flex items-center justify-between text-xs text-[#231F20]/55">
        <span className={cn("font-semibold", goal.state === "over_limit" && "text-red-600")}>{goal.percent}%</span>
        <span>
          {info.lowerIsBetter
            ? goal.actual > Number(goal.target_value)
              ? `${fmt(goal.actual - Number(goal.target_value), info.kind, goal.unit)} over`
              : `${fmt(remaining, info.kind, goal.unit)} left to spend`
            : remaining > 0
              ? `${fmt(remaining, info.kind, goal.unit)} to go`
              : "Target reached"}
        </span>
      </div>

      {goal.notes && !compact && <p className="mt-3 text-xs text-[#231F20]/55">{goal.notes}</p>}

      {!compact && (
        <div className="mt-4 flex items-center gap-4 border-t border-[#1A14A5]/10 pt-3">
          <GoalFormModal goal={goal} periodType={goal.period_type} periodKey={goal.period_key} variant="link" label={goal.metric === "custom" ? "Update" : "Edit"} />
          <ConfirmButton
            label="Delete"
            display="inline"
            icon={<Trash2 className="h-3.5 w-3.5" />}
            title={`Delete "${goal.title}"?`}
            confirmLabel="Delete goal"
            message="Only the target is removed - your real revenue, leads and other data are untouched."
            onConfirm={async () => {
              const res = await fetch(`/api/admin/goals/${goal.id}`, { method: "DELETE" });
              const body = await res.json().catch(() => ({}));
              if (!res.ok) throw new Error(body.error || "Could not delete the goal.");
              router.refresh();
            }}
          />
        </div>
      )}
    </div>
  );
}
