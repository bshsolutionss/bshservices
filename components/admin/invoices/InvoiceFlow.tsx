import { Check, FileText, Send, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDate, formatMoney, type Currency, type InvoiceStatus } from "@/lib/invoices";

interface InvoiceFlowProps {
  status: InvoiceStatus;
  issueDate: string;
  dueDate: string | null;
  total: number;
  paid: number;
  currency: Currency;
  lastPaymentOn: string | null;
  isOverdue: boolean;
}

/**
 * The invoice lifecycle as a three-stop strip: Draft → Sent → Paid.
 *
 * It exists because the status badge alone never said what to do next. Each
 * stop shows the fact that proves it happened (issue date, amount paid) and
 * the current one is called out, so the page answers "where is this invoice
 * and what's left?" at a glance.
 */
export default function InvoiceFlow({
  status,
  issueDate,
  dueDate,
  total,
  paid,
  currency,
  lastPaymentOn,
  isOverdue,
}: InvoiceFlowProps) {
  const sent = status !== "draft";
  const fullyPaid = status === "paid" || (total > 0 && paid >= total);
  const partiallyPaid = !fullyPaid && paid > 0;

  const stops = [
    {
      key: "draft",
      label: "Drafted",
      detail: `Issued ${formatDate(issueDate)}`,
      icon: FileText,
      state: "done" as const,
    },
    {
      key: "sent",
      label: "Sent to client",
      detail: sent
        ? dueDate
          ? `Due ${formatDate(dueDate)}${isOverdue ? " · overdue" : ""}`
          : "No due date set"
        : "Not sent yet",
      icon: Send,
      state: sent ? ("done" as const) : ("current" as const),
    },
    {
      key: "paid",
      label: fullyPaid ? "Paid in full" : partiallyPaid ? "Partially paid" : "Payment",
      detail: fullyPaid
        ? `${formatMoney(paid, currency)} received${lastPaymentOn ? ` · ${formatDate(lastPaymentOn)}` : ""}`
        : partiallyPaid
          ? `${formatMoney(paid, currency)} of ${formatMoney(total, currency)}`
          : `${formatMoney(total, currency)} outstanding`,
      icon: Wallet,
      state: fullyPaid ? ("done" as const) : sent ? ("current" as const) : ("todo" as const),
    },
  ];

  return (
    <ol className="grid gap-3 sm:grid-cols-3">
      {stops.map((stop) => {
        const Icon = stop.icon;
        const done = stop.state === "done";
        const current = stop.state === "current";
        return (
          <li
            key={stop.key}
            className={cn(
              "flex items-center gap-3 rounded-2xl border px-4 py-3",
              done && "border-emerald-100 bg-emerald-50/60",
              current && "border-[#1A14A5]/25 bg-white shadow-sm",
              !done && !current && "border-[#1A14A5]/10 bg-white/60"
            )}
          >
            <span
              className={cn(
                "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
                done && "bg-emerald-600 text-white",
                current && "bg-[#1A14A5] text-white",
                !done && !current && "bg-[#F4F7FE] text-[#231F20]/35"
              )}
            >
              {done ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-bold text-[#231F20]">{stop.label}</span>
              <span
                className={cn(
                  "block truncate text-xs",
                  isOverdue && stop.key === "sent" ? "font-semibold text-red-600" : "text-[#231F20]/55"
                )}
              >
                {stop.detail}
              </span>
            </span>
          </li>
        );
      })}
    </ol>
  );
}
