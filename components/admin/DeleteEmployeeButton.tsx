"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function DeleteEmployeeButton({ employeeId }: { employeeId: string }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!confirm("Delete this employee permanently? This cannot be undone.")) return;

    setDeleting(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/employees/${employeeId}`, { method: "DELETE" });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error || "Failed to delete.");
      router.push("/admin/employees");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete employee.");
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
        {deleting ? "Deleting..." : "Delete Employee"}
      </Button>
      {error && <p className="text-sm text-red-600 mt-2">❌ {error}</p>}
    </div>
  );
}
