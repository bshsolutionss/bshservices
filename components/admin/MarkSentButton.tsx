"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function MarkSentButton({ invoiceId }: { invoiceId: string }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  const handleClick = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/invoices/${invoiceId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "sent" }),
      });
      if (!res.ok) throw new Error("Failed");
      router.refresh();
    } catch {
      console.error("Failed to mark invoice as sent");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Button onClick={handleClick} disabled={saving} variant="outline" className="w-full rounded-xl border-[#1A14A5]/20 text-[#1A14A5]">
      {saving ? "Sending..." : "Mark as Sent"}
    </Button>
  );
}
