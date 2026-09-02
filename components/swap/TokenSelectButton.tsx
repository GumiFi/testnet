"use client";

import Avatar from "@/components/discover/Avatar";
import { ChevronDownIcon } from "@/components/icons";
import type { SwapToken } from "@/lib/swap-data";

export default function TokenSelectButton({
  token,
  onClick,
}: {
  token: SwapToken;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex shrink-0 items-center gap-2 rounded-lg border border-gold/40 bg-panel px-2.5 py-2 transition-colors hover:border-gold"
    >
      <Avatar label={token.monogram} accent={token.accent} className="h-6 w-6 text-[9px]" />
      <span className="font-display text-sm uppercase tracking-wider2 text-ivory">
        {token.symbol}
      </span>
      <ChevronDownIcon className="h-3.5 w-3.5 shrink-0 text-bronze" />
    </button>
  );
}
