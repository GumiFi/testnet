"use client";

import ToggleSwitch from "@/components/nft/ToggleSwitch";
import SoonTag from "./SoonTag";
import type { AdvancedTokenGeneratorValue } from "@/lib/token-generator-data";

export default function SupplyControlsFields({
  value,
}: {
  value: AdvancedTokenGeneratorValue;
  onChange: (next: AdvancedTokenGeneratorValue) => void;
}) {
  return (
    <div className="space-y-4">
      <p className="font-mono text-[10px] uppercase tracking-wider2 text-ivory">Supply & Mint Controls</p>

      <div className="flex items-center justify-between">
        <div>
          <span className="flex items-center gap-2">
            <p className="font-mono text-[10px] uppercase tracking-wider2 text-ivory">Mintable</p>
            <SoonTag />
          </span>
          <p className="mt-1 font-body text-[11px] text-bronze">
            Allow the owner to mint new supply after deploy. Not yet supported by any deployed Advanced
            token contract — supply is fixed at deploy time.
          </p>
        </div>
        <ToggleSwitch checked={false} onChange={() => {}} label="Mintable" disabled />
      </div>

      <div className="flex items-center justify-between border-t border-line pt-4">
        <div>
          <span className="flex items-center gap-2">
            <p className="font-mono text-[10px] uppercase tracking-wider2 text-ivory">Burnable</p>
            <SoonTag />
          </span>
          <p className="mt-1 font-body text-[11px] text-bronze">
            Let holders permanently burn their own tokens on demand. Not exposed by any deployed Advanced
            token contract — the Deflationary standard burns a tax share automatically instead.
          </p>
        </div>
        <ToggleSwitch checked={false} onChange={() => {}} label="Burnable" disabled />
      </div>

      <div className="flex items-center justify-between border-t border-line pt-4">
        <div>
          <span className="flex items-center gap-2">
            <p className="font-mono text-[10px] uppercase tracking-wider2 text-ivory">Pausable</p>
            <SoonTag />
          </span>
          <p className="mt-1 font-body text-[11px] text-bronze">
            Let the owner pause all transfers in an emergency. Not yet supported by any deployed Advanced
            token contract.
          </p>
        </div>
        <ToggleSwitch checked={false} onChange={() => {}} label="Pausable" disabled />
      </div>
    </div>
  );
}
