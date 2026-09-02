"use client";

import type { AllocationRow } from "@/lib/token-generator-data";

export default function AllocationDonutChart({
  rows,
  size = 168,
  centerLabel,
  centerSubLabel,
}: {
  rows: AllocationRow[];
  size?: number;
  centerLabel?: string;
  centerSubLabel?: string;
}) {
  let cursor = 0;
  const stops = rows
    .map((row) => {
      const start = cursor;
      cursor += row.pct;
      return `${row.color} ${start}% ${cursor}%`;
    })
    .join(", ");

  return (
    <div
      className="relative shrink-0 rounded-full shadow-[0_0_40px_rgba(201,162,39,0.18)]"
      style={{ width: size, height: size, background: `conic-gradient(${stops})` }}
    >
      <div
        className="absolute rounded-full border border-line bg-panel"
        style={{ inset: `${size * 0.16}px` }}
      >
        <div className="flex h-full w-full flex-col items-center justify-center">
          {centerLabel && (
            <span className="font-display text-lg uppercase tracking-wider2 text-ivory">{centerLabel}</span>
          )}
          {centerSubLabel && (
            <span className="mt-1 font-mono text-[9px] uppercase tracking-wider2 text-bronze">
              {centerSubLabel}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
