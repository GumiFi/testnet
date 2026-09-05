"use client";

import ToggleSwitch from "@/components/nft/ToggleSwitch";
import type { AdvancedTokenGeneratorValue } from "@/lib/token-generator-data";

export default function TransactionLimitsFields({
  value,
  onChange,
}: {
  value: AdvancedTokenGeneratorValue;
  onChange: (next: AdvancedTokenGeneratorValue) => void;
}) {
  function set<K extends keyof AdvancedTokenGeneratorValue>(key: K, next: AdvancedTokenGeneratorValue[K]) {
    onChange({ ...value, [key]: next });
  }

  const isAntiWhaleStandard = value.tokenStandard === "antiWhale";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-wider2 text-ivory">Anti-Whale Limits</p>
          <p className="mt-1 font-body text-[11px] text-bronze">
            Cap how much supply a single wallet can hold or move. Enforced on-chain on every trade.
          </p>
          {isAntiWhaleStandard && (
            <p className="mt-1 font-body text-[11px] text-goldLight">
              Required by the Anti-Whale token standard — both limits must be above 0% to deploy.
            </p>
          )}
        </div>
        <ToggleSwitch
          checked={value.limitsEnabled || isAntiWhaleStandard}
          onChange={(next) => set("limitsEnabled", next)}
          label="Toggle transaction limits"
          disabled={isAntiWhaleStandard}
        />
      </div>

      {(value.limitsEnabled || isAntiWhaleStandard) && (
        <>
          <div className="border-t border-line pt-4">
            <div className="flex items-center justify-between">
              <p className="font-mono text-[10px] uppercase tracking-wider2 text-ivory">Max Transaction</p>
              <span className="font-mono text-[10px] text-goldLight">{value.maxTxPct.toFixed(1)}%</span>
            </div>
            <input
              type="range"
              min={0.1}
              max={100}
              step={0.1}
              value={value.maxTxPct}
              onChange={(event) => set("maxTxPct", parseFloat(event.target.value))}
              className="mt-2 w-full cursor-pointer accent-gold"
            />
            <p className="mt-1 font-body text-[11px] text-bronze">
              Largest single transaction, as a percent of total supply.
            </p>
          </div>

          <div className="border-t border-line pt-4">
            <div className="flex items-center justify-between">
              <p className="font-mono text-[10px] uppercase tracking-wider2 text-ivory">Max Wallet</p>
              <span className="font-mono text-[10px] text-goldLight">{value.maxWalletPct.toFixed(1)}%</span>
            </div>
            <input
              type="range"
              min={0.1}
              max={100}
              step={0.1}
              value={value.maxWalletPct}
              onChange={(event) => set("maxWalletPct", parseFloat(event.target.value))}
              className="mt-2 w-full cursor-pointer accent-gold"
            />
            <p className="mt-1 font-body text-[11px] text-bronze">
              Largest balance a single wallet can hold, as a percent of total supply.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
