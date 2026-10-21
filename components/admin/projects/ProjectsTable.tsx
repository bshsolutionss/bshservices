"use client";

import Link from "next/link";
import {
  PROJECT_BILLING_COLORS,
  PROJECT_BILLING_LABELS,
  PROJECT_STAGE_LABELS,
  PROJECT_STAGE_COLORS,
  type Project,
  type ProjectStage,
} from "@/lib/projects";
import { Badge } from "@/components/admin/ui";
import { formatMoney } from "@/lib/invoices";
import AdminDataTable from "@/components/admin/DataTable/AdminDataTable";
import type { DataTableColumn } from "@/components/admin/DataTable/types";

export type ProjectListItem = Project & { clientName: string };

const columns: DataTableColumn<ProjectListItem>[] = [
  {
    key: "project",
    label: "Project",
    value: (row) => row.name,
    render: (row) => (
      <Link href={`/admin/projects/${row.id}`} className="font-medium text-[#1A14A5] hover:underline">
        {row.name}
      </Link>
    ),
  },
  {
    key: "client",
    label: "Client",
    value: (row) => row.clientName,
  },
  {
    key: "billing",
    label: "Billing",
    value: (row) => PROJECT_BILLING_LABELS[row.billing_type] ?? PROJECT_BILLING_LABELS.one_time,
    render: (row) => (
      <span className="inline-flex items-center gap-1.5">
        <Badge
          label={PROJECT_BILLING_LABELS[row.billing_type] ?? PROJECT_BILLING_LABELS.one_time}
          colors={PROJECT_BILLING_COLORS[row.billing_type] ?? PROJECT_BILLING_COLORS.one_time}
        />
        {row.billing_type === "monthly" && !row.recurring_active && (
          <span className="text-xs text-[#231F20]/45">paused</span>
        )}
      </span>
    ),
  },
  {
    key: "service",
    label: "Service",
    value: (row) => row.service_category || "",
    render: (row) => row.service_category || "-",
  },
  {
    key: "amount",
    label: "Amount",
    value: (row) => (row.billing_type === "monthly" ? row.monthly_fee : row.budget) ?? 0,
    render: (row) =>
      row.billing_type === "monthly"
        ? row.monthly_fee !== null
          ? `${formatMoney(Number(row.monthly_fee), row.currency)} / mo`
          : "-"
        : row.budget !== null
          ? formatMoney(Number(row.budget), row.currency)
          : "-",
    className: "whitespace-nowrap",
  },
  {
    key: "due",
    label: "Due",
    value: (row) => row.due_date ?? "",
    render: (row) => (row.due_date ? new Date(row.due_date).toLocaleDateString() : "-"),
    className: "whitespace-nowrap",
  },
  {
    key: "stage",
    label: "Stage",
    value: (row) => PROJECT_STAGE_LABELS[row.stage],
    render: (row) => {
      const colors = PROJECT_STAGE_COLORS[row.stage as ProjectStage];
      return (
        <span className="text-xs font-bold px-3 py-1 rounded-full" style={{ background: colors.bg, color: colors.text }}>
          {PROJECT_STAGE_LABELS[row.stage as ProjectStage]}
        </span>
      );
    },
  },
];

export default function ProjectsTable({
  projects,
  toolbarExtra,
  emptyMessage,
  emptyTitle,
  emptyAction,
}: {
  projects: ProjectListItem[];
  toolbarExtra?: React.ReactNode;
  emptyMessage: string;
  emptyTitle?: string;
  emptyAction?: React.ReactNode;
}) {
  return (
    <AdminDataTable
      tableId="projects"
      emptyTitle={emptyTitle}
      emptyAction={emptyAction}
      columns={columns}
      rows={projects}
      getRowKey={(row) => row.id}
      toolbarExtra={toolbarExtra}
      searchPlaceholder="Search projects…"
      emptyMessage={emptyMessage}
    />
  );
}
