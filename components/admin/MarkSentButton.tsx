"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Send } from "lucide-react";
import { btnPrimary } from "@/components/admin/ui";

/** Moves a draft invoice to "sent" — the point from which payments can be recorded against it. */
export default function MarkSentButton({ invoiceId }: { invoiceId: string }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClick = async () => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/invoices/${invoiceId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "sent" }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error || "Could not mark the invoice as sent.");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not mark the invoice as sent.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <span className="inline-flex flex-col items-start gap-1">
      <button type="button" onClick={handleClick} disabled={saving} className={btnPrimary}>
        <Send className="h-4 w-4" />
        {saving ? "Marking…" : "Mark as sent"}
      </button>
      {error && <span className="text-xs font-medium text-red-600">{error}</span>}
    </span>
  );
}
