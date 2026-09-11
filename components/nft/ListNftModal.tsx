"use client";

import { useState } from "react";
import { CloseIcon } from "@/components/icons";

export default function ListNftModal({
  stageLabel,
  errorMessage,
  onConfirm,
  onClose,
}: {
  stageLabel: string;
  errorMessage: string | null;
  onConfirm: (nftAddress: string, tokenId: string, priceEth: string) => void;
  onClose: () => void;
}) {
  const [nftAddress, setNftAddress] = useState("");
  const [tokenId, setTokenId] = useState("");
  const [priceEth, setPriceEth] = useState("");
  const isBusy = stageLabel !== "";

  const addressValid = /^0x[0-9a-fA-F]{40}$/.test(nftAddress.trim());
  const tokenIdValid = /^\d+$/.test(tokenId.trim());
  const priceValid = parseFloat(priceEth) > 0;
  const canSubmit = addressValid && tokenIdValid && priceValid && !isBusy;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center px-6">
      <div className="absolute inset-0 animate-fadeIn bg-void/80 backdrop-blur-sm" onClick={isBusy ? undefined : onClose} />
      <div className="relative w-full max-w-xs border border-gold/40 bg-panel px-6 py-6 animate-fadeUp">
        <div className="flex items-center justify-between">
          <span className="font-display text-sm tracking-wider2 text-ivory">List NFT For Sale</span>
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

        <div className="mt-4 space-y-3">
          <div>
            <p className="font-mono text-[0.625rem] uppercase tracking-wider2 text-bronze">NFT Contract Address</p>
            <input
              value={nftAddress}
              onChange={(event) => setNftAddress(event.target.value)}
              type="text"
              disabled={isBusy}
              placeholder="0x..."
              className="mt-1.5 w-full rounded-lg border border-line bg-panel2 px-3 py-2.5 font-mono text-xs text-ivory placeholder:text-bronze/50 focus:border-gold/60 focus:outline-none disabled:opacity-60"
            />
          </div>
          <div>
            <p className="font-mono text-[0.625rem] uppercase tracking-wider2 text-bronze">Token ID</p>
            <input
              value={tokenId}
              onChange={(event) => setTokenId(event.target.value.replace(/[^0-9]/g, ""))}
              type="text"
              inputMode="numeric"
              disabled={isBusy}
              placeholder="1"
              className="mt-1.5 w-full rounded-lg border border-line bg-panel2 px-3 py-2.5 font-mono text-xs text-ivory placeholder:text-bronze/50 focus:border-gold/60 focus:outline-none disabled:opacity-60"
            />
          </div>
          <div>
            <p className="font-mono text-[0.625rem] uppercase tracking-wider2 text-bronze">Price (ETH)</p>
            <input
              value={priceEth}
              onChange={(event) => setPriceEth(event.target.value.replace(/[^0-9.]/g, ""))}
              type="text"
              inputMode="decimal"
              disabled={isBusy}
              placeholder="0.1"
              className="mt-1.5 w-full rounded-lg border border-line bg-panel2 px-3 py-2.5 font-mono text-xs text-ivory placeholder:text-bronze/50 focus:border-gold/60 focus:outline-none disabled:opacity-60"
            />
          </div>
        </div>

        {errorMessage && <p className="mt-3 font-body text-xs leading-relaxed text-garnetLight">{errorMessage}</p>}

        <button
          type="button"
          disabled={!canSubmit}
          onClick={() => onConfirm(nftAddress.trim(), tokenId.trim(), priceEth.trim())}
          className={`mt-5 w-full rounded-lg border px-4 py-3 font-mono text-[0.6875rem] uppercase tracking-wider2 transition-colors ${
            !canSubmit
              ? "cursor-not-allowed border-line bg-panel2 text-bronze"
              : "border-goldLight text-goldLight hover:bg-gold/20"
          }`}
        >
          {isBusy ? stageLabel : "List For Sale"}
        </button>
      </div>
    </div>
  );
}
