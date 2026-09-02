export type LiquidityTab = "create" | "lock" | "positions" | "explore";

const tabs: { id: LiquidityTab; label: string }[] = [
  { id: "create", label: "Create Liquidity" },
  { id: "lock", label: "Lock Liquidity" },
  { id: "positions", label: "My Positions" },
  { id: "explore", label: "Explore Pools" },
];

export default function LiquidityTabs({
  active,
  onChange,
}: {
  active: LiquidityTab;
  onChange: (tab: LiquidityTab) => void;
}) {
  return (
    <div className="border-b border-line px-6">
      <div className="no-scrollbar mx-auto flex max-w-6xl items-center gap-6 overflow-x-auto md:gap-8">
        {tabs.map((tab) => {
          const isActive = tab.id === active;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onChange(tab.id)}
              className={`relative shrink-0 whitespace-nowrap py-4 font-mono text-xs uppercase tracking-wider2 transition-colors ${
                isActive ? "text-goldLight" : "text-bronze hover:text-ivory"
              }`}
            >
              {tab.label}
              {isActive && <span className="absolute inset-x-0 -bottom-px h-px bg-goldLight" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
