"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Avatar from "@/components/discover/Avatar";
import BoosterBadge from "@/components/BoosterBadge";
import GumiTag from "@/components/GumiTag";
import WalletTag from "@/components/WalletTag";
import ComingSoonModal from "@/components/ComingSoonModal";
import Sparkline from "@/components/Sparkline";
import { ChevronLeftIcon, ClockIcon } from "@/components/icons";
import CoinStatBox from "./CoinStatBox";
import CoinActionsRow from "./CoinActionsRow";
import CoinMarketCapCard from "./CoinMarketCapCard";
import CoinTimeframeTabs from "./CoinTimeframeTabs";
import CoinExternalLinksRow from "./CoinExternalLinksRow";
import CoinDexLinksRow from "./CoinDexLinksRow";
import CoinActivityTabs, { type CoinActivityTab } from "./CoinActivityTabs";
import CoinTradeButtons from "./CoinTradeButtons";
import CoinGraduationCard from "./CoinGraduationCard";
import CoinTopHoldersCard from "./CoinTopHoldersCard";
import CoinSentimentBar from "./CoinSentimentBar";
import {
  getLaunchpadCoinDetail,
  getLaunchpadCoinChanges,
  getLaunchpadCoinSparkline,
  isGumiHandle,
  registerLiveLaunchpadCoins,
  type LaunchpadDetailTimeframe,
} from "@/lib/launchpad-data";
import { useLiveLaunchpadCoins } from "@/lib/launchpad-live";
import { fetchRealLaunchpadCoin } from "@/lib/launchpad-realtime";
import { formatCompactUsd, formatPrice } from "@/lib/format";

const ADDRESS_PATTERN = /^0x[0-9a-fA-F]{40}$/;

export default function CoinDetailApp({ id }: { id: string }) {
  const liveReady = useLiveLaunchpadCoins();
  const [detail, setDetail] = useState(() => getLaunchpadCoinDetail(id));
  const [timeframe, setTimeframe] = useState<LaunchpadDetailTimeframe>("24H");
  const [comingSoon, setComingSoon] = useState<string | null>(null);
  const [watchlisted, setWatchlisted] = useState(false);
  const [activityTab, setActivityTab] = useState<CoinActivityTab>("Trades");
  const activityRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const existing = getLaunchpadCoinDetail(id);
    if (existing) {
      setDetail(existing);
      return;
    }
    if (!ADDRESS_PATTERN.test(id)) return;

    let cancelled = false;
    fetchRealLaunchpadCoin(id).then((coin) => {
      if (cancelled || !coin) return;
      registerLiveLaunchpadCoins([coin]);
      setDetail(getLaunchpadCoinDetail(id));
    });
    return () => {
      cancelled = true;
    };
  }, [id, liveReady]);

  const changes = useMemo(() => {
    if (!detail) {
      return { "5M": 0, "1H": 0, "6H": 0, "24H": 0 } as Record<LaunchpadDetailTimeframe, number>;
    }
    return getLaunchpadCoinChanges(detail);
  }, [detail]);

  const sparkline = useMemo(
    () => (detail ? getLaunchpadCoinSparkline(detail, timeframe) : []),
    [detail, timeframe]
  );

  if (!detail) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <p className="font-display text-sm uppercase tracking-wider2 text-ivory">Coin Not Found</p>
        <Link
          href="/launchpad"
          className="mt-4 inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider2 text-goldLight hover:text-goldLight"
        >
          <ChevronLeftIcon className="h-3 w-3" />
          Back to Launchpad
        </Link>
      </div>
    );
  }

  const activeChange = changes[timeframe];
  const bonded = Math.min(100, detail.bondingProgress);

  function focusActivity(tab: CoinActivityTab) {
    setActivityTab(tab);
    activityRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div className="mx-auto max-w-2xl px-4 pt-6 pb-10 md:pt-10 md:pb-14">
      <Link
        href="/launchpad"
        className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider2 text-bronze transition-colors hover:text-goldLight"
      >
        <ChevronLeftIcon className="h-3 w-3" />
        Back to Launchpad
      </Link>

      <div className="mt-4 flex items-start gap-3">
        <Avatar
          label={detail.monogram}
          accent={detail.accent}
          shape="square"
          className="h-16 w-16 shrink-0 rounded-2xl text-lg"
          src={detail.image ?? undefined}
        />
        <div className="min-w-0 flex-1 pt-0.5">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <h1 className="font-display text-base uppercase tracking-wider2 text-ivory">{detail.name}</h1>
            {detail.boost != null && <BoosterBadge value={detail.boost} />}
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-1.5">
            <span className="font-mono text-[10px] uppercase tracking-wider2 text-bronze">${detail.symbol}</span>
            <span className="flex items-center gap-1 font-mono text-[9px] uppercase tracking-wider2 text-bronze">
              <ClockIcon className="h-2.5 w-2.5" />
              {detail.age} ago
            </span>
            <span className="border border-gold/40 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider2 text-goldLight">
              Gumifi Launchpad
            </span>
          </div>
          <div className="mt-1.5">
            {isGumiHandle(detail.creator) ? (
              <GumiTag handle={detail.creator} className="max-w-[160px]" />
            ) : (
              <WalletTag address={detail.creator} className="max-w-[160px]" />
            )}
          </div>
        </div>
      </div>

      <div className="mt-4">
        <CoinActionsRow
          contractAddress={detail.contractAddress}
          watchlisted={watchlisted}
          onToggleWatchlist={() => setWatchlisted((value) => !value)}
          onShare={() => setComingSoon("Share")}
        />
      </div>

      <div className="mt-4">
        <CoinMarketCapCard
          marketCap={detail.marketCap}
          athMarketCap={detail.athMarketCap}
          change24h={detail.change24h}
        />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <CoinStatBox label="Volume 24H">{formatCompactUsd(detail.volume24h)}</CoinStatBox>
        <CoinStatBox label="Price">{formatPrice(detail.priceUsd)}</CoinStatBox>
      </div>

      <div className="mt-4">
        <CoinTimeframeTabs active={timeframe} onChange={setTimeframe} changes={changes} />
      </div>

      <div className="mt-3 border border-line bg-panel p-4">
        <Sparkline values={sparkline} positive={activeChange >= 0} className="h-24 w-full" />
      </div>

      <div className="mt-4 grid grid-cols-3 gap-1">
        <CoinStatBox label="Holders">{detail.holders.length}</CoinStatBox>
        <CoinStatBox label="Txns">{detail.trades.length}</CoinStatBox>
        <CoinStatBox label="Bonding">{bonded}%</CoinStatBox>
      </div>

      <div className="mt-4">
        <CoinExternalLinksRow onAction={setComingSoon} />
      </div>

      <div className="mt-4 border border-line bg-panel2 px-4 py-3">
        <p className="mb-1.5 font-mono text-[9px] uppercase tracking-wider2 text-bronze">Description</p>
        <p className="border-l-2 border-emeraldLight/50 pl-3 font-body text-xs leading-relaxed text-ivory/80">
          {detail.description}
        </p>
      </div>

      <div className="mt-4">
        <CoinTradeButtons
          symbol={detail.symbol}
          onBuy={() => setComingSoon(`Buy ${detail.symbol}`)}
          onSell={() => setComingSoon(`Sell ${detail.symbol}`)}
        />
      </div>

      <div ref={activityRef} className="mt-4 scroll-mt-20">
        <CoinActivityTabs
          trades={detail.trades}
          holders={detail.holders}
          commentCount={detail.commentCount}
          symbol={detail.symbol}
          active={activityTab}
          onChange={setActivityTab}
          onAction={setComingSoon}
        />
      </div>

      <div className="mt-4">
        <CoinGraduationCard marketCap={detail.marketCap} />
      </div>

      <div className="mt-3">
        <CoinDexLinksRow onAction={setComingSoon} />
      </div>

      <div className="mt-3">
        <CoinTopHoldersCard holders={detail.holders} onViewAll={() => focusActivity("Holders")} />
      </div>

      <div className="mt-3">
        <CoinSentimentBar votesUp={detail.votesUp} votesDown={detail.votesDown} />
      </div>

      {comingSoon && <ComingSoonModal label={comingSoon} onClose={() => setComingSoon(null)} />}
    </div>
  );
}
