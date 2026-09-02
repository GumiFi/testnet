"use client";

import { useState } from "react";
import { LockIcon, CrownIcon } from "@/components/icons";
import Avatar from "@/components/discover/Avatar";
import { useWallet } from "@/lib/wallet-context";
import { useLiquidity } from "@/lib/liquidity-context";
import { poolPairLabel } from "@/lib/liquidity-data";
import { formatUsd } from "@/lib/format";

const lockDurations = [
  { id: 30, label: "30 Days", boost: 1 },
  { id: 90, label: "90 Days", boost: 1.25 },
  { id: 180, label: "180 Days", boost: 1.5 },
  { id: 365, label: "365 Days", boost: 2 },
] as const;

type LockDuration = (typeof lockDurations)[number]["id"];

export default function LockLiquiditySection({
  onExplore,
  onLocked,
}: {
  onExplore: () => void;
  onLocked: (unlockDateLabel: string) => void;
}) {
  const { isConnected, connect } = useWallet();
  const { positions, getPoolById, lockPosition } = useLiquidity();
  const lockablePositions = positions.filter((position) => !position.locked);

  const [selectedPositionId, setSelectedPositionId] = useState<string | null>(
    lockablePositions[0]?.id ?? null
  );
  const [duration, setDuration] = useState<LockDuration>(90);

  if (!isConnected) {
    return (
      <section className="border-b border-line px-6 py-10">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col items-center border border-line bg-panel px-6 py-16 text-center">
            <div className="flex h-12 w-12 items-center justify-center border border-gold/50 text-goldLight">
              <LockIcon className="h-5 w-5" />
            </div>
            <h2 className="mt-5 font-display text-lg uppercase tracking-wider2 text-ivory">
              Lock Liquidity
            </h2>
            <p className="mt-2 max-w-xs font-body text-sm text-bronze">
              Connect your wallet to lock your positions and boost your APR.
            </p>
            <button
              type="button"
              onClick={connect}
              className="mt-6 border border-gold px-5 py-2.5 font-mono text-[11px] uppercase tracking-wider2 text-goldLight transition-colors hover:bg-gold hover:text-void"
            >
              Connect Wallet
            </button>
          </div>
        </div>
      </section>
    );
  }

  if (lockablePositions.length === 0) {
    return (
      <section className="border-b border-line px-6 py-10">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col items-center border border-line bg-panel px-6 py-16 text-center">
            <div className="flex h-12 w-12 items-center justify-center border border-gold/50 text-goldLight">
              <LockIcon className="h-5 w-5" />
            </div>
            <h2 className="mt-5 font-display text-lg uppercase tracking-wider2 text-ivory">
              No Positions To Lock
            </h2>
            <p className="mt-2 max-w-xs font-body text-sm text-bronze">
              Add liquidity to a pool first — including a token you launched yourself — then lock it
              here to boost your rewards.
            </p>
            <button
              type="button"
              onClick={onExplore}
              className="mt-6 border border-gold px-5 py-2.5 font-mono text-[11px] uppercase tracking-wider2 text-goldLight transition-colors hover:bg-gold hover:text-void"
            >
              Explore Pools
            </button>
          </div>
        </div>
      </section>
    );
  }

  const selectedPosition = lockablePositions.find((position) => position.id === selectedPositionId);
  const pool = selectedPosition ? getPoolById(selectedPosition.poolId) : undefined;
  const activeDuration = lockDurations.find((item) => item.id === duration)!;
  const boostedApr = pool ? pool.aprPct * activeDuration.boost : 0;

  function handleLock() {
    if (!selectedPosition) return;
    lockPosition(selectedPosition.id, duration, activeDuration.boost);
    onLocked(getUnlockDateLabel(duration));
  }

  return (
    <section className="border-b border-line px-6 py-10">
      <div className="mx-auto max-w-xl">
        <div className="border border-gold/40 bg-panel px-5 py-6 md:px-6">
          <h2 className="font-display text-sm uppercase tracking-wider2 text-ivory">Lock Liquidity</h2>
          <p className="mt-1 font-body text-xs text-bronze">
            Lock a position for a fixed term to boost its APR and earn extra rewards.
          </p>

          <div className="mt-6">
            <p className="font-mono text-[10px] uppercase tracking-wider2 text-bronze">Select Position</p>
            <div className="mt-2 space-y-2">
              {lockablePositions.map((position) => {
                const positionPool = getPoolById(position.poolId);
                if (!positionPool) return null;
                const isSelected = position.id === selectedPositionId;
                return (
                  <button
                    key={position.id}
                    type="button"
                    onClick={() => setSelectedPositionId(position.id)}
                    className={`flex w-full items-center justify-between border px-4 py-3 text-left transition-colors ${
                      isSelected ? "border-gold bg-gold/10" : "border-line hover:border-gold/40"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex -space-x-2">
                        <Avatar
                          label={positionPool.base.monogram}
                          accent={positionPool.base.accent}
                          className="h-7 w-7 text-[9px]"
                        />
                        <Avatar
                          label={positionPool.quote.monogram}
                          accent={positionPool.quote.accent}
                          className="h-7 w-7 text-[9px]"
                        />
                      </div>
                      <div>
                        <span className="font-display text-xs uppercase tracking-wider2 text-ivory">
                          {poolPairLabel(positionPool)}
                        </span>
                        {positionPool.createdByUser && (
                          <span className="mt-0.5 flex items-center gap-1 font-mono text-[9px] uppercase tracking-wider2 text-goldLight">
                            <CrownIcon className="h-3 w-3" />
                            Your Token
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="font-mono text-xs text-ivory">{formatUsd(position.valueUsd)}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-6">
            <p className="font-mono text-[10px] uppercase tracking-wider2 text-bronze">Lock Duration</p>
            <div className="mt-2 grid grid-cols-4 gap-2">
              {lockDurations.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setDuration(item.id)}
                  className={`border px-2 py-2.5 text-center transition-colors ${
                    duration === item.id
                      ? "border-gold bg-gold/10 text-goldLight"
                      : "border-line text-bronze hover:border-gold/40 hover:text-ivory"
                  }`}
                >
                  <p className="font-display text-xs uppercase tracking-wider2">{item.label}</p>
                  <p className="mt-1 font-mono text-[9px] text-bronze">{item.boost}x APR</p>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 space-y-2 border-t border-line pt-4">
            <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-wider2">
              <span className="text-bronze">Locked Value</span>
              <span className="text-ivory">
                {selectedPosition ? formatUsd(selectedPosition.valueUsd) : "—"}
              </span>
            </div>
            <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-wider2">
              <span className="text-bronze">Base APR</span>
              <span className="text-ivory">{pool ? `${pool.aprPct.toFixed(2)}%` : "—"}</span>
            </div>
            <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-wider2">
              <span className="text-bronze">Boosted APR</span>
              <span className="text-goldLight">{pool ? `${boostedApr.toFixed(2)}%` : "—"}</span>
            </div>
            <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-wider2">
              <span className="text-bronze">Unlock Date</span>
              <span className="text-ivory">{getUnlockDateLabel(duration)}</span>
            </div>
          </div>

          <button
            type="button"
            disabled={!selectedPosition}
            onClick={handleLock}
            className={`mt-6 flex w-full items-center justify-center gap-2 border px-4 py-3 font-mono text-[11px] uppercase tracking-wider2 transition-colors ${
              !selectedPosition
                ? "cursor-not-allowed border-line bg-panel2 text-bronze"
                : "border-gold text-goldLight hover:bg-gold hover:text-void"
            }`}
          >
            <LockIcon className="h-3.5 w-3.5" />
            Lock Liquidity
          </button>
        </div>
      </div>
    </section>
  );
}

function getUnlockDateLabel(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}
