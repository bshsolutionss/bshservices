"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function DeleteClientButton({ clientId }: { clientId: string }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!confirm("Delete this client permanently? This cannot be undone.")) return;

    setDeleting(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/clients/${clientId}`, { method: "DELETE" });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error || "Failed to delete.");
      router.push("/admin/clients");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete client.");
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
        {deleting ? "Deleting..." : "Delete Client"}
      </Button>
      {error && <p className="text-sm text-red-600 mt-2">❌ {error}</p>}
    </div>
  );
}
