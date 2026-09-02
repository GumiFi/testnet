import Link from "next/link";
import Avatar from "@/components/discover/Avatar";
import { ArrowDownIcon, ChevronLeftIcon } from "@/components/icons";
import CopyField from "./CopyField";
import { formatBalance, formatPrice } from "@/lib/format";
import {
  getSwapHistoryById,
  getSwapTokenById,
  SWAP_NETWORK_NAME,
  type SwapHistoryItem,
} from "@/lib/swap-data";

function InfoRow({
  label,
  value,
  valueClassName = "text-ivory",
  isLast = false,
}: {
  label: string;
  value: string;
  valueClassName?: string;
  isLast?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between px-4 py-3 ${isLast ? "" : "border-b border-line"}`}
    >
      <span className="font-mono text-[10px] uppercase tracking-wider2 text-bronze">{label}</span>
      <span className={`font-mono text-xs ${valueClassName}`}>{value}</span>
    </div>
  );
}

export default function SwapTxDetailApp({ id }: { id: string }) {
  const item: SwapHistoryItem | undefined = getSwapHistoryById(id);

  if (!item) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <p className="font-display text-sm uppercase tracking-wider2 text-ivory">
          Transaction Not Found
        </p>
        <Link
          href="/swap/history"
          className="mt-4 inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider2 text-goldLight hover:text-goldLight"
        >
          <ChevronLeftIcon className="h-3 w-3" />
          Back to History
        </Link>
      </div>
    );
  }

  const fromToken = getSwapTokenById(item.fromId);
  const toToken = getSwapTokenById(item.toId);
  const isCompleted = item.status === "completed";

  return (
    <div className="mx-auto max-w-md px-4 py-8 md:py-12">
      <Link
        href="/swap/history"
        className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider2 text-bronze transition-colors hover:text-goldLight"
      >
        <ChevronLeftIcon className="h-3 w-3" />
        Back to History
      </Link>

      <div className="mt-4 border border-line bg-panel px-5 py-6 text-center">
        <div className="flex items-center justify-center">
          {fromToken && (
            <Avatar label={fromToken.monogram} accent={fromToken.accent} className="h-11 w-11 text-[11px]" />
          )}
          <span className="mx-2 flex h-5 w-5 items-center justify-center text-bronze">
            <ArrowDownIcon className="h-3.5 w-3.5 -rotate-90" />
          </span>
          {toToken && (
            <Avatar label={toToken.monogram} accent={toToken.accent} className="h-11 w-11 text-[11px]" />
          )}
        </div>

        <p className="mt-4 font-display text-sm uppercase tracking-wider2 text-ivory">
          {formatBalance(item.fromAmount)} {fromToken?.symbol} → {formatBalance(item.toAmount)}{" "}
          {toToken?.symbol}
        </p>

        <span
          className={`mt-3 inline-block border px-3 py-1 font-mono text-[9px] uppercase tracking-wider2 ${
            isCompleted
              ? "border-emeraldLight/50 text-emeraldLight"
              : "border-garnetLight/50 text-garnetLight"
          }`}
        >
          {isCompleted ? "Completed" : "Failed"}
        </span>

        <p className="mt-2 font-mono text-[10px] uppercase tracking-wider2 text-bronze">{item.timeAgo}</p>
      </div>

      <div className="mt-4 border border-line bg-panel">
        <InfoRow label="Network" value={SWAP_NETWORK_NAME} />
        <InfoRow
          label="Rate"
          value={`1 ${fromToken?.symbol} = ${formatPrice(item.rate).replace("$", "")} ${toToken?.symbol}`}
        />
        <InfoRow label="Price Impact" value={`${item.priceImpactPct.toFixed(2)}%`} />
        <InfoRow label="Network Fee" value={`$${item.networkFeeUsd.toFixed(2)}`} />
        <InfoRow label="Block Number" value={item.blockNumber.toLocaleString("en-US")} isLast />
      </div>

      <div className="mt-4 border border-line bg-panel">
        <CopyField label="Transaction Hash" value={item.txHash} />
        <CopyField label="Wallet Address" value={item.walletAddress} />
        <CopyField label={`${fromToken?.symbol ?? "From"} Contract Address`} value={item.fromTokenContract} />
        <CopyField
          label={`${toToken?.symbol ?? "To"} Contract Address`}
          value={item.toTokenContract}
          isLast
        />
      </div>
    </div>
  );
}
