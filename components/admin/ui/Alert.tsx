import { AlertTriangle, CheckCircle2, Info, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type AlertTone = "info" | "success" | "warning" | "error";

const TONES: Record<AlertTone, { wrapper: string; icon: typeof Info }> = {
  info: { wrapper: "bg-[#F4F7FE] text-[#231F20]/70 border-[#1A14A5]/10", icon: Info },
  success: { wrapper: "bg-emerald-50 text-emerald-800 border-emerald-100", icon: CheckCircle2 },
  warning: { wrapper: "bg-amber-50 text-amber-800 border-amber-100", icon: AlertTriangle },
  error: { wrapper: "bg-red-50 text-red-700 border-red-100", icon: XCircle },
};

/** Inline message block — form errors, success confirmations and warnings all render through this. */
export default function Alert({
  tone = "info",
  title,
  children,
  className,
}: {
  tone?: AlertTone;
  title?: string;
  children?: React.ReactNode;
  className?: string;
}) {
  const { wrapper, icon: Icon } = TONES[tone];
  return (
    <div className={cn("flex items-start gap-2.5 rounded-xl border px-3.5 py-2.5 text-sm", wrapper, className)}>
      <Icon className="mt-0.5 h-4 w-4 shrink-0" />
      <div className="min-w-0">
        {title && <p className="font-semibold">{title}</p>}
        {children && <div className={cn(title && "mt-0.5", "text-[13px] leading-relaxed")}>{children}</div>}
      </div>
    </div>
  );
}
