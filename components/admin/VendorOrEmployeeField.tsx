"use client";

import { SelectField, TextField } from "@/components/admin/ui";
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
 * hardcoded list). Shared by the create and edit forms so both stay in sync.
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
      <TextField
        id="expense-vendor"
        label="Vendor"
        value={value}
        onChange={onChange}
        placeholder="Who was paid?"
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
    <SelectField
      id="expense-employee"
      label="Employee"
      value={value}
      onChange={onChange}
      options={options.map((name) => ({ value: name, label: name }))}
      placeholder="Select employee…"
      className={className}
      hint="Active employees. A past employee already on an expense stays selectable."
    />
  );
}
