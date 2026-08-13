"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function DeleteLeadButton({ leadId, isBooking }: { leadId: string; isBooking?: boolean }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    if (
      !confirm(
        `Delete this ${isBooking ? "booking" : "lead"} permanently? This cannot be undone${
          isBooking ? " — the time slot will also become available again." : "."
        }`
      )
    )
      return;

    setDeleting(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/leads/${leadId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete.");
      router.push(isBooking ? "/admin/bookings" : "/admin/leads");
      router.refresh();
    } catch {
      setError("Failed to delete. Please try again.");
      setDeleting(false);
    }
  };

  return (
    <div>
      <Button
        onClick={handleDelete}
        disabled={deleting}
        variant="outline"
        className="w-full rounded-xl border-red-200 text-red-600 hover:bg-red-50"
      >
        {deleting ? "Deleting..." : `Delete ${isBooking ? "Booking" : "Lead"}`}
      </Button>
      {error && <p className="text-sm text-red-600 mt-2">❌ {error}</p>}
    </div>
  );
}
