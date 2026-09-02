"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { SearchIcon, CloseIcon } from "@/components/icons";
import Pagination from "@/components/launchpad/Pagination";
import DexHeader from "./DexHeader";
import DexTabs, { type DexMainTab, type DexTimeframe } from "./DexTabs";
import DexSortBar, { type DexSortOption } from "./DexSortBar";
import PairRow from "./PairRow";
import {
  PAIRS_PER_PAGE,
  isDexMainTab,
  isDexTimeframe,
  isDexSortOption,
  queryDexPairs,
} from "@/lib/dex-data";
import { buildSearchString, pageHref, resolvePageFromPathname } from "@/lib/pagination";
import { useDebouncedValue } from "@/lib/useDebouncedValue";

const DEX_BASE_PATH = "/dex";

export default function DexApp() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const page = resolvePageFromPathname(pathname, DEX_BASE_PATH);

  const initialTab = isDexMainTab(searchParams.get("tab"))
    ? (searchParams.get("tab") as DexMainTab)
    : "Trending";
  const initialTimeframe = isDexTimeframe(searchParams.get("timeframe"))
    ? (searchParams.get("timeframe") as DexTimeframe)
    : "6H";
  const initialSort = isDexSortOption(searchParams.get("sort"))
    ? (searchParams.get("sort") as DexSortOption)
    : null;
  const initialQuery = searchParams.get("q") ?? "";

  const [tab, setTab] = useState<DexMainTab>(initialTab);
  const [timeframe, setTimeframe] = useState<DexTimeframe>(initialTimeframe);
  const [sort, setSort] = useState<DexSortOption | null>(initialSort);
  const [query, setQuery] = useState(initialQuery);
  const debouncedQuery = useDebouncedValue(query, 300);

  const { pairs: pagePairs, total, totalPages } = useMemo(
    () =>
      queryDexPairs({
        tab,
        timeframe,
        sort,
        query: debouncedQuery,
        page,
        pageSize: PAIRS_PER_PAGE,
      }),
    [tab, timeframe, sort, debouncedQuery, page]
  );

  const search = buildSearchString({
    tab: tab === "Trending" ? "" : tab,
    timeframe: timeframe === "6H" ? "" : timeframe,
    sort: sort ?? "",
    q: query,
  });

  const skipFilterReset = useRef(true);
  useEffect(() => {
    if (skipFilterReset.current) {
      skipFilterReset.current = false;
      return;
    }
    router.replace(pageHref(DEX_BASE_PATH, 1, search));
  }, [debouncedQuery, tab, timeframe, sort, router, search]);

  useEffect(() => {
    if (page > totalPages) {
      router.replace(pageHref(DEX_BASE_PATH, totalPages, search));
    }
  }, [page, totalPages, router, search]);

  const rangeStart = total === 0 ? 0 : (page - 1) * PAIRS_PER_PAGE + 1;
  const rangeEnd = Math.min(total, page * PAIRS_PER_PAGE);

  return (
    <div>
      <DexHeader />

      <section className="py-8">
        <div className="px-6">
          <div className="mx-auto max-w-6xl">
            <div className="flex items-center gap-3 border border-line bg-panel px-4 py-2.5 transition-colors focus-within:border-gold/60">
              <SearchIcon className="h-4 w-4 shrink-0 text-bronze" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                type="text"
                placeholder="Search pairs by name or ticker..."
                className="w-full bg-transparent font-body text-sm text-ivory placeholder:text-bronze/70 focus:outline-none"
              />
              {query.length > 0 && (
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
              <DexTabs tab={tab} onTabChange={setTab} timeframe={timeframe} onTimeframeChange={setTimeframe} />
            </div>

            <div className="mt-3">
              <DexSortBar active={sort} onChange={setSort} />
            </div>

            <p className="mt-4 font-mono text-[10px] uppercase tracking-wider2 text-bronze">
              {total === 0
                ? "No pairs match this filter"
                : `Showing pairs ${rangeStart}-${rangeEnd} of ${total}`}
            </p>
          </div>
        </div>

        <div className="mx-auto mt-3 max-w-6xl sm:px-6">
          <div className="border-y border-line bg-panel sm:border-x">
            {pagePairs.length === 0 ? (
              <p className="px-4 py-10 text-center font-mono text-xs uppercase tracking-wider2 text-bronze">
                No pairs in this filter yet
              </p>
            ) : (
              pagePairs.map((pair) => <PairRow key={pair.id} pair={pair} />)
            )}
          </div>
        </div>

        <div className="px-6">
          <div className="mx-auto max-w-6xl">
            <Pagination page={page} totalPages={totalPages} basePath={DEX_BASE_PATH} search={search} />
          </div>
        </div>
      </section>
    </div>
  );
}
