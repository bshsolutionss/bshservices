"use client";

import Link from "next/link";
import {
  INVOICE_STATUS_COLORS,
  INVOICE_STATUS_LABELS,
  formatDate,
  formatMoney,
  type InvoiceBalance,
  type InvoiceStatus,
} from "@/lib/invoices";
import { Badge } from "@/components/admin/ui";
import AdminDataTable from "@/components/admin/DataTable/AdminDataTable";
import type { DataTableColumn } from "@/components/admin/DataTable/types";

/** A row of `invoice_balances` plus the names resolved by the page. */
export type InvoiceListItem = InvoiceBalance & {
  clientName: string;
  projectName: string;
};

const columns: DataTableColumn<InvoiceListItem>[] = [
  {
    key: "invoice",
    label: "Invoice",
    value: (row) => row.invoice_number,
    render: (row) => (
      <Link href={`/admin/invoices/${row.invoice_id}`} className="font-medium text-[#1A14A5] hover:underline">
        {row.invoice_number}
      </Link>
    ),
    className: "whitespace-nowrap",
  },
  { key: "client", label: "Client", value: (row) => row.clientName },
  { key: "project", label: "Project", value: (row) => row.projectName },
  {
    key: "issued",
    label: "Issued",
    value: (row) => row.issue_date ?? row.created_at,
    render: (row) => formatDate(row.issue_date ?? row.created_at),
    className: "whitespace-nowrap",
  },
  {
    key: "due",
    label: "Due",
    value: (row) => row.due_date ?? "",
    render: (row) => (
      <span className={row.is_overdue ? "font-semibold text-red-600" : undefined}>
        {formatDate(row.due_date)}
        {row.is_overdue ? " · overdue" : ""}
      </span>
    ),
    className: "whitespace-nowrap",
  },
  {
    key: "total",
    label: "Total",
    value: (row) => Number(row.total),
    render: (row) => formatMoney(row.total, row.currency),
    className: "whitespace-nowrap",
  },
  {
    key: "paid",
    label: "Paid",
    value: (row) => Number(row.paid),
    render: (row) => formatMoney(row.paid, row.currency),
    className: "whitespace-nowrap",
  },
  {
    key: "balance",
    label: "Balance",
    value: (row) => Number(row.balance),
    render: (row) => (
      <span className={Number(row.balance) > 0 ? "font-semibold text-[#231F20]" : "text-[#231F20]/40"}>
        {formatMoney(row.balance, row.currency)}
      </span>
    ),
    className: "whitespace-nowrap",
  },
  {
    key: "status",
    label: "Status",
    value: (row) => INVOICE_STATUS_LABELS[row.status as InvoiceStatus] ?? row.status,
    render: (row) => (
      <Badge
        label={INVOICE_STATUS_LABELS[row.status as InvoiceStatus]}
        colors={INVOICE_STATUS_COLORS[row.status as InvoiceStatus]}
      />
    ),
  },
];

export default function InvoicesTable({
  invoices,
  toolbarExtra,
  emptyMessage = "No invoices found.",
}: {
  invoices: InvoiceListItem[];
  toolbarExtra?: React.ReactNode;
  emptyMessage?: string;
}) {
  return (
    <AdminDataTable
      tableId="invoices"
      columns={columns}
      rows={invoices}
      getRowKey={(row) => row.invoice_id}
      toolbarExtra={toolbarExtra}
      searchPlaceholder="Search invoice, client, project…"
      emptyMessage={emptyMessage}
    />
  );
}
