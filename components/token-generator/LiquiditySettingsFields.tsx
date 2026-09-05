"use client";

import SoonTag from "./SoonTag";
import type { AdvancedTokenGeneratorValue } from "@/lib/token-generator-data";

export default function LiquiditySettingsFields({
  value,
  onChange,
  autoLiquidityLockDurationLabel,
}: {
  value: AdvancedTokenGeneratorValue;
  onChange: (next: AdvancedTokenGeneratorValue) => void;
  autoLiquidityLockDurationLabel?: string;
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
          disabled={!value.autoLiquidity}
          className="mt-2 w-full rounded-lg border border-line bg-panel px-4 py-3 font-display text-base text-ivory placeholder:text-bronze/50 focus:border-gold/60 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
        />
        <p className="mt-2 font-body text-[11px] text-bronze">
          Sent with the deploy transaction to seed your token&apos;s opening liquidity pool on-chain.
          {!value.autoLiquidity && " Enable Seed Initial Liquidity in Tax & Fees to use this."}
        </p>
      </div>

      <div className="border-t border-line pt-4">
        <div className="flex items-center justify-between">
          <p className="font-mono text-[10px] uppercase tracking-wider2 text-ivory">LP Lock</p>
          <span className="font-mono text-[10px] text-goldLight">
            {value.autoLiquidity ? "Auto-Locked" : "N/A"}
          </span>
        </div>
        <p className="mt-1 font-body text-[11px] text-bronze">
          {value.autoLiquidity
            ? "Seeded liquidity locks automatically on-chain — there's no path to seed liquidity without locking it."
            : "No liquidity is seeded, so there's nothing to lock."}
        </p>
      </div>

      {value.autoLiquidity && (
        <div>
          <span className="flex items-center gap-2">
            <p className="font-mono text-[10px] uppercase tracking-wider2 text-bronze">Lock Duration</p>
            <SoonTag label="Network Default" />
          </span>
          <p className="mt-2 font-mono text-xs text-goldLight">
            {autoLiquidityLockDurationLabel ?? "Reading network default…"}
          </p>
          <p className="mt-1 font-body text-[11px] text-bronze">
            The lock duration is a network-wide setting on the factory contract, not customizable per token
            yet.
          </p>
        </div>
      )}
    </div>
  );
}
