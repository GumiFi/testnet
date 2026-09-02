"use client";

import { ChartIcon, GridIcon } from "@/components/icons";

const dexLinks = [
  { label: "Gumifi Charts", Icon: ChartIcon },
  { label: "Gumifi Terminal", Icon: GridIcon },
];

export default function CoinDexLinksRow({ onAction }: { onAction: (label: string) => void }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {dexLinks.map(({ label, Icon }) => (
        <button
          key={label}
          type="button"
          onClick={() => onAction(label)}
          className="flex items-center justify-center gap-2 border border-line px-3 py-2.5 font-mono text-[10px] uppercase tracking-wider2 text-bronze transition-colors hover:border-gold/40 hover:text-ivory"
        >
          <Icon className="h-3.5 w-3.5" />
          {label}
        </button>
      ))}
    </div>
  );
}
