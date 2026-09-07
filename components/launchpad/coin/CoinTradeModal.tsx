"use client";

import { useState } from "react";
import { CloseIcon, RocketIcon } from "@/components/icons";

export type CoinTradeMode = "buy" | "sell";

export default function CoinTradeModal({
  mode,
  symbol,
  balanceLabel,
  quoteLabel,
  quoteLoading,
  errorMessage,
  stageLabel,
  onAmountChange,
  onMax,
  onConfirm,
  onClose,
}: {
  mode: CoinTradeMode;
  symbol: string;
  balanceLabel?: string;
  quoteLabel: string;
  quoteLoading: boolean;
  errorMessage: string | null;
  stageLabel: string;
  onAmountChange: (value: string) => void;
  onMax?: () => string;
  onConfirm: (value: string) => void;
  onClose: () => void;
}) {
  const [draft, setDraft] = useState("");
  const draftNum = parseFloat(draft) || 0;
  const isBusy = stageLabel !== "";
  const isBuy = mode === "buy";
  const unitLabel = isBuy ? "ETH" : symbol;

  function handleChange(value: string) {
    const next = value.replace(/[^0-9.]/g, "");
    setDraft(next);
    onAmountChange(next);
  }

  function handleMaxClick() {
    if (!onMax) return;
    const next = onMax();
    setDraft(next);
    onAmountChange(next);
  }

  function handleConfirm() {
    if (draftNum <= 0 || isBusy) return;
    onConfirm(draft);
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center px-6">
      <div className="absolute inset-0 animate-fadeIn bg-void/80 backdrop-blur-sm" onClick={isBusy ? undefined : onClose} />
      <div className="relative w-full max-w-xs border border-gold/40 bg-panel px-6 py-6 animate-fadeUp">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2.5">
            <span
              className={`flex h-8 w-8 shrink-0 items-center justify-center border ${
                isBuy ? "border-emeraldLight/40 text-emeraldLight" : "border-garnetLight/40 text-garnetLight"
              }`}
            >
              <RocketIcon className="h-4 w-4" />
            </span>
            <span className="font-display text-sm tracking-wider2 text-ivory">
              {isBuy ? "Buy" : "Sell"} ${symbol}
            </span>
          </span>
          <button
            type="button"
            onClick={onClose}
            disabled={isBusy}
            aria-label="Close"
            className="flex h-7 w-7 shrink-0 items-center justify-center border border-line text-bronze transition-colors hover:border-gold hover:text-goldLight disabled:opacity-40"
          >
            <CloseIcon className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="mt-5">
          <div className="flex h-5 items-center justify-between">
            <p className="font-mono text-[10px] uppercase tracking-wider2 text-bronze">
              {isBuy ? "Pay (ETH)" : `Sell (${symbol})`}
            </p>
            {balanceLabel && (
              <button
                type="button"
                onClick={handleMaxClick}
                disabled={isBusy}
                className="font-mono text-[9px] uppercase tracking-wider2 text-bronze underline decoration-dotted hover:text-goldLight disabled:opacity-40"
              >
                {balanceLabel}
              </button>
            )}
          </div>
          <input
            value={draft}
            onChange={(event) => handleChange(event.target.value)}
            type="text"
            inputMode="decimal"
            autoFocus
            disabled={isBusy}
            placeholder="0.0"
            className="mt-2 w-full rounded-lg border border-line bg-panel2 px-4 py-3 font-display text-base text-ivory placeholder:text-bronze/50 focus:border-gold/60 focus:outline-none disabled:opacity-60"
          />
          <div className="mt-2 flex h-4 items-center justify-between">
            <p className="font-mono text-[10px] uppercase tracking-wider2 text-bronze">
              {quoteLoading ? "Fetching quote..." : quoteLabel}
            </p>
            <p className="font-mono text-[9px] uppercase tracking-wider2 text-bronze/70">{unitLabel} in</p>
          </div>
          {errorMessage && (
            <p className="mt-2 font-body text-xs leading-relaxed text-garnetLight">{errorMessage}</p>
          )}
        </div>

        <button
          type="button"
          disabled={draftNum <= 0 || isBusy}
          onClick={handleConfirm}
          className={`mt-6 w-full rounded-lg border px-4 py-3 font-mono text-[11px] uppercase tracking-wider2 transition-colors ${
            draftNum <= 0 || isBusy
              ? "cursor-not-allowed border-line bg-panel2 text-bronze"
              : isBuy
              ? "border-emeraldLight text-emeraldLight hover:bg-emeraldLight/20"
              : "border-garnetLight text-garnetLight hover:bg-garnetLight/20"
          }`}
        >
          {isBusy ? stageLabel : isBuy ? "Confirm Buy" : "Confirm Sell"}
        </button>
      </div>
    </div>
  );
}
