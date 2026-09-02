import Link from "next/link";
import { ChevronRightIcon, ClockIcon } from "@/components/icons";
import SwapHistoryRow from "./SwapHistoryRow";
import { getRecentSwapHistory } from "@/lib/swap-data";

const RECENT_SWAPS_LIMIT = 4;

export default function RecentSwapsSection() {
  const items = getRecentSwapHistory(RECENT_SWAPS_LIMIT);

  return (
    <div className="mx-auto mt-6 w-full max-w-md pb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ClockIcon className="h-3.5 w-3.5 text-goldLight" />
          <p className="font-mono text-[10px] uppercase tracking-wider2 text-bronze">Recent</p>
        </div>
        {items.length > 0 && (
          <Link
            href="/swap/history"
            className="font-mono text-[9px] uppercase tracking-wider2 text-bronze transition-colors hover:text-goldLight"
          >
            View All
          </Link>
        )}
      </div>

      {items.length === 0 ? (
        <div className="mt-3 border border-line bg-panel px-4 py-6 text-center">
          <p className="font-mono text-[10px] uppercase tracking-wider2 text-bronze">No transactions yet</p>
        </div>
      ) : (
        <>
          <div className="mt-3 border border-line bg-panel">
            {items.map((item, index) => (
              <SwapHistoryRow key={item.id} item={item} isLast={index === items.length - 1} />
            ))}
          </div>

          <Link
            href="/swap/history"
            className="mt-3 flex items-center justify-center gap-1 border border-line px-4 py-2.5 font-mono text-[10px] uppercase tracking-wider2 text-bronze transition-colors hover:border-gold hover:text-goldLight"
          >
            View All
            <ChevronRightIcon className="h-3 w-3" />
          </Link>
        </>
      )}
    </div>
  );
}
