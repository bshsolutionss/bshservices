import { cn } from "@/lib/utils";

interface BadgeProps {
  label: string;
  /** Pass the entity's own color map entry (e.g. INVOICE_STATUS_COLORS[status]). */
  colors?: { bg: string; text: string };
  className?: string;
}

/** Status pill. One component so every status everywhere has the same shape/size. */
export default function Badge({ label, colors, className }: BadgeProps) {
  return (
    <span
      className={cn("inline-block whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-bold", className)}
      style={colors ? { background: colors.bg, color: colors.text } : undefined}
    >
      {label}
    </span>
  );
}
