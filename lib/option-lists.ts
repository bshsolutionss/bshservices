/**
 * Editable dropdown lists. The live values live in the `app_options` table and
 * are managed in Settings > Lists; the defaults below are only used until that
 * table has rows (or before migration 0013 is run), so a form never ends up
 * with an empty dropdown. Shared by server and client code - no server imports.
 */

export type OptionListKey =
  | "expense_categories"
  | "service_categories"
  | "lead_sources"
  | "investment_types"
  | "payment_methods";

export interface OptionLite {
  value: string;
  label: string;
  color: string | null;
}

export interface AppOption extends OptionLite {
  id: string;
  list_key: OptionListKey;
  sort_order: number;
  active: boolean;
}

export const OPTION_LISTS: { key: OptionListKey; label: string; description: string; colored: boolean }[] = [
  { key: "service_categories", label: "Service categories", description: "Used on projects and leads.", colored: true },
  { key: "expense_categories", label: "Expense categories", description: "Used on every expense and in the P&L breakdown.", colored: true },
  { key: "lead_sources", label: "Lead sources", description: "Where a manually-added lead came from.", colored: false },
  { key: "investment_types", label: "Investment types", description: "Used on the Investments page.", colored: true },
  { key: "payment_methods", label: "Payment methods", description: "Offered when recording a payment on an invoice.", colored: false },
];

export const DEFAULT_OPTIONS: Record<OptionListKey, OptionLite[]> = {
  expense_categories: ["Office", "Software", "Salaries", "Advertising", "Hosting", "Domain", "Other"].map((v) => ({
    value: v,
    label: v,
    color: null,
  })),
  service_categories: ["Development", "Designing", "Marketing", "Photography", "AI Services"].map((v) => ({
    value: v,
    label: v,
    color: null,
  })),
  lead_sources: [
    "Phone call",
    "WhatsApp",
    "Referral",
    "Facebook",
    "Instagram",
    "LinkedIn",
    "Cold email",
    "Fiverr / Upwork",
    "Walk-in / event",
    "Other",
  ].map((v) => ({ value: v, label: v, color: null })),
  investment_types: ["Stocks", "Crypto", "Real estate", "Business", "Gold", "Savings", "Other"].map((v) => ({
    value: v,
    label: v,
    color: null,
  })),
  payment_methods: [
    { value: "cash", label: "Cash", color: null },
    { value: "bank_transfer", label: "Bank transfer", color: null },
    { value: "card", label: "Card", color: null },
    { value: "cheque", label: "Cheque", color: null },
    { value: "other", label: "Other", color: null },
  ],
};

export function isOptionListKey(value: string | null | undefined): value is OptionListKey {
  return !!value && OPTION_LISTS.some((l) => l.key === value);
}

/** Badge colours derived from a single hex, so a user-picked colour always reads well. */
export function optionBadgeColors(color: string | null | undefined): { bg: string; text: string } {
  if (!color || !/^#[0-9a-fA-F]{6}$/.test(color)) return { bg: "#F1F1F1", text: "#4B5563" };
  return { bg: `${color}1F`, text: color };
}
