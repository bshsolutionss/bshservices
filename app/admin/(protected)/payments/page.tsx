import Link from "next/link";
import { ArrowDownLeft, ArrowUpRight, Download, FileText, SlidersHorizontal } from "lucide-react";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { getCompanySettings } from "@/lib/admin/company-settings";
import { PERIODS, loadRecords, resolvePeriod, totalsPKR, type PaymentRecord } from "@/lib/admin/payments-hub";
import { EXPENSE_RECURRENCE_MONTHS, type ExpenseRecurrence } from "@/lib/expenses";
import { formatDate, formatMoney, type Currency } from "@/lib/invoices";
import { todayInPkt } from "@/lib/availability";
import { cn } from "@/lib/utils";
import { Badge, EmptyState, PageHeader, SectionCard, btnSecondary } from "@/components/admin/ui";
import AddPaymentModal from "@/components/admin/payments/AddPaymentModal";
import AutoExpensesCard, { type AutoExpense } from "@/components/admin/payments/AutoExpensesCard";
import DeleteRecordButton from "@/components/admin/payments/DeleteRecordButton";
import InvoiceCreateButton from "@/components/admin/invoices/InvoiceCreateButton";

export const dynamic = "force-dynamic";

/** First date on/after today in a template's schedule (template date + n x interval months). */
function nextOccurrence(date: string, recurrence: ExpenseRecurrence, today: string): string {
  const step = EXPENSE_RECURRENCE_MONTHS[recurrence] ?? 1;
  const [y0, m0, d0] = date.split("-").map(Number);
  for (let i = 0; i < 600; i++) {
    const total = m0 - 1 + i * step;
    const y = y0 + Math.floor(total / 12);
    const m = (total % 12) + 1;
    const day = Math.min(d0, new Date(Date.UTC(y, m, 0)).getUTCDate());
    const iso = `${y}-${String(m).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    if (iso >= today) return iso;
  }
  return date;
}

export default async function PaymentsPage({ searchParams }: { searchParams: Promise<{ period?: string; from?: string; to?: string; kind?: string }> }) {
  const sp = await searchParams;
  const period = resolvePeriod(sp.period, sp.from, sp.to);
  const kind: "all" | "received" | "paid_out" = sp.kind === "received" || sp.kind === "paid_out" ? sp.kind : "all";
  const today = todayInPkt();
  const service = createServiceRoleClient();

  const [records, company, { data: projectsData }, { data: employees }, { data: clients }, { data: balances }, { data: templates }] = await Promise.all([
    loadRecords(period),
    getCompanySettings(),
    service.from("projects").select("id, name, client_id, currency, budget, clients(company_name)").eq("archived", false).order("created_at", { ascending: false }),
    service.from("employees").select("id, name").eq("status", "active").order("name"),
    service.from("clients").select("id, company_name").order("company_name"),
    service.from("invoice_balances").select("invoice_id, invoice_number, project_id, balance, currency").in("status", ["sent", "partially_paid"]).gt("balance", 0),
    service.from("expenses").select("id, vendor, description, category, amount, currency, expense_date, recurrence, recurring_active").eq("expense_type", "monthly").is("recurring_parent_id", null).order("created_at", { ascending: false }),
  ]);

  const totals = await totalsPKR(records);
  const shown = kind === "all" ? records : records.filter((r) => r.kind === kind);
  const shownTotals = await totalsPKR(shown);

  type ProjectRow = { id: string; name: string; client_id: string; currency: Currency; budget: number | null; clients: { company_name: string } | { company_name: string }[] | null };
  const projects = ((projectsData ?? []) as unknown as ProjectRow[]).map((p) => ({
    id: p.id,
    name: p.name,
    client_id: p.client_id,
    currency: p.currency,
    budget: p.budget,
    client: (Array.isArray(p.clients) ? p.clients[0] : p.clients)?.company_name ?? "-",
  }));

  const autoItems: AutoExpense[] = (templates ?? []).map((t) => ({
    id: t.id,
    name: t.description || t.vendor || t.category,
    category: t.category,
    amount: Number(t.amount),
    currency: t.currency as Currency,
    recurrence: (t.recurrence as ExpenseRecurrence) ?? "monthly",
    active: t.recurring_active,
    next: nextOccurrence(t.expense_date, (t.recurrence as ExpenseRecurrence) ?? "monthly", today),
  }));

  const q = (extra: Record<string, string | undefined>) => {
    const params = new URLSearchParams();
    const merged = { period: period.key === "all" ? undefined : period.key, from: sp.from, to: sp.to, kind: kind === "all" ? undefined : kind, ...extra };
    for (const [k, v] of Object.entries(merged)) if (v) params.set(k, v);
    const s = params.toString();
    return s ? `?${s}` : "";
  };

  const chip = (active: boolean) => cn("rounded-full border px-3 py-1 text-sm transition", active ? "border-[#1A14A5] bg-[#E8E7FB] font-semibold text-[#1A14A5]" : "border-[#1A14A5]/10 bg-white text-[#231F20]/65 hover:border-[#1A14A5]/30");

  const row = (r: PaymentRecord) => (
    <li key={`${r.kind}-${r.id}`} className="flex flex-wrap items-center gap-3 py-3">
      <span className={cn("grid h-9 w-9 shrink-0 place-items-center rounded-lg", r.kind === "received" ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600")}>
        {r.kind === "received" ? <ArrowDownLeft className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
      </span>
      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-2 truncate font-medium">
          {r.title}
          {r.tag && <Badge label={r.tag} colors={r.kind === "received" ? { bg: "#D1FAE5", text: "#065F46" } : { bg: "#FEF3C7", text: "#92400E" }} />}
        </p>
        <p className="truncate text-xs text-[#231F20]/50">
          {formatDate(r.date)}
          {r.subtitle && ` · ${r.subtitle}`}
        </p>
      </div>
      <span className={cn("font-semibold", r.kind === "received" ? "text-emerald-700" : "text-amber-700")}>
        {r.kind === "received" ? "+" : "-"}
        {formatMoney(r.amount, r.currency)}
      </span>
      <DeleteRecordButton url={r.deleteUrl} title={r.title} />
    </li>
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payments"
        subtitle="All incoming client payments and outgoing team or business payouts in one timeline"
        actions={
          <>
            <a href={`/api/admin/payments/pdf${q({})}`} className={btnSecondary}>
              <Download className="h-4 w-4" /> Download PDF
            </a>
            <Link href="/admin/invoices" className={btnSecondary}>
              <FileText className="h-4 w-4" /> Invoices
            </Link>
            <InvoiceCreateButton
              clients={(clients ?? []).map((c) => ({ id: c.id as string, company_name: c.company_name as string }))}
              projects={projects.map((p) => ({ id: p.id, name: p.name, client_id: p.client_id, budget: p.budget, currency: p.currency }))}
              label="Generate invoice"
              variant="outline"
            />
            <AddPaymentModal
              projects={projects.map((p) => ({ id: p.id, name: p.name, client: p.client, currency: p.currency }))}
              employees={(employees ?? []) as { id: string; name: string }[]}
              openInvoices={(balances ?? []).map((b) => ({ id: b.invoice_id as string, number: b.invoice_number as string, project_id: b.project_id as string, balance: Number(b.balance), currency: b.currency as Currency }))}
              today={today}
            />
          </>
        }
      />

      <div className="rounded-2xl border border-[#1A14A5]/10 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-1 inline-flex items-center gap-1.5 text-sm text-[#231F20]/60">
            <SlidersHorizontal className="h-4 w-4" /> Period
          </span>
          {PERIODS.filter((p) => p.key !== "custom").map((p) => (
            <Link key={p.key} href={`/admin/payments${q({ period: p.key === "all" ? undefined : p.key, from: undefined, to: undefined })}`} className={chip(period.key === p.key)}>
              {p.label}
            </Link>
          ))}
          <form action="/admin/payments" className="ml-auto flex flex-wrap items-center gap-2">
            <input type="hidden" name="period" value="custom" />
            {kind !== "all" && <input type="hidden" name="kind" value={kind} />}
            <input type="date" name="from" defaultValue={period.key === "custom" ? (period.from ?? "") : ""} aria-label="From" className="rounded-lg border border-[#1A14A5]/15 px-2 py-1 text-sm" />
            <span className="text-xs text-[#231F20]/40">to</span>
            <input type="date" name="to" defaultValue={period.key === "custom" ? (period.to ?? "") : ""} aria-label="To" className="rounded-lg border border-[#1A14A5]/15 px-2 py-1 text-sm" />
            <button className={cn(chip(period.key === "custom"), "font-semibold")}>Custom range</button>
          </form>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="flex items-center justify-between rounded-2xl border border-[#1A14A5]/10 bg-white p-5 shadow-sm">
          <div>
            <p className="text-sm text-[#231F20]/55">Received · {period.label}</p>
            <p className="mt-1 text-3xl font-extrabold text-emerald-700">{formatMoney(totals.received, "PKR")}</p>
          </div>
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-emerald-50 text-emerald-600">
            <ArrowDownLeft className="h-5 w-5" />
          </span>
        </div>
        <div className="flex items-center justify-between rounded-2xl border border-[#1A14A5]/10 bg-white p-5 shadow-sm">
          <div>
            <p className="text-sm text-[#231F20]/55">Paid out · {period.label}</p>
            <p className="mt-1 text-3xl font-extrabold text-amber-700">{formatMoney(totals.paidOut, "PKR")}</p>
          </div>
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-amber-50 text-amber-600">
            <ArrowUpRight className="h-5 w-5" />
          </span>
        </div>
      </div>

      <AutoExpensesCard items={autoItems} today={today} defaultCurrency={company.default_currency} />

      <SectionCard
        title="Payment records"
        subtitle={`Newest first · ${shown.length} record${shown.length === 1 ? "" : "s"} · ${period.label}`}
        action={
          <div className="inline-flex rounded-xl bg-[#F4F7FE] p-1">
            {(["all", "received", "paid_out"] as const).map((k) => (
              <Link key={k} href={`/admin/payments${q({ kind: k === "all" ? undefined : k })}`} className={cn("rounded-lg px-3 py-1.5 text-sm font-semibold", kind === k ? "bg-white text-[#1A14A5] shadow-sm" : "text-[#231F20]/55")}>
                {k === "all" ? "All" : k === "received" ? "Received" : "Paid out"}
              </Link>
            ))}
          </div>
        }
      >
        <p className="-mt-1 mb-3 text-xs font-semibold">
          <span className="text-emerald-700">+{formatMoney(shownTotals.received, "PKR")}</span> <span className="text-amber-700">-{formatMoney(shownTotals.paidOut, "PKR")}</span>{" "}
          <span className="text-[#231F20]">Net {formatMoney(shownTotals.net, "PKR")}</span>
        </p>
        {shown.length === 0 ? (
          <EmptyState icon={ArrowDownLeft} title="No payments yet" description="Add a client receipt or an outgoing payout to get started." />
        ) : (
          <ul className="divide-y divide-[#1A14A5]/5">{shown.map(row)}</ul>
        )}
      </SectionCard>
    </div>
  );
}
