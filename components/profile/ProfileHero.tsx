"use client";

import Avatar from "@/components/discover/Avatar";
import CopyField from "@/components/swap/CopyField";
import { useWallet } from "@/lib/wallet-context";
import { getAssetsWithValue, getPortfolioSummary } from "@/lib/portfolio-data";
import { formatPct, formatUsd } from "@/lib/format";

export default function ProfileHero() {
  const { name, handle, address, monogram } = useWallet();
  const { totalValueUsd, changePctToday } = getPortfolioSummary(getAssetsWithValue());
  const positive = changePctToday >= 0;

  return (
    <div className="border border-line bg-panel p-5">
      <div className="flex items-center gap-4">
        <Avatar label={monogram ?? ""} accent="gold" className="h-14 w-14 text-sm" />
        <div className="min-w-0 flex-1">
          <p className="truncate font-display text-lg uppercase tracking-wider2 text-ivory">{name}</p>
          <p className="mt-0.5 truncate font-mono text-[10px] text-bronze">{handle}</p>
        </div>
      </div>

      <div className="mt-5 border-t border-line pt-4">
        <p className="font-mono text-[9px] uppercase tracking-wider2 text-bronze">Portfolio Value</p>
        <div className="mt-1 flex items-baseline gap-2">
          <p className="font-display text-2xl text-ivory text-shadow-gold">{formatUsd(totalValueUsd)}</p>
          <span
            className={`font-mono text-[10px] uppercase tracking-wider2 ${
              positive ? "text-emeraldLight" : "text-garnetLight"
            }`}
          >
            {formatPct(changePctToday)} today
          </span>
        </div>
      </div>

      {address && (
        <div className="mt-4 border border-line">
          <CopyField label="Wallet Address" value={address} isLast />
        </div>
      )}
    </div>
  );
}
