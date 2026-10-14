"use client";

import { useRouter } from "next/navigation";
import { Badge, ConfirmButton } from "@/components/admin/ui";
import AdminDataTable from "@/components/admin/DataTable/AdminDataTable";
import type { DataTableColumn } from "@/components/admin/DataTable/types";
import { EXPENSE_CATEGORY_COLORS, type Expense, type ExpenseCategory } from "@/lib/expenses";
import { formatDate, formatMoney } from "@/lib/invoices";
import ExpenseFormModal from "@/components/admin/expenses/ExpenseFormModal";

interface ExpensesTableProps {
  expenses: Expense[];
  employees: { id: string; name: string }[];
  toolbarExtra?: React.ReactNode;
}

/**
 * Expenses on the shared admin table — so sorting, filtering, search, column
 * customisation and CSV export work exactly as they do on Leads, Projects and
 * Invoices, instead of this page having its own hand-rolled <table>.
 */
export default function ExpensesTable({ expenses, employees, toolbarExtra }: ExpensesTableProps) {
  const router = useRouter();

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
        <Badge label={row.category} colors={EXPENSE_CATEGORY_COLORS[row.category as ExpenseCategory]} />
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
          <ExpenseFormModal expense={row} employees={employees} trigger="link" />
          <ConfirmButton
            label="Remove"
            display="inline"
            title="Remove this expense?"
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
      columns={columns}
      rows={expenses}
      getRowKey={(row) => row.id}
      toolbarExtra={toolbarExtra}
      searchPlaceholder="Search vendor, description, category…"
      emptyMessage="No expenses recorded yet."
    />
  );
}
