"use client";

import { useEffect } from "react";
import { CloseIcon, PlusIcon, MinusIcon, CoinIcon, LockIcon } from "@/components/icons";
import Avatar from "@/components/discover/Avatar";
import { useLiquidity } from "@/lib/liquidity-context";
import { poolPairLabel } from "@/lib/liquidity-data";
import { formatCompactUsd, formatUsd } from "@/lib/format";

export default function ManagePositionModal({
  positionId,
  onClose,
  onAction,
}: {
  positionId: string;
  onClose: () => void;
  onAction: (label: string) => void;
}) {
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  const { positions, getPoolById } = useLiquidity();
  const position = positions.find((item) => item.id === positionId);
  const pool = position ? getPoolById(position.poolId) : undefined;

  if (!position || !pool) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center md:items-center">
      <div className="absolute inset-0 animate-fadeIn bg-void/80 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full rounded-t-2xl border-t border-gold/40 bg-panel px-5 py-6 animate-fadeUp md:max-w-sm md:rounded-2xl md:border md:border-gold/40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
              <Avatar label={pool.base.monogram} accent={pool.base.accent} className="h-8 w-8 text-[10px]" />
              <Avatar label={pool.quote.monogram} accent={pool.quote.accent} className="h-8 w-8 text-[10px]" />
            </div>
            <h2 className="font-display text-sm uppercase tracking-wider2 text-ivory">
              {poolPairLabel(pool)}
            </h2>
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

        <div className="mt-6 space-y-2 border border-line bg-panel2 px-4 py-4">
          <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-wider2">
            <span className="text-bronze">Your Position</span>
            <span className="text-ivory">{formatUsd(position.valueUsd)}</span>
          </div>
          <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-wider2">
            <span className="text-bronze">Pool Share</span>
            <span className="text-ivory">{position.poolSharePct.toFixed(2)}%</span>
          </div>
          <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-wider2">
            <span className="text-bronze">Pool Liquidity</span>
            <span className="text-ivory">{formatCompactUsd(pool.tvlUsd)}</span>
          </div>
          <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-wider2">
            <span className="text-bronze">APR</span>
            <span className="text-goldLight">{pool.aprPct.toFixed(2)}%</span>
          </div>
          <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-wider2">
            <span className="text-bronze">Unclaimed Fees</span>
            <span className="text-ivory">{formatUsd(position.feesEarnedUsd24h)}</span>
          </div>
          {position.locked && position.lockedUntil && (
            <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-wider2">
              <span className="text-bronze">Locked Until</span>
              <span className="flex items-center gap-1 text-goldLight">
                <LockIcon className="h-3 w-3" />
                {new Date(position.lockedUntil).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>
          )}
        </div>

        <div className="mt-5 space-y-2">
          <button
            type="button"
            onClick={() => onAction("Add Liquidity")}
            className="flex w-full items-center gap-3 border border-line px-4 py-3 text-left transition-colors hover:border-gold/50 hover:bg-panel2"
          >
            <PlusIcon className="h-4 w-4 text-goldLight" />
            <span className="font-mono text-[11px] uppercase tracking-wider2 text-ivory">
              Add Liquidity
            </span>
          </button>
          <button
            type="button"
            disabled={position.locked}
            onClick={() => onAction("Remove Liquidity")}
            className={`flex w-full items-center gap-3 border px-4 py-3 text-left transition-colors ${
              position.locked
                ? "cursor-not-allowed border-line bg-panel2 text-bronze"
                : "border-line hover:border-gold/50 hover:bg-panel2"
            }`}
          >
            <MinusIcon className="h-4 w-4 text-goldLight" />
            <span className="font-mono text-[11px] uppercase tracking-wider2 text-ivory">
              {position.locked ? "Locked — Cannot Remove" : "Remove Liquidity"}
            </span>
          </button>
          <button
            type="button"
            onClick={() => onAction("Collect Fees")}
            className="flex w-full items-center gap-3 border border-line px-4 py-3 text-left transition-colors hover:border-gold/50 hover:bg-panel2"
          >
            <CoinIcon className="h-4 w-4 text-goldLight" />
            <span className="font-mono text-[11px] uppercase tracking-wider2 text-ivory">
              Collect Fees
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
