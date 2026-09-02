"use client";

import ToggleSwitch from "@/components/nft/ToggleSwitch";
import Stepper from "./Stepper";
import type { AdvancedTokenGeneratorValue } from "@/lib/token-generator-data";

export default function LiquiditySettingsFields({
  value,
  onChange,
}: {
  value: AdvancedTokenGeneratorValue;
  onChange: (next: AdvancedTokenGeneratorValue) => void;
}) {
  function set<K extends keyof AdvancedTokenGeneratorValue>(key: K, next: AdvancedTokenGeneratorValue[K]) {
    onChange({ ...value, [key]: next });
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="font-mono text-[10px] uppercase tracking-wider2 text-bronze">Initial Liquidity (ETH)</p>
        <input
          value={value.initialLiquidityEth}
          onChange={(event) => set("initialLiquidityEth", event.target.value.replace(/[^0-9.]/g, ""))}
          type="text"
          inputMode="decimal"
          placeholder="0.5"
          className="mt-2 w-full rounded-lg border border-line bg-panel px-4 py-3 font-display text-base text-ivory placeholder:text-bronze/50 focus:border-gold/60 focus:outline-none"
        />
        <p className="mt-2 font-body text-[11px] text-bronze">Seeds your token's opening liquidity pool.</p>
      </div>

      <div className="flex items-center justify-between border-t border-line pt-4">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-wider2 text-ivory">Lock Liquidity</p>
          <p className="mt-1 font-body text-[11px] text-bronze">
            Time-lock LP tokens so liquidity can't be pulled early.
          </p>
        </div>
        <ToggleSwitch
          checked={value.lockLiquidity}
          onChange={(next) => set("lockLiquidity", next)}
          label="Toggle lock liquidity"
        />
      </div>
      {value.lockLiquidity && (
        <div>
          <p className="font-mono text-[10px] uppercase tracking-wider2 text-bronze">Lock Duration</p>
          <div className="mt-2">
            <Stepper
              value={value.lockDurationDays}
              min={1}
              max={3650}
              step={30}
              onChange={(next) => set("lockDurationDays", next)}
              suffix=" Days"
            />
          </div>
        </div>
      )}
    </div>
  );
}
