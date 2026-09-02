"use client";

import { useMemo } from "react";
import Link from "next/link";
import {
  ActivityIcon,
  ChevronLeftIcon,
  CoinIcon,
  FrameIcon,
  RocketIcon,
  type IconProps,
} from "@/components/icons";
import UserProfileHero from "./UserProfileHero";
import UserAssetsSection from "./UserAssetsSection";
import UserLaunchesSection from "./UserLaunchesSection";
import UserNftsSection from "./UserNftsSection";
import UserActivitySection from "./UserActivitySection";
import {
  getUserActivity,
  getUserAssets,
  getUserLaunches,
  getUserNfts,
  getUserProfile,
} from "@/lib/user-profile-data";

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

export default function UserProfileApp({ handle }: { handle: string }) {
  const profile = useMemo(() => getUserProfile(handle), [handle]);
  const assets = useMemo(() => getUserAssets(handle), [handle]);
  const launches = useMemo(() => getUserLaunches(handle), [handle]);
  const nfts = useMemo(() => getUserNfts(handle), [handle]);
  const activity = useMemo(() => getUserActivity(handle), [handle]);

  if (!profile) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <p className="font-display text-sm uppercase tracking-wider2 text-ivory">Profile Not Found</p>
        <Link
          href="/"
          className="mt-4 inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider2 text-goldLight hover:text-goldLight"
        >
          <ChevronLeftIcon className="h-3 w-3" />
          Back to Discover
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl space-y-8 px-4 pt-6 pb-10 md:pt-10 md:pb-14">
      <Link
        href="/discover"
        className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider2 text-bronze transition-colors hover:text-goldLight"
      >
        <ChevronLeftIcon className="h-3 w-3" />
        Back to Discover
      </Link>

      <UserProfileHero profile={profile} />

      <div className="space-y-3">
        <SectionHeading icon={CoinIcon} label="Holdings" />
        <UserAssetsSection assets={assets} />
      </div>

      <div className="space-y-3">
        <SectionHeading icon={RocketIcon} label="Launches" />
        <UserLaunchesSection launches={launches} />
      </div>

      <div className="space-y-3">
        <SectionHeading icon={FrameIcon} label="NFTs" />
        <UserNftsSection nfts={nfts} />
      </div>

      <div className="space-y-3">
        <SectionHeading icon={ActivityIcon} label="Recent Activity" />
        <UserActivitySection activity={activity} />
      </div>
    </div>
  );
}
