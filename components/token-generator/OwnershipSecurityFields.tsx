"use client";

import ToggleSwitch from "@/components/nft/ToggleSwitch";
import SoonTag from "./SoonTag";
import type { AdvancedTokenGeneratorValue } from "@/lib/token-generator-data";

export default function OwnershipSecurityFields({
  value,
  onChange,
  timelockMinDelayLabel,
}: {
  value: AdvancedTokenGeneratorValue;
  onChange: (next: AdvancedTokenGeneratorValue) => void;
  timelockMinDelayLabel?: string;
}) {
  function set<K extends keyof AdvancedTokenGeneratorValue>(key: K, next: AdvancedTokenGeneratorValue[K]) {
    onChange({ ...value, [key]: next });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <span className="flex items-center gap-2">
            <p className="font-mono text-[10px] uppercase tracking-wider2 text-ivory">Renounce Ownership</p>
            <SoonTag />
          </span>
          <p className="mt-1 font-body text-[11px] text-bronze">
            Give up admin control right after deploy, permanently. Not yet supported — every deployed
            Advanced token contract requires ownership to transfer to a non-zero address, so it can&apos;t
            be renounced on-chain today.
          </p>
        </div>
        <ToggleSwitch checked={false} onChange={() => {}} label="Toggle renounce ownership" disabled />
      </div>

      <div className="flex items-center justify-between border-t border-line pt-4">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-wider2 text-ivory">Timelock Controller</p>
          <p className="mt-1 font-body text-[11px] text-bronze">
            Routes ownership through a timelock so admin actions are delayed on-chain. Requires a team
            allocation with a cliff or vesting period below.
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
          <span className="flex items-center gap-2">
            <p className="font-mono text-[10px] uppercase tracking-wider2 text-bronze">Timelock Delay</p>
            <SoonTag label="Network Default" />
          </span>
          <p className="mt-2 font-mono text-xs text-goldLight">{timelockMinDelayLabel ?? "Reading network default…"}</p>
          <p className="mt-1 font-body text-[11px] text-bronze">
            The delay is a network-wide setting on the factory contract, not customizable per token yet.
          </p>
        </div>
      )}

      <div className="flex items-center justify-between border-t border-line pt-4">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-wider2 text-ivory">Blacklist Function</p>
          <p className="mt-1 font-body text-[11px] text-bronze">
            Lets the owner manually block a wallet from trading after launch, enforced on-chain.
          </p>
        </div>
        <ToggleSwitch
          checked={value.blacklistFunction}
          onChange={(next) => set("blacklistFunction", next)}
          label="Toggle blacklist function"
        />
      </div>
    </div>
  );
}
