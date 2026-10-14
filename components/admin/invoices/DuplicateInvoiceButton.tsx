"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Copy } from "lucide-react";
import { btnSecondary } from "@/components/admin/ui";

/** Creates a new draft copy of this invoice (same client, project and lines) and opens it. */
export default function DuplicateInvoiceButton({ invoiceId }: { invoiceId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = async () => {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/invoices/${invoiceId}/duplicate`, { method: "POST" });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error || "Could not duplicate the invoice.");
      router.push(`/admin/invoices/${body.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not duplicate the invoice.");
      setBusy(false);
    }
  };

  return (
    <span className="inline-flex flex-col items-start gap-1">
      <button type="button" onClick={run} disabled={busy} className={btnSecondary}>
        <Copy className="h-4 w-4" />
        {busy ? "Copying…" : "Duplicate"}
      </button>
      {error && <span className="text-xs font-medium text-red-600">{error}</span>}
    </span>
  );
}
