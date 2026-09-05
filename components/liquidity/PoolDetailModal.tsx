"use client";

import { useEffect, useState } from "react";
import { CloseIcon, PlusIcon, MinusIcon, RocketIcon } from "@/components/icons";
import Sparkline from "@/components/Sparkline";
import Avatar from "@/components/discover/Avatar";
import {
  accentForAddress,
  chartMetrics,
  getSeriesForMetric,
  monogramFor,
  poolPairLabel,
  type ChartMetric,
  type OnchainPool,
} from "@/lib/pools-onchain";
import { formatCompactUsd } from "@/lib/format";

export default function PoolDetailModal({
  pool,
  onClose,
  onAction,
}: {
  pool: OnchainPool;
  onClose: () => void;
  onAction: (label: string) => void;
}) {
  const [metric, setMetric] = useState<ChartMetric>("tvl");

  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  const series = getSeriesForMetric(pool, metric);
  const positive = series[series.length - 1] >= series[0];

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center md:items-center">
      <div className="absolute inset-0 animate-fadeIn bg-void/80 backdrop-blur-sm" onClick={onClose} />

      <div className="relative max-h-[85vh] w-full overflow-y-auto rounded-t-2xl border-t border-gold/40 bg-panel px-5 py-6 animate-fadeUp md:max-w-md md:rounded-2xl md:border md:border-gold/40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
              <Avatar label={monogramFor(pool.symbol0)} accent={accentForAddress(pool.token0)} className="h-9 w-9 text-[10px]" />
              <Avatar label={monogramFor(pool.symbol1)} accent={accentForAddress(pool.token1)} className="h-9 w-9 text-[10px]" />
            </div>
            <div>
              <h2 className="font-display text-sm uppercase tracking-wider2 text-ivory">
                {poolPairLabel(pool)}
              </h2>
              {pool.isLaunchpad && (
                <span className="mt-1 flex items-center gap-1 font-mono text-[9px] uppercase tracking-wider2 text-goldLight">
                  <RocketIcon className="h-3 w-3" />
                  Launched on Gumifi
                </span>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-line text-bronze transition-colors hover:border-gold hover:text-goldLight"
            aria-label="Close"
          >
            <CloseIcon className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="mt-6 grid grid-cols-3 gap-3 text-center">
          <div>
            <p className="font-display text-lg text-goldLight md:text-xl">
              {pool.tvlUsd !== null ? formatCompactUsd(pool.tvlUsd) : "—"}
            </p>
            <p className="mt-1 font-mono text-[9px] uppercase tracking-wider2 text-bronze">
              Total Liquidity
            </p>
          </div>
          <div>
            <p className="font-display text-lg text-goldLight md:text-xl">
              {pool.aprPct !== null ? `${pool.aprPct.toFixed(2)}%` : "—"}
            </p>
            <p className="mt-1 font-mono text-[9px] uppercase tracking-wider2 text-bronze">APR</p>
          </div>
          <div>
            <p className="font-display text-lg text-goldLight md:text-xl">
              {pool.volume24hUsd !== null ? formatCompactUsd(pool.volume24hUsd) : "—"}
            </p>
            <p className="mt-1 font-mono text-[9px] uppercase tracking-wider2 text-bronze">24H Volume</p>
          </div>
        </div>

        <div className="mt-6 border border-line bg-panel2 p-4">
          <div className="flex items-center gap-2">
            {chartMetrics.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setMetric(item.id)}
                className={`rounded-full border px-3 py-1 font-mono text-[10px] uppercase tracking-wider2 transition-colors ${
                  metric === item.id
                    ? "border-gold bg-gold/10 text-goldLight"
                    : "border-line text-bronze hover:border-gold/40 hover:text-ivory"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
          <Sparkline values={series} positive={positive} className="mt-4 h-16 w-full" />
        </div>

        <div className="mt-3 flex items-center justify-between font-mono text-[10px] uppercase tracking-wider2 text-bronze">
          <span>24H Fees</span>
          <span className="text-ivory">{pool.fees24hUsd !== null ? formatCompactUsd(pool.fees24hUsd) : "—"}</span>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => onAction("Add Liquidity")}
            className="flex items-center justify-center gap-2 border border-gold px-4 py-2.5 font-mono text-[11px] uppercase tracking-wider2 text-goldLight transition-colors hover:bg-gold hover:text-void"
          >
            <PlusIcon className="h-3.5 w-3.5" />
            Add Liquidity
          </button>
          <button
            type="button"
            onClick={() => onAction("Remove Liquidity")}
            className="flex items-center justify-center gap-2 border border-line px-4 py-2.5 font-mono text-[11px] uppercase tracking-wider2 text-bronze transition-colors hover:border-garnetLight/50 hover:text-garnetLight"
          >
            <MinusIcon className="h-3.5 w-3.5" />
            Remove Liquidity
          </button>
        </div>
      </div>
    </div>
  );
}
