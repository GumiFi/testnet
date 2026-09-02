const routes = [
  {
    label: "ETH Fee Route",
    splits: [
      { label: "Treasury", value: "70%" },
      { label: "Auto-Buyback & Burn $GUMI", value: "30%" },
    ],
  },
  {
    label: "$GUMI Fee Route (Promo Rate)",
    splits: [
      { label: "Treasury", value: "70%" },
      { label: "Direct Burn $GUMI", value: "30%" },
    ],
  },
];

export default function FeeFlowDiagram() {
  return (
    <div className="mx-auto w-full max-w-2xl py-6">
      <div className="flex flex-col items-center">
        <div className="border border-gold bg-panel px-8 py-4 text-center">
          <span className="font-mono text-xs uppercase tracking-wider2 text-goldLight">
            Collected Platform Fees
          </span>
        </div>
        <div className="h-8 w-px bg-line" />
      </div>

      <div className="relative grid grid-cols-1 gap-10 md:grid-cols-2">
        <div className="absolute left-1/4 right-1/4 top-0 hidden border-t border-line md:block" />
        {routes.map((route) => (
          <div key={route.label} className="flex flex-col items-center gap-6">
            <div className="hidden h-8 w-px bg-line md:block" />
            <div className="w-full max-w-xs border border-line bg-panel px-4 py-3 text-center">
              <span className="font-mono text-[11px] uppercase tracking-wider2 text-ivory">
                {route.label}
              </span>
            </div>
            <div className="h-6 w-px bg-line" />
            <div className="relative grid w-full grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="absolute left-1/4 right-1/4 top-0 hidden border-t border-line sm:block" />
              {route.splits.map((split) => (
                <div
                  key={split.label}
                  className="flex flex-col items-center gap-3"
                >
                  <div className="hidden h-6 w-px bg-line sm:block" />
                  <div className="w-full border border-line bg-panel px-4 py-4 text-center">
                    <div className="font-display text-xl text-goldLight">
                      {split.value}
                    </div>
                    <div className="mt-1 font-mono text-[10px] uppercase tracking-wider2 text-bronze">
                      {split.label}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
