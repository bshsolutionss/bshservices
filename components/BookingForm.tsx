"use client";

import { useEffect, useMemo, useState, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Clock, CheckCircle2, Star, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { trackEvent } from "@/lib/analytics";
import { buildWhatsAppUrl, whatsAppMessageForService, DEFAULT_WHATSAPP_MESSAGE } from "@/lib/whatsapp";
import { FaWhatsapp } from "react-icons/fa";
import GoogleReviewsBadge from "@/components/GoogleReviewsBadge";

const BOOKING_HORIZON_DAYS = 60;
const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_LABELS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

function toDateStr(year: number, month: number, day: number): string {
  return `${year}-${pad(month + 1)}-${pad(day)}`;
}

function formatSlotLabel(time: string): string {
  const [h, m] = time.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${pad(m)} ${period}`;
}

interface DayCell {
  day: number;
  dateStr: string;
  disabled: boolean;
}

function buildMonthGrid(year: number, month: number): (DayCell | null)[] {
  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const horizon = new Date(today);
  horizon.setDate(horizon.getDate() + BOOKING_HORIZON_DAYS);

  const cells: (DayCell | null)[] = Array(firstWeekday).fill(null);
  for (let day = 1; day <= daysInMonth; day++) {
    const cellDate = new Date(year, month, day);
    cells.push({
      day,
      dateStr: toDateStr(year, month, day),
      disabled: cellDate < today || cellDate > horizon,
    });
  }
  return cells;
}

type Status = "idle" | "loading" | "success" | "error";

// useSearchParams() (for the guided-funnel prefill) requires a Suspense
// boundary — see the matching note in components/contactform.tsx.
function BookingFormInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const today = useMemo(() => new Date(), []);

  // Guided-funnel handoff: a service page's "Book a Consultation" CTA, or
  // the contact form's post-submit "Prefer to talk now?" link, can pass
  // ?name=&email=&phone=&service=&category=&leadId= so this step isn't a
  // cold restart — see components/contactform.tsx and lib/whatsapp.ts's
  // sibling prefill pattern.
  const prefillService = searchParams.get("service") ?? "";
  const prefillCategory = searchParams.get("category") ?? "";
  const referringLeadId = searchParams.get("leadId");

  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const [slots, setSlots] = useState<string[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotsError, setSlotsError] = useState(false);

  const [form, setForm] = useState({
    name: searchParams.get("name") ?? "",
    email: searchParams.get("email") ?? "",
    phone: searchParams.get("phone") ?? "",
    message: "",
    company_website: "", // honeypot
  });
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const grid = useMemo(() => buildMonthGrid(viewYear, viewMonth), [viewYear, viewMonth]);

  const canGoPrevMonth = !(viewYear === today.getFullYear() && viewMonth === today.getMonth());

  useEffect(() => {
    if (!selectedDate) return;
    setSlots([]);
    setSelectedTime(null);
    setSlotsLoading(true);
    setSlotsError(false);

    fetch(`/api/availability?date=${selectedDate}`)
      .then((res) => res.json())
      .then((body) => {
        if (!body.ok) throw new Error();
        setSlots(body.slots ?? []);
      })
      .catch(() => setSlotsError(true))
      .finally(() => setSlotsLoading(false));
  }, [selectedDate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const refetchSlots = () => {
    if (!selectedDate) return;
    setSlotsLoading(true);
    fetch(`/api/availability?date=${selectedDate}`)
      .then((res) => res.json())
      .then((body) => setSlots(body.ok ? body.slots ?? [] : []))
      .catch(() => setSlotsError(true))
      .finally(() => setSlotsLoading(false));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate || !selectedTime) return;

    setStatus("loading");
    setErrorMessage(null);

    // No DB merge with an earlier contact-form lead (a different row, kept
    // separate on purpose — see app/api/bookings/route.ts) but the
    // reference is preserved in the message so admin sees the thread.
    const message = referringLeadId
      ? `[Continuing from earlier inquiry, ref: ${referringLeadId}] ${form.message}`.trim()
      : form.message;

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source: "consultation_booking",
          page_path: pathname,
          name: form.name,
          email: form.email,
          phone: form.phone,
          message,
          service_category: prefillCategory || undefined,
          selected_service: prefillService || undefined,
          booking_date: selectedDate,
          booking_time: selectedTime,
          company_website: form.company_website,
        }),
      });

      const body = await res.json().catch(() => ({}));

      if (!res.ok) {
        if (body.slotTaken) {
          setSelectedTime(null);
          refetchSlots();
        }
        throw new Error(body.error || "Something went wrong. Please try again.");
      }

      setStatus("success");
      trackEvent("booking_submit", { service_category: prefillCategory || "unspecified" });
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setStatus("error");
    }
  };

  if (status === "success") {
    const whatsAppHref = buildWhatsAppUrl(
      prefillService ? whatsAppMessageForService(prefillService) : DEFAULT_WHATSAPP_MESSAGE
    );

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl shadow-xl p-10 text-center max-w-lg mx-auto"
      >
        <CheckCircle2 className="w-14 h-14 text-[#1A14A5] mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-[#231F20] mb-2">You&apos;re booked! 🎉</h3>
        <p className="text-[#231F20]/70">
          Check your email for confirmation — we&apos;ve sent the details to <strong>{form.email}</strong>.
        </p>

        {/* While-you-wait — gives the visitor somewhere to go instead of a
            dead end, and a second, lower-friction way to reach us sooner. */}
        <div className="mt-8 pt-8 border-t border-[#1A14A5]/10 text-left space-y-4">
          <p className="text-sm font-semibold text-[#231F20]/50 uppercase tracking-wide text-center">
            While you wait
          </p>

          <Link
            href="/portfolio"
            className="flex items-center justify-between gap-3 rounded-2xl border border-[#1A14A5]/10 hover:border-[#1A14A5]/30 p-4 transition-colors"
          >
            <div>
              <p className="font-semibold text-[#231F20]">See our recent work</p>
              <p className="text-sm text-[#231F20]/60">Real, live client projects we&apos;ve shipped.</p>
            </div>
            <ArrowRight className="w-4 h-4 text-[#1A14A5] shrink-0" />
          </Link>

          <a
            href={whatsAppHref}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackEvent("whatsapp_click", { source: "booking_success" })}
            className="flex items-center justify-between gap-3 rounded-2xl border border-[#25D366]/30 hover:border-[#25D366] p-4 transition-colors"
          >
            <div className="flex items-center gap-3">
              <FaWhatsapp className="w-6 h-6 text-[#25D366] shrink-0" />
              <div>
                <p className="font-semibold text-[#231F20]">Can&apos;t wait for the call?</p>
                <p className="text-sm text-[#231F20]/60">Message us on WhatsApp right now.</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-[#25D366] shrink-0" />
          </a>

          <GoogleReviewsBadge />
        </div>
      </motion.div>
    );
  }

  return (
    <div className="bg-white rounded-3xl shadow-xl p-6 md:p-10 max-w-3xl mx-auto">
      <div className="flex items-center gap-1.5 mb-6 text-sm text-[#231F20]/60">
        <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
        <span>Trusted by 9+ clients — usually responds within a few hours</span>
      </div>

      <p className="text-sm font-semibold text-[#1A14A5] mb-1">Step 1</p>
      <h3 className="text-xl font-bold text-[#231F20] mb-4">Pick a date</h3>

      <div className="flex items-center justify-between mb-3">
        <button
          type="button"
          onClick={() => {
            const prev = new Date(viewYear, viewMonth - 1, 1);
            setViewYear(prev.getFullYear());
            setViewMonth(prev.getMonth());
          }}
          disabled={!canGoPrevMonth}
          className="p-2 rounded-lg hover:bg-[#F4F7FE] disabled:opacity-30 disabled:hover:bg-transparent"
          aria-label="Previous month"
        >
          <ChevronLeft className="w-5 h-5 text-[#1A14A5]" />
        </button>
        <span className="font-semibold text-[#231F20]">
          {MONTH_LABELS[viewMonth]} {viewYear}
        </span>
        <button
          type="button"
          onClick={() => {
            const next = new Date(viewYear, viewMonth + 1, 1);
            setViewYear(next.getFullYear());
            setViewMonth(next.getMonth());
          }}
          className="p-2 rounded-lg hover:bg-[#F4F7FE]"
          aria-label="Next month"
        >
          <ChevronRight className="w-5 h-5 text-[#1A14A5]" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {WEEKDAY_LABELS.map((d) => (
          <div key={d} className="text-center text-xs font-semibold text-[#231F20]/40 py-1">
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1 mb-8">
        {grid.map((cell, i) =>
          cell === null ? (
            <div key={`blank-${i}`} />
          ) : (
            <button
              key={cell.dateStr}
              type="button"
              disabled={cell.disabled}
              onClick={() => {
                setSelectedDate(cell.dateStr);
                trackEvent("booking_date_selected");
              }}
              className={cn(
                "aspect-square rounded-lg text-sm font-medium transition",
                cell.disabled
                  ? "text-[#231F20]/20 cursor-not-allowed"
                  : selectedDate === cell.dateStr
                  ? "bg-[#1A14A5] text-white"
                  : "text-[#231F20] hover:bg-[#F4F7FE]"
              )}
            >
              {cell.day}
            </button>
          )
        )}
      </div>

      {selectedDate && (
        <>
          <p className="text-sm font-semibold text-[#1A14A5] mb-1">Step 2</p>
          <h3 className="text-xl font-bold text-[#231F20] mb-1 flex items-center gap-2">
            <Clock className="w-5 h-5" /> Pick a time
          </h3>
          <p className="text-xs text-[#231F20]/50 mb-4">All times are Pakistan Time (PKT, UTC+5)</p>

          {slotsLoading && <p className="text-sm text-[#231F20]/60 mb-8">Loading available times…</p>}
          {!slotsLoading && slotsError && (
            <p className="text-sm text-red-600 mb-8">
              Booking is temporarily unavailable. Please contact us directly instead.
            </p>
          )}
          {!slotsLoading && !slotsError && slots.length === 0 && (
            <p className="text-sm text-[#231F20]/60 mb-8">No slots available this day — try another date.</p>
          )}
          {!slotsLoading && !slotsError && slots.length > 0 && (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-8">
              {slots.map((slot) => (
                <button
                  key={slot}
                  type="button"
                  onClick={() => {
                    setSelectedTime(slot);
                    trackEvent("booking_time_selected");
                  }}
                  className={cn(
                    "py-2.5 rounded-xl text-sm font-semibold border transition",
                    selectedTime === slot
                      ? "bg-[#1A14A5] text-white border-[#1A14A5]"
                      : "border-[#1A14A5]/20 text-[#231F20] hover:border-[#1A14A5]"
                  )}
                >
                  {formatSlotLabel(slot)}
                </button>
              ))}
            </div>
          )}
        </>
      )}

      {selectedDate && selectedTime && (
        <motion.form
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          <p className="text-sm font-semibold text-[#1A14A5] mb-1">Step 3</p>
          <h3 className="text-xl font-bold text-[#231F20] mb-4">Your details</h3>

          <Input type="text" name="name" placeholder="Your Name" value={form.name} onChange={handleChange} required />
          <Input type="email" name="email" placeholder="Your Email" value={form.email} onChange={handleChange} required />
          <Input type="text" name="phone" placeholder="Your Phone Number" value={form.phone} onChange={handleChange} />
          <Textarea
            name="message"
            placeholder="What would you like to discuss? (optional)"
            value={form.message}
            onChange={handleChange}
            rows={4}
          />

          {/* Honeypot — hidden from real users, bots tend to fill every field */}
          <input
            type="text"
            name="company_website"
            value={form.company_website}
            onChange={handleChange}
            tabIndex={-1}
            autoComplete="off"
            className="hidden"
            aria-hidden="true"
          />

          <Button
            type="submit"
            disabled={status === "loading"}
            className="w-full bg-[#1A14A5] hover:bg-[#0e0a7a] text-white rounded-2xl py-6 text-lg shadow-lg"
          >
            {status === "loading" ? "Booking..." : "Confirm Booking"}
          </Button>

          {status === "error" && errorMessage && (
            <p className="text-red-600 text-center text-sm">❌ {errorMessage}</p>
          )}
        </motion.form>
      )}
    </div>
  );
}

export default function BookingForm() {
  return (
    <Suspense fallback={null}>
      <BookingFormInner />
    </Suspense>
  );
}
