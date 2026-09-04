"use client";

import Link from "next/link";
import {
  ActivityIcon,
  ChevronLeftIcon,
  CoinIcon,
  FrameIcon,
  RocketIcon,
  type IconProps,
} from "@/components/icons";
import { useOnchainPortfolio } from "@/lib/use-onchain-portfolio";
import UserProfileHero from "./UserProfileHero";
import AssetsSection from "./AssetsSection";
import LaunchesSection from "./LaunchesSection";
import UserNftsSection from "./UserNftsSection";
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

export default function UserProfileApp({ address }: { address: string }) {
  const portfolio = useOnchainPortfolio(address);

  return (
    <div className="mx-auto max-w-xl space-y-8 px-4 pt-6 pb-10 md:pt-10 md:pb-14">
      <Link
        href="/discover"
        className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider2 text-bronze transition-colors hover:text-goldLight"
      >
        <ChevronLeftIcon className="h-3 w-3" />
        Back to Discover
      </Link>

      <UserProfileHero
        address={address}
        totalValueUsd={portfolio.totalValueUsd}
        launchesCount={portfolio.myLaunches.length}
        collectionsCount={portfolio.myCollections.length}
        loading={portfolio.loading}
      />

      <div className="space-y-3">
        <SectionHeading icon={CoinIcon} label="Holdings" />
        <AssetsSection assets={portfolio.assets} loading={portfolio.loading} />
      </div>

      <div className="space-y-3">
        <SectionHeading icon={RocketIcon} label="Launches" />
        <LaunchesSection launches={portfolio.myLaunches} loading={portfolio.loading} />
      </div>

      <div className="space-y-3">
        <SectionHeading icon={FrameIcon} label="NFTs" />
        <UserNftsSection
          address={address}
          collections={portfolio.myCollections}
          collectionsLoading={portfolio.loading}
        />
      </div>

      <div className="space-y-3">
        <SectionHeading icon={ActivityIcon} label="Recent Activity" />
        <ActivitySection activity={portfolio.activity} loading={portfolio.loading} />
      </div>
    </div>
  );
}
