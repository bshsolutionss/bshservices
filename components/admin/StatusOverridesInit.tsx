"use client";

import { applyStatusOverrides, type StatusOverrideRow } from "@/lib/status-config";

/**
 * Applies the custom status names/colours in the browser, during render, so it
 * runs before the page content that reads them (it is placed ahead of the page
 * in the admin layout). Renders nothing.
 */
export default function StatusOverridesInit({ rows }: { rows: StatusOverrideRow[] }) {
  applyStatusOverrides(rows);
  return null;
}
