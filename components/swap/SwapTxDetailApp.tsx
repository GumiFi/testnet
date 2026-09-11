"use client";

import Link from "next/link";
import Avatar from "@/components/discover/Avatar";
import { ArrowDownIcon, ChevronLeftIcon } from "@/components/icons";
import CopyField from "./CopyField";
import { formatBalance, formatPrice } from "@/lib/format";
import { useSwapByTxHash } from "@/lib/swap-history-live";

const SWAP_NETWORK_NAME = "Giwa Testnet";

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
      <span className="font-mono text-[0.625rem] uppercase tracking-wider2 text-bronze">{label}</span>
      <span className={`font-mono text-xs ${valueClassName}`}>{value}</span>
    </div>
  );
}

export default function SwapTxDetailApp({ id }: { id: string }) {
  const { item, loaded } = useSwapByTxHash(id);

  if (!item) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <p className="font-display text-sm uppercase tracking-wider2 text-ivory">
          {loaded ? "Transaction Not Found" : "Loading Transaction..."}
        </p>
        <Link
          href="/swap/history"
          className="mt-4 inline-flex items-center gap-1 font-mono text-[0.625rem] uppercase tracking-wider2 text-goldLight hover:text-goldLight"
        >
          <ChevronLeftIcon className="h-3 w-3" />
          Back to History
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-4 py-8 md:py-12">
      <Link
        href="/swap/history"
        className="inline-flex items-center gap-1 font-mono text-[0.625rem] uppercase tracking-wider2 text-bronze transition-colors hover:text-goldLight"
      >
        <ChevronLeftIcon className="h-3 w-3" />
        Back to History
      </Link>

      <div className="mt-4 border border-line bg-panel px-5 py-6 text-center">
        <div className="flex items-center justify-center">
          <Avatar label={item.fromMonogram} accent={item.fromAccent} className="h-11 w-11 text-[0.6875rem]" />
          <span className="mx-2 flex h-5 w-5 items-center justify-center text-bronze">
            <ArrowDownIcon className="h-3.5 w-3.5 -rotate-90" />
          </span>
          <Avatar label={item.toMonogram} accent={item.toAccent} className="h-11 w-11 text-[0.6875rem]" />
        </div>

        <p className="mt-4 font-display text-sm uppercase tracking-wider2 text-ivory">
          {formatBalance(item.fromAmount)} {item.fromSymbol} → {formatBalance(item.toAmount)}{" "}
          {item.toSymbol}
        </p>

        <span className="mt-3 inline-block border border-emeraldLight/50 px-3 py-1 font-mono text-[0.5625rem] uppercase tracking-wider2 text-emeraldLight">
          Completed
        </span>
      </div>

      <div className="mt-4 border border-line bg-panel">
        <InfoRow label="Network" value={SWAP_NETWORK_NAME} />
        <InfoRow
          label="Rate"
          value={`1 ${item.fromSymbol} = ${formatPrice(item.rate).replace("$", "")} ${item.toSymbol}`}
        />
        <InfoRow
          label="Network Fee"
          value={item.networkFeeUsd != null ? `$${item.networkFeeUsd.toFixed(2)}` : "—"}
        />
        <InfoRow label="Block Number" value={item.blockNumber.toLocaleString("en-US")} isLast />
      </div>

      <div className="mt-4 border border-line bg-panel">
        <CopyField label="Transaction Hash" value={item.txHash} />
        <CopyField label="Wallet Address" value={item.walletAddress} />
        <CopyField label={`${item.fromSymbol} Contract Address`} value={item.fromTokenContract} />
        <CopyField label={`${item.toSymbol} Contract Address`} value={item.toTokenContract} isLast />
      </div>
    </div>
  );
}
