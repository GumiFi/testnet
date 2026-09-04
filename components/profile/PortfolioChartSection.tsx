"use client";

import { useMemo, useState } from "react";
import Sparkline from "@/components/Sparkline";
import { filterHistoryByRange, type PortfolioSnapshot } from "@/lib/portfolio-history";
import { formatPct } from "@/lib/format";

const portfolioRanges = ["1D", "1W", "1M", "1Y", "ALL"] as const;
type PortfolioRange = (typeof portfolioRanges)[number];

const RANGE_MS: Record<PortfolioRange, number | null> = {
  "1D": 24 * 60 * 60 * 1000,
  "1W": 7 * 24 * 60 * 60 * 1000,
  "1M": 30 * 24 * 60 * 60 * 1000,
  "1Y": 365 * 24 * 60 * 60 * 1000,
  ALL: null,
};

export default function PortfolioChartSection({
  currentValueUsd,
  history,
  loading,
}: {
  currentValueUsd: number;
  history: PortfolioSnapshot[];
  loading: boolean;
}) {
  const [range, setRange] = useState<PortfolioRange>("1D");

  const points = useMemo(() => filterHistoryByRange(history, RANGE_MS[range]), [history, range]);
  const hasTrend = points.length > 1;
  const series = hasTrend ? points.map((point) => point.valueUsd) : [currentValueUsd, currentValueUsd];
  const positive = series[series.length - 1] >= series[0];
  const deltaPct = series[0] === 0 ? 0 : ((series[series.length - 1] - series[0]) / series[0]) * 100;

  return (
    <div className="border border-line bg-panel p-4">
      <div className="flex items-center justify-between">
        <p className="font-mono text-[10px] uppercase tracking-wider2 text-bronze">Value Trend</p>
        <p
          className={`font-mono text-[10px] uppercase tracking-wider2 ${
            positive ? "text-emeraldLight" : "text-garnetLight"
          }`}
        >
          {hasTrend ? `${formatPct(deltaPct)} (${range})` : loading ? "Loading" : "Collecting data"}
        </p>
      </div>

      <Sparkline values={series} positive={positive} className="mt-4 h-24 w-full" />

      <div className="mt-4 flex items-center gap-2">
        {portfolioRanges.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setRange(item)}
            className={`rounded-full border px-3 py-1 font-mono text-[10px] uppercase tracking-wider2 transition-colors ${
              range === item
                ? "border-gold bg-gold/10 text-goldLight"
                : "border-line text-bronze hover:border-gold/40 hover:text-ivory"
            }`}
          >
            {item}
          </button>
        ))}
      </div>
    </div>
  );
}
