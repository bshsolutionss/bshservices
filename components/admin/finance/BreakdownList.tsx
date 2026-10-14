import { formatMoney } from "@/lib/invoices";

export interface BreakdownItem {
  label: string;
  amount: number;
  /** Share of the group total, 0–100. */
  share: number;
}

/**
 * Ranked share-of-total list (expenses by category, revenue by client).
 *
 * A ranked bar list rather than a pie: it stays readable past four slices,
 * puts the labels and the figures next to each other, and sorts by the thing
 * being compared. The bar is one hue at a single step — it encodes magnitude,
 * not identity, so no categorical palette is involved.
 */
export default function BreakdownList({
  items,
  emptyMessage = "Nothing recorded in this period.",
}: {
  items: BreakdownItem[];
  emptyMessage?: string;
}) {
  if (items.length === 0) {
    return <p className="py-2 text-sm text-[#231F20]/45">{emptyMessage}</p>;
  }

  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li key={item.label}>
          <div className="flex items-baseline justify-between gap-3 text-sm">
            <span className="truncate font-medium text-[#231F20]">{item.label}</span>
            <span className="shrink-0 font-semibold text-[#231F20]">
              {formatMoney(item.amount, "PKR")}
              <span className="ml-1.5 text-xs font-normal text-[#231F20]/45">{item.share}%</span>
            </span>
          </div>
          <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-[#F4F7FE]">
            <div
              className="h-full rounded-full bg-[#5B4BE8]"
              style={{ width: `${Math.max(item.share, 1)}%` }}
              aria-hidden
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
