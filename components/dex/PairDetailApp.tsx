"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Avatar from "@/components/discover/Avatar";
import BoosterBadge from "@/components/BoosterBadge";
import GumiTag from "@/components/GumiTag";
import WalletTag from "@/components/WalletTag";
import ComingSoonModal from "@/components/ComingSoonModal";
import Sparkline from "@/components/Sparkline";
import CopyField from "@/components/swap/CopyField";
import PriceValue from "./PriceValue";
import EthPriceValue from "./EthPriceValue";
import PairStatBox from "./PairStatBox";
import PairTimeframeTabs from "./PairTimeframeTabs";
import PairFlowBar from "./PairFlowBar";
import PairSocialRow from "./PairSocialRow";
import {
  ChevronLeftIcon,
  ShareIcon,
  MoreIcon,
  FlameIcon,
  StarIcon,
  BellIcon,
  SwapIcon,
} from "@/components/icons";
import {
  getDexPairById,
  getDexPairChanges,
  getDexCategoryLabel,
  getPairSparkline,
  isGumiHandle,
  type DexDetailTimeframe,
} from "@/lib/dex-data";
import { formatCompactUsd, formatCompactNumber } from "@/lib/format";

const detailTabs = ["Info", "Chart + Txns", "Chart", "Txns"] as const;

export default function PairDetailApp({ id }: { id: string }) {
  const pair = getDexPairById(id);
  const [timeframe, setTimeframe] = useState<DexDetailTimeframe>("24H");
  const [comingSoon, setComingSoon] = useState<string | null>(null);
  const [watchlisted, setWatchlisted] = useState(false);

  const changes = useMemo(() => {
    if (!pair) {
      return { "5M": 0, "1H": 0, "6H": 0, "24H": 0 } as Record<DexDetailTimeframe, number>;
    }
    return getDexPairChanges(pair);
  }, [pair]);

  const sparkline = useMemo(() => (pair ? getPairSparkline(pair, timeframe) : []), [pair, timeframe]);

  if (!pair) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <p className="font-display text-sm uppercase tracking-wider2 text-ivory">Pair Not Found</p>
        <Link
          href="/dex"
          className="mt-4 inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider2 text-goldLight hover:text-goldLight"
        >
          <ChevronLeftIcon className="h-3 w-3" />
          Back to Dex
        </Link>
      </div>
    );
  }

  const categoryLabel = getDexCategoryLabel(pair.category);
  const activeChange = changes[timeframe];
  const buysRatio = pair.buys24h / Math.max(pair.buys24h + pair.sells24h, 1);
  const buyVolRatio = pair.buyVolUsd / Math.max(pair.buyVolUsd + pair.sellVolUsd, 1);
  const buyersRatio = pair.buyers / Math.max(pair.buyers + pair.sellers, 1);
  const traders = Math.round((pair.buyers + pair.sellers) * 0.82);

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 md:py-10">
      <Link
        href="/dex"
        className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider2 text-bronze transition-colors hover:text-goldLight"
      >
        <ChevronLeftIcon className="h-3 w-3" />
        Back to Dex
      </Link>

      <div className="mt-4 flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <Avatar label={pair.monogram} accent={pair.accent} className="h-11 w-11 shrink-0 text-xs" />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
              <h1 className="font-display text-base uppercase tracking-wider2 text-ivory">{pair.symbol}</h1>
              <span className="font-mono text-[10px] text-bronze">/ ETH</span>
              {pair.boost != null && <BoosterBadge value={pair.boost} />}
            </div>
            <p className="truncate font-body text-xs text-bronze">{pair.name}</p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={() => setComingSoon("Share")}
            aria-label="Share"
            className="flex h-8 w-8 items-center justify-center border border-line text-bronze transition-colors hover:border-gold hover:text-goldLight"
          >
            <ShareIcon className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setComingSoon("More Options")}
            aria-label="More options"
            className="flex h-8 w-8 items-center justify-center border border-line text-bronze transition-colors hover:border-gold hover:text-goldLight"
          >
            <MoreIcon className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        <span className="border border-line px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider2 text-bronze">
          {pair.age}
        </span>
        <span className="inline-flex items-center gap-1 border border-gold/40 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider2 text-goldLight">
          <FlameIcon className="h-2.5 w-2.5" />
          Rank #{pair.rank}
        </span>
        <span className="border border-line px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider2 text-bronze">
          {categoryLabel}
        </span>
      </div>

      <div className="relative mt-5 flex h-28 items-center justify-center overflow-hidden border border-line bg-gradient-to-br from-panel2 via-panel to-void">
        <span className="pointer-events-none absolute inset-0 animate-glow bg-gold/10" />
        <span className="relative font-display text-4xl uppercase tracking-wider2 text-goldLight text-shadow-gold md:text-5xl">
          {pair.symbol}
        </span>
      </div>

      <div className="mt-3">
        <PairSocialRow onAction={setComingSoon} />
      </div>

      <div className="mt-3 border border-line bg-panel">
        <CopyField label="Token Contract" value={pair.contractAddress} />
        <CopyField label="Pair Contract" value={pair.pairAddress} isLast />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <PairStatBox label="Price USD">
          <PriceValue value={pair.priceUsd} className="font-mono text-sm text-ivory sm:text-base" />
        </PairStatBox>
        <PairStatBox label="Price">
          <EthPriceValue value={pair.priceEth} className="font-mono text-sm text-ivory sm:text-base" />
        </PairStatBox>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-3">
        <PairStatBox label="Liquidity">{formatCompactUsd(pair.liquidity)}</PairStatBox>
        <PairStatBox label="FDV">{formatCompactUsd(pair.fdv)}</PairStatBox>
        <PairStatBox label="Market Cap">{formatCompactUsd(pair.marketCap)}</PairStatBox>
      </div>

      <div className="mt-4">
        <PairTimeframeTabs active={timeframe} onChange={setTimeframe} changes={changes} />
      </div>

      <div className="mt-3 border border-line bg-panel p-4">
        <Sparkline values={sparkline} positive={activeChange >= 0} className="h-24 w-full" />
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3">
        <PairStatBox label="Txns 24H">{formatCompactNumber(pair.txns24h)}</PairStatBox>
        <PairStatBox label="Volume 24H">{formatCompactUsd(pair.volume24h)}</PairStatBox>
        <PairStatBox label="Traders 24H">{formatCompactNumber(traders)}</PairStatBox>
      </div>

      <div className="mt-3 border border-line bg-panel">
        <PairFlowBar
          label="Buys / Sells"
          leftLabel="Buys"
          rightLabel="Sells"
          leftValue={formatCompactNumber(pair.buys24h)}
          rightValue={formatCompactNumber(pair.sells24h)}
          leftRatio={buysRatio}
        />
        <PairFlowBar
          label="Buy Vol / Sell Vol"
          leftLabel="Buy"
          rightLabel="Sell"
          leftValue={formatCompactUsd(pair.buyVolUsd)}
          rightValue={formatCompactUsd(pair.sellVolUsd)}
          leftRatio={buyVolRatio}
        />
        <PairFlowBar
          label="Buyers / Sellers"
          leftLabel="Buyers"
          rightLabel="Sellers"
          leftValue={formatCompactNumber(pair.buyers)}
          rightValue={formatCompactNumber(pair.sellers)}
          leftRatio={buyersRatio}
          isLast
        />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => setWatchlisted((value) => !value)}
          className={`flex items-center justify-center gap-2 border px-4 py-2.5 font-mono text-[10px] uppercase tracking-wider2 transition-colors ${
            watchlisted
              ? "border-gold bg-gold/10 text-goldLight"
              : "border-line text-bronze hover:border-gold/40 hover:text-ivory"
          }`}
        >
          <StarIcon className="h-3.5 w-3.5" />
          {watchlisted ? "Watchlisted" : "Watchlist"}
        </button>
        <button
          type="button"
          onClick={() => setComingSoon("Price Alerts")}
          className="flex items-center justify-center gap-2 border border-line px-4 py-2.5 font-mono text-[10px] uppercase tracking-wider2 text-bronze transition-colors hover:border-gold/40 hover:text-ivory"
        >
          <BellIcon className="h-3.5 w-3.5" />
          Alerts
        </button>
      </div>

      <button
        type="button"
        onClick={() => setComingSoon(`Trade ${pair.symbol} / ETH`)}
        className="mt-3 flex w-full items-center justify-center gap-2 border border-gold bg-gold/10 px-4 py-3 font-mono text-[11px] uppercase tracking-wider2 text-goldLight transition-colors hover:bg-gold hover:text-void"
      >
        <SwapIcon className="h-4 w-4" />
        Trade {pair.symbol} / ETH
      </button>

      <div className="mt-4 flex items-center justify-between border border-line bg-panel px-4 py-3">
        <span className="font-mono text-[9px] uppercase tracking-wider2 text-bronze">Created by</span>
        {isGumiHandle(pair.creator) ? (
          <GumiTag handle={pair.creator} className="max-w-[160px]" />
        ) : (
          <WalletTag address={pair.creator} className="max-w-[160px]" />
        )}
      </div>

      <div className="mt-6 grid grid-cols-4 border border-line">
        {detailTabs.map((tabLabel, index) => {
          const isActive = tabLabel === "Info";
          return (
            <button
              key={tabLabel}
              type="button"
              onClick={() => !isActive && setComingSoon(tabLabel)}
              className={`px-2 py-2.5 text-center font-mono text-[9px] uppercase tracking-wider2 transition-colors ${
                index !== 0 ? "border-l border-line" : ""
              } ${isActive ? "bg-gold/10 text-goldLight" : "text-bronze hover:text-ivory"}`}
            >
              {tabLabel}
            </button>
          );
        })}
      </div>

      {comingSoon && <ComingSoonModal label={comingSoon} onClose={() => setComingSoon(null)} />}
    </div>
  );
}
