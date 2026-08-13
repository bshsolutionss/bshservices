"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DeleteExpenseButton({ id }: { id: string }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Remove this expense?")) return;

    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/expenses/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      router.refresh();
    } catch {
      setDeleting(false);
      alert("Failed to remove expense.");
    }
  };

  return (
    <button onClick={handleDelete} disabled={deleting} className="text-sm text-red-600 hover:underline disabled:opacity-50">
      {deleting ? "Removing..." : "Remove"}
    </button>
  );
}
