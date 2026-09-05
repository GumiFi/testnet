"use client";

import ToggleSwitch from "@/components/nft/ToggleSwitch";
import Stepper from "./Stepper";
import SoonTag from "./SoonTag";
import type { AdvancedTokenGeneratorValue } from "@/lib/token-generator-data";

export default function AntiBotFields({
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
      <div className="flex items-center justify-between">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-wider2 text-ivory">Anti-Bot Protection</p>
          <p className="mt-1 font-body text-[11px] text-bronze">
            Enforces a trading cooldown and extra limits for the first blocks after launch, on-chain.
          </p>
        </div>
        <ToggleSwitch
          checked={value.antiBotEnabled}
          onChange={(next) => set("antiBotEnabled", next)}
          label="Toggle anti-bot"
        />
      </div>

      {value.antiBotEnabled && (
        <>
          <div className="flex items-center justify-between border-t border-line pt-4">
            <div>
              <span className="flex items-center gap-2">
                <p className="font-mono text-[10px] uppercase tracking-wider2 text-ivory">Blacklist Bots</p>
                <SoonTag />
              </span>
              <p className="mt-1 font-body text-[11px] text-bronze">
                Auto-detecting and blacklisting bot wallets at launch isn't supported by any deployed
                Advanced token contract. Use the manual Blacklist Function in Ownership & Security instead.
              </p>
            </div>
            <ToggleSwitch checked={false} onChange={() => {}} label="Toggle blacklist bots" disabled />
          </div>

          <div className="border-t border-line pt-4">
            <p className="font-mono text-[10px] uppercase tracking-wider2 text-bronze">Trading Cooldown</p>
            <div className="mt-2">
              <Stepper
                value={value.cooldownSeconds}
                min={0}
                max={300}
                step={5}
                onChange={(next) => set("cooldownSeconds", next)}
                suffix="s"
              />
            </div>
            <p className="mt-1 font-body text-[11px] text-bronze">
              Minimum time a wallet must wait between trades.
            </p>
          </div>

          <div className="border-t border-line pt-4">
            <p className="font-mono text-[10px] uppercase tracking-wider2 text-bronze">
              Launch Protection Blocks
            </p>
            <div className="mt-2">
              <Stepper
                value={value.launchProtectionBlocks}
                min={0}
                max={20}
                step={1}
                onChange={(next) => set("launchProtectionBlocks", next)}
                suffix=" Blocks"
              />
            </div>
            <p className="mt-1 font-body text-[11px] text-bronze">
              Extra transaction limits applied for the first blocks after launch.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
