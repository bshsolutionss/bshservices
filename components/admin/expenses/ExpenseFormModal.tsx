"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Alert,
  ChoiceField,
  Modal,
  MoneyField,
  SelectField,
  TextareaField,
  TextField,
  btnGhost,
  btnPrimary,
} from "@/components/admin/ui";
import VendorOrEmployeeField from "@/components/admin/VendorOrEmployeeField";
import {
  EXPENSE_TYPES,
  EXPENSE_TYPE_LABELS,
  type Expense,
  type ExpenseCategory,
  type ExpenseType,
} from "@/lib/expenses";
import { CURRENCIES, type Currency } from "@/lib/invoices";
import { useOptions } from "@/lib/admin/use-options";

interface ExpenseFormModalProps {
  employees: { id: string; name: string }[];
  /** Projects a cost can be attributed to (optional on every expense). */
  projects?: { id: string; name: string }[];
  /** Omit to create; pass an expense to edit it. */
  expense?: Expense;
  /** Trigger appearance — the list toolbar wants a solid button, a row wants a text link. */
  trigger?: "solid" | "link";
  label?: string;
}

/**
 * Create and edit an expense in one form. Both used to be separate
 * implementations (a cramped inline form, and an inline row editor with its
 * own copy of the same fields) which drifted apart; now there's one labelled
 * form behind the shared modal, so adding and correcting an expense look and
 * validate identically.
 */
export default function ExpenseFormModal({
  employees,
  projects = [],
  expense,
  trigger = "solid",
  label,
}: ExpenseFormModalProps) {
  const router = useRouter();
  const editing = !!expense;

  const [open, setOpen] = useState(false);
  const categoryList = useOptions("expense_categories");
  const [expenseType, setExpenseType] = useState<ExpenseType>(expense?.expense_type ?? "one_time");
  const [projectId, setProjectId] = useState(expense?.project_id ?? "");
  const [keepRepeating, setKeepRepeating] = useState(expense?.recurring_active ?? true);
  const [category, setCategory] = useState<ExpenseCategory>(expense?.category ?? "Office");
  const [amount, setAmount] = useState(expense ? String(expense.amount) : "");
  // PKR is the business's standard currency — still freely changeable per expense.
  const [currency, setCurrency] = useState<Currency>(expense?.currency ?? "PKR");
  const [expenseDate, setExpenseDate] = useState(expense?.expense_date ?? new Date().toISOString().slice(0, 10));
  const [vendor, setVendor] = useState(expense?.vendor ?? "");
  const [description, setDescription] = useState(expense?.description ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isGenerated = !!expense?.recurring_parent_id;
  /** The original monthly row - the one future months are generated from. */
  const isTemplate = editing && expense!.expense_type === "monthly" && !isGenerated;

  const close = () => {
    setOpen(false);
    setError(null);
    if (!editing) {
      setExpenseType("one_time");
      setProjectId("");
      setKeepRepeating(true);
      setCategory("Office");
      setAmount("");
      setCurrency("PKR");
      setExpenseDate(new Date().toISOString().slice(0, 10));
      setVendor("");
      setDescription("");
    }
  };

  const save = async () => {
    if (!Number.isFinite(Number(amount)) || Number(amount) <= 0) {
      setError("Enter a positive amount.");
      return;
    }
    if (!expenseDate) {
      setError("Pick the date the money went out.");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const res = await fetch(editing ? `/api/admin/expenses/${expense!.id}` : "/api/admin/expenses", {
        method: editing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category,
          amount: Number(amount),
          currency,
          expense_date: expenseDate,
          vendor: vendor.trim() || null,
          description: description.trim() || null,
          expense_type: expenseType,
          project_id: projectId || null,
          ...(editing && isTemplate ? { recurring_active: keepRepeating } : {}),
        }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error || "Could not save the expense.");

      close();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save the expense.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          trigger === "solid"
            ? btnPrimary
            : "text-sm font-semibold text-[#1A14A5] transition hover:underline"
        )}
      >
        {trigger === "solid" && <Plus className="h-4 w-4" />}
        {label ?? (editing ? "Edit" : "New expense")}
      </button>

      <Modal
        open={open}
        onClose={close}
        title={editing ? "Edit expense" : "New expense"}
        description={
          editing
            ? "Corrections are reflected in the P&L report straight away."
            : "Recorded against the date it was spent, which is how the P&L buckets it."
        }
        size="md"
        footer={
          <>
            <button type="button" className={btnGhost} onClick={close}>
              Cancel
            </button>
            <button type="button" className={cn(btnPrimary, "ml-auto")} onClick={save} disabled={saving}>
              {saving ? "Saving…" : editing ? "Save changes" : "Add expense"}
            </button>
          </>
        }
      >
        <div className="grid gap-4 sm:grid-cols-2">
          {!isGenerated && (
            <div className="sm:col-span-2">
              <ChoiceField
                label="Type"
                value={expenseType}
                onChange={(v) => setExpenseType(v as ExpenseType)}
                options={EXPENSE_TYPES.map((t) => ({ value: t, label: EXPENSE_TYPE_LABELS[t] }))}
                hint={
                  expenseType === "monthly"
                    ? "Repeats every month on the same day - the following months are booked automatically."
                    : "A single payment."
                }
              />
            </div>
          )}
          <TextField
            id="expense-date"
            label={expenseType === "monthly" ? "First payment date" : "Date spent"}
            type="date"
            required
            value={expenseDate}
            onChange={setExpenseDate}
          />
          <SelectField
            id="expense-category"
            label="Category"
            required
            value={category}
            onChange={(v) => setCategory(v as ExpenseCategory)}
            options={
              categoryList.options.some((o) => o.value === category)
                ? categoryList.selectOptions
                : [{ value: category, label: category }, ...categoryList.selectOptions]
            }
          />
          <MoneyField
            id="expense-amount"
            label="Amount"
            required
            amount={amount}
            onAmountChange={setAmount}
            currency={currency}
            onCurrencyChange={(v) => setCurrency(v as Currency)}
            currencies={CURRENCIES}
          />
          <VendorOrEmployeeField category={category} value={vendor} onChange={setVendor} employees={employees} />
          {projects.length > 0 && (
            <SelectField
              id="expense-project"
              label="Project"
              value={projectId}
              onChange={setProjectId}
              options={projects.map((p) => ({ value: p.id, label: p.name }))}
              placeholder="Not tied to a project"
              hint="Optional - for project profitability."
            />
          )}
          {isTemplate && (
            <label className="flex items-center gap-2 self-end pb-2 text-sm text-[#231F20]/70">
              <input
                type="checkbox"
                checked={keepRepeating}
                onChange={(e) => setKeepRepeating(e.target.checked)}
                className="h-4 w-4 accent-[#1A14A5]"
              />
              Keep repeating every month
            </label>
          )}
          <TextareaField
            id="expense-description"
            label="Description"
            className="sm:col-span-2"
            value={description}
            onChange={setDescription}
            rows={2}
            placeholder="What was this for?"
          />
        </div>

        {error && <Alert tone="error" className="mt-4">{error}</Alert>}
      </Modal>
    </>
  );
}
