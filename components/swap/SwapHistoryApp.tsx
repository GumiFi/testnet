"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronLeftIcon, ClockIcon } from "@/components/icons";
import LazyOnView from "@/components/LazyOnView";
import Pagination from "@/components/launchpad/Pagination";
import SwapHistoryChunkSkeleton from "@/components/skeletons/SwapHistoryChunkSkeleton";
import SwapHistoryRow from "./SwapHistoryRow";
import { querySwapHistory, SWAP_HISTORY_PAGE_SIZE, type SwapHistoryItem } from "@/lib/swap-data";
import { resolvePageFromPathname } from "@/lib/pagination";

const HISTORY_BASE_PATH = "/swap/history";
const EAGER_ROWS = 4;
const CHUNK_SIZE = 3;

function chunkRows(list: SwapHistoryItem[], size: number): SwapHistoryItem[][] {
  const chunks: SwapHistoryItem[][] = [];
  for (let i = 0; i < list.length; i += size) {
    chunks.push(list.slice(i, i + size));
  }
  return chunks;
}

export default function SwapHistoryApp() {
  const pathname = usePathname();
  const page = resolvePageFromPathname(pathname, HISTORY_BASE_PATH);
  const { items, total, totalPages } = querySwapHistory(page, SWAP_HISTORY_PAGE_SIZE);

  const eagerItems = items.slice(0, EAGER_ROWS);
  const lazyItems = items.slice(EAGER_ROWS);
  const lazyChunks = chunkRows(lazyItems, CHUNK_SIZE);

  const rangeStart = total === 0 ? 0 : (page - 1) * SWAP_HISTORY_PAGE_SIZE + 1;
  const rangeEnd = Math.min(total, page * SWAP_HISTORY_PAGE_SIZE);

  return (
    <div className="mx-auto max-w-md px-4 py-8 md:py-12">
      <Link
        href="/swap"
        className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider2 text-bronze transition-colors hover:text-goldLight"
      >
        <ChevronLeftIcon className="h-3 w-3" />
        Back to Swap
      </Link>

      <div className="mt-4 flex items-center gap-2">
        <ClockIcon className="h-5 w-5 text-goldLight" />
        <h1 className="font-display text-xl uppercase tracking-wider2 text-ivory text-shadow-gold">
          Transaction History
        </h1>
      </div>
      <p className="mt-1 font-mono text-[10px] uppercase tracking-wider2 text-bronze">
        {total === 0 ? "No transactions yet" : `Showing ${rangeStart}-${rangeEnd} of ${total}`}
      </p>

      <div className="mt-4 border border-line bg-panel">
        {items.length === 0 ? (
          <p className="px-4 py-10 text-center font-mono text-xs uppercase tracking-wider2 text-bronze">
            No transactions in this range yet
          </p>
        ) : (
          <>
            {eagerItems.map((item, index) => (
              <SwapHistoryRow
                key={item.id}
                item={item}
                isLast={lazyItems.length === 0 && index === eagerItems.length - 1}
              />
            ))}

            {lazyChunks.map((rows, chunkIndex) => (
              <LazyOnView
                key={`${page}-${chunkIndex}`}
                rootMargin="150px"
                fallback={<SwapHistoryChunkSkeleton rows={rows.length} />}
              >
                <div>
                  {rows.map((item, rowIndex) => (
                    <SwapHistoryRow
                      key={item.id}
                      item={item}
                      isLast={chunkIndex === lazyChunks.length - 1 && rowIndex === rows.length - 1}
                    />
                  ))}
                </div>
              </LazyOnView>
            ))}
          </>
        )}
      </div>

      <Pagination page={page} totalPages={totalPages} basePath={HISTORY_BASE_PATH} />
    </div>
  );
}
