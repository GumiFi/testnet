import { ArrowUpIcon, ArrowDownIcon } from "@/components/icons";

export default function CoinSentimentBar({ votesUp, votesDown }: { votesUp: number; votesDown: number }) {
  const total = votesUp + votesDown;
  const bullishPct = total > 0 ? Math.round((votesUp / total) * 100) : 50;
  const pct = Math.max(4, Math.min(96, bullishPct));

  return (
    <div className="border border-line bg-panel p-4">
      <div className="flex items-center justify-between">
        <p className="font-mono text-[10px] uppercase tracking-wider2 text-ivory">Community Sentiment</p>
        <span className="font-mono text-[9px] uppercase tracking-wider2 text-bronze">
          {total} vote{total === 1 ? "" : "s"}
        </span>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <ArrowUpIcon className="h-3.5 w-3.5 shrink-0 text-emeraldLight" />
        <div className="flex h-1.5 w-full overflow-hidden rounded-full bg-panel2">
          <div className="h-full bg-emeraldLight" style={{ width: `${pct}%` }} />
          <div className="h-full bg-garnetLight" style={{ width: `${100 - pct}%` }} />
        </div>
        <ArrowDownIcon className="h-3.5 w-3.5 shrink-0 text-garnetLight" />
      </div>

      <div className="mt-1.5 flex items-center justify-between font-mono text-[10px]">
        <span className="text-emeraldLight">{bullishPct}%</span>
        <span className="text-garnetLight">{100 - bullishPct}%</span>
      </div>
    </div>
  );
}
