"use client";

import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { ConfirmButton } from "@/components/admin/ui";

/**
 * One delete-with-confirmation button for any detail page: DELETEs `endpoint`,
 * then returns to the list. Server pages can't hand a callback to a client
 * component, so this takes plain strings instead.
 */
export default function DeleteEntityButton({
  endpoint,
  redirectTo,
  label,
  title,
  message,
}: {
  endpoint: string;
  redirectTo: string;
  label: string;
  title: string;
  message: React.ReactNode;
}) {
  const router = useRouter();
  return (
    <ConfirmButton
      label={label}
      display="block"
      icon={<Trash2 className="h-4 w-4" />}
      title={title}
      confirmLabel="Delete permanently"
      message={message}
      onConfirm={async () => {
        const res = await fetch(endpoint, { method: "DELETE" });
        const body = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(body.error || "Could not delete.");
        router.push(redirectTo);
        router.refresh();
      }}
    />
  );
}
