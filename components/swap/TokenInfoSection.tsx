"use client";

import Avatar from "@/components/discover/Avatar";
import { ArrowDownIcon, ArrowUpIcon, ChartIcon } from "@/components/icons";
import { formatCompactUsd, formatPct, formatPrice } from "@/lib/format";
import type { SwapToken } from "@/lib/swap-data";

export default function TokenInfoSection({
  token,
  onViewChart,
}: {
  token: SwapToken;
  onViewChart: () => void;
}) {
  const positive = token.change24h >= 0;
  const hasPrice = token.priceUsd > 0;

  return (
    <div className="mx-auto mt-6 w-full max-w-md">
      <div className="rounded-xl border border-line bg-panel px-5 py-5">
        <div className="flex items-center gap-3">
          <Avatar label={token.monogram} accent={token.accent} className="h-9 w-9 text-[10px]" />
          <div className="min-w-0 flex-1">
            <p className="font-display text-sm uppercase tracking-wider2 text-ivory">
              {token.symbol}
            </p>
            <p className="truncate font-mono text-[10px] text-bronze">{token.name}</p>
          </div>
          {hasPrice && (
            <div className="shrink-0 text-right">
              <p className="font-mono text-sm text-ivory">{formatPrice(token.priceUsd)}</p>
              <p
                className={`mt-1 flex items-center justify-end gap-1 font-mono text-[10px] ${
                  positive ? "text-emeraldLight" : "text-garnetLight"
                }`}
              >
                {positive ? (
                  <ArrowUpIcon className="h-2.5 w-2.5" />
                ) : (
                  <ArrowDownIcon className="h-2.5 w-2.5" />
                )}
                {formatPct(token.change24h)}
              </p>
            </div>
          )}
        </div>

        {hasPrice ? (
          <>
            <div className="mt-4 grid grid-cols-3 gap-3 border-t border-line pt-4">
              <Stat label="Liquidity" value={formatCompactUsd(token.liquidity)} />
              <Stat label="24H Volume" value={formatCompactUsd(token.volume24h)} />
              <Stat label="Market Cap" value={formatCompactUsd(token.marketCap)} />
            </div>

            <button
              type="button"
              onClick={onViewChart}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-gold/50 px-4 py-2.5 font-mono text-[10px] uppercase tracking-wider2 text-goldLight transition-colors hover:bg-gold/10"
            >
              <ChartIcon className="h-3.5 w-3.5" />
              View Chart
            </button>
          </>
        ) : (
          <p className="mt-4 border-t border-line pt-4 font-mono text-[10px] uppercase tracking-wider2 text-bronze">
            No market data available for this imported token yet.
          </p>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="font-mono text-[9px] uppercase tracking-wider2 text-bronze">{label}</p>
      <p className="mt-1 font-mono text-xs text-ivory">{value}</p>
    </div>
  );
}
