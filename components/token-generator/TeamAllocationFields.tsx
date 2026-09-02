"use client";

import { CloseIcon, PlusIcon } from "@/components/icons";
import { teamAllocationTotalPct, type TeamAllocationRow } from "@/lib/token-generator-data";

export default function TeamAllocationFields({
  team,
  onChange,
  founderTargetPct,
}: {
  team: TeamAllocationRow[];
  onChange: (next: TeamAllocationRow[]) => void;
  founderTargetPct?: number;
}) {
  function updateRow(id: string, patch: Partial<TeamAllocationRow>) {
    onChange(team.map((row) => (row.id === id ? { ...row, ...patch } : row)));
  }

  function addRow() {
    onChange([...team, { id: `team-${Date.now()}`, wallet: "", percent: "", cliffDays: "0", vestingDays: "0" }]);
  }

  function removeRow(id: string) {
    onChange(team.filter((row) => row.id !== id));
  }

  const total = teamAllocationTotalPct(team);

  return (
    <div className="space-y-4">
      <p className="font-body text-[11px] text-bronze">
        Reserve a share of total supply for team and advisor wallets, released on a vesting schedule.
        {typeof founderTargetPct === "number" && (
          <> Your tokenomics circle sets Founder & Treasury at {founderTargetPct.toFixed(1)}%.</>
        )}
      </p>

      {team.length > 0 && (
        <div className="space-y-3">
          {team.map((row) => (
            <div key={row.id} className="rounded-xl border border-line bg-panel p-3">
              <div className="flex items-center gap-2">
                <input
                  value={row.wallet}
                  onChange={(event) => updateRow(row.id, { wallet: event.target.value })}
                  type="text"
                  placeholder="Wallet address, 0x..."
                  className="w-full rounded-lg border border-line bg-panel2 px-3 py-2 font-mono text-xs text-ivory placeholder:text-bronze/50 focus:border-gold/60 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => removeRow(row.id)}
                  aria-label="Remove allocation"
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-bronze transition-colors hover:text-goldLight"
                >
                  <CloseIcon className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="mt-2 grid grid-cols-3 gap-2">
                <div>
                  <p className="font-mono text-[9px] uppercase tracking-wider2 text-bronze">Percent</p>
                  <input
                    value={row.percent}
                    onChange={(event) => updateRow(row.id, { percent: event.target.value.replace(/[^0-9.]/g, "") })}
                    type="text"
                    inputMode="decimal"
                    placeholder="5"
                    className="mt-1 w-full rounded-lg border border-line bg-panel2 px-2 py-1.5 font-mono text-xs text-ivory placeholder:text-bronze/50 focus:border-gold/60 focus:outline-none"
                  />
                </div>
                <div>
                  <p className="font-mono text-[9px] uppercase tracking-wider2 text-bronze">Cliff (Days)</p>
                  <input
                    value={row.cliffDays}
                    onChange={(event) => updateRow(row.id, { cliffDays: event.target.value.replace(/[^0-9]/g, "") })}
                    type="text"
                    inputMode="numeric"
                    placeholder="30"
                    className="mt-1 w-full rounded-lg border border-line bg-panel2 px-2 py-1.5 font-mono text-xs text-ivory placeholder:text-bronze/50 focus:border-gold/60 focus:outline-none"
                  />
                </div>
                <div>
                  <p className="font-mono text-[9px] uppercase tracking-wider2 text-bronze">Vesting (Days)</p>
                  <input
                    value={row.vestingDays}
                    onChange={(event) =>
                      updateRow(row.id, { vestingDays: event.target.value.replace(/[^0-9]/g, "") })
                    }
                    type="text"
                    inputMode="numeric"
                    placeholder="180"
                    className="mt-1 w-full rounded-lg border border-line bg-panel2 px-2 py-1.5 font-mono text-xs text-ivory placeholder:text-bronze/50 focus:border-gold/60 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={addRow}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-line py-2.5 font-mono text-[10px] uppercase tracking-wider2 text-bronze transition-colors hover:border-gold/40 hover:text-goldLight"
      >
        <PlusIcon className="h-3 w-3" />
        Add Allocation
      </button>

      {team.length > 0 && (
        <div className="border-t border-line pt-3">
          <p
            className={`font-mono text-[10px] uppercase tracking-wider2 ${
              total > 100 ? "text-garnetLight" : "text-ivory"
            }`}
          >
            Total Allocated: {total.toFixed(1)}%
          </p>
          {total > 100 && (
            <p className="mt-1 font-body text-[11px] text-bronze">
              Allocations can't exceed 100% of total supply.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
