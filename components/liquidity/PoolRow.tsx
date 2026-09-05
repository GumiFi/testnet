import { RocketIcon } from "@/components/icons";
import Avatar from "@/components/discover/Avatar";
import { accentForAddress, monogramFor, poolPairLabel, type OnchainPool } from "@/lib/pools-onchain";
import { formatCompactUsd } from "@/lib/format";

function PoolPairLabel({ pool }: { pool: OnchainPool }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex -space-x-2">
        <Avatar label={monogramFor(pool.symbol0)} accent={accentForAddress(pool.token0)} className="h-8 w-8 text-[10px]" />
        <Avatar label={monogramFor(pool.symbol1)} accent={accentForAddress(pool.token1)} className="h-8 w-8 text-[10px]" />
      </div>
      <div className="min-w-0">
        <span className="font-display text-sm uppercase tracking-wider2 text-ivory">
          {poolPairLabel(pool)}
        </span>
        {pool.isLaunchpad && (
          <span className="mt-1 flex items-center gap-1 font-mono text-[9px] uppercase tracking-wider2 text-goldLight">
            <RocketIcon className="h-3 w-3" />
            Launched on Gumifi
          </span>
        )}
      </div>
    </div>
  );
}

export default function PoolRow({
  pool,
  variant,
  onClick,
}: {
  pool: OnchainPool;
  variant: "row" | "card";
  onClick: () => void;
}) {
  if (variant === "row") {
    return (
      <button
        type="button"
        onClick={onClick}
        className="grid w-full grid-cols-[1.6fr_1fr_1fr_0.8fr] items-center gap-4 border-b border-line px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-panel2"
      >
        <PoolPairLabel pool={pool} />
        <span className="text-right font-mono text-xs text-ivory">
          {pool.tvlUsd !== null ? formatCompactUsd(pool.tvlUsd) : "—"}
        </span>
        <span className="text-right font-mono text-xs text-ivory">
          {pool.volume24hUsd !== null ? formatCompactUsd(pool.volume24hUsd) : "—"}
        </span>
        <span className="text-right font-mono text-xs text-goldLight">
          {pool.aprPct !== null ? `${pool.aprPct.toFixed(1)}%` : "—"}
        </span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full border border-line bg-panel px-4 py-4 text-left transition-colors hover:border-gold/40"
    >
      <PoolPairLabel pool={pool} />
      <div className="mt-4 grid grid-cols-3 gap-2 border-t border-line pt-3">
        <div>
          <p className="font-mono text-[9px] uppercase tracking-wider2 text-bronze">TVL</p>
          <p className="mt-1 font-mono text-xs text-ivory">
            {pool.tvlUsd !== null ? formatCompactUsd(pool.tvlUsd) : "—"}
          </p>
        </div>
        <div>
          <p className="font-mono text-[9px] uppercase tracking-wider2 text-bronze">Volume 24H</p>
          <p className="mt-1 font-mono text-xs text-ivory">
            {pool.volume24hUsd !== null ? formatCompactUsd(pool.volume24hUsd) : "—"}
          </p>
        </div>
        <div>
          <p className="font-mono text-[9px] uppercase tracking-wider2 text-bronze">APR</p>
          <p className="mt-1 font-mono text-xs text-goldLight">
            {pool.aprPct !== null ? `${pool.aprPct.toFixed(1)}%` : "—"}
          </p>
        </div>
      </div>
    </button>
  );
}
