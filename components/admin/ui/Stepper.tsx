import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface StepDefinition {
  id: string;
  label: string;
  /** One line describing what the step asks for — shown on the active step. */
  hint?: string;
}

interface StepperProps {
  steps: StepDefinition[];
  /** Zero-based index of the step currently being filled in. */
  current: number;
  /** Lets the user jump back to an already-completed step. */
  onStepClick?: (index: number) => void;
}

/** Horizontal step indicator for the multi-step create flows (project, invoice). */
export default function Stepper({ steps, current, onStepClick }: StepperProps) {
  return (
    <ol className="flex items-center gap-2 sm:gap-3">
      {steps.map((step, index) => {
        const done = index < current;
        const active = index === current;
        const clickable = done && !!onStepClick;

        return (
          <li key={step.id} className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
            <button
              type="button"
              disabled={!clickable}
              onClick={clickable ? () => onStepClick(index) : undefined}
              className={cn(
                "flex min-w-0 items-center gap-2 text-left",
                clickable && "cursor-pointer",
                !clickable && "cursor-default"
              )}
            >
              <span
                className={cn(
                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold transition",
                  done && "bg-[#1A14A5] text-white",
                  active && "bg-[#1A14A5]/10 text-[#1A14A5] ring-2 ring-[#1A14A5]",
                  !done && !active && "bg-[#F4F7FE] text-[#231F20]/40"
                )}
              >
                {done ? <Check className="h-3.5 w-3.5" /> : index + 1}
              </span>
              <span className="min-w-0">
                <span
                  className={cn(
                    "block truncate text-xs font-semibold sm:text-sm",
                    active ? "text-[#231F20]" : "text-[#231F20]/50"
                  )}
                >
                  {step.label}
                </span>
                {active && step.hint && (
                  <span className="hidden truncate text-xs text-[#231F20]/45 sm:block">{step.hint}</span>
                )}
              </span>
            </button>
            {index < steps.length - 1 && (
              <span className={cn("h-px flex-1", done ? "bg-[#1A14A5]/40" : "bg-[#1A14A5]/10")} />
            )}
          </li>
        );
      })}
    </ol>
  );
}
