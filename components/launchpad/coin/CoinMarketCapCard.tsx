import { formatCompactUsd, formatPct } from "@/lib/format";

export default function CoinMarketCapCard({
  marketCap,
  athMarketCap,
  change24h,
}: {
  marketCap: number;
  athMarketCap: number;
  change24h: number;
}) {
  const positive = change24h >= 0;
  const isAth = marketCap >= athMarketCap;
  const athRatio = Math.max(4, Math.min(100, Math.round((marketCap / Math.max(athMarketCap, 1)) * 100)));

  return (
    <div className="border border-line bg-panel p-4">
      <p className="font-mono text-[9px] uppercase tracking-wider2 text-bronze">Market Cap</p>
      <div className="mt-1 flex flex-wrap items-baseline gap-x-2 gap-y-1">
        <span className="font-display text-2xl text-ivory text-shadow-gold">{formatCompactUsd(marketCap)}</span>
        <span className={`font-mono text-xs ${positive ? "text-emeraldLight" : "text-garnetLight"}`}>
          {formatPct(change24h)}
        </span>
        <span className="font-mono text-[9px] uppercase tracking-wider2 text-bronze">24hr</span>
      </div>
      <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-line">
        <div
          className="h-full rounded-full bg-gradient-to-r from-gold to-goldLight"
          style={{ width: `${athRatio}%` }}
        />
      </div>
      <div className="mt-1.5 text-right font-mono text-[9px] uppercase tracking-wider2 text-bronze">
        {isAth ? "New All-Time High" : `ATH ${formatCompactUsd(athMarketCap)}`}
      </div>
    </div>
  );
}
