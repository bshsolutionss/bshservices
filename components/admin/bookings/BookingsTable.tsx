"use client";

import Link from "next/link";
import {
  LEAD_STATUS_LABELS,
  LEAD_STATUS_COLORS,
  BOOKING_STATUS_LABELS,
  BOOKING_STATUS_COLORS,
  formatBookingDateTime,
  type Lead,
  type LeadStatus,
  type BookingStatus,
} from "@/lib/leads";
import AdminDataTable from "@/components/admin/DataTable/AdminDataTable";
import type { DataTableColumn } from "@/components/admin/DataTable/types";

export type BookingListItem = Pick<
  Lead,
  "id" | "name" | "email" | "phone" | "status" | "message" | "booking_date" | "booking_time" | "booking_status"
>;

const columns: DataTableColumn<BookingListItem>[] = [
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
    key: "datetime",
    label: "Date & Time",
    value: (row) => `${row.booking_date ?? ""} ${row.booking_time ?? ""}`,
    render: (row) => formatBookingDateTime(row),
    className: "whitespace-nowrap",
  },
  {
    key: "lead_status",
    label: "Lead Status",
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
    key: "booking_status",
    label: "Booking",
    value: (row) => BOOKING_STATUS_LABELS[row.booking_status as BookingStatus],
    render: (row) => {
      const colors = BOOKING_STATUS_COLORS[row.booking_status as BookingStatus];
      return (
        <span className="text-xs font-bold px-3 py-1 rounded-full" style={{ background: colors.bg, color: colors.text }}>
          {BOOKING_STATUS_LABELS[row.booking_status as BookingStatus]}
        </span>
      );
    },
  },
];

export default function BookingsTable({ bookings, emptyMessage }: { bookings: BookingListItem[]; emptyMessage: string }) {
  return (
    <AdminDataTable
      tableId="bookings"
      columns={columns}
      rows={bookings}
      getRowKey={(row) => row.id}
      searchPlaceholder="Search bookings…"
      emptyMessage={emptyMessage}
    />
  );
}
