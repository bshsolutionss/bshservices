import Link from "next/link";
import { Download, FileText, Receipt } from "lucide-react";
import { formatDate, formatMoney, type InvoiceBalance } from "@/lib/invoices";
import { PORTAL_INVOICE } from "@/lib/portal/status";
import { fileSize } from "@/lib/portal/format";
import { EmptyState, StatusPill, portalCard } from "@/components/portal/ui";

export function InvoiceRows({ rows }: { rows: InvoiceBalance[] }) {
  if (rows.length === 0) {
    return <EmptyState icon={Receipt} title="No invoices yet" description="Invoices will appear here as they're issued." />;
  }
  return (
    <div className={`${portalCard} divide-y divide-stone-100 overflow-hidden`}>
      {rows.map((b) => {
        const key = b.is_overdue ? "overdue" : b.balance <= 0.005 && b.total > 0 ? "paid" : b.status;
        const status = PORTAL_INVOICE[key];
        return (
          <div key={b.invoice_id} className="flex flex-wrap items-center gap-3 px-5 py-4">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-orange-100/70 text-orange-600">
              <Receipt className="h-4 w-4" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-medium">{b.invoice_number}</p>
              <p className="text-xs text-stone-500">
                Issued {formatDate(b.issue_date)}
                {b.due_date && ` · due ${formatDate(b.due_date)}`}
              </p>
            </div>
            <div className="text-right">
              <p className="font-semibold">{formatMoney(b.total, b.currency)}</p>
              {b.balance > 0.005 && b.paid > 0 && <p className="text-xs text-stone-500">{formatMoney(b.balance, b.currency)} left</p>}
            </div>
            <StatusPill label={status.label} tone={status.tone} />
            <a
              href={`/api/portal/invoices/${b.invoice_id}/pdf`}
              className="grid h-9 w-9 place-items-center rounded-full border border-stone-200 text-stone-600 hover:bg-stone-50"
              aria-label={`Download ${b.invoice_number}`}
            >
              <Download className="h-4 w-4" />
            </a>
          </div>
        );
      })}
    </div>
  );
}

export interface DocRow {
  id: string;
  title: string;
  category: string;
  file_name: string;
  size_bytes: number | null;
  created_at: string;
}

export function DocumentRows({ rows, empty }: { rows: DocRow[]; empty: { title: string; description: string } }) {
  if (rows.length === 0) return <EmptyState icon={FileText} title={empty.title} description={empty.description} />;
  return (
    <div className={`${portalCard} divide-y divide-stone-100 overflow-hidden`}>
      {rows.map((d) => (
        <Link key={d.id} href={`/api/portal/files/${d.id}`} className="flex items-center gap-3 px-5 py-4 hover:bg-stone-50">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-orange-100/70 text-orange-600">
            <FileText className="h-4 w-4" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium">{d.title}</p>
            <p className="truncate text-xs text-stone-500">
              {d.file_name}
              {d.size_bytes ? ` · ${fileSize(d.size_bytes)}` : ""} · {formatDate(d.created_at)}
            </p>
          </div>
          <span className="rounded-full bg-stone-100 px-2.5 py-1 text-[11px] font-medium capitalize text-stone-600">{d.category}</span>
          <Download className="h-4 w-4 text-stone-400" />
        </Link>
      ))}
    </div>
  );
}
