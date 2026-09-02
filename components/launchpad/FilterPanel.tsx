"use client";

import { useState } from "react";
import RangeSlider from "./RangeSlider";
import { MCAP_FILTER_MAX, MCAP_FILTER_MIN, VOLUME_FILTER_MAX, VOLUME_FILTER_MIN } from "@/lib/launchpad-data";
import { formatCompactUsd } from "@/lib/format";

export type FilterRange = {
  mcapMin: number;
  mcapMax: number;
  volMin: number;
  volMax: number;
};

export const DEFAULT_FILTER_RANGE: FilterRange = {
  mcapMin: MCAP_FILTER_MIN,
  mcapMax: MCAP_FILTER_MAX,
  volMin: VOLUME_FILTER_MIN,
  volMax: VOLUME_FILTER_MAX,
};

function boundLabel(value: number, max: number): string {
  return value >= max ? `${formatCompactUsd(value)}+` : formatCompactUsd(value);
}

export default function FilterPanel({
  applied,
  onApply,
  onClose,
}: {
  applied: FilterRange;
  onApply: (range: FilterRange) => void;
  onClose: () => void;
}) {
  const [draft, setDraft] = useState<FilterRange>(applied);

  return (
    <div className="absolute right-0 top-full z-30 mt-2 w-72 border border-line bg-panel p-4 shadow-lg shadow-void/60">
      <div className="flex items-center justify-between">
        <p className="font-mono text-[9px] uppercase tracking-wider2">
          <span className="text-goldLight">Mcap</span>
        </p>
        <p className="font-mono text-[9px] uppercase tracking-wider2 text-bronze">
          {boundLabel(draft.mcapMin, MCAP_FILTER_MAX)} - {boundLabel(draft.mcapMax, MCAP_FILTER_MAX)}
        </p>
      </div>
      <div className="mt-3">
        <RangeSlider
          min={MCAP_FILTER_MIN}
          max={MCAP_FILTER_MAX}
          valueMin={draft.mcapMin}
          valueMax={draft.mcapMax}
          onChange={([mcapMin, mcapMax]) => setDraft((prev) => ({ ...prev, mcapMin, mcapMax }))}
        />
      </div>
      <div className="mt-3 flex items-center gap-2">
        <input
          type="text"
          inputMode="numeric"
          placeholder="e.g., 10k, 1m"
          value={draft.mcapMin ? String(draft.mcapMin) : ""}
          onChange={(event) => {
            const next = Number(event.target.value.replace(/[^0-9]/g, "")) || 0;
            setDraft((prev) => ({ ...prev, mcapMin: Math.min(next, prev.mcapMax) }));
          }}
          className="w-full border border-line bg-void px-2 py-1.5 font-mono text-[10px] text-ivory placeholder:text-bronze/60 focus:outline-none focus:border-gold/60"
        />
        <span className="text-bronze">–</span>
        <input
          type="text"
          inputMode="numeric"
          placeholder="e.g., 10k, 1m"
          value={draft.mcapMax < MCAP_FILTER_MAX ? String(draft.mcapMax) : ""}
          onChange={(event) => {
            const raw = event.target.value.replace(/[^0-9]/g, "");
            const next = raw ? Number(raw) : MCAP_FILTER_MAX;
            setDraft((prev) => ({ ...prev, mcapMax: Math.max(next, prev.mcapMin) }));
          }}
          className="w-full border border-line bg-void px-2 py-1.5 font-mono text-[10px] text-ivory placeholder:text-bronze/60 focus:outline-none focus:border-gold/60"
        />
      </div>

      <div className="mt-5 flex items-center justify-between">
        <p className="font-mono text-[9px] uppercase tracking-wider2 text-goldLight">24h Vol</p>
        <p className="font-mono text-[9px] uppercase tracking-wider2 text-bronze">
          {boundLabel(draft.volMin, VOLUME_FILTER_MAX)} - {boundLabel(draft.volMax, VOLUME_FILTER_MAX)}
        </p>
      </div>
      <div className="mt-3">
        <RangeSlider
          min={VOLUME_FILTER_MIN}
          max={VOLUME_FILTER_MAX}
          valueMin={draft.volMin}
          valueMax={draft.volMax}
          onChange={([volMin, volMax]) => setDraft((prev) => ({ ...prev, volMin, volMax }))}
        />
      </div>
      <div className="mt-3 flex items-center gap-2">
        <input
          type="text"
          inputMode="numeric"
          placeholder="e.g., 5k, 100k"
          value={draft.volMin ? String(draft.volMin) : ""}
          onChange={(event) => {
            const next = Number(event.target.value.replace(/[^0-9]/g, "")) || 0;
            setDraft((prev) => ({ ...prev, volMin: Math.min(next, prev.volMax) }));
          }}
          className="w-full border border-line bg-void px-2 py-1.5 font-mono text-[10px] text-ivory placeholder:text-bronze/60 focus:outline-none focus:border-gold/60"
        />
        <span className="text-bronze">–</span>
        <input
          type="text"
          inputMode="numeric"
          placeholder="e.g., 5k, 100k"
          value={draft.volMax < VOLUME_FILTER_MAX ? String(draft.volMax) : ""}
          onChange={(event) => {
            const raw = event.target.value.replace(/[^0-9]/g, "");
            const next = raw ? Number(raw) : VOLUME_FILTER_MAX;
            setDraft((prev) => ({ ...prev, volMax: Math.max(next, prev.volMin) }));
          }}
          className="w-full border border-line bg-void px-2 py-1.5 font-mono text-[10px] text-ivory placeholder:text-bronze/60 focus:outline-none focus:border-gold/60"
        />
      </div>

      <div className="mt-5 flex items-center gap-2">
        <button
          type="button"
          onClick={() => {
            setDraft(DEFAULT_FILTER_RANGE);
            onApply(DEFAULT_FILTER_RANGE);
            onClose();
          }}
          className="flex-1 border border-line py-2 font-mono text-[10px] uppercase tracking-wider2 text-bronze transition-colors hover:border-gold/40 hover:text-ivory"
        >
          Clear
        </button>
        <button
          type="button"
          onClick={() => {
            onApply(draft);
            onClose();
          }}
          className="flex-1 border border-gold bg-gold/10 py-2 font-mono text-[10px] uppercase tracking-wider2 text-goldLight transition-colors hover:bg-gold/20"
        >
          Apply
        </button>
      </div>
    </div>
  );
}
