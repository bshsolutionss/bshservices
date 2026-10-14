"use client";

import { useEffect, useState } from "react";
import { DEFAULT_OPTIONS, optionBadgeColors, type OptionLite, type OptionListKey } from "@/lib/option-lists";

// One request per list per page load, shared by every form on the page. Starts
// from the built-in defaults so a dropdown is never empty while it loads.
const cache = new Map<OptionListKey, Promise<OptionLite[]>>();

function load(key: OptionListKey): Promise<OptionLite[]> {
  let pending = cache.get(key);
  if (!pending) {
    pending = fetch(`/api/admin/options?list=${key}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((body) => (Array.isArray(body?.options) && body.options.length > 0 ? (body.options as OptionLite[]) : DEFAULT_OPTIONS[key]))
      .catch(() => DEFAULT_OPTIONS[key]);
    cache.set(key, pending);
  }
  return pending;
}

/** Drops the cached list so the next read refetches - called after editing a list in Settings. */
export function invalidateOptions(key: OptionListKey) {
  cache.delete(key);
}

/** The editable options for a dropdown, plus helpers to label/colour a stored value (works for values no longer in the list). */
export function useOptions(key: OptionListKey) {
  const [options, setOptions] = useState<OptionLite[]>(DEFAULT_OPTIONS[key]);

  useEffect(() => {
    let live = true;
    load(key).then((loaded) => live && setOptions(loaded));
    return () => {
      live = false;
    };
  }, [key]);

  return {
    options,
    selectOptions: options.map((o) => ({ value: o.value, label: o.label })),
    labelFor: (value: string | null | undefined) => options.find((o) => o.value === value)?.label ?? value ?? "",
    colorsFor: (value: string | null | undefined) => optionBadgeColors(options.find((o) => o.value === value)?.color),
  };
}
