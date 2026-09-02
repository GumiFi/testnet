import Avatar from "@/components/discover/Avatar";
import TradeValueCell from "./TradeValueCell";
import { formatCompactNumber } from "@/lib/format";
import type { LaunchpadTrade } from "@/lib/launchpad-data";

export default function CoinTradesTable({ trades, symbol }: { trades: LaunchpadTrade[]; symbol: string }) {
  if (trades.length === 0) {
    return (
      <p className="px-4 py-10 text-center font-mono text-xs uppercase tracking-wider2 text-bronze">
        No trades yet
      </p>
    );
  }

  return (
    <div className="max-h-[440px] overflow-y-auto border border-t-0 border-line">
      <table className="w-full table-fixed border-collapse text-left">
        <colgroup>
          <col className="w-[26%]" />
          <col className="w-[16%]" />
          <col className="w-[22%]" />
          <col className="w-[22%]" />
          <col className="w-[14%]" />
        </colgroup>
        <thead className="sticky top-0 z-10 bg-void">
          <tr className="border-b border-line font-mono text-[8px] uppercase tracking-wider text-bronze">
            <th className="px-1 py-1.5 font-normal">Trader</th>
            <th className="px-1 py-1.5 font-normal">Type</th>
            <th className="px-1 py-1.5 font-normal">Value</th>
            <th className="px-1 py-1.5 font-normal">Amount</th>
            <th className="px-1 py-1.5 font-normal">Time</th>
          </tr>
        </thead>
        <tbody>
          {trades.map((trade) => {
            const positive = trade.type === "Buy";
            return (
              <tr key={trade.id} className="border-b border-line last:border-b-0 hover:bg-panel2">
                <td className="px-1 py-2">
                  <div className="flex min-w-0 items-center gap-1">
                    <Avatar label={trade.monogram} accent={trade.accent} className="h-4 w-4 shrink-0 text-[7px]" />
                    <span className="truncate font-mono text-[9px] text-ivory">{trade.trader}</span>
                  </div>
                </td>
                <td className="px-1 py-2">
                  <span
                    className={`truncate font-mono text-[9px] uppercase tracking-wider ${
                      positive ? "text-emeraldLight" : "text-garnetLight"
                    }`}
                  >
                    {trade.type}
                  </span>
                </td>
                <td className="px-1 py-2">
                  <TradeValueCell amountEth={trade.amountEth} valueUsd={trade.valueUsd} />
                </td>
                <td className="px-1 py-2">
                  <span className="truncate font-mono text-[9px] text-goldLight">
                    {formatCompactNumber(trade.amountToken)} {symbol}
                  </span>
                </td>
                <td className="px-1 py-2 font-mono text-[8px] uppercase tracking-wider text-bronze">
                  {trade.timeAgo}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
