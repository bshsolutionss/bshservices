"use client";

import { Download } from "lucide-react";
import { cn } from "@/lib/utils";
import { btnSecondary } from "@/components/admin/ui";
import { formatMoney } from "@/lib/invoices";
import type { MonthlyPL, ProfitLossReport } from "@/lib/finance";

interface ProfitLossTableProps {
  months: MonthlyPL[];
  totals: ProfitLossReport["totals"];
  /** Goes into the exported file name, e.g. "2026-01_2026-12". */
  rangeId: string;
  basisLabel: string;
}

function csvField(value: string): string {
  return /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

/**
 * The month-by-month P&L — and the table view the chart above is required to
 * have, so the numbers are always readable without interpreting a bar.
 * Export writes exactly these rows, including the totals line.
 */
export default function ProfitLossTable({ months, totals, rangeId, basisLabel }: ProfitLossTableProps) {
  const exportCsv = () => {
    const header = ["Month", `Revenue (PKR, ${basisLabel})`, "Expenses (PKR)", "Profit (PKR)", "Margin %"];
    const lines = months.map((row) =>
      [row.month, row.revenue, row.expenses, row.profit, row.margin ?? ""].map((v) => csvField(String(v))).join(",")
    );
    const totalLine = ["Total", totals.revenue, totals.expenses, totals.profit, totals.margin ?? ""]
      .map((v) => csvField(String(v)))
      .join(",");

    const csv = [header.map(csvField).join(","), ...lines, totalLine].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `profit-loss-${rangeId}.csv`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-[#231F20]/50">
          Revenue basis: <span className="font-semibold text-[#231F20]/70">{basisLabel}</span>
        </p>
        <button type="button" onClick={exportCsv} className={btnSecondary}>
          <Download className="h-4 w-4" /> Export CSV
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[520px] text-sm">
          <thead>
            <tr className="border-b border-[#1A14A5]/10 text-left text-xs uppercase tracking-wide text-[#231F20]/45">
              <th className="py-2.5 pr-3 font-semibold">Month</th>
              <th className="py-2.5 pr-3 text-right font-semibold">Revenue</th>
              <th className="py-2.5 pr-3 text-right font-semibold">Expenses</th>
              <th className="py-2.5 pr-3 text-right font-semibold">Profit</th>
              <th className="py-2.5 text-right font-semibold">Margin</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1A14A5]/5">
            {months.map((row) => {
              const empty = row.revenue === 0 && row.expenses === 0;
              return (
                <tr key={row.month} className={cn("transition hover:bg-[#F4F7FE]", empty && "text-[#231F20]/35")}>
                  <td className="whitespace-nowrap py-2.5 pr-3 font-semibold text-[#231F20]">{row.label}</td>
                  <td className="whitespace-nowrap py-2.5 pr-3 text-right">{formatMoney(row.revenue, "PKR")}</td>
                  <td className="whitespace-nowrap py-2.5 pr-3 text-right">{formatMoney(row.expenses, "PKR")}</td>
                  <td
                    className={cn(
                      "whitespace-nowrap py-2.5 pr-3 text-right font-semibold",
                      !empty && (row.profit >= 0 ? "text-emerald-700" : "text-red-600")
                    )}
                  >
                    {formatMoney(row.profit, "PKR")}
                  </td>
                  <td className="whitespace-nowrap py-2.5 text-right">
                    {row.margin !== null ? `${row.margin}%` : "-"}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-[#1A14A5]/15 font-bold text-[#231F20]">
              <td className="py-3 pr-3">Total</td>
              <td className="whitespace-nowrap py-3 pr-3 text-right">{formatMoney(totals.revenue, "PKR")}</td>
              <td className="whitespace-nowrap py-3 pr-3 text-right">{formatMoney(totals.expenses, "PKR")}</td>
              <td
                className={cn(
                  "whitespace-nowrap py-3 pr-3 text-right",
                  totals.profit >= 0 ? "text-emerald-700" : "text-red-600"
                )}
              >
                {formatMoney(totals.profit, "PKR")}
              </td>
              <td className="whitespace-nowrap py-3 text-right">
                {totals.margin !== null ? `${totals.margin}%` : "-"}
              </td>
            </tr>
            <tr className="text-xs text-[#231F20]/45">
              <td className="py-2 pr-3">Monthly average</td>
              <td className="whitespace-nowrap py-2 pr-3 text-right">{formatMoney(totals.averageRevenue, "PKR")}</td>
              <td className="whitespace-nowrap py-2 pr-3 text-right">{formatMoney(totals.averageExpenses, "PKR")}</td>
              <td className="whitespace-nowrap py-2 pr-3 text-right">{formatMoney(totals.averageProfit, "PKR")}</td>
              <td />
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
