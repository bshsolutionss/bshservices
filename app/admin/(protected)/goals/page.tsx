import Link from "next/link";
import { ChevronLeft, ChevronRight, Target } from "lucide-react";
import { cn } from "@/lib/utils";
import { todayInPkt } from "@/lib/availability";
import { computeGoalProgress, listGoals } from "@/lib/admin/goals";
import { isValidPeriodKey, periodLabel, shiftPeriod, type GoalPeriodType } from "@/lib/goals";
import { EmptyState, PageHeader, StatCard } from "@/components/admin/ui";
import GoalCard from "@/components/admin/goals/GoalCard";
import GoalFormModal from "@/components/admin/goals/GoalFormModal";
import { WriteGate } from "@/components/admin/RoleContext";

export const dynamic = "force-dynamic";

export default async function AdminGoalsPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string; period?: string }>;
}) {
  const query = await searchParams;
  const type: GoalPeriodType = query.view === "yearly" ? "yearly" : "monthly";
  const today = todayInPkt();
  const currentKey = type === "yearly" ? today.slice(0, 4) : today.slice(0, 7);
  const key = query.period && isValidPeriodKey(type, query.period) ? query.period : currentKey;

  const goals = await computeGoalProgress(await listGoals(type, key));
  const achieved = goals.filter((g) => g.state === "achieved").length;
  const behind = goals.filter((g) => g.state === "behind" || g.state === "missed" || g.state === "over_limit").length;

  const href = (view: GoalPeriodType, period?: string) =>
    `/admin/goals?view=${view}${period && period !== (view === "yearly" ? today.slice(0, 4) : today.slice(0, 7)) ? `&period=${period}` : ""}`;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Goals"
        subtitle="Set monthly and yearly targets - progress is measured live from your real revenue, leads and clients."
        actions={
          <WriteGate module="goals">
            <GoalFormModal periodType={type} periodKey={key} />
          </WriteGate>
        }
      >
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex rounded-full border border-[#1A14A5]/10 bg-white p-1">
            {(["monthly", "yearly"] as const).map((view) => (
              <Link
                key={view}
                href={href(view)}
                className={cn(
                  "rounded-full px-4 py-1.5 text-sm font-semibold capitalize transition",
                  type === view ? "bg-[#1A14A5] text-white shadow-sm" : "text-[#231F20]/60 hover:text-[#1A14A5]"
                )}
              >
                {view}
              </Link>
            ))}
          </div>
          <div className="flex items-center gap-1 rounded-full border border-[#1A14A5]/10 bg-white p-1">
            <Link href={href(type, shiftPeriod(type, key, -1))} aria-label="Previous" className="rounded-full p-1.5 text-[#231F20]/60 hover:bg-[#F4F7FE]">
              <ChevronLeft className="h-4 w-4" />
            </Link>
            <span className="min-w-[8.5rem] text-center text-sm font-bold text-[#231F20]">{periodLabel(type, key)}</span>
            <Link href={href(type, shiftPeriod(type, key, 1))} aria-label="Next" className="rounded-full p-1.5 text-[#231F20]/60 hover:bg-[#F4F7FE]">
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          {key !== currentKey && (
            <Link href={href(type)} className="text-sm font-medium text-[#1A14A5] hover:underline">
              Back to {type === "yearly" ? "this year" : "this month"}
            </Link>
          )}
        </div>
      </PageHeader>

      {goals.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          <StatCard label="Goals" value={goals.length} icon={Target} iconBg="#1A14A5" description={periodLabel(type, key)} />
          <StatCard label="Achieved" value={achieved} icon={Target} iconBg="#059669" valueColor="#065F46" description="Target reached" />
          <StatCard label="Needs attention" value={behind} icon={Target} iconBg="#f97316" valueColor="#92400E" description="Behind pace or over limit" />
        </div>
      )}

      {goals.length === 0 ? (
        <div className="rounded-2xl border border-[#1A14A5]/10 bg-white shadow-sm">
          <EmptyState
            icon={Target}
            title={`No ${type} goals for ${periodLabel(type, key)}`}
            description="Pick something to aim for - revenue, new leads, deals won - and watch the bar fill as real data comes in."
            action={
              <WriteGate module="goals">
                <GoalFormModal periodType={type} periodKey={key} />
              </WriteGate>
            }
          />
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {goals.map((goal) => (
            <GoalCard key={goal.id} goal={goal} />
          ))}
        </div>
      )}
    </div>
  );
}
