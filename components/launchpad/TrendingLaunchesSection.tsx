"use client";

import { useMemo, useRef } from "react";
import Link from "next/link";
import { FlameIcon, ChevronLeftIcon, ChevronRightIcon } from "@/components/icons";
import Avatar from "@/components/discover/Avatar";
import BoosterBadge from "@/components/BoosterBadge";
import GumiTag from "@/components/GumiTag";
import WalletTag from "@/components/WalletTag";
import { isGumiHandle, getTrendingLaunchpadCoins } from "@/lib/launchpad-data";
import { useLiveLaunchpadCoins } from "@/lib/launchpad-live";
import { formatCompactUsd, formatPct, formatPrice } from "@/lib/format";

export default function TrendingLaunchesSection() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const liveReady = useLiveLaunchpadCoins();
  const trending = useMemo(() => getTrendingLaunchpadCoins(), [liveReady]);

  function scrollBy(direction: 1 | -1) {
    scrollRef.current?.scrollBy({ left: direction * 320, behavior: "smooth" });
  }

  return (
    <section className="border-b border-line px-6 py-10">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FlameIcon className="h-4 w-4 text-goldLight" />
            <h2 className="font-display text-lg uppercase tracking-wider2 text-ivory">Trending Now</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => scrollBy(-1)}
              aria-label="Scroll left"
              className="flex h-8 w-8 items-center justify-center border border-line text-bronze transition-colors hover:border-gold hover:text-goldLight"
            >
              <ChevronLeftIcon className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => scrollBy(1)}
              aria-label="Scroll right"
              className="flex h-8 w-8 items-center justify-center border border-line text-bronze transition-colors hover:border-gold hover:text-goldLight"
            >
              <ChevronRightIcon className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div
          ref={scrollRef}
          className="no-scrollbar mt-5 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2"
        >
          {trending.map((coin) => {
            const positive = coin.change24h >= 0;
            return (
              <Link
                key={coin.id}
                href={`/launchpad/coin/${coin.id}`}
                className="group relative w-[75%] shrink-0 snap-start overflow-hidden border border-gold/50 bg-panel text-left transition-colors hover:border-gold sm:w-[320px]"
              >
                <div className="relative aspect-[4/3] w-full overflow-hidden">
                  <Avatar
                    label={coin.monogram}
                    accent={coin.accent}
                    shape="square"
                    className="h-full w-full text-5xl"
                    src={coin.image ?? undefined}
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-void via-void/20 to-transparent" />
                  <span className="absolute left-3 top-3 font-display text-xl text-ivory text-shadow-gold">
                    {formatCompactUsd(coin.marketCap)}
                  </span>
                  <span
                    className={`absolute right-3 top-3 font-mono text-[10px] uppercase tracking-wider2 ${
                      positive ? "text-emeraldLight" : "text-garnetLight"
                    }`}
                  >
                    {formatPct(coin.change24h)}
                  </span>

                  <div className="absolute inset-x-0 bottom-0 z-10 bg-void/90 px-3 py-1.5">
                    <div className="flex items-center justify-between font-mono text-[9px] uppercase tracking-wider2 text-bronze">
                      <span>Bonding</span>
                      <span className={coin.bondingProgress >= 100 ? "text-emeraldLight" : "text-goldLight"}>
                        {Math.min(100, coin.bondingProgress)}%
                      </span>
                    </div>
                    <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-line">
                      <div
                        className={`h-full rounded-full ${
                          coin.bondingProgress >= 100 ? "bg-emeraldLight" : "bg-gold"
                        }`}
                        style={{ width: `${Math.min(100, coin.bondingProgress)}%` }}
                      />
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <p className="font-display text-sm uppercase tracking-wider2 text-ivory">{coin.name}</p>
                  <p className="mt-1 truncate font-mono text-[10px] uppercase tracking-wider2 text-bronze">
                    ${coin.symbol}
                  </p>
                  <p className="mt-2 h-4 truncate font-body text-xs text-ivory/60">
                    {coin.tagline || "\u00A0"}
                  </p>
                  <div className="mt-1 flex items-end justify-between gap-2">
                    <p className="font-mono text-[10px] text-goldLight">{formatPrice(coin.priceUsd)}</p>
                    <div className="flex shrink-0 flex-col items-end gap-1">
                      <div className="flex h-[15px] items-center">
                        {coin.boost != null && <BoosterBadge value={coin.boost} />}
                      </div>
                      {isGumiHandle(coin.creator) ? (
                        <GumiTag handle={coin.creator} className="max-w-[140px]" />
                      ) : (
                        <WalletTag address={coin.creator} className="max-w-[140px]" />
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
