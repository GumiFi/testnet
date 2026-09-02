"use client";

import { MinusIcon, PlusIcon } from "@/components/icons";

export default function Stepper({
  value,
  min,
  max,
  step = 1,
  onChange,
  suffix = "",
}: {
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (next: number) => void;
  suffix?: string;
}) {
  return (
    <div className="flex items-center rounded-lg border border-line bg-panel">
      <button
        type="button"
        onClick={() => onChange(Math.max(min, Math.round((value - step) * 100) / 100))}
        aria-label="Decrease"
        className="flex h-9 w-9 shrink-0 items-center justify-center text-bronze transition-colors hover:text-goldLight"
      >
        <MinusIcon className="h-3 w-3" />
      </button>
      <span className="flex-1 text-center font-mono text-xs text-ivory">
        {value}
        {suffix}
      </span>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, Math.round((value + step) * 100) / 100))}
        aria-label="Increase"
        className="flex h-9 w-9 shrink-0 items-center justify-center text-bronze transition-colors hover:text-goldLight"
      >
        <PlusIcon className="h-3 w-3" />
      </button>
    </div>
  );
}
