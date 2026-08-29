"use client";

import { Input } from "@/components/ui/input";
import type { ExpenseCategory } from "@/lib/expenses";

interface VendorOrEmployeeFieldProps {
  category: ExpenseCategory;
  value: string;
  onChange: (value: string) => void;
  /** Real employees fetched from the `employees` table — see app/admin/(protected)/expenses/page.tsx. */
  employees: { id: string; name: string }[];
  className?: string;
}

/**
 * The "Vendor" field on an expense — except when the category is
 * "Salaries", where a vendor doesn't make sense and this becomes an
 * Employee dropdown instead (sourced from real employee records, not a
 * hardcoded list). Shared between NewExpenseInlineForm and ExpenseRow's
 * inline edit so both stay in sync.
 */
export default function VendorOrEmployeeField({
  category,
  value,
  onChange,
  employees,
  className,
}: VendorOrEmployeeFieldProps) {
  if (category !== "Salaries") {
    return (
      <Input
        placeholder="Vendor (optional)"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={className}
      />
    );
  }

  const names = employees.map((e) => e.name);
  // An existing expense's saved value might not match any current employee
  // name (they've since left, or it was free-typed before this dropdown
  // existed) — keep it selectable instead of silently discarding it.
  const options = value && !names.includes(value) ? [value, ...names] : names;

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={className ?? "rounded-lg border border-[#1A14A5]/20 px-3 py-2 text-sm bg-white"}
    >
      <option value="">Select employee…</option>
      {options.map((name) => (
        <option key={name} value={name}>
          {name}
        </option>
      ))}
    </select>
  );
}
