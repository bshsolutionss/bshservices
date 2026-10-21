"use client";

import { CalendarX } from "lucide-react";
import { useRouter } from "next/navigation";
import { ConfirmButton } from "@/components/admin/ui";

export default function BookingCancelButton({ leadId, guestName }: { leadId: string; guestName: string }) {
  const router = useRouter();
  return (
    <ConfirmButton
      label="Cancel booking"
      display="block"
      icon={<CalendarX className="h-4 w-4" />}
      title={`Cancel the booking for "${guestName}"?`}
      confirmLabel="Cancel booking"
      message="The time slot becomes available for other visitors again. The guest is not emailed automatically - let them know yourself."
      onConfirm={async () => {
        const res = await fetch(`/api/admin/leads/${leadId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ booking_status: "cancelled" }),
        });
        const body = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(body.error || "Could not cancel the booking.");
        router.refresh();
      }}
    />
  );
}
