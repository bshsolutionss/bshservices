"use client";

import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { ConfirmButton } from "@/components/admin/ui";

export default function DeleteLeadButton({
  leadId,
  leadName,
  isBooking,
}: {
  leadId: string;
  leadName: string;
  isBooking?: boolean;
}) {
  const router = useRouter();
  const noun = isBooking ? "booking" : "lead";
  return (
    <ConfirmButton
      label={`Delete ${noun}`}
      display="block"
      icon={<Trash2 className="h-4 w-4" />}
      title={`Delete ${noun} "${leadName}"?`}
      confirmLabel={`Delete ${noun}`}
      message={`This cannot be undone${isBooking ? " - the time slot becomes available again" : ""}. ${
        isBooking ? "" : "If they simply aren't interested, mark the lead as Lost with a reason instead - that keeps your reports accurate."
      }`}
      onConfirm={async () => {
        const res = await fetch(`/api/admin/leads/${leadId}`, { method: "DELETE" });
        const body = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(body.error || `Could not delete the ${noun}.`);
        router.push(isBooking ? "/admin/bookings" : "/admin/leads");
        router.refresh();
      }}
    />
  );
}
