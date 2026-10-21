import { AlertTriangle, CheckCircle2, Receipt, Wallet } from "lucide-react";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { ensureStatusOverrides } from "@/lib/admin/status-overrides";
import { formatMoney, type InvoiceBalance } from "@/lib/invoices";
import { sumToPKR } from "@/lib/currency";
import { getExchangeRates } from "@/lib/admin/exchange-rates";
import type { Client } from "@/lib/clients";
import type { Project } from "@/lib/projects";
import { PageHeader, StatCard } from "@/components/admin/ui";
import InvoiceCreateButton from "@/components/admin/invoices/InvoiceCreateButton";
import { WriteGate } from "@/components/admin/RoleContext";
import InvoicesTable, { type InvoiceListItem } from "@/components/admin/invoices/InvoicesTable";

export const dynamic = "force-dynamic";

export default async function AdminInvoicesPage() {
  await ensureStatusOverrides();
  const supabase = createServiceRoleClient();

  const [{ data: balancesData }, { data: clientsData }, { data: projectsData }, rates] = await Promise.all([
    // Ordered by due_date in SQL because that column predates migration
    // 0010 — the newest-first sort by issue date happens below, once the
    // rows are in hand, so this page renders either way.
    supabase.from("invoice_balances").select("*").order("due_date", { ascending: true, nullsFirst: false }),
    supabase.from("clients").select("id, company_name").order("company_name"),
    supabase.from("projects").select("id, name, client_id, budget, currency").order("name"),
    getExchangeRates(),
  ]);

  const balances = (balancesData ?? []) as InvoiceBalance[];
  const clients = (clientsData ?? []) as Pick<Client, "id" | "company_name">[];
  const projects = (projectsData ?? []) as Pick<Project, "id" | "name" | "client_id" | "budget" | "currency">[];
  const clientNames = new Map(clients.map((c) => [c.id, c.company_name]));
  const projectNames = new Map(projects.map((p) => [p.id, p.name]));

  // invoice_balances carries invoice_number from migration 0010 onward. If
  // that hasn't been applied yet the column is simply absent, so fill the
  // numbers in from `invoices` rather than rendering blank links.
  const needsNumberFallback = balances.length > 0 && !balances[0].invoice_number;
  let numberFallback = new Map<string, string>();
  if (needsNumberFallback) {
    const { data } = await supabase.from("invoices").select("id, invoice_number");
    numberFallback = new Map((data ?? []).map((i: { id: string; invoice_number: string }) => [i.id, i.invoice_number]));
  }

  const rows: InvoiceListItem[] = balances
    .map((balance) => ({
      ...balance,
      invoice_number:
        balance.invoice_number || numberFallback.get(balance.invoice_id) || balance.invoice_id.slice(0, 8),
      clientName: clientNames.get(balance.client_id) ?? "-",
      projectName: balance.project_id ? (projectNames.get(balance.project_id) ?? "-") : "-",
    }))
    .sort((a, b) => String(b.issue_date ?? b.created_at ?? "").localeCompare(String(a.issue_date ?? a.created_at ?? "")));

  /* ── KPIs. Converted to one PKR figure (the business's standard currency)
        the same way the dashboard does it; each row below keeps its own
        real currency. ── */
  const outstanding = rows.filter((r) => r.status === "sent" || r.status === "partially_paid");
  const overdue = rows.filter((r) => r.is_overdue);

  const invoicedPKR = sumToPKR(
    rows.filter((r) => r.status !== "draft").map((r) => ({ amount: Number(r.total), currency: r.currency })),
    rates
  );
  const collectedPKR = sumToPKR(rows.map((r) => ({ amount: Number(r.paid), currency: r.currency })), rates);
  const outstandingPKR = sumToPKR(
    outstanding.map((r) => ({ amount: Number(r.balance), currency: r.currency })),
    rates
  );
  const overduePKR = sumToPKR(overdue.map((r) => ({ amount: Number(r.balance), currency: r.currency })), rates);
  const collectionRate = invoicedPKR > 0 ? Math.round((collectedPKR / invoicedPKR) * 100) : null;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Invoices"
        subtitle={`Bill clients, email invoices and track what has been paid. ${rows.length} invoice${rows.length === 1 ? "" : "s"} · ${outstanding.length} awaiting payment.`}
        actions={
          <WriteGate module="invoices">
            <InvoiceCreateButton
              clients={clients}
              projects={projects.map((p) => ({
                id: p.id,
                name: p.name,
                client_id: p.client_id,
                budget: p.budget,
                currency: p.currency,
              }))}
            />
          </WriteGate>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Invoiced"
          value={formatMoney(invoicedPKR, "PKR")}
          description="Sent invoices, all time"
          icon={Receipt}
          iconBg="#1A14A5"
        />
        <StatCard
          label="Collected"
          value={formatMoney(collectedPKR, "PKR")}
          description={collectionRate !== null ? `${collectionRate}% of invoiced` : "No invoices yet"}
          icon={CheckCircle2}
          valueColor="#065F46"
          iconBg="#059669"
        />
        <StatCard
          label="Outstanding"
          value={formatMoney(outstandingPKR, "PKR")}
          description={`${outstanding.length} unpaid invoice${outstanding.length === 1 ? "" : "s"}`}
          icon={Wallet}
          valueColor="#92400E"
          iconBg="#f97316"
        />
        <StatCard
          label="Overdue"
          value={formatMoney(overduePKR, "PKR")}
          description={`${overdue.length} past the due date`}
          icon={AlertTriangle}
          valueColor="#991B1B"
          iconBg="#dc2626"
        />
      </div>

      <InvoicesTable
        invoices={rows}
        emptyTitle="No invoices yet"
        emptyAction={
          <InvoiceCreateButton
            clients={clients}
            projects={projects.map((p) => ({ id: p.id, name: p.name, client_id: p.client_id, budget: p.budget, currency: p.currency }))}
            label="Create first invoice"
          />
        }
      />
    </div>
  );
}
