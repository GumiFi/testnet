"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { PlusIcon, SearchIcon, CloseIcon } from "@/components/icons";
import FilterChips from "@/components/discover/FilterChips";
import Avatar from "@/components/discover/Avatar";
import ComingSoonModal from "@/components/ComingSoonModal";
import { nftCollections, type NftCollection } from "@/lib/discover-data";
import { formatCompactNumber, formatEth, formatPct } from "@/lib/format";

const marketplaceFilters = ["All", "Trending", "New", "Top Volume", "Lowest Price"] as const;
type MarketplaceFilter = (typeof marketplaceFilters)[number];

function filterCollections(
  collections: NftCollection[],
  filter: MarketplaceFilter,
  query: string
): NftCollection[] {
  let list = [...collections];
  const trimmedQuery = query.trim().toLowerCase();
  if (trimmedQuery) {
    list = list.filter((collection) => collection.name.toLowerCase().includes(trimmedQuery));
  }
  switch (filter) {
    case "New":
      return list.filter((collection) => collection.isNew);
    case "Top Volume":
      return list.sort((a, b) => b.volume24hEth - a.volume24hEth);
    case "Lowest Price":
      return list.sort((a, b) => a.floorEth - b.floorEth);
    case "Trending":
      return list.sort((a, b) => b.change24h - a.change24h);
    default:
      return list;
  }
}

export default function NftMarketplaceApp() {
  const [filter, setFilter] = useState<MarketplaceFilter>("All");
  const [query, setQuery] = useState("");
  const [comingSoon, setComingSoon] = useState<string | null>(null);

  const collections = useMemo(
    () => filterCollections(nftCollections, filter, query),
    [filter, query]
  );
  const isSearching = query.trim().length > 0;

  return (
    <div>
      <section className="border-b border-line px-6 py-10 md:py-14">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="animate-fadeUp">
              <span className="font-mono text-xs uppercase tracking-wider3 text-bronze">
                Every collection on GUMIFI
              </span>
              <h1 className="mt-3 font-display text-3xl uppercase tracking-wider2 text-ivory text-shadow-gold md:text-4xl">
                NFT Marketplace
              </h1>
              <p className="mt-3 max-w-xl font-body text-sm text-bronze">
                Browse live NFT collections across the ecosystem, sorted by momentum, volume, and freshness.
              </p>
            </div>
            <Link
              href="/nft/create"
              prefetch={false}
              className="inline-flex shrink-0 items-center justify-center gap-2 border border-gold px-4 py-2.5 font-mono text-[10px] uppercase tracking-wider2 text-goldLight transition-colors hover:bg-gold hover:text-void"
            >
              <PlusIcon className="h-3.5 w-3.5" />
              Create Collection
            </Link>
          </div>

          <div className="mt-8 flex items-center gap-3 rounded-xl border border-line bg-panel px-4 py-3 transition-colors focus-within:border-gold/60">
            <SearchIcon className="h-4 w-4 shrink-0 text-bronze" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              type="text"
              placeholder="Search collections..."
              className="w-full bg-transparent font-body text-sm text-ivory placeholder:text-bronze/70 focus:outline-none"
            />
            {isSearching && (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="Close search"
                className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-line text-bronze transition-colors hover:border-gold hover:text-goldLight"
              >
                <CloseIcon className="h-3 w-3" />
              </button>
            )}
          </div>

          <div className="mt-5">
            <FilterChips options={marketplaceFilters} active={filter} onChange={setFilter} />
          </div>
        </div>
      </section>

      <section className="px-6 py-10">
        <div className="mx-auto max-w-6xl">
          {collections.length === 0 ? (
            <p className="px-4 py-16 text-center font-mono text-xs uppercase tracking-wider2 text-bronze">
              No collections found
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {collections.map((collection) => {
                const positive = collection.change24h >= 0;
                return (
                  <button
                    key={collection.id}
                    type="button"
                    onClick={() => setComingSoon(collection.name)}
                    className="border border-line bg-panel p-4 text-left transition-colors hover:border-gold/40"
                  >
                    <div className="relative aspect-square w-full overflow-hidden">
                      <Avatar
                        label={collection.monogram}
                        accent={collection.accent}
                        className="h-full w-full text-2xl"
                        shape="square"
                      />
                      {collection.isNew && (
                        <span className="absolute left-2 top-2 border border-gold/50 bg-void/80 px-2 py-1 font-mono text-[9px] uppercase tracking-wider2 text-goldLight">
                          New
                        </span>
                      )}
                    </div>
                    <p className="mt-3 truncate font-display text-sm uppercase tracking-wider2 text-ivory">
                      {collection.name}
                    </p>
                    <p className="mt-1 font-mono text-[10px] uppercase tracking-wider2 text-bronze">
                      {formatCompactNumber(collection.items)} items
                    </p>
                    <div className="mt-3 flex items-center justify-between border-t border-line pt-3">
                      <div>
                        <p className="font-mono text-[9px] uppercase tracking-wider2 text-bronze">Floor</p>
                        <p className="mt-0.5 font-mono text-xs text-goldLight">
                          {formatEth(collection.floorEth)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-mono text-[9px] uppercase tracking-wider2 text-bronze">24h Vol</p>
                        <p className="mt-0.5 font-mono text-xs text-ivory">
                          {formatEth(collection.volume24hEth)}
                        </p>
                      </div>
                    </div>
                    <div className="mt-2 flex items-center justify-between font-mono text-[10px] uppercase tracking-wider2">
                      <span className="text-bronze">{formatCompactNumber(collection.owners)} owners</span>
                      <span className={positive ? "text-emeraldLight" : "text-garnetLight"}>
                        {formatPct(collection.change24h)}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {comingSoon && <ComingSoonModal label={comingSoon} onClose={() => setComingSoon(null)} />}
    </div>
  );
}
