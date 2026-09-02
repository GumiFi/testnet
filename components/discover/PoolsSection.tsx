import { DropletIcon } from "@/components/icons";
import { pools } from "@/lib/discover-data";
import { formatCompactUsd } from "@/lib/format";

export default function PoolsSection({
  onAction,
}: {
  onAction: (label: string) => void;
}) {
  return (
    <section className="border-b border-line px-6 py-10">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-center gap-2">
          <DropletIcon className="h-4 w-4 text-goldLight" />
          <h2 className="font-display text-lg uppercase tracking-wider2 text-ivory">Popular Pools</h2>
        </div>

        <div className="mt-5 border border-line bg-panel">
          {pools.map((pool) => (
            <button
              key={pool.id}
              type="button"
              onClick={() => onAction(pool.pair)}
              className="flex w-full items-center justify-between gap-4 border-b border-line px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-panel2"
            >
              <span className="font-display text-xs uppercase tracking-wider2 text-ivory">{pool.pair}</span>
              <div className="flex items-center gap-5 font-mono text-[10px] uppercase tracking-wider2 text-bronze">
                <span>
                  TVL <span className="text-ivory">{formatCompactUsd(pool.tvlUsd)}</span>
                </span>
                <span className="hidden sm:inline">
                  VOL <span className="text-ivory">{formatCompactUsd(pool.volume24hUsd)}</span>
                </span>
                <span className="text-goldLight">{pool.aprPct.toFixed(1)}% APR</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
