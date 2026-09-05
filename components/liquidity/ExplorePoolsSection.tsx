"use client";

import { useEffect, useMemo, useState } from "react";
import { SearchIcon, CloseIcon } from "@/components/icons";
import FilterChips from "@/components/discover/FilterChips";
import { useWallet } from "@/lib/wallet-context";
import { NETWORK } from "@/config/contracts.config";
import { createProviderCaller, createRpcCaller, type EthCaller } from "@/lib/nft-onchain";
import {
  classifyPool,
  fetchExplorePools,
  filterOnchainPools,
  poolFilters,
  type OnchainPool,
  type PoolCategory,
  type PoolFilter,
} from "@/lib/pools-onchain";
import PoolRow from "./PoolRow";

export default function ExplorePoolsSection({
  onSelectPool,
}: {
  onSelectPool: (pool: OnchainPool) => void;
}) {
  const { provider } = useWallet();
  const [pools, setPools] = useState<OnchainPool[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [refreshTick, setRefreshTick] = useState(0);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<PoolFilter>("All");

  useEffect(() => {
    let cancelled = false;

    async function run() {
      setLoading(true);
      setLoadError(null);
      try {
        const call: EthCaller = provider ? createProviderCaller(provider) : createRpcCaller(NETWORK.rpcUrl);
        const fetched = await fetchExplorePools(call);
        if (!cancelled) {
          setPools(fetched);
          setLoading(false);
        }
      } catch (caughtError) {
        if (!cancelled) {
          setLoadError(caughtError instanceof Error ? caughtError.message : "Failed to load pools");
          setLoading(false);
        }
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [provider, refreshTick]);

  const categoriesByPair = useMemo(() => {
    const map = new Map<string, PoolCategory[]>();
    pools.forEach((pool) => {
      map.set(pool.pairAddress.toLowerCase(), classifyPool(pool, pools));
    });
    return map;
  }, [pools]);

  const filteredPools = useMemo(
    () => filterOnchainPools(pools, filter, query, categoriesByPair),
    [pools, filter, query, categoriesByPair]
  );

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

        <div className="mt-4 flex items-center justify-between gap-3">
          <FilterChips options={poolFilters} active={filter} onChange={setFilter} />
          <button
            type="button"
            onClick={() => setRefreshTick((tick) => tick + 1)}
            className="shrink-0 font-mono text-[10px] uppercase tracking-wider2 text-bronze hover:text-ivory"
          >
            Refresh
          </button>
        </div>

        <div className="mt-5">
          {loading ? (
            <p className="border border-line bg-panel px-4 py-10 text-center font-mono text-xs uppercase tracking-wider2 text-bronze">
              Reading Pools On-Chain...
            </p>
          ) : loadError ? (
            <div className="flex flex-col items-center border border-line bg-panel px-4 py-10 text-center">
              <p className="font-mono text-xs uppercase tracking-wider2 text-garnetLight">{loadError}</p>
              <button
                type="button"
                onClick={() => setRefreshTick((tick) => tick + 1)}
                className="mt-4 border border-gold px-5 py-2.5 font-mono text-[11px] uppercase tracking-wider2 text-goldLight transition-colors hover:bg-gold hover:text-void"
              >
                Retry
              </button>
            </div>
          ) : filteredPools.length === 0 ? (
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
                {filteredPools.map((pool) => (
                  <PoolRow key={pool.pairAddress} pool={pool} variant="row" onClick={() => onSelectPool(pool)} />
                ))}
              </div>
              <div className="grid grid-cols-1 gap-3 sm:hidden">
                {filteredPools.map((pool) => (
                  <PoolRow key={pool.pairAddress} pool={pool} variant="card" onClick={() => onSelectPool(pool)} />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
