"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import {
  Alert,
  ChoiceField,
  ConfirmButton,
  EmptyState,
  TextField,
  btnPrimary,
} from "@/components/admin/ui";
import { formatDate, formatMoney, type Currency } from "@/lib/invoices";
import type { EntryKind, PersonalProjectEntry } from "@/lib/personal-projects";

/** Money in and out of one personal project. */
export default function PersonalProjectEntries({
  projectId,
  currency,
  entries,
}: {
  projectId: string;
  currency: Currency;
  entries: PersonalProjectEntry[];
}) {
  const router = useRouter();
  const [kind, setKind] = useState<EntryKind>("cost");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!Number.isFinite(Number(amount)) || Number(amount) <= 0) return setError("Enter an amount greater than zero.");
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/personal-projects/${projectId}/entries`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind, amount: Number(amount), entry_date: date, description: description.trim() || undefined }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error || "Could not save.");
      setAmount("");
      setDescription("");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={add} className="space-y-3 rounded-xl bg-[#F4F7FE] p-3">
        <ChoiceField
          label="Type"
          value={kind}
          onChange={(v) => setKind(v as EntryKind)}
          options={[
            { value: "cost", label: "Money spent" },
            { value: "revenue", label: "Money earned" },
          ]}
        />
        <div className="flex flex-wrap items-end gap-3">
          <div className="w-36">
            <TextField id="pe-amount" label={`Amount (${currency})`} type="number" min="0" step="0.01" value={amount} onChange={setAmount} />
          </div>
          <div className="w-40">
            <TextField id="pe-date" label="Date" type="date" value={date} onChange={setDate} />
          </div>
          <div className="min-w-[160px] flex-1">
            <TextField id="pe-desc" label="What for" value={description} onChange={setDescription} placeholder="Hosting, ads, first sale…" />
          </div>
          <button type="submit" disabled={saving} className={btnPrimary}>
            <Plus className="h-4 w-4" />
            {saving ? "Adding…" : "Add entry"}
          </button>
        </div>
      </form>
      {error && <Alert tone="error">{error}</Alert>}

      {entries.length === 0 ? (
        <EmptyState title="Nothing logged yet" description="Record what you spend on this project and what it earns, to see if it pays off." />
      ) : (
        <ul className="divide-y divide-[#1A14A5]/5">
          {entries.map((entry) => (
            <li key={entry.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
              <div className="min-w-0">
                <span className={entry.kind === "revenue" ? "font-semibold text-emerald-700" : "font-semibold text-red-600"}>
                  {entry.kind === "revenue" ? "+" : "−"}
                  {formatMoney(entry.amount, currency)}
                </span>
                <span className="text-[#231F20]/50"> · {entry.description || (entry.kind === "revenue" ? "Revenue" : "Cost")}</span>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <span className="text-xs text-[#231F20]/40">{formatDate(entry.entry_date)}</span>
                <ConfirmButton
                  label=""
                  display="inline"
                  icon={<Trash2 className="h-4 w-4" />}
                  title="Delete this entry?"
                  confirmLabel="Delete"
                  message="It will no longer count towards this project's profit."
                  onConfirm={async () => {
                    const res = await fetch(`/api/admin/personal-projects/${projectId}/entries/${entry.id}`, { method: "DELETE" });
                    const body = await res.json().catch(() => ({}));
                    if (!res.ok) throw new Error(body.error || "Could not delete.");
                    router.refresh();
                  }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
