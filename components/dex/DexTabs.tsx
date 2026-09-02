import { FlameIcon, RocketIcon, CrownIcon } from "@/components/icons";
import { dexMainTabs, dexTimeframes, type DexMainTab, type DexTimeframe } from "@/lib/dex-data";

export { dexMainTabs, dexTimeframes, type DexMainTab, type DexTimeframe };

const tabIcons: Record<DexMainTab, (props: { className?: string }) => JSX.Element> = {
  Trending: FlameIcon,
  New: RocketIcon,
  Top: CrownIcon,
};

export default function DexTabs({
  tab,
  onTabChange,
  timeframe,
  onTimeframeChange,
}: {
  tab: DexMainTab;
  onTabChange: (value: DexMainTab) => void;
  timeframe: DexTimeframe;
  onTimeframeChange: (value: DexTimeframe) => void;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        {dexMainTabs.map((option) => {
          const Icon = tabIcons[option];
          const isActive = option === tab;
          return (
            <button
              key={option}
              type="button"
              onClick={() => onTabChange(option)}
              className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider2 transition-colors ${
                isActive
                  ? "border-gold bg-gold/10 text-goldLight"
                  : "border-line text-bronze hover:border-gold/40 hover:text-ivory"
              }`}
            >
              <Icon className="h-3 w-3" />
              {option}
              {option === "New" && isActive && <span className="text-bronze">· {timeframe}</span>}
            </button>
          );
        })}
      </div>

      {tab === "New" && (
        <div className="flex shrink-0 items-center gap-1">
          {dexTimeframes.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => onTimeframeChange(option)}
              className={`border px-2 py-1 font-mono text-[9px] uppercase tracking-wider2 transition-colors ${
                option === timeframe
                  ? "border-gold text-goldLight"
                  : "border-line text-bronze hover:border-gold/40 hover:text-ivory"
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
