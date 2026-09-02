"use client";

import { useState } from "react";
import Sparkline from "@/components/Sparkline";
import { portfolioChartSeries, portfolioRanges, type PortfolioRange } from "@/lib/portfolio-data";
import { formatPct } from "@/lib/format";

export default function PortfolioChartSection() {
  const [range, setRange] = useState<PortfolioRange>("1D");
  const series = portfolioChartSeries[range];
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
          {formatPct(deltaPct)} ({range})
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
