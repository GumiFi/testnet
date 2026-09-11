"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Avatar from "@/components/discover/Avatar";
import { CheckIcon, CopyIcon, EyeIcon, EyeOffIcon } from "@/components/icons";
import { useWallet, truncateAddress } from "@/lib/wallet-context";
import { useOnchainPortfolio } from "@/lib/use-onchain-portfolio";
import { formatBalance, formatUsd } from "@/lib/format";

export default function WalletDropdown({ onClose }: { onClose: () => void }) {
  const { address, monogram, avatarUrl } = useWallet();
  const { assets, totalValueUsd, loading: holdingsLoading } = useOnchainPortfolio(address);
  const [copied, setCopied] = useState(false);
  const [valueHidden, setValueHidden] = useState(false);
  const scrollLockPrev = useRef<string | null>(null);
  const scrollLockTimer = useRef<number | null>(null);

  function lockPageScroll() {
    if (scrollLockPrev.current === null) {
      scrollLockPrev.current = document.body.style.overflow;
      document.body.style.overflow = "hidden";
    }
  }

  function unlockPageScroll() {
    if (scrollLockPrev.current !== null) {
      document.body.style.overflow = scrollLockPrev.current;
      scrollLockPrev.current = null;
    }
  }

  function handleHoldingsScroll() {
    lockPageScroll();
    if (scrollLockTimer.current !== null) {
      window.clearTimeout(scrollLockTimer.current);
    }
    scrollLockTimer.current = window.setTimeout(unlockPageScroll, 150);
  }

  useEffect(() => {
    return () => {
      if (scrollLockTimer.current !== null) {
        window.clearTimeout(scrollLockTimer.current);
      }
      unlockPageScroll();
    };
  }, []);

  async function handleCopyAddress() {
    if (!address) return;
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="absolute right-0 top-full z-40 mt-2 w-80 max-w-[calc(100vw_-_1.5rem)] border border-gold/40 bg-panel shadow-[0_1.25rem_2.5rem_rgba(0,0,0,0.55)]">
      <div className="flex items-center gap-2.5 border-b border-line bg-gradient-to-b from-gold/10 to-transparent px-3.5 py-3">
        <Link href="/profile" onClick={onClose} aria-label="View profile">
          <Avatar label={monogram ?? ""} accent="gold" src={avatarUrl} className="h-8 w-8 shrink-0 text-[0.625rem]" />
        </Link>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleCopyAddress}
              className="min-w-0 flex-1 truncate text-left font-mono text-xs uppercase tracking-wider2 text-ivory transition-colors hover:text-goldLight"
            >
              {truncateAddress(address ?? "")}
            </button>
            <button
              type="button"
              onClick={handleCopyAddress}
              aria-label="Copy wallet address"
              className="shrink-0 text-bronze transition-colors hover:text-goldLight"
            >
              {copied ? (
                <CheckIcon className="h-3 w-3 text-emeraldLight" />
              ) : (
                <CopyIcon className="h-3 w-3" />
              )}
            </button>
          </div>

          <div className="mt-0.5 flex items-center gap-1.5">
            <p className="min-w-0 truncate font-mono text-[0.625rem] text-goldLight">
              {valueHidden ? "*****" : formatUsd(totalValueUsd)}
            </p>
            <button
              type="button"
              onClick={() => setValueHidden((hidden) => !hidden)}
              aria-label={valueHidden ? "Show balance" : "Hide balance"}
              className="shrink-0 text-bronze transition-colors hover:text-goldLight"
            >
              {valueHidden ? <EyeOffIcon className="h-3 w-3" /> : <EyeIcon className="h-3 w-3" />}
            </button>
          </div>
        </div>
      </div>

      <p className="border-b border-line px-3.5 pt-2.5 pb-1.5 font-mono text-[0.5625rem] uppercase tracking-wider2 text-bronze">
        Holdings
      </p>

      <div className="max-h-28 overflow-y-auto overscroll-contain" onScroll={handleHoldingsScroll}>
        {holdingsLoading && assets.length === 0 && (
          <p className="px-3.5 py-3 font-mono text-[0.5625rem] uppercase tracking-wider2 text-bronze">
            Loading on-chain holdings…
          </p>
        )}
        {[...assets]
          .sort((a, b) => (b.valueUsd ?? -1) - (a.valueUsd ?? -1))
          .map((asset) => (
            <div
              key={asset.id}
              className="flex h-14 shrink-0 items-center gap-2 border-b border-line px-3 last:border-b-0"
            >
              <Avatar label={asset.monogram} accent={asset.accent} className="h-6 w-6 shrink-0 text-[0.5rem]" />
              <div className="min-w-0 flex-1">
                <p className="truncate font-display text-[0.625rem] uppercase tracking-wider2 text-ivory">
                  {asset.symbol}
                </p>
                <p className="truncate font-mono text-[0.5rem] text-bronze">
                  {formatBalance(asset.balance)} {asset.symbol}
                </p>
              </div>
              <p className="shrink-0 font-mono text-[0.5625rem] text-goldLight">
                {valueHidden ? "*****" : asset.valueUsd != null ? formatUsd(asset.valueUsd) : "—"}
              </p>
            </div>
          ))}
      </div>
    </div>
  );
}
