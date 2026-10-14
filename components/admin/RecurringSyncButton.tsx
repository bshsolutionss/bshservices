"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";
import { btnSecondary } from "@/components/admin/ui";

/**
 * Runs the daily recurring job on demand: drafts due monthly retainer
 * invoices and books due monthly expenses. Safe to press any time - the
 * database refuses duplicates.
 */
export default function RecurringSyncButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const run = async () => {
    setBusy(true);
    setResult(null);
    try {
      const res = await fetch("/api/admin/recurring", { method: "POST" });
      const body = await res.json().catch(() => ({}));
      if (!res.ok && !body.errors) throw new Error(body.error || "Sync failed.");
      const created = (body.invoicesCreated ?? 0) + (body.expensesCreated ?? 0);
      setResult(
        body.errors?.length
          ? `Done with ${body.errors.length} problem${body.errors.length === 1 ? "" : "s"}: ${body.errors[0]}`
          : created === 0
            ? "Everything is up to date."
            : `Created ${body.invoicesCreated} invoice${body.invoicesCreated === 1 ? "" : "s"} and ${body.expensesCreated} expense${body.expensesCreated === 1 ? "" : "s"}.`
      );
      router.refresh();
    } catch (err) {
      setResult(err instanceof Error ? err.message : "Sync failed.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <span className="inline-flex items-center gap-2">
      <button type="button" onClick={run} disabled={busy} className={btnSecondary} title="Create this month's retainer invoices and monthly expenses">
        <RefreshCw className={busy ? "h-4 w-4 animate-spin" : "h-4 w-4"} />
        Sync recurring
      </button>
      {result && <span className="text-xs text-[#231F20]/60">{result}</span>}
    </span>
  );
}
