"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  RocketIcon,
  SearchIcon,
  GearIcon,
  FilterIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ClockIcon,
} from "@/components/icons";
import Avatar from "@/components/discover/Avatar";
import BoosterBadge from "@/components/BoosterBadge";
import GumiTag from "@/components/GumiTag";
import WalletTag from "@/components/WalletTag";
import FilterChips from "@/components/discover/FilterChips";
import Pagination from "./Pagination";
import FilterPanel, { DEFAULT_FILTER_RANGE, type FilterRange } from "./FilterPanel";
import DisplaySettingsPanel, { type ViewMode } from "./DisplaySettingsPanel";
import CoinTableView from "./CoinTableView";
import {
  COINS_PER_PAGE,
  isGumiHandle,
  launchpadExploreFilters as exploreFilters,
  isLaunchpadExploreFilter as isExploreFilter,
  queryLaunchpadCoins,
  type LaunchpadExploreFilter as ExploreFilter,
} from "@/lib/launchpad-data";
import { formatCompactUsd, formatPct, formatPrice } from "@/lib/format";
import { buildSearchString, pageHref, resolvePageFromPathname } from "@/lib/pagination";

const LAUNCHPAD_BASE_PATH = "/launchpad";

export default function ExploreCoinsSection() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const page = resolvePageFromPathname(pathname, LAUNCHPAD_BASE_PATH);

  const initialFilter = isExploreFilter(searchParams.get("filter"))
    ? (searchParams.get("filter") as ExploreFilter)
    : "Trending";
  const initialQuery = searchParams.get("q") ?? "";

  const [filter, setFilter] = useState<ExploreFilter>(initialFilter);
  const [query, setQuery] = useState(initialQuery);
  const [range, setRange] = useState<FilterRange>(DEFAULT_FILTER_RANGE);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [animationsEnabled, setAnimationsEnabled] = useState(true);
  const [openPanel, setOpenPanel] = useState<"filter" | "display" | null>(null);

  const { coins: pageCoins, total, totalPages } = useMemo(
    () =>
      queryLaunchpadCoins({
        filter,
        query,
        page,
        pageSize: COINS_PER_PAGE,
        mcapMin: range.mcapMin,
        mcapMax: range.mcapMax,
        volMin: range.volMin,
        volMax: range.volMax,
      }),
    [filter, query, page, range]
  );

  const search = buildSearchString({
    filter: filter === "Trending" ? "" : filter,
    q: query,
  });

  const skipFilterReset = useRef(true);
  useEffect(() => {
    if (skipFilterReset.current) {
      skipFilterReset.current = false;
      return;
    }
    router.replace(pageHref(LAUNCHPAD_BASE_PATH, 1, search));
  }, [filter, query, router, search]);

  useEffect(() => {
    if (page > totalPages) {
      router.replace(pageHref(LAUNCHPAD_BASE_PATH, totalPages, search));
    }
  }, [page, totalPages, router, search]);

  const isFilterActive =
    range.mcapMin !== DEFAULT_FILTER_RANGE.mcapMin ||
    range.mcapMax !== DEFAULT_FILTER_RANGE.mcapMax ||
    range.volMin !== DEFAULT_FILTER_RANGE.volMin ||
    range.volMax !== DEFAULT_FILTER_RANGE.volMax;

  return (
    <section className="px-6 py-10">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-center gap-2">
          <RocketIcon className="h-4 w-4 text-goldLight" />
          <h2 className="font-display text-lg uppercase tracking-wider2 text-ivory">Explore Coins</h2>
        </div>

        <div className="mt-5 flex items-center gap-3 border border-line bg-panel px-4 py-2.5 transition-colors focus-within:border-gold/60">
          <SearchIcon className="h-4 w-4 shrink-0 text-bronze" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            type="text"
            placeholder="Search coins by name or ticker..."
            className="w-full bg-transparent font-body text-sm text-ivory placeholder:text-bronze/70 focus:outline-none"
          />
        </div>

        <div className="relative mt-4 flex items-center justify-between gap-3">
          {openPanel && (
            <div className="fixed inset-0 z-20" onClick={() => setOpenPanel(null)} aria-hidden="true" />
          )}
          <FilterChips options={exploreFilters} active={filter} onChange={setFilter} />

          <div className="flex shrink-0 items-center gap-2">
            <div className="relative">
              <button
                type="button"
                onClick={() => setOpenPanel((prev) => (prev === "filter" ? null : "filter"))}
                aria-label="Filter coins"
                className={`flex h-8 items-center gap-1.5 border px-2.5 font-mono text-[10px] uppercase tracking-wider2 transition-colors ${
                  isFilterActive || openPanel === "filter"
                    ? "border-gold text-goldLight"
                    : "border-line text-bronze hover:border-gold hover:text-goldLight"
                }`}
              >
                <FilterIcon className="h-3.5 w-3.5" />
                Filter
              </button>
              {openPanel === "filter" && (
                <FilterPanel
                  applied={range}
                  onApply={setRange}
                  onClose={() => setOpenPanel(null)}
                />
              )}
            </div>

            <div className="relative">
              <button
                type="button"
                onClick={() => setOpenPanel((prev) => (prev === "display" ? null : "display"))}
                aria-label="Coin list settings"
                className={`flex h-8 w-8 shrink-0 items-center justify-center border transition-colors ${
                  openPanel === "display"
                    ? "border-gold text-goldLight"
                    : "border-line text-bronze hover:border-gold hover:text-goldLight"
                }`}
              >
                <GearIcon className="h-4 w-4" />
              </button>
              {openPanel === "display" && (
                <DisplaySettingsPanel
                  viewMode={viewMode}
                  onViewModeChange={(mode) => {
                    setViewMode(mode);
                  }}
                  animationsEnabled={animationsEnabled}
                  onAnimationsChange={setAnimationsEnabled}
                />
              )}
            </div>
          </div>
        </div>

        <p className="mt-4 font-mono text-[10px] uppercase tracking-wider2 text-bronze">
          {total} coins · Page {page} of {totalPages}
        </p>

        {viewMode === "table" ? (
          <div className="mt-3">
            <CoinTableView coins={pageCoins} animationsEnabled={animationsEnabled} />
          </div>
        ) : (
          <div className="mt-3 grid grid-cols-2 gap-3 sm:gap-4">
            {pageCoins.length === 0 ? (
              <p className="col-span-full px-4 py-10 text-center font-mono text-xs uppercase tracking-wider2 text-bronze">
                No coins match this filter yet
              </p>
            ) : (
              pageCoins.map((coin) => {
                const positive = coin.change24h >= 0;
                const bonded = Math.min(100, coin.bondingProgress);
                return (
                  <Link
                    key={coin.id}
                    href={`/launchpad/coin/${coin.id}`}
                    className={`group relative overflow-hidden border border-line bg-panel p-2.5 text-left ${
                      animationsEnabled ? "transition-colors hover:border-gold/40" : "hover:border-gold/40"
                    }`}
                  >
                    <div className="relative aspect-square w-full overflow-hidden">
                      <Avatar
                        label={coin.monogram}
                        accent={coin.accent}
                        shape="square"
                        className="h-full w-full text-2xl"
                      />
                      <span className="absolute left-1 top-1 border border-gold/50 bg-void/90 px-1 py-0.5 font-mono text-[9px] uppercase tracking-wider2 text-goldLight">
                        {formatCompactUsd(coin.marketCap)}
                      </span>
                      {coin.isNew && (
                        <span className="absolute right-1 top-1 border border-emeraldLight/60 bg-void/90 px-1 py-0.5 font-mono text-[9px] uppercase tracking-wider2 text-emeraldLight">
                          New
                        </span>
                      )}

                      <div className="absolute inset-x-0 bottom-0 bg-void/90 px-1.5 py-1">
                        <div className="flex items-center justify-between font-mono text-[8px] uppercase tracking-wider2 text-bronze">
                          <span>Bonding</span>
                          <span className={bonded >= 100 ? "text-emeraldLight" : "text-goldLight"}>{bonded}%</span>
                        </div>
                        <div className="mt-0.5 h-1 w-full overflow-hidden rounded-full bg-line">
                          <div
                            className={`h-full rounded-full ${bonded >= 100 ? "bg-emeraldLight" : "bg-gold"}`}
                            style={{ width: `${bonded}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="mt-1.5 flex items-start justify-between gap-2">
                      <p className="min-w-0 flex-1 truncate font-display text-xs uppercase tracking-wider2 text-ivory">
                        {coin.name}
                      </p>
                      <div className="flex shrink-0 flex-col items-end gap-1 font-mono text-[9px] uppercase tracking-wider2">
                        <span className="flex items-center gap-0.5 text-bronze">
                          <ClockIcon className="h-2.5 w-2.5" />
                          {coin.age}
                        </span>
                        <span
                          className={`flex items-center gap-0.5 ${
                            positive ? "text-emeraldLight" : "text-garnetLight"
                          }`}
                        >
                          {positive ? (
                            <ArrowUpIcon className="h-2.5 w-2.5" />
                          ) : (
                            <ArrowDownIcon className="h-2.5 w-2.5" />
                          )}
                          {formatPct(coin.change24h)}
                        </span>
                      </div>
                    </div>
                    <p className="truncate font-mono text-[10px] uppercase tracking-wider2 text-bronze">
                      ${coin.symbol}
                    </p>
                    <p className="mt-1 h-4 truncate font-body text-[11px] text-ivory/60">
                      {coin.tagline || "\u00A0"}
                    </p>
                    <div className="mt-1 flex items-end justify-between gap-2">
                      <p className="font-mono text-[10px] text-goldLight">{formatPrice(coin.priceUsd)}</p>
                      <div className="flex shrink-0 flex-col items-end gap-1">
                        <div className="flex h-[13px] items-center">
                          {coin.boost != null && <BoosterBadge value={coin.boost} />}
                        </div>
                        {isGumiHandle(coin.creator) ? (
                          <GumiTag handle={coin.creator} className="max-w-[120px]" />
                        ) : (
                          <WalletTag address={coin.creator} className="max-w-[120px]" />
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        )}

        <Pagination page={page} totalPages={totalPages} basePath={LAUNCHPAD_BASE_PATH} search={search} />
      </div>
    </section>
  );
}
