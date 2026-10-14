import Link from "next/link";
import { ArrowDownRight, ArrowUpRight, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { cardBase } from "./styles";

interface StatCardProps {
  label: string;
  value: string | number;
  /** One line of context, e.g. "Payments received this month". */
  description?: string;
  icon?: LucideIcon;
  /** Value text color — defaults to brand blue. */
  valueColor?: string;
  /** Icon badge background. */
  iconBg?: string;
  /** Signed change vs. the comparison period; direction drives the arrow + color. */
  delta?: { value: string; direction: "up" | "down" | "flat"; label?: string };
  /** Makes the whole tile a link. */
  href?: string;
  className?: string;
}

/**
 * The single KPI tile for the admin panel — dashboard, finance, invoices and
 * expenses all use this, so a metric looks the same wherever it appears.
 */
export default function StatCard({
  label,
  value,
  description,
  icon: Icon,
  valueColor,
  iconBg,
  delta,
  href,
  className,
}: StatCardProps) {
  const body = (
    <>
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-[#231F20]/70">{label}</p>
        <p className="mt-1 break-words text-2xl font-extrabold" style={{ color: valueColor || "#1A14A5" }}>
          {value}
        </p>
        {delta && (
          <p
            className={cn(
              "mt-1 inline-flex items-center gap-1 text-xs font-semibold",
              delta.direction === "up" && "text-emerald-600",
              delta.direction === "down" && "text-red-600",
              delta.direction === "flat" && "text-[#231F20]/45"
            )}
          >
            {delta.direction === "up" && <ArrowUpRight className="h-3.5 w-3.5" />}
            {delta.direction === "down" && <ArrowDownRight className="h-3.5 w-3.5" />}
            {delta.value}
            {delta.label && <span className="font-normal text-[#231F20]/45">{delta.label}</span>}
          </p>
        )}
        {description && !delta && <p className="mt-1 truncate text-xs text-[#231F20]/50">{description}</p>}
      </div>
      {Icon && (
        <div
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl"
          style={{ backgroundColor: iconBg || "#1A14A5" }}
        >
          <Icon className="h-5 w-5 text-white" />
        </div>
      )}
    </>
  );

  const shell = cn(
    cardBase,
    "flex items-center justify-between gap-4 p-5",
    href && "transition hover:border-[#1A14A5]/30 hover:shadow-md",
    className
  );

  return href ? (
    <Link href={href} className={shell}>
      {body}
    </Link>
  ) : (
    <div className={shell}>{body}</div>
  );
}
