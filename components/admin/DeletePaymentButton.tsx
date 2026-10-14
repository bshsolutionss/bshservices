"use client";

import { useRouter } from "next/navigation";
import { ConfirmButton } from "@/components/admin/ui";

export default function DeletePaymentButton({ invoiceId, paymentId }: { invoiceId: string; paymentId: string }) {
  const router = useRouter();

  return (
    <ConfirmButton
      label="Remove"
      display="inline"
      title="Remove this payment?"
      confirmLabel="Remove payment"
      message="The payment will be deleted and the invoice's paid/outstanding status recalculated. Revenue reports will no longer count it."
      onConfirm={async () => {
        const res = await fetch(`/api/admin/invoices/${invoiceId}/payments/${paymentId}`, { method: "DELETE" });
        const body = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(body.error || "Could not remove the payment.");
        router.refresh();
      }}
    />
  );
}
