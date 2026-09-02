"use client";

import { useMemo, useState } from "react";
import { SearchIcon, CloseIcon } from "@/components/icons";
import FilterChips from "@/components/discover/FilterChips";
import { filterPools, poolFilters, type PoolFilter } from "@/lib/liquidity-data";
import { useLiquidity } from "@/lib/liquidity-context";
import PoolRow from "./PoolRow";

export default function ExplorePoolsSection({
  onSelectPool,
}: {
  onSelectPool: (poolId: string) => void;
}) {
  const { pools: allPools } = useLiquidity();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<PoolFilter>("All");

  const pools = useMemo(() => filterPools(allPools, filter, query), [allPools, filter, query]);

  return (
    <section className="px-6 py-10">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-center gap-3 border border-line bg-panel px-4 py-3 transition-colors focus-within:border-gold/60">
          <SearchIcon className="h-4 w-4 shrink-0 text-bronze" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            type="text"
            placeholder="Search token or pool"
            className="w-full bg-transparent font-body text-sm text-ivory placeholder:text-bronze/70 focus:outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Clear search"
              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-line text-bronze transition-colors hover:border-gold hover:text-goldLight"
            >
              <CloseIcon className="h-3 w-3" />
            </button>
          )}
        </div>

        <div className="mt-4">
          <FilterChips options={poolFilters} active={filter} onChange={setFilter} />
        </div>

        <div className="mt-5">
          {pools.length === 0 ? (
            <p className="border border-line bg-panel px-4 py-10 text-center font-mono text-xs uppercase tracking-wider2 text-bronze">
              No pools match your search
            </p>
          ) : (
            <>
              <div className="hidden border border-line bg-panel sm:block">
                <div className="grid grid-cols-[1.6fr_1fr_1fr_0.8fr] gap-4 border-b border-line px-4 py-3 font-mono text-[10px] uppercase tracking-wider2 text-bronze">
                  <span>Pool</span>
                  <span className="text-right">TVL</span>
                  <span className="text-right">Volume 24H</span>
                  <span className="text-right">APR</span>
                </div>
                {pools.map((pool) => (
                  <PoolRow key={pool.id} pool={pool} variant="row" onClick={() => onSelectPool(pool.id)} />
                ))}
              </div>
              <div className="grid grid-cols-1 gap-3 sm:hidden">
                {pools.map((pool) => (
                  <PoolRow key={pool.id} pool={pool} variant="card" onClick={() => onSelectPool(pool.id)} />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
