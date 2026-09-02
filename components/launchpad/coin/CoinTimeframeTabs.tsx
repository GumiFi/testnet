import { launchpadDetailTimeframes, type LaunchpadDetailTimeframe } from "@/lib/launchpad-data";
import { formatPct } from "@/lib/format";

export default function CoinTimeframeTabs({
  active,
  onChange,
  changes,
}: {
  active: LaunchpadDetailTimeframe;
  onChange: (value: LaunchpadDetailTimeframe) => void;
  changes: Record<LaunchpadDetailTimeframe, number>;
}) {
  return (
    <div className="grid grid-cols-4 gap-2">
      {launchpadDetailTimeframes.map((timeframe) => {
        const value = changes[timeframe];
        const positive = value >= 0;
        const isActive = timeframe === active;
        return (
          <button
            key={timeframe}
            type="button"
            onClick={() => onChange(timeframe)}
            className={`border px-2 py-2.5 text-center transition-colors ${
              isActive ? "border-gold bg-gold/10" : "border-line hover:border-gold/40"
            }`}
          >
            <p className="font-mono text-[9px] uppercase tracking-wider2 text-bronze">{timeframe}</p>
            <p
              className={`mt-0.5 font-mono text-[11px] ${
                positive ? "text-emeraldLight" : "text-garnetLight"
              }`}
            >
              {formatPct(value)}
            </p>
          </button>
        );
      })}
    </div>
  );
}
