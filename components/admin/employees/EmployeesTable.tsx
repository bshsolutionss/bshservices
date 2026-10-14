"use client";

import Link from "next/link";
import { Badge } from "@/components/admin/ui";
import AdminDataTable from "@/components/admin/DataTable/AdminDataTable";
import type { DataTableColumn } from "@/components/admin/DataTable/types";
import {
  EMPLOYEE_STATUS_COLORS,
  EMPLOYEE_STATUS_LABELS,
  type Employee,
  type EmployeeStatus,
} from "@/lib/employees";
import { formatDate } from "@/lib/invoices";

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
  { key: "role", label: "Role", value: (row) => row.role ?? "" },
  { key: "department", label: "Department", value: (row) => row.department ?? "" },
  {
    key: "contact",
    label: "Contact",
    value: (row) => row.email ?? row.phone ?? "",
    render: (row) => (
      <>
        <div>{row.email || "—"}</div>
        {row.phone && <div className="text-xs text-[#231F20]/50">{row.phone}</div>}
      </>
    ),
  },
  {
    key: "hired",
    label: "Hired",
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
      emptyMessage="No employees added yet."
    />
  );
}
