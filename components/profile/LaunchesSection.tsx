import Avatar from "@/components/discover/Avatar";
import { CrownIcon } from "@/components/icons";
import { formatCompactUsd } from "@/lib/format";
import type { OnchainLaunch } from "@/lib/use-onchain-portfolio";

export default function LaunchesSection({
  launches,
  loading,
}: {
  launches: OnchainLaunch[];
  loading: boolean;
}) {
  if (loading && launches.length === 0) {
    return (
      <div className="border border-line bg-panel px-4 py-8 text-center">
        <p className="font-mono text-[10px] uppercase tracking-wider2 text-bronze">Loading launches…</p>
      </div>
    );
  }

  if (launches.length === 0) {
    return (
      <div className="border border-line bg-panel px-4 py-8 text-center">
        <p className="font-mono text-[10px] uppercase tracking-wider2 text-bronze">Nothing here yet</p>
      </div>
    );
  }

  return (
    <div className="border border-line bg-panel">
      {launches.map((launch, index) => (
        <div
          key={launch.id}
          className={`flex items-center gap-3 px-4 py-3 ${
            index === launches.length - 1 ? "" : "border-b border-line"
          }`}
        >
          <Avatar
            label={launch.monogram}
            accent="gold"
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
                {launch.bondingProgress}% Bonding Curve
              </p>
            )}
          </div>
          <div className="shrink-0 text-right">
            <p className="font-mono text-xs text-ivory">{formatCompactUsd(launch.marketCapUsd)}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
