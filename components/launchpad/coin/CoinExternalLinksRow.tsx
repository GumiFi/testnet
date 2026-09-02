"use client";

import { CompassIcon, BoltIcon, RocketIcon, FlagIcon } from "@/components/icons";

const externalTools = [
  { label: "GumiScan", Icon: CompassIcon },
  { label: "GumiSignal", Icon: BoltIcon },
  { label: "GumiPilot", Icon: RocketIcon },
];

export default function CoinExternalLinksRow({ onAction }: { onAction: (label: string) => void }) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
      {externalTools.map(({ label, Icon }) => (
        <button
          key={label}
          type="button"
          onClick={() => onAction(label)}
          className="flex shrink-0 items-center gap-1.5 border border-line px-3 py-1.5 font-mono text-[9px] uppercase tracking-wider2 text-bronze transition-colors hover:border-gold/50 hover:text-goldLight"
        >
          <Icon className="h-3 w-3" />
          {label}
        </button>
      ))}
      <button
        type="button"
        onClick={() => onAction("Report Coin")}
        aria-label="Report coin"
        className="flex h-7 w-7 shrink-0 items-center justify-center border border-line text-bronze transition-colors hover:border-garnetLight/60 hover:text-garnetLight"
      >
        <FlagIcon className="h-3 w-3" />
      </button>
    </div>
  );
}
