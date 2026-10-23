"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MessageCircle } from "lucide-react";
import { btnSecondary } from "@/components/admin/ui";

/** Opens (creating if needed) the chat with this client in the Messages inbox. */
export default function MessageClientButton({ clientId }: { clientId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function open() {
    setBusy(true);
    try {
      const res = await fetch("/api/admin/messages/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId }),
      });
      const json = await res.json().catch(() => null);
      if (json?.ok) router.push(`/admin/messages?c=${json.id}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <button onClick={open} disabled={busy} className={btnSecondary}>
      <MessageCircle className="h-4 w-4" /> {busy ? "Opening..." : "Message"}
    </button>
  );
}
