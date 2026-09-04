"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Avatar from "@/components/discover/Avatar";
import { CheckIcon, CopyIcon, EyeIcon, EyeOffIcon } from "@/components/icons";
import { useWallet, truncateAddress } from "@/lib/wallet-context";
import { portfolioAssets, type PortfolioAssetWithValue } from "@/lib/portfolio-data";
import { formatBalance, formatUsd } from "@/lib/format";
import { CONTRACT_ADDRESSES, NETWORK } from "@/config/contracts.config";
import { createRpcCaller } from "@/lib/nft-onchain";
import { fetchErc20Balance, fetchNativeBalance } from "@/lib/token-onchain";

const ON_CHAIN_ASSET_IDS = ["eth", "gumi"] as const;

export default function WalletDropdown({ onClose }: { onClose: () => void }) {
  const { address, monogram, avatarUrl } = useWallet();
  const [assets, setAssets] = useState<PortfolioAssetWithValue[]>([]);
  const [holdingsLoading, setHoldingsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [valueHidden, setValueHidden] = useState(false);
  const scrollLockPrev = useRef<string | null>(null);
  const scrollLockTimer = useRef<number | null>(null);

  const totalValueUsd = assets.reduce((sum, asset) => sum + asset.valueUsd, 0);

  useEffect(() => {
    if (!address) {
      setAssets([]);
      return;
    }
    let cancelled = false;
    setHoldingsLoading(true);
    const call = createRpcCaller(NETWORK.rpcUrl);
    Promise.all([
      fetchNativeBalance(null, NETWORK.rpcUrl, address),
      fetchErc20Balance(call, CONTRACT_ADDRESSES.gumiToken, address),
    ])
      .then(([ethBalance, gumiBalance]) => {
        if (cancelled) return;
        const balances: Record<(typeof ON_CHAIN_ASSET_IDS)[number], number> = {
          eth: ethBalance,
          gumi: gumiBalance,
        };
        const onChainAssets = portfolioAssets
          .filter((asset): asset is typeof asset & { id: (typeof ON_CHAIN_ASSET_IDS)[number] } =>
            (ON_CHAIN_ASSET_IDS as readonly string[]).includes(asset.id)
          )
          .map((asset) => {
            const balance = balances[asset.id];
            return { ...asset, balance, valueUsd: asset.priceUsd * balance };
          })
          .sort((a, b) => b.valueUsd - a.valueUsd);
        setAssets(onChainAssets);
      })
      .catch(() => {
        if (cancelled) return;
        setAssets([]);
      })
      .finally(() => {
        if (!cancelled) setHoldingsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [address]);

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
    <div className="absolute right-0 top-full z-40 mt-2 w-full border border-gold/40 bg-panel shadow-[0_20px_40px_rgba(0,0,0,0.55)]">
      <div className="flex items-center gap-2.5 border-b border-line bg-gradient-to-b from-gold/10 to-transparent px-3.5 py-3">
        <Link href="/profile" onClick={onClose} aria-label="View profile">
          <Avatar label={monogram ?? ""} accent="gold" src={avatarUrl} className="h-8 w-8 shrink-0 text-[10px]" />
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
            <p className="min-w-0 truncate font-mono text-[10px] text-goldLight">
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

      <p className="border-b border-line px-3.5 pt-2.5 pb-1.5 font-mono text-[9px] uppercase tracking-wider2 text-bronze">
        Holdings
      </p>

      <div className="max-h-28 overflow-y-auto overscroll-contain" onScroll={handleHoldingsScroll}>
        {holdingsLoading && assets.length === 0 && (
          <p className="px-3.5 py-3 font-mono text-[9px] uppercase tracking-wider2 text-bronze">
            Loading on-chain holdings…
          </p>
        )}
        {assets.map((asset) => (
          <div
            key={asset.id}
            className="flex h-14 shrink-0 items-center gap-2 border-b border-line px-3 last:border-b-0"
          >
            <Avatar label={asset.monogram} accent={asset.accent} className="h-6 w-6 shrink-0 text-[8px]" />
            <div className="min-w-0 flex-1">
              <p className="truncate font-display text-[10px] uppercase tracking-wider2 text-ivory">
                {asset.symbol}
              </p>
              <p className="truncate font-mono text-[8px] text-bronze">
                {formatBalance(asset.balance)} {asset.symbol}
              </p>
            </div>
            <p className="shrink-0 font-mono text-[9px] text-goldLight">
              {valueHidden ? "*****" : formatUsd(asset.valueUsd)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
