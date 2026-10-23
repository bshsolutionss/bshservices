import Link from "next/link";
import { ChevronLeft, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * The portal's design system - one place for every client-facing screen, the way
 * components/admin/ui is for the admin panel. Warm off-white page, white rounded
 * cards, orange accent.
 */

export const portalBtn =
  "inline-flex items-center justify-center gap-1.5 rounded-full bg-gradient-to-b from-orange-500 to-orange-600 px-5 py-2.5 text-sm font-semibold text-white shadow-[0_6px_16px_-6px_rgba(234,88,12,0.6)] transition hover:from-orange-500 hover:to-orange-700 disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/40 focus-visible:ring-offset-2";
export const portalBtnGhost =
  "inline-flex items-center justify-center gap-1.5 rounded-full border border-stone-200 bg-white px-4 py-2 text-sm font-medium text-stone-700 transition hover:bg-stone-50 disabled:pointer-events-none disabled:opacity-50";
export const portalInput =
  "w-full rounded-full border border-stone-200 bg-white px-4 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-500/15";
export const portalTextarea =
  "w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-900 placeholder:text-stone-400 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-500/15";
export const portalCard = "rounded-3xl border border-stone-200/70 bg-white shadow-[0_1px_2px_rgba(28,25,23,0.04),0_8px_24px_-12px_rgba(28,25,23,0.08)]";

export function PageHeader({
  icon: Icon,
  title,
  subtitle,
  backHref,
  backLabel,
  actions,
}: {
  icon?: LucideIcon;
  title: string;
  subtitle?: string;
  backHref?: string;
  backLabel?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="mb-6">
      {backHref && (
        <Link href={backHref} className="mb-3 inline-flex items-center gap-1 text-sm text-stone-500 hover:text-orange-600">
          <ChevronLeft className="h-4 w-4" />
          {backLabel ?? "Back"}
        </Link>
      )}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3.5">
          {Icon && (
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-orange-100/80 text-orange-600">
              <Icon className="h-5 w-5" />
            </span>
          )}
          <div>
            <h1 className="text-[1.65rem] font-semibold leading-tight tracking-tight text-stone-900">{title}</h1>
            {subtitle && <p className="text-sm text-stone-500">{subtitle}</p>}
          </div>
        </div>
        {actions}
      </div>
    </div>
  );
}

export function SectionLabel({ children, hint, action }: { children: React.ReactNode; hint?: string; action?: React.ReactNode }) {
  return (
    <div className="mb-3 mt-9 flex items-end justify-between gap-3">
      <div>
        <h2 className="text-[11px] font-medium uppercase tracking-[0.14em] text-stone-400">{children}</h2>
        {hint && <p className="mt-1 text-sm text-stone-500">{hint}</p>}
      </div>
      {action}
    </div>
  );
}

export function StatCard({
  icon: Icon,
  value,
  label,
  hint,
  tone = "neutral",
}: {
  icon: LucideIcon;
  value: React.ReactNode;
  label: string;
  hint?: string;
  tone?: "neutral" | "orange";
}) {
  return (
    <div className={cn(portalCard, "p-4")}>
      <span
        className={cn(
          "grid h-9 w-9 place-items-center rounded-xl",
          tone === "orange" ? "bg-orange-100/80 text-orange-600" : "bg-stone-100 text-stone-500"
        )}
      >
        <Icon className="h-4 w-4" />
      </span>
      <p className="mt-4 text-2xl font-semibold tracking-tight text-stone-900">{value}</p>
      <p className="text-[13px] text-stone-500">{label}</p>
      {hint && <p className="mt-0.5 text-[11px] text-stone-400">{hint}</p>}
    </div>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="rounded-3xl border border-dashed border-stone-300/80 bg-stone-100/50 px-6 py-12 text-center">
      <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-orange-100 text-orange-600">
        <Icon className="h-5 w-5" />
      </span>
      <h3 className="mt-4 font-semibold text-stone-900">{title}</h3>
      {description && <p className="mx-auto mt-1 max-w-sm text-sm text-stone-500">{description}</p>}
      {children && <div className="mt-4">{children}</div>}
    </div>
  );
}

const TONES = {
  blue: "bg-blue-50 text-blue-700",
  green: "bg-emerald-50 text-emerald-700",
  amber: "bg-amber-50 text-amber-700",
  red: "bg-red-50 text-red-700",
  stone: "bg-stone-100 text-stone-600",
  orange: "bg-orange-50 text-orange-700",
} as const;

export function StatusPill({ label, tone = "stone", dot }: { label: string; tone?: keyof typeof TONES; dot?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium", TONES[tone])}>
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current" />}
      {label}
    </span>
  );
}

export function ProgressBar({ value, className }: { value: number; className?: string }) {
  return (
    <div className={cn("h-1.5 w-full overflow-hidden rounded-full bg-stone-200/70", className)}>
      <div className="h-full rounded-full bg-orange-500 transition-all" style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
    </div>
  );
}
