"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Badge, ConfirmButton } from "@/components/admin/ui";
import AdminDataTable from "@/components/admin/DataTable/AdminDataTable";
import type { DataTableColumn } from "@/components/admin/DataTable/types";
import {
  COMM_CHANNEL_COLORS,
  COMM_CHANNEL_LABELS,
  COMM_DIRECTION_LABELS,
  type Communication,
} from "@/lib/communications";
import { formatDate } from "@/lib/invoices";

export type CommunicationRow = Communication & {
  clientName: string;
  projectName: string | null;
};

/** The full communication history on the shared admin table (sort, filter, search, export). */
export default function CommunicationTable({
  rows,
  hideClient = false,
  emptyAction,
}: {
  rows: CommunicationRow[];
  hideClient?: boolean;
  emptyAction?: React.ReactNode;
}) {
  const router = useRouter();

  const columns: DataTableColumn<CommunicationRow>[] = [
    {
      key: "when",
      label: "When",
      value: (row) => row.occurred_at,
      render: (row) => (
        <>
          <div>{formatDate(row.occurred_at)}</div>
          <div className="text-xs text-[#231F20]/45">
            {new Date(row.occurred_at).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
          </div>
        </>
      ),
      className: "whitespace-nowrap",
    },
    ...(hideClient
      ? []
      : [
          {
            key: "client",
            label: "Client",
            value: (row: CommunicationRow) => row.clientName,
            render: (row: CommunicationRow) =>
              row.client_id ? (
                <Link href={`/admin/clients/${row.client_id}`} className="font-medium text-[#1A14A5] hover:underline">
                  {row.clientName}
                </Link>
              ) : (
                row.clientName
              ),
          },
        ]),
    {
      key: "channel",
      label: "Channel",
      value: (row) => COMM_CHANNEL_LABELS[row.channel],
      render: (row) => (
        <span className="inline-flex flex-col items-start gap-0.5">
          <Badge label={COMM_CHANNEL_LABELS[row.channel]} colors={COMM_CHANNEL_COLORS[row.channel]} />
          {row.channel !== "note" && <span className="text-[11px] text-[#231F20]/45">{COMM_DIRECTION_LABELS[row.direction]}</span>}
        </span>
      ),
    },
    {
      key: "details",
      label: "Details",
      value: (row) => `${row.subject ?? ""} ${row.summary ?? ""}`.trim(),
      render: (row) => (
        <div className="max-w-md">
          {row.subject && <p className="font-medium text-[#231F20]">{row.subject}</p>}
          {row.summary && <p className="line-clamp-2 whitespace-pre-line text-xs text-[#231F20]/60">{row.summary}</p>}
          {row.projectName && <p className="mt-0.5 text-[11px] text-[#1A14A5]">{row.projectName}</p>}
        </div>
      ),
    },
    {
      key: "followup",
      label: "Follow-up",
      value: (row) => row.follow_up_on ?? "",
      render: (row) =>
        row.follow_up_on ? (
          <span className={row.follow_up_done ? "text-[#231F20]/40 line-through" : "font-medium text-amber-700"}>
            {formatDate(row.follow_up_on)}
          </span>
        ) : (
          "—"
        ),
      className: "whitespace-nowrap",
    },
    {
      key: "actions",
      label: "",
      value: () => "",
      sortable: false,
      filterable: false,
      render: (row) => (
        <ConfirmButton
          label="Delete"
          display="inline"
          title={`Delete "${row.subject || COMM_CHANNEL_LABELS[row.channel]}" for ${row.clientName}?`}
          confirmLabel="Delete"
          message="It is removed from the client's communication history."
          onConfirm={async () => {
            const res = await fetch(`/api/admin/communications/${row.id}`, { method: "DELETE" });
            const body = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(body.error || "Could not delete.");
            router.refresh();
          }}
        />
      ),
    },
  ];

  return (
    <AdminDataTable
      tableId="communications"
      columns={columns}
      rows={rows}
      getRowKey={(row) => row.id}
      searchPlaceholder="Search client, subject, notes…"
      emptyTitle="No communication logged yet"
      emptyAction={emptyAction}
      emptyMessage="Log a call, chat or meeting - or email a client from here - so the history is never lost."
    />
  );
}
