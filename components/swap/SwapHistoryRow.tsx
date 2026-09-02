import Link from "next/link";
import Avatar from "@/components/discover/Avatar";
import { ArrowDownIcon, ChevronRightIcon } from "@/components/icons";
import { getSwapTokenById, type SwapHistoryItem } from "@/lib/swap-data";

export default function SwapHistoryRow({
  item,
  isLast = false,
}: {
  item: SwapHistoryItem;
  isLast?: boolean;
}) {
  const fromToken = getSwapTokenById(item.fromId);
  const toToken = getSwapTokenById(item.toId);
  if (!fromToken || !toToken) return null;

  return (
    <Link
      href={`/swap/tx/${item.id}`}
      className={`flex items-center gap-3 px-4 py-3 transition-colors hover:bg-panel2 ${
        isLast ? "" : "border-b border-line"
      }`}
    >
      <div className="flex shrink-0 items-center">
        <Avatar label={fromToken.monogram} accent={fromToken.accent} className="h-7 w-7 text-[9px]" />
        <span className="mx-1.5 flex h-4 w-4 items-center justify-center text-bronze">
          <ArrowDownIcon className="h-3 w-3 -rotate-90" />
        </span>
        <Avatar label={toToken.monogram} accent={toToken.accent} className="h-7 w-7 text-[9px]" />
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate font-display text-xs uppercase tracking-wider2 text-ivory">
          {fromToken.symbol} → {toToken.symbol}
        </p>
        {item.status === "failed" && (
          <span className="mt-0.5 inline-block font-mono text-[9px] uppercase tracking-wider2 text-garnetLight">
            Failed
          </span>
        )}
      </div>

      <span className="shrink-0 font-mono text-[10px] uppercase tracking-wider2 text-bronze">
        {item.timeAgo}
      </span>
      <ChevronRightIcon className="h-3 w-3 shrink-0 text-bronze" />
    </Link>
  );
}
