"use client";

import { useEffect, useState } from "react";
import {
  ActivityIcon,
  CoinIcon,
  DropletIcon,
  FrameIcon,
  RocketIcon,
  WalletIcon,
  type IconProps,
} from "@/components/icons";
import { useWallet } from "@/lib/wallet-context";
import { useOnchainPortfolio } from "@/lib/use-onchain-portfolio";
import {
  loadPortfolioHistory,
  recordPortfolioSnapshot,
  type PortfolioSnapshot,
} from "@/lib/portfolio-history";
import ProfileHero from "./ProfileHero";
import PortfolioChartSection from "./PortfolioChartSection";
import AssetsSection from "./AssetsSection";
import LaunchesSection from "./LaunchesSection";
import LiquiditySection from "./LiquiditySection";
import NftsSection from "./NftsSection";
import ActivitySection from "./ActivitySection";

function SectionHeading({
  icon: Icon,
  label,
}: {
  icon: (props: IconProps) => JSX.Element;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="h-4 w-4 text-goldLight" />
      <h2 className="font-display text-sm uppercase tracking-wider2 text-ivory">{label}</h2>
    </div>
  );
}

export default function ProfileApp() {
  const { isConnected, connect, address } = useWallet();
  const portfolio = useOnchainPortfolio(address);
  const [history, setHistory] = useState<PortfolioSnapshot[]>([]);

  useEffect(() => {
    setHistory(address ? loadPortfolioHistory(address) : []);
  }, [address]);

  useEffect(() => {
    if (!address || portfolio.loading) return;
    setHistory(recordPortfolioSnapshot(address, portfolio.totalValueUsd));
  }, [address, portfolio.loading, portfolio.totalValueUsd]);

  if (!isConnected) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center px-4 py-20 text-center md:py-28">
        <div className="flex h-12 w-12 items-center justify-center border border-gold/50 text-goldLight">
          <WalletIcon className="h-5 w-5" />
        </div>
        <h1 className="mt-5 font-display text-lg uppercase tracking-wider2 text-ivory">Your Profile</h1>
        <p className="mt-2 max-w-xs font-body text-sm text-bronze">
          Connect your wallet to view your profile, holdings, and activity.
        </p>
        <button
          type="button"
          onClick={connect}
          className="mt-6 border border-gold px-5 py-2.5 font-mono text-[11px] uppercase tracking-wider2 text-goldLight transition-colors hover:bg-gold hover:text-void"
        >
          Connect Wallet
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl space-y-8 px-4 py-8 md:py-12">
      <ProfileHero totalValueUsd={portfolio.totalValueUsd} history={history} loading={portfolio.loading} />
      <PortfolioChartSection
        currentValueUsd={portfolio.totalValueUsd}
        history={history}
        loading={portfolio.loading}
      />

      <div className="space-y-3">
        <SectionHeading icon={CoinIcon} label="Assets" />
        <AssetsSection assets={portfolio.assets} loading={portfolio.loading} />
      </div>

      <div className="space-y-3">
        <SectionHeading icon={RocketIcon} label="My Launches" />
        <LaunchesSection launches={portfolio.myLaunches} loading={portfolio.loading} />
      </div>

      <div className="space-y-3">
        <SectionHeading icon={DropletIcon} label="Liquidity Positions" />
        <LiquiditySection />
      </div>

      <div className="space-y-3">
        <SectionHeading icon={FrameIcon} label="My NFTs" />
        <NftsSection collections={portfolio.myCollections} collectionsLoading={portfolio.loading} />
      </div>

      <div className="space-y-3">
        <SectionHeading icon={ActivityIcon} label="Recent Activity" />
        <ActivitySection activity={portfolio.activity} loading={portfolio.loading} />
      </div>
    </div>
  );
}
