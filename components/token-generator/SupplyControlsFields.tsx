"use client";

import ToggleSwitch from "@/components/nft/ToggleSwitch";
import type { AdvancedTokenGeneratorValue } from "@/lib/token-generator-data";

const inputClasses =
  "mt-2 w-full rounded-lg border border-line bg-panel px-3 py-2.5 font-mono text-xs text-ivory placeholder:text-bronze/50 focus:border-gold/60 focus:outline-none";

export default function SupplyControlsFields({
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
      <p className="font-mono text-[10px] uppercase tracking-wider2 text-ivory">Supply & Mint Controls</p>

      <div className="flex items-center justify-between">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-wider2 text-ivory">Mintable</p>
          <p className="mt-1 font-body text-[11px] text-bronze">Allow the owner to mint new supply after deploy.</p>
        </div>
        <ToggleSwitch checked={value.mintable} onChange={(next) => set("mintable", next)} label="Toggle mintable" />
      </div>
      {value.mintable && (
        <div>
          <p className="font-mono text-[10px] uppercase tracking-wider2 text-bronze">Max Supply Cap</p>
          <input
            value={value.maxSupplyCap}
            onChange={(event) => set("maxSupplyCap", event.target.value.replace(/[^0-9]/g, ""))}
            type="text"
            inputMode="numeric"
            placeholder="Leave blank for unlimited"
            className={inputClasses}
          />
        </div>
      )}

      <div className="flex items-center justify-between border-t border-line pt-4">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-wider2 text-ivory">Burnable</p>
          <p className="mt-1 font-body text-[11px] text-bronze">Let holders permanently burn their own tokens.</p>
        </div>
        <ToggleSwitch checked={value.burnable} onChange={(next) => set("burnable", next)} label="Toggle burnable" />
      </div>

      <div className="flex items-center justify-between border-t border-line pt-4">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-wider2 text-ivory">Pausable</p>
          <p className="mt-1 font-body text-[11px] text-bronze">Let the owner pause all transfers in an emergency.</p>
        </div>
        <ToggleSwitch checked={value.pausable} onChange={(next) => set("pausable", next)} label="Toggle pausable" />
      </div>
    </div>
  );
}
