import { NextResponse, type NextRequest } from "next/server";
import { computeAvailableSlots } from "@/lib/availability";

/** Public — returns open time slots for a given date. Never throws; degrades to an empty list. */
export async function GET(request: NextRequest) {
  const date = request.nextUrl.searchParams.get("date");

  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ ok: false, error: "A valid date (YYYY-MM-DD) is required.", slots: [] }, { status: 400 });
  }

  const slots = await computeAvailableSlots(date);
  return NextResponse.json({ ok: true, slots });
}
