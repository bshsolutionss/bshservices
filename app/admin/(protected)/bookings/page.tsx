import Link from "next/link";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { cn } from "@/lib/utils";
import { todayInPkt } from "@/lib/availability";
import BookingsTable, { type BookingListItem } from "@/components/admin/bookings/BookingsTable";

export const dynamic = "force-dynamic";

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

      <BookingsTable
        bookings={bookings}
        emptyMessage={`No ${filter !== "all" ? FILTER_LABELS[filter].toLowerCase() + " " : ""}bookings found.`}
      />
    </div>
  );
}
