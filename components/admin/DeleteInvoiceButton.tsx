"use client";

import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { ConfirmButton } from "@/components/admin/ui";

export default function DeleteInvoiceButton({ invoiceId, paymentCount }: { invoiceId: string; paymentCount: number }) {
  const router = useRouter();

  return (
    <ConfirmButton
      label="Delete invoice"
      display="block"
      icon={<Trash2 className="h-4 w-4" />}
      title="Delete this invoice?"
      confirmLabel="Delete permanently"
      message={
        <>
          <p>
            The invoice, its line items{paymentCount > 0 ? " and its recorded payments" : ""} will be removed. This
            cannot be undone.
          </p>
          {paymentCount > 0 && (
            <p className="mt-2 font-semibold text-red-600">
              {paymentCount} recorded payment{paymentCount === 1 ? "" : "s"} will be deleted with it, so this money
              will no longer appear in revenue reports.
            </p>
          )}
        </>
      }
      onConfirm={async () => {
        const res = await fetch(`/api/admin/invoices/${invoiceId}`, { method: "DELETE" });
        const body = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(body.error || "Could not delete the invoice.");
        router.push("/admin/invoices");
        router.refresh();
      }}
    />
  );
}
