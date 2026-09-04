"use client";

import { useEffect, useState } from "react";
import Avatar from "@/components/discover/Avatar";
import { CONTRACT_ADDRESSES, NETWORK } from "@/config/contracts.config";
import { createRpcCaller, fetchGumiCustomNftHoldings, type OwnedNft } from "@/lib/nft-onchain";
import type { NftCollectionRecord } from "@/lib/nft-collections-realtime";

type NftCategory = "owned" | "created";

const tabs: { id: NftCategory; label: string }[] = [
  { id: "owned", label: "Owned" },
  { id: "created", label: "Created" },
];

function monogramFor(symbol: string): string {
  const clean = symbol.trim().toUpperCase();
  return clean.slice(0, 2).padEnd(2, clean.charAt(0) || "T");
}

export default function UserNftsSection({
  address,
  collections,
  collectionsLoading,
}: {
  address: string;
  collections: NftCollectionRecord[];
  collectionsLoading: boolean;
}) {
  const [category, setCategory] = useState<NftCategory>("owned");
  const [owned, setOwned] = useState<OwnedNft[]>([]);
  const [ownedLoading, setOwnedLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setOwnedLoading(true);
    const call = createRpcCaller(NETWORK.rpcUrl);
    fetchGumiCustomNftHoldings(call, CONTRACT_ADDRESSES.gumiCustomNFT, address)
      .then((holdings) => {
        if (!cancelled) setOwned(holdings.items);
      })
      .catch(() => {
        if (!cancelled) setOwned([]);
      })
      .finally(() => {
        if (!cancelled) setOwnedLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [address]);

  const isOwnedTab = category === "owned";

  return (
    <div>
      <div className="flex items-center gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setCategory(tab.id)}
            className={`rounded-full border px-3 py-1 font-mono text-[10px] uppercase tracking-wider2 transition-colors ${
              category === tab.id
                ? "border-gold bg-gold/10 text-goldLight"
                : "border-line text-bronze hover:border-gold/40 hover:text-ivory"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {isOwnedTab ? (
        ownedLoading && owned.length === 0 ? (
          <div className="mt-3 border border-line bg-panel px-4 py-8 text-center">
            <p className="font-mono text-[10px] uppercase tracking-wider2 text-bronze">Loading NFTs…</p>
          </div>
        ) : owned.length === 0 ? (
          <div className="mt-3 border border-line bg-panel px-4 py-8 text-center">
            <p className="font-mono text-[10px] uppercase tracking-wider2 text-bronze">Nothing here yet</p>
          </div>
        ) : (
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {owned.map((nft) => (
              <div key={nft.tokenId} className="border border-line bg-panel p-3">
                <Avatar
                  label={nft.tokenId.slice(0, 3)}
                  accent="gold"
                  src={nft.image}
                  className="h-12 w-12 text-[10px]"
                  shape="square"
                />
                <p className="mt-2 truncate font-display text-[11px] uppercase tracking-wider2 text-ivory">
                  {nft.name}
                </p>
                <p className="mt-0.5 truncate font-mono text-[9px] uppercase tracking-wider2 text-bronze">
                  Gumi Custom NFT
                </p>
              </div>
            ))}
          </div>
        )
      ) : collectionsLoading && collections.length === 0 ? (
        <div className="mt-3 border border-line bg-panel px-4 py-8 text-center">
          <p className="font-mono text-[10px] uppercase tracking-wider2 text-bronze">Loading collections…</p>
        </div>
      ) : collections.length === 0 ? (
        <div className="mt-3 border border-line bg-panel px-4 py-8 text-center">
          <p className="font-mono text-[10px] uppercase tracking-wider2 text-bronze">Nothing here yet</p>
        </div>
      ) : (
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {collections.map((collection) => (
            <div key={collection.metadataId} className="border border-line bg-panel p-3">
              <Avatar
                label={monogramFor(collection.symbol)}
                accent="gold"
                src={collection.image}
                className="h-12 w-12 text-[10px]"
                shape="square"
              />
              <p className="mt-2 truncate font-display text-[11px] uppercase tracking-wider2 text-ivory">
                {collection.name}
              </p>
              <p className="mt-0.5 truncate font-mono text-[9px] uppercase tracking-wider2 text-bronze">
                {collection.symbol}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
