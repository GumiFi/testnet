"use client";

import { useEffect, useState } from "react";
import Avatar from "@/components/discover/Avatar";
import CopyField from "@/components/swap/CopyField";
import ComingSoonModal from "@/components/ComingSoonModal";
import { CrownIcon } from "@/components/icons";
import { CONTRACT_ADDRESSES, NETWORK, getExplorerAddressUrl } from "@/config/contracts.config";
import { createRpcCaller, fetchGumiCustomNftBalance } from "@/lib/nft-onchain";
import { formatUsd } from "@/lib/format";
import { getWalletProfile } from "@/lib/user-profile-data";

export default function UserProfileHero({
  address,
  totalValueUsd,
  launchesCount,
  collectionsCount,
  loading,
}: {
  address: string;
  totalValueUsd: number;
  launchesCount: number;
  collectionsCount: number;
  loading: boolean;
}) {
  const [following, setFollowing] = useState(false);
  const [comingSoon, setComingSoon] = useState<string | null>(null);
  const [isPremium, setIsPremium] = useState(false);
  const profile = getWalletProfile(address);
  const showPlaceholder = loading && totalValueUsd === 0;

  useEffect(() => {
    let cancelled = false;
    fetchGumiCustomNftBalance(createRpcCaller(NETWORK.rpcUrl), CONTRACT_ADDRESSES.gumiCustomNFT, address)
      .then((balance) => {
        if (!cancelled) setIsPremium(balance > 0);
      })
      .catch(() => {
        if (!cancelled) setIsPremium(false);
      });
    return () => {
      cancelled = true;
    };
  }, [address]);

  return (
    <div className="border border-line bg-panel p-5">
      <div className="flex items-start gap-4">
        <Avatar
          label={profile.monogram}
          accent={profile.accent}
          shape="square"
          className="h-14 w-14 shrink-0 rounded-2xl text-sm"
        />
        <div className="min-w-0 flex-1">
          <p className="truncate font-display text-lg uppercase tracking-wider2 text-ivory">
            {profile.name}
          </p>
          <a
            href={getExplorerAddressUrl(address)}
            target="_blank"
            rel="noreferrer"
            className="mt-1 inline-block font-mono text-[10px] uppercase tracking-wider2 text-bronze transition-colors hover:text-goldLight"
          >
            View on Explorer ↗
          </a>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1.5">
          <span
            className={`inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 font-mono text-[8px] uppercase tracking-wider2 ${
              isPremium
                ? "border-gold/60 bg-gold/10 text-goldLight shadow-[0_0_5px_rgba(201,162,39,0.35)]"
                : "border-line text-bronze"
            }`}
          >
            {isPremium && <CrownIcon className="h-2.5 w-2.5" />}
            {isPremium ? "Premium" : "Free Tier"}
          </span>
          <button
            type="button"
            onClick={() => setFollowing((value) => !value)}
            className={`border px-4 py-2 font-mono text-[10px] uppercase tracking-wider2 transition-colors ${
              following
                ? "border-line text-bronze hover:border-garnetLight/60 hover:text-garnetLight"
                : "border-gold text-goldLight hover:bg-gold hover:text-void"
            }`}
          >
            {following ? "Following" : "Follow"}
          </button>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-1 border-t border-line pt-4">
        <div>
          <p className="font-mono text-[9px] uppercase tracking-wider2 text-bronze">Portfolio Value</p>
          <p className="mt-1 font-display text-sm text-ivory">
            {showPlaceholder ? "—" : formatUsd(totalValueUsd)}
          </p>
        </div>
        <div>
          <p className="font-mono text-[9px] uppercase tracking-wider2 text-bronze">Launches</p>
          <p className="mt-1 font-display text-sm text-ivory">{launchesCount}</p>
        </div>
        <div>
          <p className="font-mono text-[9px] uppercase tracking-wider2 text-bronze">NFT Collections</p>
          <p className="mt-1 font-display text-sm text-ivory">{collectionsCount}</p>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-3 border-t border-line pt-4 font-mono text-[10px] uppercase tracking-wider2 text-bronze">
        <span>{NETWORK.name}</span>
        <button
          type="button"
          onClick={() => setComingSoon("Share Profile")}
          className="ml-auto text-bronze transition-colors hover:text-goldLight"
        >
          Share
        </button>
      </div>

      <div className="mt-4 border border-line">
        <CopyField label="Wallet Address" value={address} isLast />
      </div>

      {comingSoon && <ComingSoonModal label={comingSoon} onClose={() => setComingSoon(null)} />}
    </div>
  );
}
