"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Archive, ArchiveRestore, Trash2 } from "lucide-react";
import {
  Alert,
  ChoiceField,
  ConfirmButton,
  MoneyField,
  SectionCard,
  SelectField,
  TextField,
  TextareaField,
  btnPrimary,
  btnSecondary,
} from "@/components/admin/ui";
import {
  PROJECT_BILLING_TYPES,
  PROJECT_STAGES,
  PROJECT_STAGE_LABELS,
  type ProjectBillingType,
  type ProjectServiceCategory,
  type ProjectStage,
} from "@/lib/projects";
import { CURRENCIES, type Currency } from "@/lib/invoices";
import { useOptions } from "@/lib/admin/use-options";

interface ProjectEditControlProps {
  projectId: string;
  initialStage: ProjectStage;
  initialBudget: number | null;
  initialCurrency: Currency;
  initialStartDate: string | null;
  initialDueDate: string | null;
  initialServiceCategory: ProjectServiceCategory | null;
  initialDescription: string | null;
  initialArchived: boolean;
  initialBillingType: ProjectBillingType;
  initialMonthlyFee: number | null;
  initialBillingDay: number;
  initialAutoInvoice: boolean;
  initialRecurringActive: boolean;
  taskCount?: number;
}

/** Everything editable about a project, plus archive/delete, in the sidebar of its detail page. */
export default function ProjectEditControl({
  projectId,
  initialStage,
  initialBudget,
  initialCurrency,
  initialStartDate,
  initialDueDate,
  initialServiceCategory,
  initialDescription,
  initialArchived,
  initialBillingType,
  initialMonthlyFee,
  initialBillingDay,
  initialAutoInvoice,
  initialRecurringActive,
  taskCount = 0,
}: ProjectEditControlProps) {
  const router = useRouter();
  const services = useOptions("service_categories");
  const [stage, setStage] = useState<ProjectStage>(initialStage);
  const [budget, setBudget] = useState(initialBudget !== null ? String(initialBudget) : "");
  const [currency, setCurrency] = useState<Currency>(initialCurrency);
  const [startDate, setStartDate] = useState(initialStartDate ?? "");
  const [dueDate, setDueDate] = useState(initialDueDate ?? "");
  const [serviceCategory, setServiceCategory] = useState<ProjectServiceCategory | "">(initialServiceCategory ?? "");
  const [description, setDescription] = useState(initialDescription ?? "");
  const [billingType, setBillingType] = useState<ProjectBillingType>(initialBillingType ?? "one_time");
  const [monthlyFee, setMonthlyFee] = useState(initialMonthlyFee !== null ? String(initialMonthlyFee) : "");
  const [billingDay, setBillingDay] = useState(String(initialBillingDay ?? 1));
  const [autoInvoice, setAutoInvoice] = useState(!!initialAutoInvoice);
  const [recurringActive, setRecurringActive] = useState(initialRecurringActive ?? true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [archiving, setArchiving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const patch = async (body: Record<string, unknown>) => {
    const res = await fetch(`/api/admin/projects/${projectId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const parsed = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(parsed.error || "Save failed.");
  };

  const handleSave = async () => {
    if (startDate && dueDate && dueDate < startDate) {
      setError("Due date can't be before the start date.");
      return;
    }

    if (billingType === "monthly" && (!Number.isFinite(Number(monthlyFee)) || Number(monthlyFee) <= 0)) {
      setError("Enter the monthly fee for a monthly project.");
      return;
    }

    setSaving(true);
    setSaved(false);
    setError(null);
    try {
      await patch({
        billing_type: billingType,
        monthly_fee: billingType === "monthly" ? Number(monthlyFee) : null,
        billing_day: Number(billingDay) || 1,
        auto_invoice: billingType === "monthly" ? autoInvoice : false,
        recurring_active: recurringActive,
        stage,
        budget: budget === "" ? null : Number(budget),
        currency,
        start_date: startDate || null,
        due_date: dueDate || null,
        service_category: serviceCategory || null,
        description: description || null,
      });
      setSaved(true);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save project.");
    } finally {
      setSaving(false);
    }
  };

  const handleArchiveToggle = async () => {
    setArchiving(true);
    setError(null);
    try {
      await patch({ archived: !initialArchived });
      router.refresh();
    } catch {
      setError("Failed to update archive status.");
    } finally {
      setArchiving(false);
    }
  };

  return (
    <SectionCard title="Project settings" subtitle={initialArchived ? "This project is archived" : undefined}>
      <div className="space-y-4">
        <SelectField
          id="project-edit-stage"
          label="Stage"
          value={stage}
          onChange={(v) => setStage(v as ProjectStage)}
          options={PROJECT_STAGES.map((s) => ({ value: s, label: PROJECT_STAGE_LABELS[s] }))}
        />
        <SelectField
          id="project-edit-service"
          label="Service"
          value={serviceCategory}
          onChange={(v) => setServiceCategory(v as ProjectServiceCategory)}
          options={
            serviceCategory && !services.options.some((o) => o.value === serviceCategory)
              ? [{ value: serviceCategory, label: serviceCategory }, ...services.selectOptions]
              : services.selectOptions
          }
          placeholder="Not set"
        />
        <ChoiceField
          label="Billing"
          value={billingType}
          onChange={(v) => setBillingType(v as ProjectBillingType)}
          options={PROJECT_BILLING_TYPES.map((t) => ({ value: t, label: t === "monthly" ? "Monthly" : "One-time" }))}
        />
        {billingType === "monthly" ? (
          <>
            <MoneyField
              id="project-edit-fee"
              label="Monthly fee"
              amount={monthlyFee}
              onAmountChange={setMonthlyFee}
              currency={currency}
              onCurrencyChange={(v) => setCurrency(v as Currency)}
              currencies={CURRENCIES}
            />
            <SelectField
              id="project-edit-billing-day"
              label="Invoice on day"
              value={billingDay}
              onChange={setBillingDay}
              options={Array.from({ length: 28 }, (_, i) => ({ value: String(i + 1), label: `Day ${i + 1}` }))}
            />
            <label className="flex items-center gap-2 text-sm text-[#231F20]/70">
              <input
                type="checkbox"
                checked={autoInvoice}
                onChange={(e) => setAutoInvoice(e.target.checked)}
                className="h-4 w-4 accent-[#1A14A5]"
              />
              Draft the invoice automatically each month
            </label>
            <label className="flex items-center gap-2 text-sm text-[#231F20]/70">
              <input
                type="checkbox"
                checked={recurringActive}
                onChange={(e) => setRecurringActive(e.target.checked)}
                className="h-4 w-4 accent-[#1A14A5]"
              />
              Retainer is active (untick to pause billing)
            </label>
          </>
        ) : (
          <MoneyField
            id="project-edit-budget"
            label="Budget"
            amount={budget}
            onAmountChange={setBudget}
            currency={currency}
            onCurrencyChange={(v) => setCurrency(v as Currency)}
            currencies={CURRENCIES}
          />
        )}
        <div className="grid grid-cols-2 gap-3">
          <TextField id="project-edit-start" label="Start" type="date" value={startDate} onChange={setStartDate} />
          <TextField id="project-edit-due" label="Due" type="date" value={dueDate} onChange={setDueDate} />
        </div>
        <TextareaField
          id="project-edit-description"
          label="Scope / description"
          value={description}
          onChange={setDescription}
          rows={4}
          placeholder="Project scope, notes…"
        />

        {error && <Alert tone="error">{error}</Alert>}
        {saved && !error && <Alert tone="success">Saved.</Alert>}

        <button type="button" onClick={handleSave} disabled={saving} className={btnPrimary}>
          {saving ? "Saving…" : "Save changes"}
        </button>

        <div className="space-y-2 border-t border-[#1A14A5]/10 pt-4">
          <button
            type="button"
            onClick={handleArchiveToggle}
            disabled={archiving}
            className={`${btnSecondary} w-full`}
          >
            {initialArchived ? <ArchiveRestore className="h-4 w-4" /> : <Archive className="h-4 w-4" />}
            {archiving ? "Updating…" : initialArchived ? "Unarchive project" : "Archive project"}
          </button>
          <ConfirmButton
            label="Delete project"
            display="block"
            icon={<Trash2 className="h-4 w-4" />}
            title="Delete this project?"
            confirmLabel="Delete permanently"
            message={
              <>
                <p>The project and everything attached to it will be removed. This cannot be undone.</p>
                {taskCount > 0 && (
                  <p className="mt-2 font-semibold text-red-600">
                    Its {taskCount} task{taskCount === 1 ? "" : "s"} will be deleted too.
                  </p>
                )}
                <p className="mt-2">If you only want it out of the way, archive it instead.</p>
              </>
            }
            onConfirm={async () => {
              const res = await fetch(`/api/admin/projects/${projectId}`, { method: "DELETE" });
              const body = await res.json().catch(() => ({}));
              if (!res.ok) throw new Error(body.error || "Could not delete the project.");
              router.push("/admin/projects");
              router.refresh();
            }}
          />
        </div>
      </div>
    </SectionCard>
  );
}
