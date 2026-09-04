import Avatar from "@/components/discover/Avatar";
import { formatBalance, formatUsd } from "@/lib/format";
import type { OnchainAsset } from "@/lib/use-onchain-portfolio";

export default function AssetsSection({
  assets,
  loading,
}: {
  assets: OnchainAsset[];
  loading: boolean;
}) {
  const sorted = [...assets].sort((a, b) => (b.valueUsd ?? -1) - (a.valueUsd ?? -1));

  if (loading && sorted.length === 0) {
    return (
      <div className="border border-line bg-panel px-4 py-8 text-center">
        <p className="font-mono text-[10px] uppercase tracking-wider2 text-bronze">Loading assets…</p>
      </div>
    );
  }

  if (sorted.length === 0) {
    return (
      <div className="border border-line bg-panel px-4 py-8 text-center">
        <p className="font-mono text-[10px] uppercase tracking-wider2 text-bronze">Nothing here yet</p>
      </div>
    );
  }

  return (
    <div className="border border-line bg-panel">
      {sorted.map((asset, index) => (
        <div
          key={asset.id}
          className={`flex items-center gap-3 px-4 py-3 ${
            index === sorted.length - 1 ? "" : "border-b border-line"
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
            <p className="font-mono text-xs text-ivory">
              {asset.valueUsd !== null ? formatUsd(asset.valueUsd) : "—"}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
