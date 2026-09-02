import Avatar from "@/components/discover/Avatar";
import { CrownIcon } from "@/components/icons";
import { myLaunches } from "@/lib/portfolio-data";
import { formatCompactNumber, formatCompactUsd } from "@/lib/format";

export default function LaunchesSection() {
  return (
    <div className="border border-line bg-panel">
      {myLaunches.map((launch, index) => (
        <div
          key={launch.id}
          className={`flex items-center gap-3 px-4 py-3 ${
            index === myLaunches.length - 1 ? "" : "border-b border-line"
          }`}
        >
          <Avatar
            label={launch.monogram}
            accent={launch.accent}
            className="h-8 w-8 shrink-0 text-[9px]"
            shape="square"
          />
          <div className="min-w-0 flex-1">
            <p className="truncate font-display text-xs uppercase tracking-wider2 text-ivory">
              {launch.symbol}
            </p>
            {launch.graduated ? (
              <span className="mt-0.5 flex items-center gap-1 font-mono text-[9px] uppercase tracking-wider2 text-goldLight">
                <CrownIcon className="h-2.5 w-2.5" />
                Graduated
              </span>
            ) : (
              <p className="mt-0.5 font-mono text-[9px] uppercase tracking-wider2 text-bronze">
                {launch.bondingCurvePct}% Bonding Curve
              </p>
            )}
          </div>
          <div className="shrink-0 text-right">
            <p className="font-mono text-xs text-ivory">{formatCompactUsd(launch.marketCap)}</p>
            <p className="mt-0.5 font-mono text-[10px] text-bronze">
              {formatCompactNumber(launch.holders)} Holders
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
