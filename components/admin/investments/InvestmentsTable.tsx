"use client";

import Link from "next/link";
import { Badge } from "@/components/admin/ui";
import AdminDataTable from "@/components/admin/DataTable/AdminDataTable";
import type { DataTableColumn } from "@/components/admin/DataTable/types";
import {
  INVESTMENT_STATUS_COLORS,
  INVESTMENT_STATUS_LABELS,
  investmentPerformance,
  type Investment,
} from "@/lib/investments";
import { formatDate, formatMoney } from "@/lib/invoices";
import { useOptions } from "@/lib/admin/use-options";

export type InvestmentRow = Investment & { returnsTotal: number };

export default function InvestmentsTable({ investments }: { investments: InvestmentRow[] }) {
  const types = useOptions("investment_types");

  const columns: DataTableColumn<InvestmentRow>[] = [
    {
      key: "name",
      label: "Investment",
      value: (row) => row.name,
      render: (row) => (
        <Link href={`/admin/investments/${row.id}`} className="font-medium text-[#1A14A5] hover:underline">
          {row.name}
        </Link>
      ),
    },
    {
      key: "type",
      label: "Type",
      value: (row) => (row.investment_type ? types.labelFor(row.investment_type) : ""),
      render: (row) =>
        row.investment_type ? <Badge label={types.labelFor(row.investment_type)} colors={types.colorsFor(row.investment_type)} /> : "—",
    },
    {
      key: "invested",
      label: "Invested",
      value: (row) => Number(row.invested_amount),
      render: (row) => formatMoney(row.invested_amount, row.currency),
      className: "whitespace-nowrap",
    },
    {
      key: "value",
      label: "Current value",
      value: (row) => Number(row.current_value),
      render: (row) => formatMoney(row.current_value, row.currency),
      className: "whitespace-nowrap",
    },
    {
      key: "returns",
      label: "Returns received",
      value: (row) => row.returnsTotal,
      render: (row) => formatMoney(row.returnsTotal, row.currency),
      className: "whitespace-nowrap",
    },
    {
      key: "roi",
      label: "Gain / loss",
      value: (row) => investmentPerformance(row, row.returnsTotal).gain,
      render: (row) => {
        const { gain, roiPct } = investmentPerformance(row, row.returnsTotal);
        return (
          <span className={gain >= 0 ? "font-semibold text-emerald-700" : "font-semibold text-red-600"}>
            {gain >= 0 ? "+" : ""}
            {formatMoney(gain, row.currency)}
            {roiPct !== null && <span className="ml-1 text-xs font-medium">({roiPct}%)</span>}
          </span>
        );
      },
      className: "whitespace-nowrap",
    },
    {
      key: "since",
      label: "Since",
      value: (row) => row.invested_on,
      render: (row) => formatDate(row.invested_on),
      className: "whitespace-nowrap",
    },
    {
      key: "status",
      label: "Status",
      value: (row) => INVESTMENT_STATUS_LABELS[row.status],
      render: (row) => <Badge label={INVESTMENT_STATUS_LABELS[row.status]} colors={INVESTMENT_STATUS_COLORS[row.status]} />,
    },
  ];

  return (
    <AdminDataTable
      tableId="investments"
      columns={columns}
      rows={investments}
      getRowKey={(row) => row.id}
      searchPlaceholder="Search investments…"
      emptyMessage="No investments yet - add the first one."
    />
  );
}
