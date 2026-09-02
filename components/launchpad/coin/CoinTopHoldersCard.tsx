import { CrownIcon } from "@/components/icons";
import type { LaunchpadHolder } from "@/lib/launchpad-data";

export default function CoinTopHoldersCard({
  holders,
  onViewAll,
}: {
  holders: LaunchpadHolder[];
  onViewAll: () => void;
}) {
  const top = holders.slice(0, 3);

  return (
    <div className="border border-line bg-panel">
      <div className="flex items-center justify-between px-4 py-3">
        <p className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider2 text-ivory">
          <CrownIcon className="h-3.5 w-3.5 text-goldLight" />
          Top Holders
        </p>
        <button
          type="button"
          onClick={onViewAll}
          className="font-mono text-[9px] uppercase tracking-wider2 text-bronze transition-colors hover:text-goldLight"
        >
          View All
        </button>
      </div>
      <div className="border-t border-line">
        {top.map((holder, index) => (
          <div
            key={holder.address}
            className={`flex items-center justify-between px-4 py-2 ${
              index === top.length - 1 ? "" : "border-b border-line"
            }`}
          >
            <span className="flex items-center gap-1.5 truncate font-mono text-[10px] text-ivory">
              {index === 0 && <CrownIcon className="h-3 w-3 shrink-0 text-goldLight" />}
              {holder.address}
            </span>
            <span className="shrink-0 font-mono text-[10px] text-bronze">{holder.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
