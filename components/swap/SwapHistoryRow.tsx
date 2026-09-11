import Link from "next/link";
import Avatar from "@/components/discover/Avatar";
import { ArrowDownIcon, ChevronRightIcon } from "@/components/icons";
import type { SwapHistoryItem } from "@/lib/swap-history-onchain";
import { formatTimeAgo } from "@/lib/activity-onchain";

export default function SwapHistoryRow({
  item,
  isLast = false,
}: {
  item: SwapHistoryItem;
  isLast?: boolean;
}) {
  return (
    <Link
      href={`/swap/tx/${item.txHash}`}
      className={`flex items-center gap-3 px-4 py-3 transition-colors hover:bg-panel2 ${
        isLast ? "" : "border-b border-line"
      }`}
    >
      <div className="flex shrink-0 items-center">
        <Avatar label={item.fromMonogram} accent={item.fromAccent} className="h-7 w-7 text-[0.5625rem]" />
        <span className="mx-1.5 flex h-4 w-4 items-center justify-center text-bronze">
          <ArrowDownIcon className="h-3 w-3 -rotate-90" />
        </span>
        <Avatar label={item.toMonogram} accent={item.toAccent} className="h-7 w-7 text-[0.5625rem]" />
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate font-display text-xs uppercase tracking-wider2 text-ivory">
          {item.fromSymbol} → {item.toSymbol}
        </p>
      </div>

      <span className="shrink-0 font-mono text-[0.625rem] uppercase tracking-wider2 text-bronze">
        {formatTimeAgo(item.timestampMs)}
      </span>
      <ChevronRightIcon className="h-3 w-3 shrink-0 text-bronze" />
    </Link>
  );
}
