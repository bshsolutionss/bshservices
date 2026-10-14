"use client";

import Link from "next/link";
import { Badge } from "@/components/admin/ui";
import AdminDataTable from "@/components/admin/DataTable/AdminDataTable";
import type { DataTableColumn } from "@/components/admin/DataTable/types";
import {
  EMPLOYEE_STATUS_COLORS,
  EMPLOYEE_STATUS_LABELS,
  EMPLOYMENT_TYPE_COLORS,
  EMPLOYMENT_TYPE_LABELS,
  PAY_BASIS_SUFFIX,
  type Employee,
  type EmployeeStatus,
} from "@/lib/employees";
import { formatDate, formatMoney } from "@/lib/invoices";

const columns: DataTableColumn<Employee>[] = [
  {
    key: "name",
    label: "Name",
    value: (row) => row.name,
    render: (row) => (
      <Link href={`/admin/employees/${row.id}`} className="font-medium text-[#1A14A5] hover:underline">
        {row.name}
      </Link>
    ),
  },
  {
    key: "type",
    label: "Type",
    value: (row) => EMPLOYMENT_TYPE_LABELS[row.employment_type] ?? "Job (staff)",
    render: (row) => (
      <Badge
        label={EMPLOYMENT_TYPE_LABELS[row.employment_type] ?? "Job (staff)"}
        colors={EMPLOYMENT_TYPE_COLORS[row.employment_type] ?? EMPLOYMENT_TYPE_COLORS.job}
      />
    ),
  },
  { key: "role", label: "Role", value: (row) => row.role ?? "" },
  { key: "department", label: "Department", value: (row) => row.department ?? "" },
  {
    key: "pay",
    label: "Pay",
    value: (row) => row.pay_amount ?? 0,
    render: (row) =>
      row.pay_amount != null ? (
        <span className="whitespace-nowrap">
          {formatMoney(row.pay_amount, row.pay_currency)}{" "}
          <span className="text-xs text-[#231F20]/45">{PAY_BASIS_SUFFIX[row.pay_basis] ?? ""}</span>
        </span>
      ) : (
        "—"
      ),
  },
  {
    key: "contact",
    label: "Contact",
    value: (row) => row.email ?? row.phone ?? "",
    render: (row) => (
      <>
        <div>{row.email || <span className="text-amber-600">No email</span>}</div>
        {row.phone && <div className="text-xs text-[#231F20]/50">{row.phone}</div>}
      </>
    ),
  },
  {
    key: "hired",
    label: "Since",
    value: (row) => row.hire_date ?? "",
    render: (row) => formatDate(row.hire_date),
    className: "whitespace-nowrap",
  },
  {
    key: "status",
    label: "Status",
    value: (row) => EMPLOYEE_STATUS_LABELS[row.status as EmployeeStatus] ?? row.status,
    render: (row) => (
      <Badge
        label={EMPLOYEE_STATUS_LABELS[row.status as EmployeeStatus]}
        colors={EMPLOYEE_STATUS_COLORS[row.status as EmployeeStatus]}
      />
    ),
  },
];

export default function EmployeesTable({ employees }: { employees: Employee[] }) {
  return (
    <AdminDataTable
      tableId="employees"
      columns={columns}
      rows={employees}
      getRowKey={(row) => row.id}
      searchPlaceholder="Search name, role, department…"
      emptyMessage="No team members added yet."
    />
  );
}
