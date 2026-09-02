"use client";

import { useMemo, useState } from "react";
import { FrameIcon } from "@/components/icons";
import FilterChips from "./FilterChips";
import Avatar from "./Avatar";
import { nftCollections, type NftCollection } from "@/lib/discover-data";
import { formatCompactNumber, formatEth, formatPct } from "@/lib/format";

const nftFilters = ["Trending", "New", "Top Volume", "Lowest Price"] as const;
type NftFilter = (typeof nftFilters)[number];

function sortCollections(collections: NftCollection[], filter: NftFilter): NftCollection[] {
  const list = [...collections];
  switch (filter) {
    case "New":
      return list.filter((collection) => collection.isNew);
    case "Top Volume":
      return list.sort((a, b) => b.volume24hEth - a.volume24hEth);
    case "Lowest Price":
      return list.sort((a, b) => a.floorEth - b.floorEth);
    default:
      return list.sort((a, b) => b.change24h - a.change24h);
  }
}

export default function NftSection({
  onAction,
}: {
  onAction: (label: string) => void;
}) {
  const [filter, setFilter] = useState<NftFilter>("Trending");
  const collections = useMemo(() => sortCollections(nftCollections, filter), [filter]);

  return (
    <section className="border-b border-line px-6 py-10">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-center gap-2">
          <FrameIcon className="h-4 w-4 text-goldLight" />
          <h2 className="font-display text-lg uppercase tracking-wider2 text-ivory">NFT Collections</h2>
        </div>

        <div className="mt-4">
          <FilterChips options={nftFilters} active={filter} onChange={setFilter} />
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {collections.length === 0 ? (
            <p className="col-span-full px-4 py-8 text-center font-mono text-xs uppercase tracking-wider2 text-bronze">
              No collections in this filter yet
            </p>
          ) : (
            collections.map((collection) => {
              const positive = collection.change24h >= 0;
              return (
                <button
                  key={collection.id}
                  type="button"
                  onClick={() => onAction(collection.name)}
                  className="border border-line bg-panel p-3 text-left transition-colors hover:border-gold/40"
                >
                  <div className="aspect-square w-full overflow-hidden">
                    <Avatar
                      label={collection.monogram}
                      accent={collection.accent}
                      className="h-full w-full text-xl"
                      shape="square"
                    />
                  </div>
                  <p className="mt-3 truncate font-display text-xs uppercase tracking-wider2 text-ivory">
                    {collection.name}
                  </p>
                  <p className="mt-1 font-mono text-[10px] uppercase tracking-wider2 text-bronze">
                    Floor {formatEth(collection.floorEth)}
                  </p>
                  <div className="mt-1 flex items-center justify-between font-mono text-[10px] uppercase tracking-wider2">
                    <span className="text-bronze">{formatCompactNumber(collection.owners)} owners</span>
                    <span className={positive ? "text-emeraldLight" : "text-garnetLight"}>
                      {formatPct(collection.change24h)}
                    </span>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
}
