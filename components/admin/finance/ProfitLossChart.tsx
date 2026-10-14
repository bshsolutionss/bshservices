"use client";

import { useState } from "react";
import { formatMoney } from "@/lib/invoices";
import type { MonthlyPL } from "@/lib/finance";

/**
 * Revenue vs. expenses per month, with the profit line over the top.
 *
 * All three series are the same measure (PKR), so they share one y-axis —
 * never a second scale. Colors are a CVD-validated triple (indigo / rose /
 * teal): adjacent-pair separation, lightness band, chroma floor and contrast
 * against a white card all pass. Identity is never carried by color alone —
 * there is a legend, and the P&L table underneath is the table view of this
 * same data.
 */
const COLORS = {
  revenue: "#5B4BE8",
  expenses: "#E11D48",
  profit: "#0D9488",
} as const;

const WIDTH = 880;
const HEIGHT = 300;
const PADDING = { top: 16, right: 16, bottom: 34, left: 68 };

function niceCeil(value: number): number {
  if (value <= 0) return 1;
  const magnitude = 10 ** Math.floor(Math.log10(value));
  const normalized = value / magnitude;
  const step = normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 2.5 ? 2.5 : normalized <= 5 ? 5 : 10;
  return step * magnitude;
}

/** Compact axis labels — "PKR 1.2M" beats a nine-digit tick. */
function compact(value: number): string {
  const abs = Math.abs(value);
  if (abs >= 1_000_000) return `${(value / 1_000_000).toFixed(abs >= 10_000_000 ? 0 : 1)}M`;
  if (abs >= 1_000) return `${(value / 1_000).toFixed(abs >= 10_000 ? 0 : 1)}k`;
  return String(Math.round(value));
}

export default function ProfitLossChart({ months }: { months: MonthlyPL[] }) {
  const [hovered, setHovered] = useState<number | null>(null);

  if (months.length === 0) return null;

  const maxValue = Math.max(
    1,
    ...months.map((m) => Math.max(m.revenue, m.expenses, m.profit))
  );
  const minProfit = Math.min(0, ...months.map((m) => m.profit));

  const top = niceCeil(maxValue);
  const bottom = minProfit < 0 ? -niceCeil(Math.abs(minProfit)) : 0;
  const span = top - bottom || 1;

  const plotWidth = WIDTH - PADDING.left - PADDING.right;
  const plotHeight = HEIGHT - PADDING.top - PADDING.bottom;
  const bandWidth = plotWidth / months.length;

  const y = (value: number) => PADDING.top + ((top - value) / span) * plotHeight;
  const zeroY = y(0);

  // Two bars per month with a 2px surface gap between them, inset from the band edges.
  const groupInset = Math.min(bandWidth * 0.18, 14);
  const barArea = bandWidth - groupInset * 2;
  const barWidth = Math.max(4, (barArea - 2) / 2);

  const ticks = [0, 0.25, 0.5, 0.75, 1].map((fraction) => bottom + span * fraction);

  const centerX = (index: number) => PADDING.left + bandWidth * index + bandWidth / 2;

  // A hand-picked range can be up to 60 months wide, at which point every
  // month label would collide — show every nth instead (the first and last
  // are always kept, and the tooltip names the exact month anyway).
  const labelEvery = Math.ceil(months.length / 14);
  const showLabel = (index: number) =>
    labelEvery === 1 || index === 0 || index === months.length - 1 || index % labelEvery === 0;
  const profilePoints = months.map((m, index) => `${centerX(index)},${y(m.profit)}`).join(" ");

  const active = hovered !== null ? months[hovered] : null;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-[#231F20]/60">
        <LegendChip color={COLORS.revenue} label="Revenue" />
        <LegendChip color={COLORS.expenses} label="Expenses" />
        <LegendChip color={COLORS.profit} label="Profit" shape="line" />
        <span className="ml-auto font-normal text-[#231F20]/40">All figures converted to PKR</span>
      </div>

      <div className="relative">
        <svg
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          className="h-auto w-full"
          role="img"
          aria-label="Monthly revenue, expenses and profit"
          onMouseLeave={() => setHovered(null)}
        >
          {/* Recessive grid + value axis */}
          {ticks.map((tick) => (
            <g key={tick}>
              <line
                x1={PADDING.left}
                x2={WIDTH - PADDING.right}
                y1={y(tick)}
                y2={y(tick)}
                stroke={tick === 0 ? "#231F20" : "#1A14A5"}
                strokeOpacity={tick === 0 ? 0.18 : 0.07}
                strokeWidth={1}
              />
              <text
                x={PADDING.left - 10}
                y={y(tick) + 4}
                textAnchor="end"
                className="fill-[#231F20]/40"
                fontSize={11}
              >
                {compact(tick)}
              </text>
            </g>
          ))}

          {months.map((month, index) => {
            const isActive = hovered === index;
            return (
              <g key={month.month}>
                {/* Hover band — a hit target wider than the marks themselves. */}
                <rect
                  x={PADDING.left + bandWidth * index}
                  y={PADDING.top}
                  width={bandWidth}
                  height={plotHeight}
                  fill={isActive ? "#1A14A5" : "transparent"}
                  fillOpacity={isActive ? 0.04 : 0}
                  onMouseEnter={() => setHovered(index)}
                />
                <rect
                  x={PADDING.left + bandWidth * index + groupInset}
                  y={y(month.revenue)}
                  width={barWidth}
                  height={Math.max(zeroY - y(month.revenue), 0)}
                  rx={4}
                  fill={COLORS.revenue}
                  fillOpacity={hovered === null || isActive ? 1 : 0.45}
                  pointerEvents="none"
                />
                <rect
                  x={PADDING.left + bandWidth * index + groupInset + barWidth + 2}
                  y={y(month.expenses)}
                  width={barWidth}
                  height={Math.max(zeroY - y(month.expenses), 0)}
                  rx={4}
                  fill={COLORS.expenses}
                  fillOpacity={hovered === null || isActive ? 1 : 0.45}
                  pointerEvents="none"
                />
                {(showLabel(index) || isActive) && (
                  <text
                    x={centerX(index)}
                    y={HEIGHT - 12}
                    textAnchor="middle"
                    fontSize={11}
                    className={isActive ? "fill-[#231F20] font-semibold" : "fill-[#231F20]/45"}
                  >
                    {month.label}
                  </text>
                )}
              </g>
            );
          })}

          {/* Profit line last, so it reads on top of the bars. 2px stroke with a surface ring on each marker. */}
          {months.length > 1 && (
            <polyline
              points={profilePoints}
              fill="none"
              stroke={COLORS.profit}
              strokeWidth={2}
              strokeLinejoin="round"
              strokeLinecap="round"
              pointerEvents="none"
            />
          )}
          {months.map((month, index) => (
            <circle
              key={`point-${month.month}`}
              cx={centerX(index)}
              cy={y(month.profit)}
              r={hovered === index ? 6 : 4.5}
              fill={COLORS.profit}
              stroke="#ffffff"
              strokeWidth={2}
              pointerEvents="none"
            />
          ))}
        </svg>

        {active && (
          <div
            className="pointer-events-none absolute top-2 z-10 w-44 -translate-x-1/2 rounded-xl border border-[#1A14A5]/10 bg-white p-3 shadow-lg"
            // Clamped so the tooltip for the first/last month stays inside the card.
            style={{ left: `${Math.min(Math.max((centerX(hovered!) / WIDTH) * 100, 12), 88)}%` }}
          >
            <p className="text-xs font-bold text-[#231F20]">{active.label}</p>
            <dl className="mt-1.5 space-y-1 text-xs">
              <TooltipRow color={COLORS.revenue} label="Revenue" value={formatMoney(active.revenue, "PKR")} />
              <TooltipRow color={COLORS.expenses} label="Expenses" value={formatMoney(active.expenses, "PKR")} />
              <TooltipRow color={COLORS.profit} label="Profit" value={formatMoney(active.profit, "PKR")} />
            </dl>
            {active.margin !== null && (
              <p className="mt-1.5 border-t border-[#1A14A5]/10 pt-1.5 text-xs text-[#231F20]/50">
                Margin {active.margin}%
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function LegendChip({ color, label, shape = "bar" }: { color: string; label: string; shape?: "bar" | "line" }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        aria-hidden
        className={shape === "line" ? "h-0.5 w-4 rounded-full" : "h-3 w-3 rounded-[3px]"}
        style={{ backgroundColor: color }}
      />
      {label}
    </span>
  );
}

function TooltipRow({ color, label, value }: { color: string; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <dt className="inline-flex items-center gap-1.5 text-[#231F20]/55">
        <span aria-hidden className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
        {label}
      </dt>
      <dd className="font-semibold text-[#231F20]">{value}</dd>
    </div>
  );
}
