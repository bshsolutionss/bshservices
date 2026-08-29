"use client";

import Link from "next/link";
import {
  LEAD_STATUS_LABELS,
  LEAD_STATUS_COLORS,
  LEAD_PRIORITY_LABELS,
  type Lead,
  type LeadStatus,
  type LeadPriority,
} from "@/lib/leads";
import { formatMoney } from "@/lib/invoices";
import AdminDataTable from "@/components/admin/DataTable/AdminDataTable";
import type { DataTableColumn } from "@/components/admin/DataTable/types";

export type LeadListItem = Pick<
  Lead,
  | "id"
  | "name"
  | "email"
  | "phone"
  | "status"
  | "source"
  | "selected_service"
  | "service_category"
  | "business"
  | "priority"
  | "expected_value"
  | "expected_value_currency"
  | "created_at"
>;

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

const columns: DataTableColumn<LeadListItem>[] = [
  {
    key: "name",
    label: "Name",
    value: (row) => row.name,
    render: (row) => (
      <Link href={`/admin/leads/${row.id}`} className="font-medium text-[#1A14A5] hover:underline">
        {row.name}
      </Link>
    ),
  },
  {
    key: "contact",
    label: "Contact",
    value: (row) => row.email,
    render: (row) => (
      <>
        <div>{row.email}</div>
        {row.phone && <div className="text-xs text-[#231F20]/50">{row.phone}</div>}
      </>
    ),
  },
  {
    key: "service",
    label: "Service",
    value: (row) => row.selected_service || row.service_category || "",
    render: (row) => row.selected_service || row.service_category || "—",
  },
  {
    key: "priority",
    label: "Priority",
    value: (row) => LEAD_PRIORITY_LABELS[row.priority as LeadPriority],
  },
  {
    key: "value",
    label: "Value",
    value: (row) => row.expected_value ?? 0,
    render: (row) =>
      row.expected_value !== null ? formatMoney(Number(row.expected_value), row.expected_value_currency) : "—",
    className: "whitespace-nowrap",
  },
  {
    key: "status",
    label: "Status",
    value: (row) => LEAD_STATUS_LABELS[row.status as LeadStatus],
    render: (row) => {
      const colors = LEAD_STATUS_COLORS[row.status as LeadStatus];
      return (
        <span className="text-xs font-bold px-3 py-1 rounded-full" style={{ background: colors.bg, color: colors.text }}>
          {LEAD_STATUS_LABELS[row.status as LeadStatus]}
        </span>
      );
    },
  },
  {
    key: "received",
    label: "Received",
    value: (row) => row.created_at,
    render: (row) => formatDate(row.created_at),
    className: "whitespace-nowrap",
  },
];

export default function LeadsTable({ leads }: { leads: LeadListItem[] }) {
  return (
    <AdminDataTable
      tableId="leads"
      columns={columns}
      rows={leads}
      getRowKey={(row) => row.id}
      searchPlaceholder="Search leads…"
      emptyMessage="No leads found."
    />
  );
}
