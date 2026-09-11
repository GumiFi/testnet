"use client";

import { ChartIcon } from "@/components/icons";
import { formatCompactNumber, formatCompactUsd } from "@/lib/format";
import { dexPairs, getDexStats } from "@/lib/dex-data";
import { useLiveDexPairs } from "@/lib/dex-live";

export default function DexHeader() {
  useLiveDexPairs();
  const stats = getDexStats();

  return (
    <section className="border-b border-line px-6 py-10 md:py-14">
      <div className="mx-auto max-w-6xl">
        <div className="animate-fadeUp">
          <span className="font-mono text-xs uppercase tracking-wider3 text-bronze">
            Live pair screener
          </span>
          <div className="mt-3 flex items-center gap-3">
            <ChartIcon className="h-6 w-6 text-goldLight" />
            <h1 className="font-display text-3xl uppercase tracking-wider2 text-ivory text-shadow-gold md:text-4xl">
              Dex
            </h1>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-3 gap-3">
          <div className="border border-line bg-panel px-3 py-3 text-center sm:px-4">
            <p className="font-mono text-[0.5625rem] uppercase tracking-wider2 text-bronze">24H Volume</p>
            <p className="mt-1 font-display text-sm text-ivory sm:text-base">
              {formatCompactUsd(stats.volume24h)}
            </p>
          </div>
          <div className="border border-line bg-panel px-3 py-3 text-center sm:px-4">
            <p className="font-mono text-[0.5625rem] uppercase tracking-wider2 text-bronze">24H Txns</p>
            <p className="mt-1 font-display text-sm text-ivory sm:text-base">
              {formatCompactNumber(stats.txns24h)}
            </p>
          </div>
          <div className="border border-line bg-panel px-3 py-3 text-center sm:px-4">
            <p className="font-mono text-[0.5625rem] uppercase tracking-wider2 text-bronze">Pairs Tracked</p>
            <p className="mt-1 font-display text-sm text-ivory sm:text-base">{dexPairs.length}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
