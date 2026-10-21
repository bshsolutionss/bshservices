"use client";

import { ChevronDown } from "lucide-react";

/**
 * Optional / less-used fields tucked behind a toggle so the form starts short.
 * Opens by default when `defaultOpen` (e.g. when editing a record that already
 * has advanced values), and is a real <details>, so it works with the keyboard.
 */
export default function AdvancedSection({
  title = "More options",
  hint,
  defaultOpen = false,
  children,
}: {
  title?: string;
  hint?: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  return (
    <details open={defaultOpen} className="group rounded-xl border border-[#1A14A5]/10 sm:col-span-2">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-[#231F20] hover:bg-[#F4F7FE] [&::-webkit-details-marker]:hidden">
        <span>
          {title}
          {hint && <span className="ml-2 text-xs font-normal text-[#231F20]/50">{hint}</span>}
        </span>
        <ChevronDown className="h-4 w-4 text-[#231F20]/50 transition-transform group-open:rotate-180" />
      </summary>
      <div className="grid gap-4 border-t border-[#1A14A5]/10 p-4 sm:grid-cols-2">{children}</div>
    </details>
  );
}
