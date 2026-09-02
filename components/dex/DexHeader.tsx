import { ChartIcon } from "@/components/icons";
import { formatCompactNumber, formatCompactUsd } from "@/lib/format";
import { dexStats, TOTAL_PAIRS } from "@/lib/dex-data";

export default function DexHeader() {
  return (
    <section className="border-b border-line px-6 py-10 md:py-14">
      <div className="mx-auto max-w-6xl">
        <div className="animate-fadeUp">
          <span className="font-mono text-xs uppercase tracking-wider3 text-bronze">
            Live pair screener
          </span>
          <div className="mt-3 flex items-center gap-3">
            <ChartIcon className="h-6 w-6 text-goldLight" />
            <h1 className="font-display text-3xl uppercase tracking-wider2 text-ivory text-shadow-gold md:text-4xl">
              Dex
            </h1>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-3 gap-3">
          <div className="border border-line bg-panel px-3 py-3 text-center sm:px-4">
            <p className="font-mono text-[9px] uppercase tracking-wider2 text-bronze">24H Volume</p>
            <p className="mt-1 font-display text-sm text-ivory sm:text-base">
              {formatCompactUsd(dexStats.volume24h)}
            </p>
          </div>
          <div className="border border-line bg-panel px-3 py-3 text-center sm:px-4">
            <p className="font-mono text-[9px] uppercase tracking-wider2 text-bronze">24H Txns</p>
            <p className="mt-1 font-display text-sm text-ivory sm:text-base">
              {formatCompactNumber(dexStats.txns24h)}
            </p>
          </div>
          <div className="border border-line bg-panel px-3 py-3 text-center sm:px-4">
            <p className="font-mono text-[9px] uppercase tracking-wider2 text-bronze">Pairs Tracked</p>
            <p className="mt-1 font-display text-sm text-ivory sm:text-base">{TOTAL_PAIRS}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
