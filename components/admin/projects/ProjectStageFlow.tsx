import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { PROJECT_STAGE_LABELS, type ProjectStage } from "@/lib/projects";
import { formatDate } from "@/lib/invoices";

interface ProjectStageFlowProps {
  stage: ProjectStage;
  stages: ProjectStage[];
  startDate: string | null;
  dueDate: string | null;
  taskCount: number;
  completedTasks: number;
}

/**
 * Where the project is in its lifecycle, plus the two facts people actually
 * ask about alongside it (dates and task progress). Stages come from
 * PROJECT_STAGES, so adding a stage to the domain adds it here with no
 * change to this file.
 */
export default function ProjectStageFlow({
  stage,
  stages,
  startDate,
  dueDate,
  taskCount,
  completedTasks,
}: ProjectStageFlowProps) {
  const currentIndex = stages.indexOf(stage);
  const progress = taskCount > 0 ? Math.round((completedTasks / taskCount) * 100) : null;

  return (
    <div className="rounded-2xl border border-[#1A14A5]/10 bg-white p-5 shadow-sm">
      <ol className="flex flex-wrap items-center gap-2">
        {stages.map((item, index) => {
          const done = index < currentIndex;
          const active = index === currentIndex;
          return (
            <li key={item} className="flex items-center gap-2">
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold",
                  done && "bg-emerald-50 text-emerald-700",
                  active && "bg-[#1A14A5] text-white",
                  !done && !active && "bg-[#F4F7FE] text-[#231F20]/40"
                )}
              >
                {done && <Check className="h-3 w-3" />}
                {PROJECT_STAGE_LABELS[item]}
              </span>
              {index < stages.length - 1 && (
                <span className={cn("h-px w-4 sm:w-8", done ? "bg-emerald-200" : "bg-[#1A14A5]/10")} />
              )}
            </li>
          );
        })}
      </ol>

      <div className="mt-4 grid gap-4 border-t border-[#1A14A5]/10 pt-4 sm:grid-cols-3">
        <Fact label="Start" value={formatDate(startDate)} />
        <Fact label="Due" value={formatDate(dueDate)} />
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[#231F20]/45">Tasks</p>
          {progress === null ? (
            <p className="mt-1 text-sm font-semibold text-[#231F20]/50">No tasks yet</p>
          ) : (
            <>
              <p className="mt-1 text-sm font-semibold text-[#231F20]">
                {completedTasks}/{taskCount} done · {progress}%
              </p>
              <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-[#F4F7FE]">
                <div className="h-full rounded-full bg-[#1A14A5]" style={{ width: `${progress}%` }} />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-[#231F20]/45">{label}</p>
      <p className="mt-1 text-sm font-semibold text-[#231F20]">{value}</p>
    </div>
  );
}
