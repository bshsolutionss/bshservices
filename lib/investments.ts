import type { Currency } from "@/lib/invoices";

export type InvestmentStatus = "active" | "sold" | "closed";

export interface Investment {
  id: string;
  created_at: string;
  name: string;
  /** From the editable "Investment types" list in Settings. */
  investment_type: string | null;
  currency: Currency;
  invested_amount: number;
  current_value: number;
  invested_on: string;
  status: InvestmentStatus;
  expected_return_pct: number | null;
  notes: string | null;
}

export interface InvestmentReturn {
  id: string;
  created_at: string;
  investment_id: string;
  amount: number;
  received_on: string;
  note: string | null;
}

export const INVESTMENT_STATUSES: InvestmentStatus[] = ["active", "sold", "closed"];

export const INVESTMENT_STATUS_LABELS: Record<InvestmentStatus, string> = {
  active: "Active",
  sold: "Sold / exited",
  closed: "Closed",
};

export const INVESTMENT_STATUS_COLORS: Record<InvestmentStatus, { bg: string; text: string }> = {
  active: { bg: "#D1FAE5", text: "#065F46" },
  sold: { bg: "#DBEAFE", text: "#1E40AF" },
  closed: { bg: "#F1F1F1", text: "#6B7280" },
};

/** Gain/loss and ROI for one investment, in its own currency. Returns received count as gain. */
export function investmentPerformance(inv: Pick<Investment, "invested_amount" | "current_value">, returnsTotal: number) {
  const invested = Number(inv.invested_amount);
  const gain = Number(inv.current_value) + returnsTotal - invested;
  return { gain, roiPct: invested > 0 ? Math.round((gain / invested) * 1000) / 10 : null };
}
