"use client";

import { CloseIcon } from "@/components/icons";
import { formatEth } from "@/lib/format";
import type { MarketListing } from "@/lib/nft-marketplace-onchain";

export default function BuyNftModal({
  listing,
  priceEth,
  stageLabel,
  errorMessage,
  onConfirm,
  onClose,
}: {
  listing: MarketListing;
  priceEth: number;
  stageLabel: string;
  errorMessage: string | null;
  onConfirm: () => void;
  onClose: () => void;
}) {
  const isBusy = stageLabel !== "";

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center px-6">
      <div className="absolute inset-0 animate-fadeIn bg-void/80 backdrop-blur-sm" onClick={isBusy ? undefined : onClose} />
      <div className="relative w-full max-w-xs border border-gold/40 bg-panel px-6 py-6 animate-fadeUp">
        <div className="flex items-center justify-between">
          <span className="font-display text-sm tracking-wider2 text-ivory">Buy NFT</span>
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

        <div className="mt-4 flex items-center gap-3">
          <div className="h-14 w-14 shrink-0 overflow-hidden border border-line bg-panel2">
            {listing.image ? (
              <img src={listing.image} alt={listing.name} className="h-full w-full object-cover" />
            ) : null}
          </div>
          <div className="min-w-0">
            <p className="truncate font-display text-sm uppercase tracking-wider2 text-ivory">{listing.name}</p>
            <p className="font-mono text-[0.625rem] text-bronze">Token #{listing.tokenId}</p>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-line pt-4">
          <span className="font-mono text-[0.625rem] uppercase tracking-wider2 text-bronze">Price</span>
          <span className="font-mono text-sm text-goldLight">{formatEth(priceEth)}</span>
        </div>

        {errorMessage && <p className="mt-3 font-body text-xs leading-relaxed text-garnetLight">{errorMessage}</p>}

        <button
          type="button"
          disabled={isBusy}
          onClick={onConfirm}
          className={`mt-5 w-full rounded-lg border px-4 py-3 font-mono text-[0.6875rem] uppercase tracking-wider2 transition-colors ${
            isBusy
              ? "cursor-not-allowed border-line bg-panel2 text-bronze"
              : "border-emeraldLight text-emeraldLight hover:bg-emeraldLight/20"
          }`}
        >
          {isBusy ? stageLabel : "Confirm Purchase"}
        </button>
      </div>
    </div>
  );
}
