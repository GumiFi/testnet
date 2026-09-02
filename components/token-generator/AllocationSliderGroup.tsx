"use client";

import AllocationDonutChart from "./AllocationDonutChart";
import { rebalanceAllocation, type AllocationRow } from "@/lib/token-generator-data";

export default function AllocationSliderGroup({
  rows,
  onChange,
  centerLabel,
  centerSubLabel,
  size,
}: {
  rows: AllocationRow[];
  onChange: (next: AllocationRow[]) => void;
  centerLabel?: string;
  centerSubLabel?: string;
  size?: number;
}) {
  return (
    <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
      <AllocationDonutChart rows={rows} centerLabel={centerLabel} centerSubLabel={centerSubLabel} size={size} />

      <div className="w-full flex-1 space-y-4">
        {rows.map((row) => (
          <div key={row.id}>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider2 text-ivory">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: row.color }} />
                {row.label}
              </span>
              <span className="font-mono text-[10px] text-goldLight">{row.pct.toFixed(1)}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              step={0.5}
              value={row.pct}
              onChange={(event) => onChange(rebalanceAllocation(rows, row.id, parseFloat(event.target.value)))}
              style={{ accentColor: row.color }}
              className="mt-2 w-full cursor-pointer"
              aria-label={`${row.label} allocation`}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
