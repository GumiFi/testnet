import { CrownIcon } from "@/components/icons";
import { formatCompactNumber, formatCompactUsd } from "@/lib/format";
import type { LaunchpadHolder } from "@/lib/launchpad-data";

const VISIBLE_HOLDER_LIMIT = 50;

export default function CoinHoldersList({ holders, symbol }: { holders: LaunchpadHolder[]; symbol: string }) {
  if (holders.length === 0) {
    return (
      <p className="px-4 py-10 text-center font-mono text-xs uppercase tracking-wider2 text-bronze">
        No holders yet
      </p>
    );
  }

  const visible = holders.slice(0, VISIBLE_HOLDER_LIMIT);
  const rest = holders.slice(VISIBLE_HOLDER_LIMIT);
  const others =
    rest.length > 0
      ? {
          firstRank: rest[0].rank,
          lastRank: rest[rest.length - 1].rank,
          pct: rest.reduce((sum, holder) => sum + holder.pct, 0),
          amountToken: rest.reduce((sum, holder) => sum + holder.amountToken, 0),
          valueUsd: rest.reduce((sum, holder) => sum + holder.valueUsd, 0),
        }
      : null;
  const maxPct = Math.max(...visible.map((holder) => holder.pct), others?.pct ?? 0, 0.0001);

  return (
    <div className="max-h-[440px] overflow-y-auto border border-t-0 border-line">
      <table className="w-full table-fixed border-collapse text-left">
        <colgroup>
          <col className="w-[34%]" />
          <col className="w-[26%]" />
          <col className="w-[22%]" />
          <col className="w-[18%]" />
        </colgroup>
        <thead className="sticky top-0 z-10 bg-void">
          <tr className="border-b border-line font-mono text-[8px] uppercase tracking-wider text-bronze">
            <th className="px-1 py-1.5 font-normal">Holder</th>
            <th className="px-1 py-1.5 font-normal">Amount</th>
            <th className="px-1 py-1.5 font-normal">Value</th>
            <th className="px-1 py-1.5 text-right font-normal">%</th>
          </tr>
        </thead>
        <tbody>
          {visible.map((holder) => (
            <tr key={holder.address} className="border-b border-line last:border-b-0 hover:bg-panel2">
              <td className="px-1 py-2">
                <div className="flex min-w-0 items-center gap-1">
                  {holder.rank === 1 ? (
                    <CrownIcon className="h-3 w-3 shrink-0 text-goldLight" />
                  ) : (
                    <span className="w-3 shrink-0 text-center font-mono text-[8px] text-bronze">
                      {holder.rank}
                    </span>
                  )}
                  <span className="truncate font-mono text-[9px] text-ivory">{holder.address}</span>
                  {holder.isCreator && (
                    <span className="shrink-0 border border-gold/40 px-0.5 font-mono text-[7px] uppercase tracking-wider text-goldLight">
                      Dev
                    </span>
                  )}
                </div>
              </td>
              <td className="px-1 py-2">
                <span className="truncate font-mono text-[9px] text-goldLight">
                  {formatCompactNumber(holder.amountToken)} {symbol}
                </span>
              </td>
              <td className="px-1 py-2 truncate font-mono text-[9px] text-ivory">
                {formatCompactUsd(holder.valueUsd)}
              </td>
              <td className="px-1 py-2">
                <div className="flex flex-col items-end gap-1">
                  <span className="font-mono text-[9px] text-bronze">{holder.pct}%</span>
                  <div className="h-[3px] w-full overflow-hidden bg-line/50">
                    <div
                      className="h-full bg-gold/70"
                      style={{ width: `${(holder.pct / maxPct) * 100}%` }}
                    />
                  </div>
                </div>
              </td>
            </tr>
          ))}
          {others && (
            <tr className="bg-panel2/60 last:border-b-0">
              <td className="px-1 py-2">
                <span className="truncate font-mono text-[9px] uppercase tracking-wider text-bronze">
                  Others ({others.firstRank}-{others.lastRank})
                </span>
              </td>
              <td className="px-1 py-2">
                <span className="truncate font-mono text-[9px] text-goldLight">
                  {formatCompactNumber(others.amountToken)} {symbol}
                </span>
              </td>
              <td className="px-1 py-2 truncate font-mono text-[9px] text-ivory">
                {formatCompactUsd(others.valueUsd)}
              </td>
              <td className="px-1 py-2">
                <div className="flex flex-col items-end gap-1">
                  <span className="font-mono text-[9px] text-bronze">{others.pct.toFixed(2)}%</span>
                  <div className="h-[3px] w-full overflow-hidden bg-line/50">
                    <div
                      className="h-full bg-gold/70"
                      style={{ width: `${(others.pct / maxPct) * 100}%` }}
                    />
                  </div>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
