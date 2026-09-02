import { FlameIcon } from "@/components/icons";

export default function PairWithGumiRow() {
  return (
    <div className="mt-5 flex items-center justify-between gap-4 border border-line bg-panel2 px-4 py-3">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center border border-line text-bronze">
          <FlameIcon className="h-4 w-4" />
        </span>
        <div>
          <span className="flex items-center gap-2">
            <span className="font-mono text-[11px] uppercase tracking-wider2 text-ivory">Pair With $GUMI</span>
            <span className="border border-line px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider2 text-bronze">
              Soon
            </span>
          </span>
          <p className="mt-1 font-body text-xs text-bronze">
            Launch your token's liquidity paired with $GUMI instead of ETH.
          </p>
        </div>
      </div>
      <span
        aria-disabled="true"
        className="flex h-4 w-8 shrink-0 items-center justify-start rounded-full border border-line bg-panel px-0.5"
      >
        <span className="h-2.5 w-2.5 rounded-full bg-bronze/60" />
      </span>
    </div>
  );
}
