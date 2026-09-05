"use client";

import { BoltIcon, LockIcon } from "@/components/icons";
import Avatar from "@/components/discover/Avatar";
import { formatBalance, formatUsd } from "@/lib/format";
import type { OnchainPosition } from "@/lib/positions-onchain";

function monogramFor(symbol: string): string {
  const clean = symbol.trim().toUpperCase();
  return clean.slice(0, 2).padEnd(2, clean.charAt(0) || "T");
}

function unlockLabel(unlockTime: bigint): string {
  return new Date(Number(unlockTime) * 1000).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function PositionCard({
  position,
  onManage,
}: {
  position: OnchainPosition;
  onManage: () => void;
}) {
  const isLocked = position.locks.some((lock) => !lock.withdrawn);
  const isBoosted = position.locks.some((lock) => !lock.withdrawn && lock.boosted);
  const lockedSharePct =
    position.totalOwnedRaw > 0n ? Number((position.lockedRaw * 10000n) / position.totalOwnedRaw) / 100 : 0;

  return (
    <div className="border border-line bg-panel p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex -space-x-2">
            <Avatar label={monogramFor(position.symbol0)} accent="gold" className="h-8 w-8 text-[10px]" />
            <Avatar label={monogramFor(position.symbol1)} accent="emerald" className="h-8 w-8 text-[10px]" />
          </div>
          <span className="font-display text-sm uppercase tracking-wider2 text-ivory">
            {position.symbol0} / {position.symbol1}
          </span>
        </div>
        <div className="flex flex-col items-end gap-1">
          {isLocked ? (
            <span className="flex items-center gap-1 border border-gold/50 bg-gold/10 px-2 py-1 font-mono text-[9px] uppercase tracking-wider2 text-goldLight">
              <LockIcon className="h-3 w-3" />
              Locked
            </span>
          ) : (
            <span className="border border-emeraldLight/50 bg-emerald/30 px-2 py-1 font-mono text-[9px] uppercase tracking-wider2 text-emeraldLight">
              Unlocked
            </span>
          )}
          {isBoosted && (
            <span className="flex items-center gap-1 border border-gold/50 bg-gold/10 px-2 py-1 font-mono text-[9px] uppercase tracking-wider2 text-goldLight">
              <BoltIcon className="h-3 w-3" />
              Boosted
            </span>
          )}
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between">
        <span className="font-mono text-[10px] uppercase tracking-wider2 text-bronze">Your Position</span>
        <span className="font-display text-lg text-ivory">
          {position.valueUsd !== null ? formatUsd(position.valueUsd) : "—"}
        </span>
      </div>
      <div className="mt-2 flex items-center justify-between">
        <span className="font-mono text-[10px] uppercase tracking-wider2 text-bronze">Pool Share</span>
        <span className="font-mono text-xs text-ivory">{position.poolSharePct.toFixed(4)}%</span>
      </div>

      <div className="mt-4 space-y-2 border-t border-line pt-4">
        <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-wider2">
          <span className="text-bronze">{position.symbol0} Owned</span>
          <span className="text-ivory">{formatBalance(position.amount0Owned)}</span>
        </div>
        <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-wider2">
          <span className="text-bronze">{position.symbol1} Owned</span>
          <span className="text-ivory">{formatBalance(position.amount1Owned)}</span>
        </div>
        {isLocked && (
          <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-wider2">
            <span className="text-bronze">Locked Share</span>
            <span className="text-ivory">{lockedSharePct.toFixed(1)}%</span>
          </div>
        )}
        {isLocked && position.nextUnlockTime !== null && (
          <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-wider2">
            <span className="text-bronze">Next Unlock</span>
            <span className="text-ivory">{unlockLabel(position.nextUnlockTime)}</span>
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
