"use client";

import { LockIcon, CrownIcon } from "@/components/icons";
import Avatar from "@/components/discover/Avatar";
import { useLiquidity } from "@/lib/liquidity-context";
import { poolPairLabel, type LiquidityPosition } from "@/lib/liquidity-data";
import { formatCompactUsd, formatUsd } from "@/lib/format";

export default function PositionCard({
  position,
  onManage,
}: {
  position: LiquidityPosition;
  onManage: () => void;
}) {
  const { getPoolById } = useLiquidity();
  const pool = getPoolById(position.poolId);
  if (!pool) return null;

  const unlockLabel = position.lockedUntil
    ? new Date(position.lockedUntil).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : null;

  return (
    <div className="border border-line bg-panel p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex -space-x-2">
            <Avatar label={pool.base.monogram} accent={pool.base.accent} className="h-8 w-8 text-[10px]" />
            <Avatar label={pool.quote.monogram} accent={pool.quote.accent} className="h-8 w-8 text-[10px]" />
          </div>
          <div>
            <span className="font-display text-sm uppercase tracking-wider2 text-ivory">
              {poolPairLabel(pool)}
            </span>
            {pool.createdByUser && (
              <span className="mt-0.5 flex items-center gap-1 font-mono text-[9px] uppercase tracking-wider2 text-goldLight">
                <CrownIcon className="h-3 w-3" />
                Your Token
              </span>
            )}
          </div>
        </div>
        {position.locked ? (
          <span className="flex items-center gap-1 border border-gold/50 bg-gold/10 px-2 py-1 font-mono text-[9px] uppercase tracking-wider2 text-goldLight">
            <LockIcon className="h-3 w-3" />
            Locked
          </span>
        ) : (
          <span className="border border-emeraldLight/50 bg-emerald/30 px-2 py-1 font-mono text-[9px] uppercase tracking-wider2 text-emeraldLight">
            Active
          </span>
        )}
      </div>

      <div className="mt-5 flex items-center justify-between">
        <span className="font-mono text-[10px] uppercase tracking-wider2 text-bronze">Your Position</span>
        <span className="font-display text-lg text-ivory">{formatUsd(position.valueUsd)}</span>
      </div>
      <div className="mt-2 flex items-center justify-between">
        <span className="font-mono text-[10px] uppercase tracking-wider2 text-bronze">Pool Share</span>
        <span className="font-mono text-xs text-ivory">{position.poolSharePct.toFixed(2)}%</span>
      </div>

      <div className="mt-4 space-y-2 border-t border-line pt-4">
        <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-wider2">
          <span className="text-bronze">Liquidity</span>
          <span className="text-ivory">{formatCompactUsd(pool.tvlUsd)}</span>
        </div>
        <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-wider2">
          <span className="text-bronze">APR</span>
          <span className="text-goldLight">
            {position.locked && position.boostedAprPct
              ? `${(pool.aprPct * position.boostedAprPct).toFixed(2)}%`
              : `${pool.aprPct.toFixed(2)}%`}
          </span>
        </div>
        <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-wider2">
          <span className="text-bronze">24H Fees</span>
          <span className="text-ivory">{formatUsd(position.feesEarnedUsd24h)}</span>
        </div>
        {position.locked && unlockLabel && (
          <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-wider2">
            <span className="text-bronze">Unlocks</span>
            <span className="text-ivory">{unlockLabel}</span>
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={onManage}
        className="mt-5 w-full border border-gold px-4 py-2 font-mono text-[10px] uppercase tracking-wider2 text-goldLight transition-colors hover:bg-gold hover:text-void"
      >
        Manage
      </button>
    </div>
  );
}
