"use client";

import { useMemo, useState } from "react";
import { FlameIcon, ArrowUpIcon, ArrowDownIcon } from "@/components/icons";
import Sparkline from "@/components/Sparkline";
import BoosterBadge from "@/components/BoosterBadge";
import FilterChips from "./FilterChips";
import Avatar from "./Avatar";
import { discoverTokens, type DiscoverToken } from "@/lib/discover-data";
import { formatCompactUsd, formatPct, formatPrice } from "@/lib/format";

const trendingFilters = ["Trending", "New", "Gainers", "Volume"] as const;
type TrendingFilter = (typeof trendingFilters)[number];

function sortTokens(tokens: DiscoverToken[], filter: TrendingFilter): DiscoverToken[] {
  const list = [...tokens];
  switch (filter) {
    case "New":
      return list.filter((token) => token.isNew).sort((a, b) => b.trendScore - a.trendScore);
    case "Gainers":
      return list.sort((a, b) => b.change24h - a.change24h);
    case "Volume":
      return list.sort((a, b) => b.volume24h - a.volume24h);
    default:
      return list.sort((a, b) => b.trendScore - a.trendScore);
  }
}

export default function TrendingSection({
  onAction,
}: {
  onAction: (label: string) => void;
}) {
  const [filter, setFilter] = useState<TrendingFilter>("Trending");
  const tokens = useMemo(() => sortTokens(discoverTokens, filter).slice(0, 6), [filter]);

  return (
    <section className="border-b border-line px-6 py-10">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-center gap-2">
          <FlameIcon className="h-4 w-4 text-goldLight" />
          <h2 className="font-display text-lg uppercase tracking-wider2 text-ivory">Trending</h2>
        </div>

        <div className="mt-4">
          <FilterChips options={trendingFilters} active={filter} onChange={setFilter} />
        </div>

        <div className="mt-5 border border-line bg-panel">
          {tokens.length === 0 ? (
            <p className="px-4 py-8 text-center font-mono text-xs uppercase tracking-wider2 text-bronze">
              No tokens in this filter yet
            </p>
          ) : (
            tokens.map((token) => {
              const positive = token.change24h >= 0;
              return (
                <button
                  key={token.id}
                  type="button"
                  onClick={() => onAction(token.symbol)}
                  className="flex w-full items-center gap-3 border-b border-line px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-panel2"
                >
                  <Avatar label={token.monogram} accent={token.accent} className="h-10 w-10 text-[11px]" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline gap-2">
                      <span className="font-display text-sm uppercase tracking-wider2 text-ivory">
                        {token.symbol}
                      </span>
                      <span className="truncate font-body text-xs text-bronze">{token.name}</span>
                      {token.boost != null && <BoosterBadge value={token.boost} className="self-center" />}
                    </div>
                    <p className="mt-1 truncate font-mono text-[10px] uppercase tracking-wider2 text-bronze">
                      MC {formatCompactUsd(token.marketCap)} · VOL {formatCompactUsd(token.volume24h)} · LIQ{" "}
                      {formatCompactUsd(token.liquidity)}
                    </p>
                  </div>
                  <Sparkline
                    values={token.sparkline}
                    positive={positive}
                    className="hidden h-8 w-16 shrink-0 sm:block"
                  />
                  <div className="shrink-0 text-right">
                    <p className="font-mono text-xs text-ivory">{formatPrice(token.priceUsd)}</p>
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
                </button>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
}
