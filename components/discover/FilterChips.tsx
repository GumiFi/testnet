export default function FilterChips<T extends string>({
  options,
  active,
  onChange,
}: {
  options: readonly T[];
  active: T;
  onChange: (value: T) => void;
}) {
  return (
    <div className="no-scrollbar flex items-center gap-2 overflow-x-auto">
      {options.map((option) => {
        const isActive = option === active;
        return (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            className={`shrink-0 rounded-full border px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider2 transition-colors ${
              isActive
                ? "border-gold bg-gold/10 text-goldLight"
                : "border-line text-bronze hover:border-gold/40 hover:text-ivory"
            }`}
          >
            {option}
          </button>
        );
      })}
    </div>
  );
}
