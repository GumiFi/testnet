"use client";

import { GlobeIcon, XIcon, SendIcon, ChevronDownIcon } from "@/components/icons";

const socialButtons = [
  { label: "Website", Icon: GlobeIcon },
  { label: "X", Icon: XIcon },
  { label: "Telegram", Icon: SendIcon },
];

export default function PairSocialRow({ onAction }: { onAction: (label: string) => void }) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
      {socialButtons.map(({ label, Icon }) => (
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
        onClick={() => onAction("More Links")}
        aria-label="More links"
        className="flex h-7 w-7 shrink-0 items-center justify-center border border-line text-bronze transition-colors hover:border-gold/50 hover:text-goldLight"
      >
        <ChevronDownIcon className="h-3 w-3" />
      </button>
    </div>
  );
}
