"use client";

import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { ConfirmButton } from "@/components/admin/ui";

export default function DeleteClientButton({ clientId, clientName }: { clientId: string; clientName: string }) {
  const router = useRouter();
  return (
    <ConfirmButton
      label="Delete client"
      display="block"
      icon={<Trash2 className="h-4 w-4" />}
      title={`Delete client "${clientName}"?`}
      confirmLabel="Delete client"
      message="The client and their communication history are removed. This cannot be undone. A client that still has projects or invoices can't be deleted - remove or archive those first."
      onConfirm={async () => {
        const res = await fetch(`/api/admin/clients/${clientId}`, { method: "DELETE" });
        const body = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(body.error || "Could not delete the client.");
        router.push("/admin/clients");
        router.refresh();
      }}
    />
  );
}
