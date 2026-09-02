"use client";

import { useState } from "react";
import { ShareIcon, CopyIcon, CheckIcon, StarIcon } from "@/components/icons";

function truncateMiddle(value: string, head = 6, tail = 4): string {
  if (value.length <= head + tail + 3) return value;
  return `${value.slice(0, head)}...${value.slice(-tail)}`;
}

export default function CoinActionsRow({
  contractAddress,
  watchlisted,
  onToggleWatchlist,
  onShare,
}: {
  contractAddress: string;
  watchlisted: boolean;
  onToggleWatchlist: () => void;
  onShare: () => void;
}) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(contractAddress);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="flex items-center gap-2 border border-line bg-panel px-3 py-3">
      <button
        type="button"
        onClick={onShare}
        className="flex flex-1 items-center justify-center gap-1.5 border border-gold/50 bg-gold/10 px-3 py-2 font-mono text-[10px] uppercase tracking-wider2 text-goldLight transition-colors hover:bg-gold hover:text-void"
      >
        <ShareIcon className="h-3.5 w-3.5" />
        Share
      </button>
      <button
        type="button"
        onClick={handleCopy}
        className="flex flex-1 items-center justify-center gap-1.5 border border-line px-3 py-2 font-mono text-[10px] text-ivory transition-colors hover:border-gold/50"
      >
        {copied ? (
          <CheckIcon className="h-3.5 w-3.5 text-emeraldLight" />
        ) : (
          <CopyIcon className="h-3.5 w-3.5 text-bronze" />
        )}
        {truncateMiddle(contractAddress)}
      </button>
      <button
        type="button"
        onClick={onToggleWatchlist}
        aria-label="Toggle watchlist"
        className={`flex h-9 w-9 shrink-0 items-center justify-center border transition-colors ${
          watchlisted ? "border-gold bg-gold/10 text-goldLight" : "border-line text-bronze hover:border-gold/40"
        }`}
      >
        <StarIcon className="h-4 w-4" />
      </button>
    </div>
  );
}
