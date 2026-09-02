import { liquidityPositions } from "@/lib/portfolio-data";
import { formatCompactUsd } from "@/lib/format";

export default function LiquiditySection() {
  return (
    <div className="border border-line bg-panel">
      {liquidityPositions.map((position, index) => (
        <div
          key={position.id}
          className={`flex items-center justify-between gap-3 px-4 py-3 ${
            index === liquidityPositions.length - 1 ? "" : "border-b border-line"
          }`}
        >
          <div className="min-w-0 flex-1">
            <p className="truncate font-display text-xs uppercase tracking-wider2 text-ivory">
              {position.pair}
            </p>
            <p className="mt-0.5 font-mono text-[10px] text-bronze">{position.poolSharePct}% Pool Share</p>
          </div>
          <div className="shrink-0 text-right">
            <p className="font-mono text-xs text-ivory">{formatCompactUsd(position.valueUsd)}</p>
            <p className="mt-0.5 font-mono text-[10px] text-emeraldLight">
              +{formatCompactUsd(position.feesEarnedUsd)} fees
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
