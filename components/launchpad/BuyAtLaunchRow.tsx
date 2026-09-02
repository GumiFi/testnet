import { RocketIcon } from "@/components/icons";

export default function BuyAtLaunchRow() {
  return (
    <div className="mt-3 flex items-start gap-3 border border-gold/30 bg-panel2 px-4 py-3">
      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center border border-gold/40 text-goldLight">
        <RocketIcon className="h-4 w-4" />
      </span>
      <div>
        <span className="flex items-center gap-2">
          <span className="font-mono text-[11px] uppercase tracking-wider2 text-ivory">Buy Tokens At Launch</span>
          <span className="border border-gold/60 bg-gold/10 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider2 text-goldLight">
            Required
          </span>
        </span>
        <p className="mt-1 font-body text-xs text-bronze">
          Every launch requires the creator to buy in first — you'll set the amount in the next step.
        </p>
      </div>
    </div>
  );
}
