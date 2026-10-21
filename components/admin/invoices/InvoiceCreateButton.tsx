"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { useDraft } from "@/lib/admin/use-draft";
import { cn } from "@/lib/utils";
import {
  Alert,
  ChoiceField,
  Modal,
  Stepper,
  SelectField,
  TextField,
  TextareaField,
  btnGhost,
  btnPrimary,
  btnSecondary,
  inputBase,
  AdvancedSection,
  type StepDefinition,
} from "@/components/admin/ui";
import {
  CURRENCIES,
  CURRENCY_LABELS,
  computeInvoiceTotals,
  round2,
  formatMoney,
  type Currency,
} from "@/lib/invoices";

const STEPS: StepDefinition[] = [
  { id: "bill-to", label: "Bill to", hint: "Client, project and currency" },
  { id: "lines", label: "Line items", hint: "What you're charging for" },
  { id: "terms", label: "Dates & notes", hint: "Issue, due and review" },
];

interface LineDraft {
  /** Local-only key so rows stay stable while being edited/reordered. */
  key: string;
  description: string;
  quantity: string;
  unit_price: string;
}

export interface InvoiceProjectOption {
  id: string;
  name: string;
  client_id: string;
  budget?: number | null;
  currency?: Currency | null;
}

interface InvoiceCreateButtonProps {
  clients: { id: string; company_name: string }[];
  projects: InvoiceProjectOption[];
  defaultClientId?: string;
  defaultProjectId?: string;
  /** Hides the client/project pickers — used when opened from a project page. */
  lockSelection?: boolean;
  label?: string;
  variant?: "solid" | "outline";
  /** Opens the builder on mount — the "create project → invoice it now" handoff. */
  autoOpen?: boolean;
}

let lineCounter = 0;
const newLine = (description = "", quantity = "1", unit_price = ""): LineDraft => ({
  key: `line-${++lineCounter}`,
  description,
  quantity,
  unit_price,
});

const DUE_PRESETS = [
  { label: "On receipt", days: 0 },
  { label: "7 days", days: 7 },
  { label: "15 days", days: 15 },
  { label: "30 days", days: 30 },
];

function addDays(isoDate: string, days: number): string {
  const date = new Date(`${isoDate}T00:00:00`);
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

/**
 * Create Invoice as a three-step builder with real line items.
 *
 * The old form asked for one opaque "Amount" plus flat tax/discount boxes
 * with no labels and no running total. This one bills by line
 * (description x quantity x unit price), takes tax as a percentage, and
 * shows the computed subtotal/tax/total next to the inputs the whole time.
 * The preview uses computeInvoiceTotals, the same arithmetic the database
 * applies on write, so what you see is what gets saved.
 */
interface InvoiceDraft {
  clientId: string;
  projectId: string;
  currency: Currency;
  lines: LineDraft[];
  taxRate: string;
  discount: string;
  discountMode: "flat" | "percent";
  issueDate: string;
  dueDate: string;
  notes: string;
  poNumber: string;
  terms: string;
}

export default function InvoiceCreateButton({
  clients,
  projects,
  defaultClientId,
  defaultProjectId,
  lockSelection = false,
  label = "New Invoice",
  variant = "solid",
  autoOpen = false,
}: InvoiceCreateButtonProps) {
  const router = useRouter();
  const pathname = usePathname();

  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const { draft, save: saveDraft, clear: clearDraft } = useDraft<InvoiceDraft>(`invoice:${defaultProjectId ?? defaultClientId ?? "new"}`);

  const [clientId, setClientId] = useState(defaultClientId ?? "");
  const [projectId, setProjectId] = useState(defaultProjectId ?? "");
  const [currency, setCurrency] = useState<Currency>("PKR");
  const [lines, setLines] = useState<LineDraft[]>([newLine()]);
  const [taxRate, setTaxRate] = useState("0");
  const [discount, setDiscount] = useState("");
  const [discountMode, setDiscountMode] = useState<"flat" | "percent">("flat");
  const [poNumber, setPoNumber] = useState("");
  const [terms, setTerms] = useState("");
  const [defaultDueDays, setDefaultDueDays] = useState<number | null>(null);
  const [defaultsLoaded, setDefaultsLoaded] = useState(false);
  const [issueDate, setIssueDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const availableProjects = useMemo(
    () => projects.filter((p) => !clientId || p.client_id === clientId),
    [projects, clientId]
  );

  /** Pre-fills the first line from the project (name + budget) — the common case is "bill this project". */
  const applyProjectDefaults = useCallback(
    (id: string) => {
      const project = projects.find((p) => p.id === id);
      if (!project) return;
      if (project.currency) setCurrency(project.currency);
      setLines((current) => {
        const firstIsEmpty = current.length === 1 && !current[0].description && !current[0].unit_price;
        if (!firstIsEmpty) return current;
        return [newLine(project.name, "1", project.budget != null ? String(project.budget) : "")];
      });
    },
    [projects]
  );

  useEffect(() => {
    if (!autoOpen) return;
    setOpen(true);
    if (defaultProjectId) applyProjectDefaults(defaultProjectId);
    // Drop the ?invoice=new marker so a refresh or back-navigation doesn't reopen the builder.
    router.replace(pathname, { scroll: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once for the handoff from project creation
  }, [autoOpen]);

  // A percentage discount is turned into a flat amount off the subtotal, so the preview, the API and the database all agree.
  const rawSubtotal = computeInvoiceTotals(lines, 0, 0).subtotal;
  const effectiveDiscount =
    discountMode === "percent" ? round2((rawSubtotal * (Number(discount) || 0)) / 100) : discount;
  const totals = computeInvoiceTotals(lines, taxRate, effectiveDiscount);

  // Business defaults (tax rate, payment terms) come from Settings > Invoices. Fetched the first
  // time the builder opens - lazily, so none of the pages that host this button pay for it.
  useEffect(() => {
    if (!open || defaultsLoaded) return;
    setDefaultsLoaded(true);
    fetch("/api/admin/settings/invoice")
      .then((res) => (res.ok ? res.json() : null))
      .then((body) => {
        if (!body?.settings) return;
        // A project link already chose the currency; otherwise start from the business default.
        if (body.default_currency && !defaultProjectId) setCurrency((current) => (current === "PKR" ? body.default_currency : current));
        const { default_tax_rate, default_due_days } = body.settings;
        setTaxRate((current) => (current === "0" && default_tax_rate > 0 ? String(default_tax_rate) : current));
        setDefaultDueDays(typeof default_due_days === "number" ? default_due_days : null);
        setDueDate((current) => (current || typeof default_due_days !== "number" ? current : addDays(issueDate, default_due_days)));
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps -- load once per mount, on first open
  }, [open]);

  // Work in progress is kept in this browser, so a refresh or an accidental close doesn't lose a long invoice.
  const pristine = !lines.some((l) => l.description || l.unit_price) && !notes && !poNumber && !terms;
  useEffect(() => {
    if (!open || pristine) return;
    saveDraft({ clientId, projectId, currency, lines, taxRate, discount, discountMode, issueDate, dueDate, notes, poNumber, terms });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- save whenever any field changes
  }, [open, clientId, projectId, currency, lines, taxRate, discount, discountMode, issueDate, dueDate, notes, poNumber, terms]);

  const restoreDraft = () => {
    if (!draft) return;
    setClientId(draft.clientId);
    setProjectId(draft.projectId);
    setCurrency(draft.currency);
    setLines(draft.lines.length > 0 ? draft.lines : [newLine()]);
    setTaxRate(draft.taxRate);
    setDiscount(draft.discount);
    setDiscountMode(draft.discountMode);
    setIssueDate(draft.issueDate);
    setDueDate(draft.dueDate);
    setNotes(draft.notes);
    setPoNumber(draft.poNumber);
    setTerms(draft.terms);
  };

  const reset = () => {
    setStep(0);
    setClientId(defaultClientId ?? "");
    setProjectId(defaultProjectId ?? "");
    setCurrency("PKR");
    setLines([newLine()]);
    setTaxRate("0");
    setDiscount("");
    setDiscountMode("flat");
    setPoNumber("");
    setTerms("");
    setIssueDate(new Date().toISOString().slice(0, 10));
    setDueDate(defaultDueDays !== null ? addDays(new Date().toISOString().slice(0, 10), defaultDueDays) : "");
    setNotes("");
    setErrors({});
    setSubmitError(null);
  };

  const close = () => {
    setOpen(false);
    reset();
  };

  const updateLine = (key: string, patch: Partial<LineDraft>) =>
    setLines((current) => current.map((line) => (line.key === key ? { ...line, ...patch } : line)));

  const removeLine = (key: string) =>
    setLines((current) => (current.length === 1 ? current : current.filter((line) => line.key !== key)));

  const validateStep = (index: number): boolean => {
    const next: Record<string, string> = {};
    if (index === 0 && !clientId) next.client = "Choose who this invoice is for.";
    if (index === 1) {
      const filled = lines.filter((l) => l.description.trim() !== "" || l.unit_price !== "");
      if (filled.length === 0) next.lines = "Add at least one line item.";
      else if (filled.some((l) => !l.description.trim())) next.lines = "Every line needs a description.";
      else if (filled.some((l) => Number(l.quantity) <= 0)) next.lines = "Quantity must be greater than zero.";
      else if (totals.subtotal <= 0) next.lines = "The subtotal must be greater than zero.";
      if (Number(taxRate) < 0 || Number(taxRate) > 100) next.taxRate = "Tax must be between 0 and 100%.";
      if (discount !== "" && Number(discount) < 0) next.discount = "Discount can't be negative.";
      if (discountMode === "percent" && Number(discount) > 100) next.discount = "A percentage can't be above 100%.";
      else if (discount !== "" && totals.discount > totals.subtotal + totals.tax) {
        next.discount = "Discount is larger than the invoice.";
      }
    }
    if (index === 2 && dueDate && dueDate < issueDate) {
      next.dueDate = "Due date can't be before the issue date.";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const goNext = () => {
    if (validateStep(step)) setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const handleCreate = async () => {
    if (!validateStep(0) || !validateStep(1) || !validateStep(2)) return;
    setSaving(true);
    setSubmitError(null);
    try {
      const res = await fetch("/api/admin/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_id: clientId,
          project_id: projectId || undefined,
          currency,
          tax_rate: Number(taxRate) || 0,
          discount: totals.discount,
          po_number: poNumber.trim() || undefined,
          terms: terms.trim() || undefined,
          issue_date: issueDate,
          due_date: dueDate || undefined,
          notes: notes.trim() || undefined,
          items: lines
            .filter((l) => l.description.trim())
            .map((l) => ({
              description: l.description.trim(),
              quantity: Number(l.quantity) || 1,
              unit_price: Number(l.unit_price) || 0,
            })),
        }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error || "Failed to create invoice.");

      clearDraft();
      close();
      router.push(`/admin/invoices/${body.id}`);
      router.refresh();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Failed to create invoice.");
      setSaving(false);
    }
  };

  const clientName = clients.find((c) => c.id === clientId)?.company_name ?? "-";
  const projectName = projects.find((p) => p.id === projectId)?.name;

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
        title="New invoice"
        description="Bill by line item. The invoice number is generated when you create it."
        size="xl"
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
            <span className="ml-auto hidden text-sm sm:block">
              <span className="text-[#231F20]/50">Total </span>
              <span className="font-extrabold text-[#231F20]">{formatMoney(totals.total, currency)}</span>
            </span>
            {step < STEPS.length - 1 ? (
              <button type="button" className={btnPrimary} onClick={goNext}>
                Continue
              </button>
            ) : (
              <button type="button" className={btnPrimary} onClick={handleCreate} disabled={saving}>
                {saving ? "Creating…" : "Create draft invoice"}
              </button>
            )}
          </>
        }
      >
        {open && draft && pristine && (
          <Alert tone="info" title="You have an unfinished invoice" className="mb-4">
            <span className="block">Saved automatically on this device. Pick up where you left off, or start fresh.</span>
            <span className="mt-2 flex gap-2">
              <button type="button" onClick={restoreDraft} className="rounded-lg bg-[#1A14A5] px-3 py-1 text-xs font-semibold text-white">
                Restore draft
              </button>
              <button type="button" onClick={clearDraft} className="rounded-lg px-3 py-1 text-xs font-semibold text-[#231F20]/70 ring-1 ring-[#1A14A5]/15">
                Discard draft
              </button>
            </span>
          </Alert>
        )}

        {step === 0 && (
          <div className="grid gap-4 sm:grid-cols-2">
            {lockSelection ? (
              <div className="sm:col-span-2 rounded-xl bg-[#F4F7FE] px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-[#231F20]/50">Billing</p>
                <p className="mt-1 font-semibold text-[#231F20]">{clientName}</p>
                {projectName && <p className="text-sm text-[#231F20]/60">Project: {projectName}</p>}
              </div>
            ) : (
              <>
                <SelectField
                  id="invoice-client"
                  label="Client"
                  required
                  value={clientId}
                  onChange={(v) => {
                    setClientId(v);
                    setProjectId("");
                  }}
                  options={clients.map((c) => ({ value: c.id, label: c.company_name }))}
                  placeholder="Select a client…"
                  error={errors.client}
                />
                <SelectField
                  id="invoice-project"
                  label="Project"
                  value={projectId}
                  onChange={(v) => {
                    setProjectId(v);
                    if (v) applyProjectDefaults(v);
                  }}
                  options={availableProjects.map((p) => ({ value: p.id, label: p.name }))}
                  placeholder="No linked project"
                  hint={
                    clientId
                      ? "Linking a project pre-fills the first line and keeps revenue reportable per project."
                      : "Pick a client first to see their projects."
                  }
                  disabled={!clientId}
                />
              </>
            )}
            <SelectField
              id="invoice-currency"
              label="Currency"
              required
              className="sm:col-span-2"
              value={currency}
              onChange={(v) => setCurrency(v as Currency)}
              options={CURRENCIES.map((c) => ({ value: c, label: CURRENCY_LABELS[c] }))}
              hint="Every line on this invoice is in this currency."
            />
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <div className="overflow-x-auto rounded-xl border border-[#1A14A5]/10">
              <table className="w-full min-w-[620px] text-sm">
                <thead className="bg-[#F4F7FE] text-left text-xs uppercase tracking-wide text-[#231F20]/50">
                  <tr>
                    <th className="px-3 py-2 font-semibold">Description</th>
                    <th className="w-24 px-3 py-2 font-semibold">Qty</th>
                    <th className="w-36 px-3 py-2 font-semibold">Unit price</th>
                    <th className="w-32 px-3 py-2 text-right font-semibold">Line total</th>
                    <th className="w-10 px-2 py-2" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1A14A5]/5">
                  {lines.map((line) => (
                    <tr key={line.key}>
                      <td className="px-3 py-2">
                        <input
                          value={line.description}
                          onChange={(e) => updateLine(line.key, { description: e.target.value })}
                          placeholder="e.g. Landing page design"
                          className={cn(inputBase, "border-transparent bg-transparent px-2 py-1.5")}
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="number"
                          min="0"
                          step="0.5"
                          value={line.quantity}
                          onChange={(e) => updateLine(line.key, { quantity: e.target.value })}
                          className={cn(inputBase, "border-transparent bg-transparent px-2 py-1.5")}
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={line.unit_price}
                          onChange={(e) => updateLine(line.key, { unit_price: e.target.value })}
                          placeholder="0.00"
                          className={cn(inputBase, "border-transparent bg-transparent px-2 py-1.5")}
                        />
                      </td>
                      <td className="px-3 py-2 text-right font-semibold text-[#231F20] whitespace-nowrap">
                        {formatMoney((Number(line.quantity) || 0) * (Number(line.unit_price) || 0), currency)}
                      </td>
                      <td className="px-2 py-2">
                        <button
                          type="button"
                          onClick={() => removeLine(line.key)}
                          disabled={lines.length === 1}
                          aria-label="Remove line"
                          className="rounded-lg p-1.5 text-[#231F20]/35 transition hover:bg-red-50 hover:text-red-600 disabled:pointer-events-none disabled:opacity-30"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <button type="button" onClick={() => setLines((c) => [...c, newLine()])} className={btnSecondary}>
              <Plus className="h-4 w-4" /> Add line
            </button>

            {errors.lines && <Alert tone="error">{errors.lines}</Alert>}

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-4">
                <TextField
                  id="invoice-tax"
                  label="Tax rate (%)"
                  type="number"
                  min="0"
                  step="0.01"
                  value={taxRate}
                  onChange={setTaxRate}
                  error={errors.taxRate}
                  hint="Applied to the subtotal. Use 0 if this invoice isn't taxed."
                />
                <ChoiceField
                  label="Discount type"
                  value={discountMode}
                  onChange={(v) => setDiscountMode(v as "flat" | "percent")}
                  options={[
                    { value: "flat", label: `Amount (${currency})` },
                    { value: "percent", label: "Percent (%)" },
                  ]}
                />
                <TextField
                  id="invoice-discount"
                  label={discountMode === "percent" ? "Discount (%)" : `Discount (${currency})`}
                  type="number"
                  min="0"
                  step="0.01"
                  value={discount}
                  onChange={setDiscount}
                  placeholder={discountMode === "percent" ? "e.g. 10" : "0.00"}
                  error={errors.discount}
                  hint={
                    discountMode === "percent"
                      ? `Takes ${formatMoney(totals.discount, currency)} off the subtotal.`
                      : "A flat amount taken off the total."
                  }
                />
              </div>

              <TotalsPanel totals={totals} currency={currency} taxRate={taxRate} />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-4">
              <TextField
                id="invoice-issue"
                label="Issue date"
                type="date"
                required
                value={issueDate}
                onChange={setIssueDate}
                hint="What the invoice is dated for, finance reports use this."
              />
              <div className="space-y-1.5">
                <TextField
                  id="invoice-due"
                  label="Due date"
                  type="date"
                  value={dueDate}
                  onChange={setDueDate}
                  error={errors.dueDate}
                />
                <div className="flex flex-wrap gap-1.5">
                  {DUE_PRESETS.map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => setDueDate(addDays(issueDate, preset.days))}
                      className="rounded-lg bg-[#F4F7FE] px-2.5 py-1 text-xs font-semibold text-[#231F20]/60 transition hover:bg-[#1A14A5]/10 hover:text-[#1A14A5]"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
              <AdvancedSection title="More options" hint="PO number, terms for this invoice">
              <TextField
                id="invoice-po"
                label="PO / reference number"
                value={poNumber}
                onChange={setPoNumber}
                hint="Optional - the client's purchase order, printed on the PDF."
              />
              <TextareaField
                id="invoice-terms"
                label="Terms (this invoice only)"
                value={terms}
                onChange={setTerms}
                rows={2}
                placeholder="Leave empty to use your default terms from Settings."
              />
              </AdvancedSection>
              <TextareaField
                id="invoice-notes"
                label="Notes"
                value={notes}
                onChange={setNotes}
                rows={3}
                placeholder="Payment instructions, terms, thank-you note… Appears on the PDF."
              />
            </div>

            <div className="space-y-4">
              <div className="rounded-xl border border-[#1A14A5]/10 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-[#231F20]/50">Summary</p>
                <dl className="mt-2 space-y-1.5 text-sm">
                  <Row label="Client" value={clientName} />
                  {projectName && <Row label="Project" value={projectName} />}
                  <Row label="Lines" value={String(lines.filter((l) => l.description.trim()).length)} />
                  <Row label="Currency" value={currency} />
                </dl>
              </div>
              <TotalsPanel totals={totals} currency={currency} taxRate={taxRate} />
              <Alert tone="info">
                It saves as a <strong>draft</strong>. Review it, then mark it as sent from the invoice page.
              </Alert>
              {submitError && <Alert tone="error">{submitError}</Alert>}
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-[#231F20]/55">{label}</dt>
      <dd className="truncate font-semibold text-[#231F20]">{value}</dd>
    </div>
  );
}

function TotalsPanel({
  totals,
  currency,
  taxRate,
}: {
  totals: { subtotal: number; tax: number; discount: number; total: number };
  currency: Currency;
  taxRate: string;
}) {
  return (
    <div className="rounded-xl bg-[#F4F7FE] p-4">
      <dl className="space-y-1.5 text-sm">
        <div className="flex items-center justify-between">
          <dt className="text-[#231F20]/55">Subtotal</dt>
          <dd className="font-semibold text-[#231F20]">{formatMoney(totals.subtotal, currency)}</dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="text-[#231F20]/55">Tax {Number(taxRate) > 0 ? `(${Number(taxRate)}%)` : ""}</dt>
          <dd className="font-semibold text-[#231F20]">{formatMoney(totals.tax, currency)}</dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="text-[#231F20]/55">Discount</dt>
          <dd className="font-semibold text-[#231F20]">−{formatMoney(totals.discount, currency)}</dd>
        </div>
        <div className="mt-2 flex items-center justify-between border-t border-[#1A14A5]/10 pt-2">
          <dt className="font-bold text-[#231F20]">Total</dt>
          <dd className="text-lg font-extrabold text-[#1A14A5]">{formatMoney(totals.total, currency)}</dd>
        </div>
      </dl>
    </div>
  );
}
