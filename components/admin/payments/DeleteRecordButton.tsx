"use client";

import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { ConfirmButton } from "@/components/admin/ui";

/** Removes one payment record (an invoice payment or an expense) and refreshes the timeline. */
export default function DeleteRecordButton({ url, title }: { url: string; title: string }) {
  const router = useRouter();
  return (
    <ConfirmButton
      display="inline"
      label=""
      icon={<Trash2 className="h-4 w-4" />}
      title={`Delete "${title}"?`}
      message="This removes the record and updates your totals. It can't be undone."
      onConfirm={async () => {
        const res = await fetch(url, { method: "DELETE" });
        if (!res.ok) throw new Error("Could not delete this record.");
        router.refresh();
      }}
    />
  );
}
