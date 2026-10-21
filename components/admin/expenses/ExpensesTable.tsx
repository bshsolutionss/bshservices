"use client";

import { useRouter } from "next/navigation";
import { Badge, ConfirmButton } from "@/components/admin/ui";
import AdminDataTable from "@/components/admin/DataTable/AdminDataTable";
import type { DataTableColumn } from "@/components/admin/DataTable/types";
import {
  EXPENSE_TYPE_COLORS,
  EXPENSE_TYPE_LABELS,
  type Expense,
} from "@/lib/expenses";
import { formatDate, formatMoney } from "@/lib/invoices";
import { useOptions } from "@/lib/admin/use-options";
import ExpenseFormModal from "@/components/admin/expenses/ExpenseFormModal";

interface ExpensesTableProps {
  expenses: Expense[];
  employees: { id: string; name: string }[];
  projects?: { id: string; name: string }[];
  toolbarExtra?: React.ReactNode;
  emptyTitle?: string;
  emptyAction?: React.ReactNode;
}

/**
 * Expenses on the shared admin table — so sorting, filtering, search, column
 * customisation and CSV export work exactly as they do on Leads, Projects and
 * Invoices, instead of this page having its own hand-rolled <table>.
 */
export default function ExpensesTable({ expenses, employees, projects = [], toolbarExtra, emptyTitle, emptyAction }: ExpensesTableProps) {
  const router = useRouter();
  const categories = useOptions("expense_categories");

  // Defined here rather than at module scope because the row actions need the
  // employee list and the router for refresh after a delete.
  const columns: DataTableColumn<Expense>[] = [
    {
      key: "date",
      label: "Date",
      value: (row) => row.expense_date,
      render: (row) => formatDate(row.expense_date),
      className: "whitespace-nowrap",
    },
    {
      key: "category",
      label: "Category",
      value: (row) => row.category,
      render: (row) => (
        <Badge label={categories.labelFor(row.category)} colors={categories.colorsFor(row.category)} />
      ),
    },
    {
      key: "type",
      label: "Type",
      value: (row) => EXPENSE_TYPE_LABELS[row.expense_type] ?? EXPENSE_TYPE_LABELS.one_time,
      render: (row) => (
        <span className="inline-flex items-center gap-1.5">
          <Badge
            label={EXPENSE_TYPE_LABELS[row.expense_type] ?? EXPENSE_TYPE_LABELS.one_time}
            colors={EXPENSE_TYPE_COLORS[row.expense_type] ?? EXPENSE_TYPE_COLORS.one_time}
          />
          {row.expense_type === "monthly" && !row.recurring_parent_id && !row.recurring_active && (
            <span className="text-xs text-[#231F20]/45">stopped</span>
          )}
          {row.recurring_parent_id && <span className="text-xs text-[#231F20]/45">auto</span>}
        </span>
      ),
    },
    { key: "vendor", label: "Vendor / Employee", value: (row) => row.vendor ?? "" },
    { key: "description", label: "Description", value: (row) => row.description ?? "" },
    {
      key: "amount",
      label: "Amount",
      value: (row) => Number(row.amount),
      render: (row) => (
        <span className="font-semibold text-[#231F20]">{formatMoney(row.amount, row.currency)}</span>
      ),
      className: "whitespace-nowrap",
    },
    { key: "currency", label: "Currency", value: (row) => row.currency },
    {
      key: "actions",
      label: "",
      value: () => "",
      sortable: false,
      filterable: false,
      render: (row) => (
        <div className="flex items-center gap-3">
          <ExpenseFormModal expense={row} employees={employees} projects={projects} trigger="link" />
          <ConfirmButton
            label="Remove"
            display="inline"
            title={`Remove the ${row.vendor || row.category} expense?`}
            confirmLabel="Remove expense"
            message={`${formatMoney(row.amount, row.currency)} on ${formatDate(
              row.expense_date
            )} will be deleted, and will no longer count against profit in reports.`}
            onConfirm={async () => {
              const res = await fetch(`/api/admin/expenses/${row.id}`, { method: "DELETE" });
              const body = await res.json().catch(() => ({}));
              if (!res.ok) throw new Error(body.error || "Could not remove the expense.");
              router.refresh();
            }}
          />
        </div>
      ),
      className: "whitespace-nowrap",
    },
  ];

  return (
    <AdminDataTable
      tableId="expenses"
      emptyTitle={emptyTitle}
      emptyAction={emptyAction}
      columns={columns}
      rows={expenses}
      getRowKey={(row) => row.id}
      toolbarExtra={toolbarExtra}
      searchPlaceholder="Search vendor, description, category…"
      emptyMessage="No expenses recorded yet."
    />
  );
}
