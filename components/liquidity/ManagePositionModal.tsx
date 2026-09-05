"use client";

import { useEffect } from "react";
import { BoltIcon, CloseIcon, CoinIcon, LockIcon, MinusIcon, PlusIcon } from "@/components/icons";
import Avatar from "@/components/discover/Avatar";
import { formatBalance, formatUsd } from "@/lib/format";
import type { OnchainPosition } from "@/lib/positions-onchain";

function monogramFor(symbol: string): string {
  const clean = symbol.trim().toUpperCase();
  return clean.slice(0, 2).padEnd(2, clean.charAt(0) || "T");
}

export default function ManagePositionModal({
  position,
  onClose,
  onAction,
}: {
  position: OnchainPosition;
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

  const isLocked = position.locks.some((lock) => !lock.withdrawn);
  const isBoosted = position.locks.some((lock) => !lock.withdrawn && lock.boosted);

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center md:items-center">
      <div className="absolute inset-0 animate-fadeIn bg-void/80 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full rounded-t-2xl border-t border-gold/40 bg-panel px-5 py-6 animate-fadeUp md:max-w-sm md:rounded-2xl md:border md:border-gold/40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
              <Avatar label={monogramFor(position.symbol0)} accent="gold" className="h-8 w-8 text-[10px]" />
              <Avatar label={monogramFor(position.symbol1)} accent="emerald" className="h-8 w-8 text-[10px]" />
            </div>
            <h2 className="font-display text-sm uppercase tracking-wider2 text-ivory">
              {position.symbol0} / {position.symbol1}
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
            <span className="text-ivory">{position.valueUsd !== null ? formatUsd(position.valueUsd) : "—"}</span>
          </div>
          <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-wider2">
            <span className="text-bronze">Pool Share</span>
            <span className="text-ivory">{position.poolSharePct.toFixed(4)}%</span>
          </div>
          <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-wider2">
            <span className="text-bronze">{position.symbol0} Owned</span>
            <span className="text-ivory">{formatBalance(position.amount0Owned)}</span>
          </div>
          <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-wider2">
            <span className="text-bronze">{position.symbol1} Owned</span>
            <span className="text-ivory">{formatBalance(position.amount1Owned)}</span>
          </div>
          {isBoosted && (
            <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-wider2">
              <span className="text-bronze">APR Boost</span>
              <span className="flex items-center gap-1 text-goldLight">
                <BoltIcon className="h-3 w-3" />
                Active
              </span>
            </div>
          )}
          {position.nextUnlockTime !== null && (
            <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-wider2">
              <span className="text-bronze">Next Unlock</span>
              <span className="flex items-center gap-1 text-goldLight">
                <LockIcon className="h-3 w-3" />
                {new Date(Number(position.nextUnlockTime) * 1000).toLocaleDateString("en-US", {
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
            <span className="font-mono text-[11px] uppercase tracking-wider2 text-ivory">Add Liquidity</span>
          </button>
          <button
            type="button"
            disabled={isLocked}
            onClick={() => onAction("Remove Liquidity")}
            className={`flex w-full items-center gap-3 border px-4 py-3 text-left transition-colors ${
              isLocked
                ? "cursor-not-allowed border-line bg-panel2 text-bronze"
                : "border-line hover:border-gold/50 hover:bg-panel2"
            }`}
          >
            <MinusIcon className="h-4 w-4 text-goldLight" />
            <span className="font-mono text-[11px] uppercase tracking-wider2 text-ivory">
              {isLocked ? "Locked — Cannot Remove" : "Remove Liquidity"}
            </span>
          </button>
          <button
            type="button"
            onClick={() => onAction("Collect Fees")}
            className="flex w-full items-center gap-3 border border-line px-4 py-3 text-left transition-colors hover:border-gold/50 hover:bg-panel2"
          >
            <CoinIcon className="h-4 w-4 text-goldLight" />
            <span className="font-mono text-[11px] uppercase tracking-wider2 text-ivory">Collect Fees</span>
          </button>
        </div>
      </div>
    </div>
  );
}
