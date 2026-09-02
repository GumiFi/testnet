"use client";

import { GridIcon, TableIcon } from "@/components/icons";

export type ViewMode = "grid" | "table";

export default function DisplaySettingsPanel({
  viewMode,
  onViewModeChange,
  animationsEnabled,
  onAnimationsChange,
}: {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  animationsEnabled: boolean;
  onAnimationsChange: (enabled: boolean) => void;
}) {
  return (
    <div className="absolute right-0 top-full z-30 mt-2 w-60 border border-line bg-panel p-4 shadow-lg shadow-void/60">
      <p className="font-mono text-[9px] uppercase tracking-wider2 text-bronze">Layout</p>
      <div className="mt-2 flex items-center gap-2">
        <button
          type="button"
          onClick={() => onViewModeChange("grid")}
          className={`flex flex-1 items-center justify-center gap-1.5 border py-2 font-mono text-[10px] uppercase tracking-wider2 transition-colors ${
            viewMode === "grid"
              ? "border-gold bg-gold/10 text-goldLight"
              : "border-line text-bronze hover:border-gold/40 hover:text-ivory"
          }`}
        >
          <GridIcon className="h-3.5 w-3.5" />
          Grid
        </button>
        <button
          type="button"
          onClick={() => onViewModeChange("table")}
          className={`flex flex-1 items-center justify-center gap-1.5 border py-2 font-mono text-[10px] uppercase tracking-wider2 transition-colors ${
            viewMode === "table"
              ? "border-gold bg-gold/10 text-goldLight"
              : "border-line text-bronze hover:border-gold/40 hover:text-ivory"
          }`}
        >
          <TableIcon className="h-3.5 w-3.5" />
          Table
        </button>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-line pt-4">
        <p className="font-mono text-[10px] uppercase tracking-wider2 text-ivory">Animations</p>
        <button
          type="button"
          role="switch"
          aria-checked={animationsEnabled}
          onClick={() => onAnimationsChange(!animationsEnabled)}
          className={`relative h-5 w-9 shrink-0 rounded-full border transition-colors ${
            animationsEnabled ? "border-gold bg-gold/30" : "border-line bg-void"
          }`}
        >
          <span
            className={`absolute top-0.5 h-3.5 w-3.5 rounded-full bg-goldLight transition-all ${
              animationsEnabled ? "left-4" : "left-0.5"
            }`}
          />
        </button>
      </div>
    </div>
  );
}
