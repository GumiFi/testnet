"use client";

import CoinTradesTable from "./CoinTradesTable";
import CoinCommentsPanel from "./CoinCommentsPanel";
import CoinHoldersList from "./CoinHoldersList";
import type { LaunchpadTrade, LaunchpadHolder } from "@/lib/launchpad-data";

const activityTabs = ["Trades", "Comments", "Holders"] as const;
export type CoinActivityTab = (typeof activityTabs)[number];

export default function CoinActivityTabs({
  trades,
  holders,
  commentCount,
  symbol,
  active,
  onChange,
  onAction,
}: {
  trades: LaunchpadTrade[];
  holders: LaunchpadHolder[];
  commentCount: number;
  symbol: string;
  active: CoinActivityTab;
  onChange: (tab: CoinActivityTab) => void;
  onAction: (label: string) => void;
}) {
  return (
    <div>
      <div className="grid grid-cols-3 border border-line">
        {activityTabs.map((tab, index) => (
          <button
            key={tab}
            type="button"
            onClick={() => onChange(tab)}
            className={`px-2 py-2.5 text-center font-mono text-[10px] uppercase tracking-wider2 transition-colors ${
              index !== 0 ? "border-l border-line" : ""
            } ${active === tab ? "bg-gold/10 text-goldLight" : "text-bronze hover:text-ivory"}`}
          >
            {tab}
            {tab === "Comments" && commentCount > 0 ? ` (${commentCount})` : ""}
          </button>
        ))}
      </div>
      {active === "Trades" && <CoinTradesTable trades={trades} symbol={symbol} />}
      {active === "Comments" && <CoinCommentsPanel commentCount={commentCount} onAction={onAction} />}
      {active === "Holders" && <CoinHoldersList holders={holders} symbol={symbol} />}
    </div>
  );
}
