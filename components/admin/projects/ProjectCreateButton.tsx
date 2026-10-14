"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Alert,
  ChoiceField,
  Modal,
  Stepper,
  SelectField,
  TextField,
  TextareaField,
  MoneyField,
  btnGhost,
  btnPrimary,
  btnSecondary,
  type StepDefinition,
} from "@/components/admin/ui";
import {
  PROJECT_BILLING_LABELS,
  PROJECT_BILLING_TYPES,
  PROJECT_STAGES,
  PROJECT_STAGE_LABELS,
  type ProjectBillingType,
  type ProjectServiceCategory,
  type ProjectStage,
} from "@/lib/projects";
import { CURRENCIES, formatMoney, type Currency } from "@/lib/invoices";
import { useOptions } from "@/lib/admin/use-options";

const STEPS: StepDefinition[] = [
  { id: "details", label: "Project", hint: "Who it's for and what it is" },
  { id: "plan", label: "Budget & timeline", hint: "Value, stage and dates" },
  { id: "review", label: "Review", hint: "Confirm and create" },
];

interface ProjectCreateButtonProps {
  /** Fixed client — used on a client's own page, where the picker would be noise. */
  clientId?: string;
  clientName?: string;
  /** Selectable clients — used on the projects list page. */
  clients?: { id: string; company_name: string }[];
  variant?: "solid" | "outline";
  label?: string;
}

/**
 * Create Project, as a three-step flow instead of the old one-line inline
 * form: details → budget/timeline → review. Every field is labelled, the
 * review step shows exactly what will be saved, and on success it hands you
 * straight to the new project (optionally opening the invoice builder
 * there), so "won work → project → invoice" is one continuous path rather
 * than three disconnected screens.
 */
export default function ProjectCreateButton({
  clientId,
  clientName,
  clients,
  variant = "solid",
  label = "New Project",
}: ProjectCreateButtonProps) {
  const router = useRouter();
  const services = useOptions("service_categories");
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);

  const [selectedClientId, setSelectedClientId] = useState(clientId ?? "");
  const [name, setName] = useState("");
  const [serviceCategory, setServiceCategory] = useState("");
  const [description, setDescription] = useState("");
  const [billingType, setBillingType] = useState<ProjectBillingType>("one_time");
  const [monthlyFee, setMonthlyFee] = useState("");
  const [billingDay, setBillingDay] = useState("1");
  const [autoInvoice, setAutoInvoice] = useState(true);
  const [budget, setBudget] = useState("");
  const [currency, setCurrency] = useState<Currency>("PKR");
  const [stage, setStage] = useState<ProjectStage>("planning");
  const [startDate, setStartDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [invoiceNext, setInvoiceNext] = useState(true);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const clientOptions = useMemo(
    () => (clients ?? []).map((c) => ({ value: c.id, label: c.company_name })),
    [clients]
  );
  const resolvedClientName =
    clientName ?? clients?.find((c) => c.id === selectedClientId)?.company_name ?? "—";

  const reset = () => {
    setStep(0);
    setSelectedClientId(clientId ?? "");
    setName("");
    setServiceCategory("");
    setDescription("");
    setBillingType("one_time");
    setMonthlyFee("");
    setBillingDay("1");
    setAutoInvoice(true);
    setBudget("");
    setCurrency("PKR");
    setStage("planning");
    setStartDate("");
    setDueDate("");
    setInvoiceNext(true);
    setErrors({});
    setSubmitError(null);
  };

  const close = () => {
    setOpen(false);
    reset();
  };

  /** Per-step validation — you can't advance past a step with a problem on it. */
  const validateStep = (index: number): boolean => {
    const next: Record<string, string> = {};
    if (index === 0) {
      if (!selectedClientId) next.client = "Pick the client this project belongs to.";
      if (!name.trim()) next.name = "Give the project a name.";
    }
    if (index === 1) {
      if (billingType === "monthly") {
        if (!Number.isFinite(Number(monthlyFee)) || Number(monthlyFee) <= 0) {
          next.monthlyFee = "Enter the monthly fee.";
        }
      } else if (budget !== "" && (!Number.isFinite(Number(budget)) || Number(budget) < 0)) {
        next.budget = "Budget must be a positive number.";
      }
      if (startDate && dueDate && dueDate < startDate) {
        next.dueDate = "Due date can't be before the start date.";
      }
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const goNext = () => {
    if (validateStep(step)) setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const handleCreate = async () => {
    if (!validateStep(0) || !validateStep(1)) {
      setStep(0);
      return;
    }
    setSaving(true);
    setSubmitError(null);
    try {
      const res = await fetch("/api/admin/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          client_id: selectedClientId,
          billing_type: billingType,
          monthly_fee: billingType === "monthly" ? Number(monthlyFee) : undefined,
          billing_day: Number(billingDay) || 1,
          auto_invoice: billingType === "monthly" ? autoInvoice : false,
          budget: billingType === "monthly" || budget === "" ? undefined : Number(budget),
          currency,
          stage,
          service_category: (serviceCategory as ProjectServiceCategory) || undefined,
          description: description.trim() || undefined,
          start_date: startDate || undefined,
          due_date: dueDate || undefined,
        }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error || "Failed to create project.");

      // Land on the project itself — and open the invoice builder there when
      // the user asked to bill it straight away.
      const target = `/admin/projects/${body.id}${invoiceNext ? "?invoice=new" : ""}`;
      close();
      router.push(target);
      router.refresh();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Failed to create project.");
      setSaving(false);
    }
  };

  const summaryRows: { label: string; value: string }[] = [
    { label: "Client", value: resolvedClientName },
    { label: "Project", value: name.trim() || "—" },
    { label: "Service", value: serviceCategory || "—" },
    { label: "Billing", value: PROJECT_BILLING_LABELS[billingType] },
    billingType === "monthly"
      ? { label: "Monthly fee", value: `${formatMoney(Number(monthlyFee) || 0, currency)} on day ${billingDay}` }
      : { label: "Budget", value: budget === "" ? "Not set" : formatMoney(Number(budget), currency) },
    { label: "Stage", value: PROJECT_STAGE_LABELS[stage] },
    { label: "Start", value: startDate || "—" },
    { label: "Due", value: dueDate || "—" },
  ];

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(variant === "solid" ? btnPrimary : btnSecondary)}
      >
        <Plus className="h-4 w-4" />
        {label}
      </button>

      <Modal
        open={open}
        onClose={close}
        title="New project"
        description="Three short steps. Nothing is saved until the last one."
        size="lg"
        header={<Stepper steps={STEPS} current={step} onStepClick={setStep} />}
        footer={
          <>
            {step > 0 ? (
              <button type="button" className={btnSecondary} onClick={() => setStep((s) => s - 1)}>
                Back
              </button>
            ) : (
              <button type="button" className={btnGhost} onClick={close}>
                Cancel
              </button>
            )}
            <div className="ml-auto flex items-center gap-3">
              {step < STEPS.length - 1 ? (
                <button type="button" className={btnPrimary} onClick={goNext}>
                  Continue
                </button>
              ) : (
                <button type="button" className={btnPrimary} onClick={handleCreate} disabled={saving}>
                  {saving ? "Creating…" : "Create project"}
                </button>
              )}
            </div>
          </>
        }
      >
        {step === 0 && (
          <div className="grid gap-4 sm:grid-cols-2">
            {clientId ? (
              <div className="sm:col-span-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-[#231F20]/55">Client</p>
                <p className="mt-1 font-semibold text-[#231F20]">{resolvedClientName}</p>
              </div>
            ) : (
              <SelectField
                id="project-client"
                label="Client"
                required
                className="sm:col-span-2"
                value={selectedClientId}
                onChange={(v) => setSelectedClientId(v)}
                options={clientOptions}
                placeholder="Select a client…"
                error={errors.client}
                hint="Projects always belong to a client. Convert a won lead first if the client doesn't exist yet."
              />
            )}
            <TextField
              id="project-name"
              label="Project name"
              required
              className="sm:col-span-2"
              value={name}
              onChange={setName}
              placeholder="e.g. Website redesign — Phase 1"
              error={errors.name}
              autoFocus
            />
            <SelectField
              id="project-service"
              label="Service"
              value={serviceCategory}
              onChange={setServiceCategory}
              options={services.selectOptions}
              placeholder="Select a service…"
              hint="Used for reporting and filters."
            />
            <TextareaField
              id="project-description"
              label="Scope / description"
              className="sm:col-span-2"
              value={description}
              onChange={setDescription}
              rows={3}
              placeholder="What is being delivered? Anything the team should know."
            />
          </div>
        )}

        {step === 1 && (
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <ChoiceField
                label="Client pays"
                value={billingType}
                onChange={(v) => setBillingType(v as ProjectBillingType)}
                options={PROJECT_BILLING_TYPES.map((t) => ({
                  value: t,
                  label: t === "monthly" ? "Monthly (retainer)" : "One time (fixed project)",
                }))}
                hint={
                  billingType === "monthly"
                    ? "A recurring fee billed every month until you pause it."
                    : "A fixed budget for a defined piece of work."
                }
              />
            </div>
            {billingType === "monthly" ? (
              <>
                <MoneyField
                  id="project-monthly-fee"
                  label="Monthly fee"
                  required
                  amount={monthlyFee}
                  onAmountChange={setMonthlyFee}
                  currency={currency}
                  onCurrencyChange={(v) => setCurrency(v as Currency)}
                  currencies={CURRENCIES}
                  error={errors.monthlyFee}
                />
                <SelectField
                  id="project-billing-day"
                  label="Invoice on day"
                  value={billingDay}
                  onChange={setBillingDay}
                  options={Array.from({ length: 28 }, (_, i) => ({ value: String(i + 1), label: `Day ${i + 1} of the month` }))}
                />
                <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-[#1A14A5]/15 px-4 py-3 sm:col-span-2">
                  <input
                    type="checkbox"
                    checked={autoInvoice}
                    onChange={(e) => setAutoInvoice(e.target.checked)}
                    className="mt-0.5 h-4 w-4 accent-[#1A14A5]"
                  />
                  <span className="text-sm">
                    <span className="font-semibold text-[#231F20]">Draft the invoice automatically each month</span>
                    <span className="block text-xs text-[#231F20]/55">
                      A draft is created on the billing day for you to review and send - nothing is sent to the client automatically.
                    </span>
                  </span>
                </label>
              </>
            ) : (
              <MoneyField
                id="project-budget"
                label="Budget"
                amount={budget}
                onAmountChange={setBudget}
                currency={currency}
                onCurrencyChange={(v) => setCurrency(v as Currency)}
                currencies={CURRENCIES}
                error={errors.budget}
                hint="Pre-fills the first invoice line. Leave empty if it isn't agreed yet."
              />
            )}
            <SelectField
              id="project-stage"
              label="Starting stage"
              value={stage}
              onChange={(v) => setStage(v as ProjectStage)}
              options={PROJECT_STAGES.map((s) => ({ value: s, label: PROJECT_STAGE_LABELS[s] }))}
            />
            <TextField id="project-start" label="Start date" type="date" value={startDate} onChange={setStartDate} />
            <TextField
              id="project-due"
              label="Due date"
              type="date"
              value={dueDate}
              onChange={setDueDate}
              error={errors.dueDate}
            />
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <dl className="divide-y divide-[#1A14A5]/5 overflow-hidden rounded-xl border border-[#1A14A5]/10">
              {summaryRows.map((row) => (
                <div key={row.label} className="flex items-center justify-between gap-4 px-4 py-2.5 text-sm">
                  <dt className="text-[#231F20]/55">{row.label}</dt>
                  <dd className="truncate font-semibold text-[#231F20]">{row.value}</dd>
                </div>
              ))}
            </dl>

            {description.trim() && (
              <div className="rounded-xl bg-[#F4F7FE] px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-[#231F20]/50">Scope</p>
                <p className="mt-1 whitespace-pre-wrap text-sm text-[#231F20]/75">{description.trim()}</p>
              </div>
            )}

            <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-[#1A14A5]/15 px-4 py-3">
              <input
                type="checkbox"
                checked={invoiceNext}
                onChange={(e) => setInvoiceNext(e.target.checked)}
                className="mt-0.5 h-4 w-4 accent-[#1A14A5]"
              />
              <span className="text-sm">
                <span className="font-semibold text-[#231F20]">Create the first invoice next</span>
                <span className="block text-xs text-[#231F20]/55">
                  Opens the invoice builder on the project, pre-filled with the client and budget.
                </span>
              </span>
            </label>

            {submitError && <Alert tone="error">{submitError}</Alert>}
          </div>
        )}
      </Modal>
    </>
  );
}
