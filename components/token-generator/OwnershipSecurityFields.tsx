"use client";

import ToggleSwitch from "@/components/nft/ToggleSwitch";
import Stepper from "./Stepper";
import type { AdvancedTokenGeneratorValue } from "@/lib/token-generator-data";

export default function OwnershipSecurityFields({
  value,
  onChange,
}: {
  value: AdvancedTokenGeneratorValue;
  onChange: (next: AdvancedTokenGeneratorValue) => void;
}) {
  function set<K extends keyof AdvancedTokenGeneratorValue>(key: K, next: AdvancedTokenGeneratorValue[K]) {
    onChange({ ...value, [key]: next });
  }

  const showRenounceNote = value.renounceOwnership && (value.mintable || value.pausable || value.blacklistFunction);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-wider2 text-ivory">Renounce Ownership</p>
          <p className="mt-1 font-body text-[11px] text-bronze">
            Give up admin control right after deploy, permanently.
          </p>
        </div>
        <ToggleSwitch
          checked={value.renounceOwnership}
          onChange={(next) => set("renounceOwnership", next)}
          label="Toggle renounce ownership"
        />
      </div>

      <div className="flex items-center justify-between border-t border-line pt-4">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-wider2 text-ivory">Timelock Controller</p>
          <p className="mt-1 font-body text-[11px] text-bronze">
            Delays every admin action so holders can react in time.
          </p>
        </div>
        <ToggleSwitch
          checked={value.timelockEnabled}
          onChange={(next) => set("timelockEnabled", next)}
          label="Toggle timelock"
        />
      </div>
      {value.timelockEnabled && (
        <div>
          <p className="font-mono text-[10px] uppercase tracking-wider2 text-bronze">Timelock Delay</p>
          <div className="mt-2">
            <Stepper
              value={value.timelockDelayHours}
              min={1}
              max={168}
              step={1}
              onChange={(next) => set("timelockDelayHours", next)}
              suffix="h"
            />
          </div>
        </div>
      )}

      <div className="flex items-center justify-between border-t border-line pt-4">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-wider2 text-ivory">Blacklist Function</p>
          <p className="mt-1 font-body text-[11px] text-bronze">
            Lets the owner block malicious wallets from trading.
          </p>
        </div>
        <ToggleSwitch
          checked={value.blacklistFunction}
          onChange={(next) => set("blacklistFunction", next)}
          label="Toggle blacklist function"
        />
      </div>

      {showRenounceNote && (
        <p className="border-t border-line pt-4 font-body text-[11px] text-bronze">
          Renouncing ownership also permanently disables mint, pause, and blacklist controls.
        </p>
      )}
    </div>
  );
}
