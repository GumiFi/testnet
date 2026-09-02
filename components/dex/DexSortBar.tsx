import { dexSortOptions, type DexSortOption } from "@/lib/dex-data";

export { dexSortOptions, type DexSortOption };

export default function DexSortBar({
  active,
  onChange,
}: {
  active: DexSortOption | null;
  onChange: (value: DexSortOption | null) => void;
}) {
  return (
    <div className="no-scrollbar flex items-center gap-2 overflow-x-auto">
      {dexSortOptions.map((option) => {
        const isActive = option === active;
        return (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            className={`shrink-0 border px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider2 transition-colors ${
              isActive
                ? "border-gold bg-gold/10 text-goldLight"
                : "border-line text-bronze hover:border-gold/40 hover:text-ivory"
            }`}
          >
            {option}
          </button>
        );
      })}
      <button
        type="button"
        onClick={() => onChange(null)}
        disabled={active === null}
        className="shrink-0 border border-line px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider2 text-bronze transition-colors hover:border-garnetLight/60 hover:text-garnetLight disabled:cursor-not-allowed disabled:opacity-30"
      >
        Reset
      </button>
    </div>
  );
}
