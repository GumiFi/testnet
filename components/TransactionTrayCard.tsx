"use client";

import { useState } from "react";
import { CheckIcon, CopyIcon, GlobeIcon, XIcon } from "@/components/icons";
import { GIWA_EXPLORER_TX_URL, type TransactionRecord } from "@/lib/transaction-context";

function truncateHash(hash: string): string {
  return `${hash.slice(0, 8)}...${hash.slice(-6)}`;
}

function stepIndex(status: TransactionRecord["status"]): number {
  if (status === "pending") return 0;
  if (status === "confirming") return 1;
  return 2;
}

export default function TransactionTrayCard({
  transaction,
  onDismiss,
}: {
  transaction: TransactionRecord;
  onDismiss: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const { status, title, subtitle, txHash } = transaction;
  const activeIndex = stepIndex(status);
  const isFailed = status === "failed";
  const isSuccess = status === "success";
  const isSettled = isFailed || isSuccess;

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(txHash);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="w-full animate-fadeUp border border-gold/40 bg-panel/95 px-4 py-3.5 shadow-[0_20px_40px_rgba(0,0,0,0.55)] backdrop-blur">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <span
            className={`flex h-8 w-8 shrink-0 items-center justify-center border ${
              isFailed
                ? "border-garnetLight/50 text-garnetLight"
                : isSuccess
                  ? "border-emeraldLight/50 text-emeraldLight"
                  : "border-gold/50 text-goldLight"
            }`}
          >
            {isFailed ? (
              <XIcon className="h-3.5 w-3.5" />
            ) : isSuccess ? (
              <CheckIcon className="h-3.5 w-3.5" />
            ) : (
              <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-goldLight/30 border-t-goldLight" />
            )}
          </span>
          <div className="min-w-0">
            <p className="truncate font-display text-xs uppercase tracking-wider2 text-ivory">
              {title}
            </p>
            {subtitle && (
              <p className="mt-0.5 truncate font-mono text-[10px] text-bronze">{subtitle}</p>
            )}
          </div>
        </div>
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss notification"
          className="shrink-0 text-bronze transition-colors hover:text-goldLight"
        >
          <XIcon className="h-3 w-3" />
        </button>
      </div>

      <div className="mt-3.5 flex items-center gap-1.5">
        {[0, 1, 2].map((index) => {
          const isFinal = index === 2;
          const isPast = index < activeIndex;
          const isCurrent = index === activeIndex && !isSettled;
          let barClass = "bg-line";
          if (isFinal && isSettled) {
            barClass = isFailed ? "bg-garnetLight" : "bg-emeraldLight";
          } else if (isPast) {
            barClass = "bg-goldLight";
          } else if (isCurrent) {
            barClass = "bg-goldLight/70 animate-pulse";
          }
          return (
            <span
              key={index}
              className={`h-1 flex-1 rounded-full transition-colors ${barClass}`}
            />
          );
        })}
      </div>

      <div className="mt-1.5 flex items-center justify-between font-mono text-[8.5px] uppercase tracking-wider2">
        <span className={activeIndex >= 0 ? "text-goldLight" : "text-bronze"}>Pending</span>
        <span className={activeIndex >= 1 ? "text-goldLight" : "text-bronze"}>Confirming</span>
        <span
          className={isSettled ? (isFailed ? "text-garnetLight" : "text-emeraldLight") : "text-bronze"}
        >
          {isFailed ? "Failed" : "Success"}
        </span>
      </div>

      <div className="mt-3 flex items-center justify-between gap-2 border-t border-line pt-2.5">
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1.5 font-mono text-[10px] text-bronze transition-colors hover:text-goldLight"
        >
          {copied ? (
            <CheckIcon className="h-3 w-3 text-emeraldLight" />
          ) : (
            <CopyIcon className="h-3 w-3" />
          )}
          {truncateHash(txHash)}
        </button>
        <a
          href={`${GIWA_EXPLORER_TX_URL}/${txHash}`}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider2 text-goldLight transition-colors hover:text-gold"
        >
          <GlobeIcon className="h-3 w-3" />
          Explorer
        </a>
      </div>
    </div>
  );
}
