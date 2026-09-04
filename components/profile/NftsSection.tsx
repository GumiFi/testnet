"use client";

import { useState } from "react";
import Avatar from "@/components/discover/Avatar";
import { nftPortfolioItems, type NftCategory } from "@/lib/portfolio-data";
import { formatEth } from "@/lib/format";
import { useWallet } from "@/lib/wallet-context";

const tabs: { id: NftCategory; label: string }[] = [
  { id: "owned", label: "Owned" },
  { id: "created", label: "Created" },
  { id: "listed", label: "Listed" },
];

export default function NftsSection() {
  const [category, setCategory] = useState<NftCategory>("owned");
  const { ownedGumiNfts, gumiNftBalance, gumiNftsLoading } = useWallet();
  const isOwnedTab = category === "owned";
  const mockItems = nftPortfolioItems.filter((item) => item.category === category);

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
        gumiNftsLoading ? (
          <div className="mt-3 border border-line bg-panel px-4 py-8 text-center">
            <p className="font-mono text-[10px] uppercase tracking-wider2 text-bronze">Loading NFTs...</p>
          </div>
        ) : ownedGumiNfts.length > 0 ? (
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {ownedGumiNfts.map((nft) => (
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
        ) : gumiNftBalance > 0 ? (
          <div className="mt-3 border border-line bg-panel px-4 py-8 text-center">
            <p className="font-mono text-[10px] uppercase tracking-wider2 text-bronze">
              {gumiNftBalance} Gumi Custom NFT Owned
            </p>
          </div>
        ) : (
          <div className="mt-3 border border-line bg-panel px-4 py-8 text-center">
            <p className="font-mono text-[10px] uppercase tracking-wider2 text-bronze">Nothing here yet</p>
          </div>
        )
      ) : mockItems.length === 0 ? (
        <div className="mt-3 border border-line bg-panel px-4 py-8 text-center">
          <p className="font-mono text-[10px] uppercase tracking-wider2 text-bronze">Nothing here yet</p>
        </div>
      ) : (
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {mockItems.map((item) => (
            <div key={item.id} className="border border-line bg-panel p-3">
              <Avatar label={item.monogram} accent={item.accent} className="h-12 w-12 text-[10px]" shape="square" />
              <p className="mt-2 truncate font-display text-[11px] uppercase tracking-wider2 text-ivory">
                {item.name}
              </p>
              <p className="mt-0.5 truncate font-mono text-[9px] uppercase tracking-wider2 text-bronze">
                {item.collection}
              </p>
              {item.priceEth !== undefined && (
                <p className="mt-1 font-mono text-[10px] text-goldLight">{formatEth(item.priceEth)}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
