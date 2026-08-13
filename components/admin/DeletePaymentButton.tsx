"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DeletePaymentButton({ invoiceId, paymentId }: { invoiceId: string; paymentId: string }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Remove this payment? The invoice's status will be recalculated.")) return;

    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/invoices/${invoiceId}/payments/${paymentId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed");
      router.refresh();
    } catch {
      alert("Failed to delete payment.");
      setDeleting(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={deleting}
      className="text-xs font-semibold text-red-600 hover:underline disabled:opacity-50"
    >
      {deleting ? "..." : "Delete"}
    </button>
  );
}
