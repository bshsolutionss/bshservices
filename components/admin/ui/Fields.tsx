"use client";

import { cn } from "@/lib/utils";
import { inputBase, inputInvalid, labelBase } from "./styles";

/* ───────────────────────── wrapper ───────────────────────── */

interface FieldProps {
  label: string;
  htmlFor?: string;
  required?: boolean;
  /** Helper text under the control — use it to explain, not to repeat the label. */
  hint?: string;
  error?: string | null;
  className?: string;
  /** Suppress the automatic "optional" tag (for choices that always have a value). */
  hideOptional?: boolean;
  children: React.ReactNode;
}

/**
 * Label + control + hint/error wrapper. Every admin form field goes through
 * this so labels are always visible (the old forms relied on placeholders
 * alone, which disappear the moment you start typing) and validation
 * messages always appear in the same spot.
 */
export function Field({ label, htmlFor, required, hint, error, className, hideOptional, children }: FieldProps) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <label htmlFor={htmlFor} className={labelBase}>
        {label}
        {required ? (
          <span className="ml-0.5 text-red-500" aria-label="required">
            *
          </span>
        ) : (
          !hideOptional && (
            <span className="ml-1.5 text-[10px] font-medium normal-case tracking-normal text-[#231F20]/35">optional</span>
          )
        )}
      </label>
      {children}
      {error ? (
        <p className="text-xs font-medium text-red-600">{error}</p>
      ) : (
        hint && <p className="text-xs text-[#231F20]/45">{hint}</p>
      )}
    </div>
  );
}

/* ───────────────────────── controls ───────────────────────── */

type BaseControlProps = Omit<FieldProps, "children" | "htmlFor"> & { id?: string };

interface TextFieldProps extends BaseControlProps {
  value: string;
  onChange: (value: string) => void;
  type?: "text" | "email" | "tel" | "date" | "time" | "datetime-local" | "number" | "search";
  placeholder?: string;
  min?: string;
  step?: string;
  disabled?: boolean;
  autoFocus?: boolean;
  /** Offered as suggestions while typing; any other text is still accepted. */
  suggestions?: string[];
}

export function TextField({
  value,
  onChange,
  type = "text",
  placeholder,
  min,
  step,
  disabled,
  autoFocus,
  suggestions,
  id,
  ...field
}: TextFieldProps) {
  const listId = suggestions && suggestions.length > 0 && id ? `${id}-suggestions` : undefined;
  return (
    <Field {...field} htmlFor={id}>
      {listId && (
        <datalist id={listId}>
          {suggestions!.map((s) => (
            <option key={s} value={s} />
          ))}
        </datalist>
      )}
      <input
        id={id}
        list={listId}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        min={min}
        step={step}
        disabled={disabled}
        autoFocus={autoFocus}
        aria-invalid={!!field.error}
        className={cn(inputBase, field.error && inputInvalid)}
      />
    </Field>
  );
}

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectFieldProps extends BaseControlProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  /** Shown as a disabled first option when the value is empty. */
  placeholder?: string;
  disabled?: boolean;
}

export function SelectField({ value, onChange, options, placeholder, disabled, id, ...field }: SelectFieldProps) {
  return (
    <Field {...field} htmlFor={id} hideOptional={!placeholder}>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        aria-invalid={!!field.error}
        className={cn(inputBase, "appearance-none bg-[right_0.75rem_center] pr-9", field.error && inputInvalid)}
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8' fill='none'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='%23231F20' stroke-opacity='0.4' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E\")",
          backgroundRepeat: "no-repeat",
        }}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((option) => (
          <option key={option.value} value={option.value} disabled={option.disabled}>
            {option.label}
          </option>
        ))}
      </select>
    </Field>
  );
}

interface TextareaFieldProps extends BaseControlProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  disabled?: boolean;
}

export function TextareaField({ value, onChange, placeholder, rows = 3, disabled, id, ...field }: TextareaFieldProps) {
  return (
    <Field {...field} htmlFor={id}>
      <textarea
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        disabled={disabled}
        aria-invalid={!!field.error}
        className={cn(inputBase, "resize-y leading-relaxed", field.error && inputInvalid)}
      />
    </Field>
  );
}

interface MoneyFieldProps extends BaseControlProps {
  amount: string;
  onAmountChange: (value: string) => void;
  currency: string;
  onCurrencyChange?: (value: string) => void;
  currencies: readonly string[];
  placeholder?: string;
  disabled?: boolean;
}

/**
 * Amount + currency as one control. Kept together deliberately: an amount
 * without its currency is meaningless in this panel (invoices, budgets and
 * expenses can each be in any of the four supported currencies).
 */
export function MoneyField({
  amount,
  onAmountChange,
  currency,
  onCurrencyChange,
  currencies,
  placeholder = "0.00",
  disabled,
  id,
  ...field
}: MoneyFieldProps) {
  return (
    <Field {...field} htmlFor={id}>
      <div
        className={cn(
          "flex items-stretch overflow-hidden rounded-xl border border-[#1A14A5]/15 bg-white transition focus-within:border-[#1A14A5]/50 focus-within:ring-2 focus-within:ring-[#1A14A5]/10",
          field.error && "border-red-300 focus-within:border-red-400 focus-within:ring-red-100"
        )}
      >
        <input
          id={id}
          type="number"
          min="0"
          step="0.01"
          inputMode="decimal"
          value={amount}
          onChange={(e) => onAmountChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          aria-invalid={!!field.error}
          className="min-w-0 flex-1 bg-transparent px-3 py-2 text-sm text-[#231F20] outline-none placeholder:text-[#231F20]/35 disabled:bg-[#F4F7FE]"
        />
        <select
          value={currency}
          onChange={(e) => onCurrencyChange?.(e.target.value)}
          disabled={disabled || !onCurrencyChange}
          aria-label="Currency"
          className="border-l border-[#1A14A5]/10 bg-[#F4F7FE] px-2.5 text-xs font-bold text-[#231F20]/70 outline-none"
        >
          {currencies.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>
    </Field>
  );
}

/** Plain row of radio-style choices — used for small either/or options (e.g. tax mode, revenue basis). */
export function ChoiceField({
  value,
  onChange,
  options,
  ...field
}: BaseControlProps & { value: string; onChange: (value: string) => void; options: SelectOption[] }) {
  return (
    <Field {...field} hideOptional>
      <div className="flex flex-wrap gap-1.5 rounded-xl bg-[#F4F7FE] p-1" role="group" aria-label={field.label}>
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={cn(
              "flex-1 rounded-lg px-3 py-1.5 text-xs font-semibold transition",
              value === option.value
                ? "bg-white text-[#1A14A5] shadow-sm"
                : "text-[#231F20]/55 hover:text-[#231F20]"
            )}
          >
            {option.label}
          </button>
        ))}
      </div>
    </Field>
  );
}
