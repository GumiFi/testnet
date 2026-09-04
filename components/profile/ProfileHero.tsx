"use client";

import Avatar from "@/components/discover/Avatar";
import CopyField from "@/components/swap/CopyField";
import { CrownIcon } from "@/components/icons";
import { useWallet } from "@/lib/wallet-context";
import { computeChangePct, type PortfolioSnapshot } from "@/lib/portfolio-history";
import { formatPct, formatUsd } from "@/lib/format";

export default function ProfileHero({
  totalValueUsd,
  history,
  loading,
}: {
  totalValueUsd: number;
  history: PortfolioSnapshot[];
  loading: boolean;
}) {
  const { name, handle, address, monogram, isGumiHolder, avatarUrl } = useWallet();
  const changePctToday = computeChangePct(history, totalValueUsd);
  const positive = changePctToday >= 0;
  const showPlaceholder = loading && totalValueUsd === 0 && history.length === 0;

  return (
    <div className="relative border border-line bg-panel p-5">
      <div className="absolute right-5 top-5 flex flex-col items-end gap-1.5">
        <span
          className={`inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 font-mono text-[8px] uppercase tracking-wider2 ${
            isGumiHolder
              ? "border-gold/60 bg-gold/10 text-goldLight shadow-[0_0_5px_rgba(201,162,39,0.35)]"
              : "border-line text-bronze"
          }`}
        >
          {isGumiHolder && <CrownIcon className="h-2.5 w-2.5" />}
          {isGumiHolder ? "Premium" : "Free Tier"}
        </span>
      </div>

      <div className="flex items-center gap-4 pr-16">
        <Avatar label={monogram ?? ""} accent="gold" src={avatarUrl} className="h-14 w-14 text-sm" />
        <div className="min-w-0 flex-1">
          <p className="truncate font-display text-lg uppercase tracking-wider2 text-ivory">{name}</p>
          <p className="mt-0.5 truncate font-mono text-[10px] text-bronze">{handle}</p>
        </div>
      </div>

      <div className="mt-5 border-t border-line pt-4">
        <p className="font-mono text-[9px] uppercase tracking-wider2 text-bronze">Portfolio Value</p>
        <div className="mt-1 flex items-baseline gap-2">
          <p className="font-display text-2xl text-ivory text-shadow-gold">
            {showPlaceholder ? "—" : formatUsd(totalValueUsd)}
          </p>
          {!showPlaceholder && (
            <span
              className={`font-mono text-[10px] uppercase tracking-wider2 ${
                positive ? "text-emeraldLight" : "text-garnetLight"
              }`}
            >
              {formatPct(changePctToday)} today
            </span>
          )}
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
