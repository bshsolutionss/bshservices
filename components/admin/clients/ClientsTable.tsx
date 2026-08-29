"use client";

import Link from "next/link";
import type { Client } from "@/lib/clients";
import AdminDataTable from "@/components/admin/DataTable/AdminDataTable";
import type { DataTableColumn } from "@/components/admin/DataTable/types";

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

const columns: DataTableColumn<Client>[] = [
  {
    key: "company",
    label: "Company",
    value: (row) => row.company_name,
    render: (row) => (
      <Link href={`/admin/clients/${row.id}`} className="font-medium text-[#1A14A5] hover:underline">
        {row.company_name}
      </Link>
    ),
  },
  {
    key: "contact",
    label: "Contact",
    value: (row) => row.contact_name || row.contact_email,
    render: (row) => (
      <>
        <div>{row.contact_name || row.contact_email}</div>
        <div className="text-xs text-[#231F20]/50">{row.contact_email}</div>
      </>
    ),
  },
  {
    key: "industry",
    label: "Industry",
    value: (row) => row.industry || "",
    render: (row) => row.industry || "—",
  },
  {
    key: "account_manager",
    label: "Account Manager",
    value: (row) => row.account_manager || "",
    render: (row) => row.account_manager || "—",
  },
  {
    key: "since",
    label: "Since",
    value: (row) => row.created_at,
    render: (row) => formatDate(row.created_at),
    className: "whitespace-nowrap",
  },
];

export default function ClientsTable({ clients, toolbarExtra }: { clients: Client[]; toolbarExtra?: React.ReactNode }) {
  return (
    <AdminDataTable
      tableId="clients"
      columns={columns}
      rows={clients}
      getRowKey={(row) => row.id}
      toolbarExtra={toolbarExtra}
      searchPlaceholder="Search clients…"
      emptyMessage="No clients yet — they're created automatically when a lead is marked Won, or added manually above."
    />
  );
}
