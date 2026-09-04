"use client";

import { RocketIcon, ChevronRightIcon } from "@/components/icons";

export default function BuyAtLaunchRow({
  amount,
  onOpen,
}: {
  amount: string;
  onOpen: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="mt-3 flex w-full items-start gap-3 border border-gold/30 bg-panel2 px-4 py-3 text-left transition-colors hover:border-gold/60"
    >
      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center border border-gold/40 text-goldLight">
        <RocketIcon className="h-4 w-4" />
      </span>
      <div className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          <span className="font-mono text-[11px] uppercase tracking-wider2 text-ivory">Buy Tokens At Launch</span>
          <span className="border border-gold/60 bg-gold/10 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider2 text-goldLight">
            Required
          </span>
        </span>
        <p className="mt-1 font-body text-xs text-bronze">
          Every launch requires the creator to buy in first — tap to set your initial buy amount.
        </p>
        <p className="mt-1.5 font-mono text-[10px] uppercase tracking-wider2 text-goldLight">
          Initial Buy: {amount || "0"} ETH
        </p>
      </div>
      <ChevronRightIcon className="mt-1.5 h-3.5 w-3.5 shrink-0 text-bronze" />
    </button>
  );
}
