import Link from "next/link";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { cn } from "@/lib/utils";
import { todayInPkt } from "@/lib/availability";
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

export const dynamic = "force-dynamic";

type BookingListItem = Pick<
  Lead,
  "id" | "name" | "email" | "phone" | "status" | "message" | "booking_date" | "booking_time" | "booking_status"
>;

const FILTERS = ["upcoming", "past", "cancelled", "all"] as const;
type Filter = (typeof FILTERS)[number];

const FILTER_LABELS: Record<Filter, string> = {
  upcoming: "Upcoming",
  past: "Past",
  cancelled: "Cancelled",
  all: "All",
};

function isFilter(value: string | undefined): value is Filter {
  return !!value && (FILTERS as readonly string[]).includes(value);
}

export default async function AdminBookingsPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const { filter: filterParam } = await searchParams;
  const filter: Filter = isFilter(filterParam) ? filterParam : "upcoming";
  const today = todayInPkt();

  const supabase = createServiceRoleClient();
  let query = supabase
    .from("leads")
    .select("id, name, email, phone, status, message, booking_date, booking_time, booking_status")
    .eq("source", "consultation_booking");

  if (filter === "upcoming") {
    query = query.eq("booking_status", "confirmed").gte("booking_date", today).order("booking_date").order("booking_time");
  } else if (filter === "past") {
    query = query
      .eq("booking_status", "confirmed")
      .lt("booking_date", today)
      .order("booking_date", { ascending: false })
      .order("booking_time", { ascending: false });
  } else if (filter === "cancelled") {
    query = query.eq("booking_status", "cancelled").order("booking_date", { ascending: false });
  } else {
    query = query.order("booking_date", { ascending: false }).order("booking_time", { ascending: false });
  }

  const { data } = await query.limit(200);
  const bookings = (data ?? []) as BookingListItem[];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-[#231F20]">Bookings</h1>
        <p className="text-[#231F20]/60 text-sm mt-1">
          {bookings.length} consultation booking{bookings.length === 1 ? "" : "s"} — contact-form leads are on the{" "}
          <Link href="/admin/leads" className="text-[#1A14A5] hover:underline">
            Leads
          </Link>{" "}
          page
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <Link
            key={f}
            href={`/admin/bookings?filter=${f}`}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-semibold transition",
              filter === f ? "bg-[#1A14A5] text-white" : "bg-white text-[#231F20]/70 border border-[#1A14A5]/10"
            )}
          >
            {FILTER_LABELS[f]}
          </Link>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-[#1A14A5]/10 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#1A14A5]/10 text-left text-[#231F20]/50">
              <th className="px-6 py-3 font-medium">Name</th>
              <th className="px-6 py-3 font-medium">Contact</th>
              <th className="px-6 py-3 font-medium">Date &amp; Time</th>
              <th className="px-6 py-3 font-medium">Lead Status</th>
              <th className="px-6 py-3 font-medium">Booking</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1A14A5]/5">
            {bookings.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-10 text-center text-[#231F20]/50">
                  No {filter !== "all" ? FILTER_LABELS[filter].toLowerCase() : ""} bookings found.
                </td>
              </tr>
            )}
            {bookings.map((booking) => (
              <tr key={booking.id} className="hover:bg-[#F4F7FE] transition">
                <td className="px-6 py-4">
                  <Link href={`/admin/leads/${booking.id}`} className="font-medium text-[#1A14A5] hover:underline">
                    {booking.name}
                  </Link>
                </td>
                <td className="px-6 py-4 text-[#231F20]/70">
                  <div>{booking.email}</div>
                  {booking.phone && <div className="text-xs text-[#231F20]/50">{booking.phone}</div>}
                </td>
                <td className="px-6 py-4 text-[#231F20]/70 whitespace-nowrap">
                  {formatBookingDateTime(booking)}
                </td>
                <td className="px-6 py-4">
                  <span
                    className="text-xs font-bold px-3 py-1 rounded-full"
                    style={{
                      background: LEAD_STATUS_COLORS[booking.status as LeadStatus].bg,
                      color: LEAD_STATUS_COLORS[booking.status as LeadStatus].text,
                    }}
                  >
                    {LEAD_STATUS_LABELS[booking.status as LeadStatus]}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span
                    className="text-xs font-bold px-3 py-1 rounded-full"
                    style={{
                      background: BOOKING_STATUS_COLORS[booking.booking_status as BookingStatus].bg,
                      color: BOOKING_STATUS_COLORS[booking.booking_status as BookingStatus].text,
                    }}
                  >
                    {BOOKING_STATUS_LABELS[booking.booking_status as BookingStatus]}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
