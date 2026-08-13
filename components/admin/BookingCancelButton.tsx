"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function BookingCancelButton({ leadId }: { leadId: string }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCancel = async () => {
    if (!confirm("Cancel this consultation booking? The time slot will become available again.")) return;

    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/leads/${leadId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ booking_status: "cancelled" }),
      });
      if (!res.ok) throw new Error("Failed to cancel booking.");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to cancel booking.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <Button
        onClick={handleCancel}
        disabled={saving}
        variant="outline"
        className="w-full rounded-xl border-red-200 text-red-600 hover:bg-red-50"
      >
        {saving ? "Cancelling..." : "Cancel Booking"}
      </Button>
      {error && <p className="text-sm text-red-600 mt-2">❌ {error}</p>}
    </div>
  );
}
