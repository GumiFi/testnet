"use client";

import ToggleSwitch from "@/components/nft/ToggleSwitch";
import Stepper from "./Stepper";
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
            Blocks known bot patterns during the launch window.
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
              <p className="font-mono text-[10px] uppercase tracking-wider2 text-ivory">Blacklist Bots</p>
              <p className="mt-1 font-body text-[11px] text-bronze">
                Auto-blacklist wallets flagged as bots at launch.
              </p>
            </div>
            <ToggleSwitch
              checked={value.blacklistBots}
              onChange={(next) => set("blacklistBots", next)}
              label="Toggle blacklist bots"
            />
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
