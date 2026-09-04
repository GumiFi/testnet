"use client";

import { useState } from "react";
import { CloseIcon, RocketIcon } from "@/components/icons";

export default function InitialBuyModal({
  value,
  onConfirm,
  onClose,
}: {
  value: string;
  onConfirm: (next: string) => void;
  onClose: () => void;
}) {
  const [draft, setDraft] = useState(value);
  const draftNum = parseFloat(draft) || 0;

  function handleConfirm() {
    if (draftNum <= 0) return;
    onConfirm(draft);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center px-6">
      <div className="absolute inset-0 animate-fadeIn bg-void/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-xs border border-gold/40 bg-panel px-6 py-6 animate-fadeUp">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center border border-gold/40 text-goldLight">
              <RocketIcon className="h-4 w-4" />
            </span>
            <span className="font-display text-sm tracking-wider2 text-ivory">Initial Buy</span>
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-7 w-7 shrink-0 items-center justify-center border border-line text-bronze transition-colors hover:border-gold hover:text-goldLight"
          >
            <CloseIcon className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="mt-5">
          <div className="flex h-5 items-center justify-between">
            <p className="font-mono text-[10px] uppercase tracking-wider2 text-bronze">Initial Buy (ETH)</p>
            <span className="border border-gold/60 bg-gold/10 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider2 text-goldLight">
              Required
            </span>
          </div>
          <input
            value={draft}
            onChange={(event) => setDraft(event.target.value.replace(/[^0-9.]/g, ""))}
            type="text"
            inputMode="decimal"
            autoFocus
            placeholder="0.5"
            className="mt-2 w-full rounded-lg border border-line bg-panel2 px-4 py-3 font-display text-base text-ivory placeholder:text-bronze/50 focus:border-gold/60 focus:outline-none"
          />
          <p className="mt-2 font-body text-xs text-bronze">
            This creates your token's initial liquidity pool — you can lock it right after launch.
          </p>
        </div>

        <button
          type="button"
          disabled={draftNum <= 0}
          onClick={handleConfirm}
          className={`mt-6 w-full rounded-lg border px-4 py-3 font-mono text-[11px] uppercase tracking-wider2 transition-colors ${
            draftNum <= 0
              ? "cursor-not-allowed border-line bg-panel2 text-bronze"
              : "border-gold text-goldLight hover:bg-gold hover:text-void"
          }`}
        >
          Confirm Amount
        </button>
      </div>
    </div>
  );
}
