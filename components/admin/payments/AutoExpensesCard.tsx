"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pause, Play, Plus, Repeat, Trash2 } from "lucide-react";
import { Alert, ConfirmButton, Modal, SectionCard, SelectField, TextField, btnPrimary, btnSecondary } from "@/components/admin/ui";
import { EXPENSE_RECURRENCES, EXPENSE_RECURRENCE_LABELS, type ExpenseRecurrence } from "@/lib/expenses";
import { formatMoney, type Currency } from "@/lib/invoices";
import { useOptions } from "@/lib/admin/use-options";

export interface AutoExpense {
  id: string;
  name: string;
  category: string;
  amount: number;
  currency: Currency;
  recurrence: ExpenseRecurrence;
  active: boolean;
  /** Pre-computed on the server: the next date it will be recorded. */
  next: string;
}

const ordinal = (n: number) => `${n}${["th", "st", "nd", "rd"][(n % 100 >> 3) ^ 1 && n % 10 < 4 ? n % 10 : 0]}`;

/** Subscriptions and bills recorded for you on their due date - rent, hosting, software. */
export default function AutoExpensesCard({ items, today, defaultCurrency }: { items: AutoExpense[]; today: string; defaultCurrency: Currency }) {
  const router = useRouter();
  const categories = useOptions("expense_categories");
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [recurrence, setRecurrence] = useState<ExpenseRecurrence>("monthly");
  const [date, setDate] = useState(today);
  const [category, setCategory] = useState("Software");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const close = () => {
    setOpen(false);
    setName("");
    setAmount("");
    setRecurrence("monthly");
    setDate(today);
    setError(null);
  };

  async function save() {
    setError(null);
    if (!name.trim()) return setError("Give it a name, e.g. Figma or Office rent.");
    if (!(Number(amount) > 0)) return setError("Enter an amount greater than zero.");
    setBusy(true);
    try {
      const res = await fetch("/api/admin/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, amount: Number(amount), currency: defaultCurrency, expense_date: date, vendor: name.trim(), description: name.trim(), expense_type: "monthly", recurrence }),
      });
      const json = await res.json().catch(() => null);
      if (!json?.ok) return setError(json?.error ?? "Could not save.");
      // A date that is already due is booked straight away by the sync.
      if (date < today) await fetch("/api/admin/recurring", { method: "POST" }).catch(() => undefined);
      close();
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  async function toggle(id: string, active: boolean) {
    await fetch(`/api/admin/expenses/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ recurring_active: active }) });
    router.refresh();
  }

  const dayOfMonth = Number(date.split("-")[2]) || 1;
  const due = date <= today;

  return (
    <SectionCard
      title="Auto expenses"
      subtitle="Subscriptions and bills recorded for you on their due date"
      action={
        <button onClick={() => setOpen(true)} className={btnSecondary}>
          <Plus className="h-4 w-4" /> Add auto expense
        </button>
      }
    >
      {items.length === 0 ? (
        <p className="rounded-xl border border-dashed border-[#1A14A5]/20 px-4 py-5 text-center text-sm text-[#231F20]/55">
          No auto expenses yet. Add your software subscriptions, hosting, rent - anything charged on a fixed date - and it&apos;s recorded for you every time.
        </p>
      ) : (
        <ul className="divide-y divide-[#1A14A5]/5">
          {items.map((e) => (
            <li key={e.id} className="flex flex-wrap items-center gap-3 py-3">
              <span className="grid h-9 w-9 place-items-center rounded-lg bg-[#F4F7FE] text-[#1A14A5]">
                <Repeat className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{e.name}</p>
                <p className="text-xs text-[#231F20]/50">
                  {EXPENSE_RECURRENCE_LABELS[e.recurrence]} · {e.active ? `next ${new Date(`${e.next}T00:00:00`).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}` : "paused"}
                </p>
              </div>
              <span className="font-semibold">{formatMoney(e.amount, e.currency)}</span>
              <button onClick={() => toggle(e.id, !e.active)} aria-label={e.active ? "Pause" : "Resume"} title={e.active ? "Pause" : "Resume"} className="rounded-lg p-1.5 text-[#231F20]/50 hover:bg-[#F4F7FE] hover:text-[#1A14A5]">
                {e.active ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </button>
              <ConfirmButton
                display="inline"
                label=""
                icon={<Trash2 className="h-4 w-4" />}
                title={`Delete "${e.name}"?`}
                message="No further payments are recorded. Payments already recorded stay in your history."
                onConfirm={async () => {
                  const res = await fetch(`/api/admin/expenses/${e.id}`, { method: "DELETE" });
                  if (!res.ok) throw new Error("Could not delete.");
                  router.refresh();
                }}
              />
            </li>
          ))}
        </ul>
      )}

      <Modal
        open={open}
        onClose={close}
        title="Add auto expense"
        footer={
          <>
            <button className={btnSecondary} onClick={close}>
              Cancel
            </button>
            <button className={`${btnPrimary} ml-auto`} disabled={busy} onClick={save}>
              {busy ? "Saving..." : "Add auto expense"}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <TextField id="auto-name" label="Name" required value={name} onChange={setName} placeholder="e.g. Figma, Office rent, AWS" autoFocus />
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField id="auto-amount" label="Amount" required type="number" min="0" step="0.01" value={amount} onChange={setAmount} placeholder="0.00" hint={`In ${defaultCurrency}.`} />
            <SelectField id="auto-every" label="How often" value={recurrence} onChange={(v) => setRecurrence(v as ExpenseRecurrence)} options={EXPENSE_RECURRENCES.map((r) => ({ value: r, label: EXPENSE_RECURRENCE_LABELS[r] }))} hideOptional />
          </div>
          <SelectField id="auto-category" label="Category" value={category} onChange={setCategory} options={categories.selectOptions} hideOptional />
          <TextField
            id="auto-date"
            label="Next payment date"
            required
            type="date"
            value={date}
            onChange={setDate}
            hint={`Recorded on this date, then ${recurrence === "monthly" ? `monthly on the ${ordinal(dayOfMonth)}` : recurrence === "quarterly" ? "every 3 months" : "every year"}.`}
          />
          {due && <p className="text-xs font-medium text-amber-700">It&apos;s due {date === today ? "today" : "already"}, so it will be recorded as soon as you save.</p>}
          {error && <Alert tone="error">{error}</Alert>}
        </div>
      </Modal>
    </SectionCard>
  );
}
