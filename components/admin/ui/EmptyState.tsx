import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/** Consistent "nothing here yet" block, with room for the action that fixes it. */
export default function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-2 px-6 py-12 text-center", className)}>
      {Icon && (
        <span className="mb-1 flex h-11 w-11 items-center justify-center rounded-2xl bg-[#F4F7FE]">
          <Icon className="h-5 w-5 text-[#1A14A5]/60" />
        </span>
      )}
      <p className="font-semibold text-[#231F20]">{title}</p>
      {description && <p className="max-w-sm text-sm text-[#231F20]/50">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
