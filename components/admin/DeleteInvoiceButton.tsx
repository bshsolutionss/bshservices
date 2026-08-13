"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function DeleteInvoiceButton({ invoiceId, paymentCount }: { invoiceId: string; paymentCount: number }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    const paymentWarning =
      paymentCount > 0 ? ` This will also delete its ${paymentCount} recorded payment${paymentCount === 1 ? "" : "s"}.` : "";
    if (!confirm(`Delete this invoice permanently?${paymentWarning} This cannot be undone.`)) return;

    setDeleting(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/invoices/${invoiceId}`, { method: "DELETE" });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error || "Failed to delete.");
      router.push("/admin/invoices");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete invoice.");
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
        {deleting ? "Deleting..." : "Delete Invoice"}
      </Button>
      {error && <p className="text-sm text-red-600 mt-2">❌ {error}</p>}
    </div>
  );
}
