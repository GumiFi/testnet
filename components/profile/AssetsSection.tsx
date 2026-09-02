import Avatar from "@/components/discover/Avatar";
import { getAssetsWithValue } from "@/lib/portfolio-data";
import { formatBalance, formatPct, formatUsd } from "@/lib/format";

export default function AssetsSection() {
  const assets = getAssetsWithValue();

  return (
    <div className="border border-line bg-panel">
      {assets.map((asset, index) => (
        <div
          key={asset.id}
          className={`flex items-center gap-3 px-4 py-3 ${
            index === assets.length - 1 ? "" : "border-b border-line"
          }`}
        >
          <Avatar label={asset.monogram} accent={asset.accent} className="h-8 w-8 shrink-0 text-[9px]" />
          <div className="min-w-0 flex-1">
            <p className="truncate font-display text-xs uppercase tracking-wider2 text-ivory">
              {asset.symbol}
            </p>
            <p className="mt-0.5 font-mono text-[10px] text-bronze">
              {formatBalance(asset.balance)} {asset.symbol}
            </p>
          </div>
          <div className="shrink-0 text-right">
            <p className="font-mono text-xs text-ivory">{formatUsd(asset.valueUsd)}</p>
            <p
              className={`mt-0.5 font-mono text-[10px] ${
                asset.change24h >= 0 ? "text-emeraldLight" : "text-garnetLight"
              }`}
            >
              {formatPct(asset.change24h)}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
