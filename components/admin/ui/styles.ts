/**
 * Shared class presets for every admin screen.
 *
 * Why these live in one file: the admin panel is meant to read as a single
 * application (see the admin conventions), but buttons/inputs/cards were
 * previously restyled inline on each page with slightly different radii,
 * borders and paddings. Importing these constants instead means a visual
 * change happens once, here, rather than in twenty files.
 */
import { cn } from "@/lib/utils";

export const BRAND = {
  blue: "#1A14A5",
  blueDark: "#0e0a7a",
  dark: "#231F20",
  bg: "#F4F7FE",
} as const;

/* ───────────────────────── buttons ───────────────────────── */

const btnBase =
  "inline-flex items-center justify-center gap-1.5 rounded-xl text-sm font-semibold transition disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A14A5]/40 focus-visible:ring-offset-1";

export const btnSize = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-4 py-2",
  lg: "px-5 py-2.5",
} as const;

export const btnPrimary = cn(btnBase, btnSize.md, "bg-[#1A14A5] text-white hover:bg-[#0e0a7a] shadow-sm");
export const btnSecondary = cn(
  btnBase,
  btnSize.md,
  "border border-[#1A14A5]/15 bg-white text-[#231F20] hover:bg-[#F4F7FE]"
);
export const btnGhost = cn(btnBase, btnSize.md, "text-[#231F20]/60 hover:bg-[#F4F7FE] hover:text-[#1A14A5]");
export const btnDanger = cn(btnBase, btnSize.md, "bg-red-600 text-white hover:bg-red-700 shadow-sm");
export const btnDangerOutline = cn(
  btnBase,
  btnSize.md,
  "border border-red-200 bg-white text-red-600 hover:bg-red-50"
);

/* ───────────────────────── form controls ───────────────────────── */

export const inputBase =
  "w-full rounded-xl border border-[#1A14A5]/15 bg-white px-3 py-2 text-sm text-[#231F20] placeholder:text-[#231F20]/35 outline-none transition focus:border-[#1A14A5]/50 focus:ring-2 focus:ring-[#1A14A5]/10 disabled:bg-[#F4F7FE] disabled:text-[#231F20]/50";

export const inputInvalid = "border-red-300 focus:border-red-400 focus:ring-red-100";

export const labelBase = "block text-xs font-semibold uppercase tracking-wide text-[#231F20]/55";

/* ───────────────────────── surfaces ───────────────────────── */

export const cardBase = "rounded-2xl border border-[#1A14A5]/10 bg-white shadow-sm";
export const cardPad = "p-5 sm:p-6";

/** Soft informational strip used for hints inside forms and cards. */
export const hintBox = "rounded-xl bg-[#F4F7FE] px-3 py-2 text-xs text-[#231F20]/60";
