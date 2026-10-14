"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarPlus } from "lucide-react";
import { btnSecondary } from "@/components/admin/ui";

/** Drafts this month's retainer invoice for a monthly project and opens it. Safe to click twice - the month can only be billed once. */
export default function RetainerInvoiceButton({ projectId, periodLabel }: { projectId: string; periodLabel: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = async () => {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/projects/${projectId}/retainer-invoice`, { method: "POST" });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error || "Could not create the invoice.");
      router.push(`/admin/invoices/${body.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create the invoice.");
      setBusy(false);
    }
  };

  return (
    <span className="inline-flex flex-col items-start gap-1">
      <button type="button" onClick={run} disabled={busy} className={btnSecondary}>
        <CalendarPlus className="h-4 w-4" />
        {busy ? "Creating…" : `Invoice ${periodLabel}`}
      </button>
      {error && <span className="text-xs font-medium text-red-600">{error}</span>}
    </span>
  );
}
