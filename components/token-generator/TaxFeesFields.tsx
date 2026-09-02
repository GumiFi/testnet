"use client";

import ToggleSwitch from "@/components/nft/ToggleSwitch";
import AllocationSliderGroup from "./AllocationSliderGroup";
import { feeSplitRows, applyFeeSplitRows, type AdvancedTokenGeneratorValue } from "@/lib/token-generator-data";

const inputClasses =
  "mt-2 w-full rounded-lg border border-line bg-panel px-3 py-2.5 font-mono text-xs text-ivory placeholder:text-bronze/50 focus:border-gold/60 focus:outline-none";

function TaxSlider({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (next: number) => void;
}) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <p className="font-mono text-[10px] uppercase tracking-wider2 text-ivory">{label}</p>
        <span className="font-mono text-[10px] text-goldLight">{value.toFixed(1)}%</span>
      </div>
      <input
        type="range"
        min={0}
        max={25}
        step={0.5}
        value={value}
        onChange={(event) => onChange(parseFloat(event.target.value))}
        className="mt-2 w-full cursor-pointer accent-gold"
      />
    </div>
  );
}

export default function TaxFeesFields({
  value,
  onChange,
}: {
  value: AdvancedTokenGeneratorValue;
  onChange: (next: AdvancedTokenGeneratorValue) => void;
}) {
  function set<K extends keyof AdvancedTokenGeneratorValue>(key: K, next: AdvancedTokenGeneratorValue[K]) {
    onChange({ ...value, [key]: next });
  }

  const feeRows = feeSplitRows(value);
  const feeTotal = feeRows.reduce((sum, row) => sum + row.pct, 0);

  return (
    <div className="space-y-6">
      <div className="space-y-5 rounded-xl border border-line bg-panel2 p-4">
        <TaxSlider label="Buy Tax" value={value.buyTaxPct} onChange={(next) => set("buyTaxPct", next)} />
        <TaxSlider label="Sell Tax" value={value.sellTaxPct} onChange={(next) => set("sellTaxPct", next)} />
        <TaxSlider
          label="Transfer Tax"
          value={value.transferTaxPct}
          onChange={(next) => set("transferTaxPct", next)}
        />
      </div>

      <div>
        <div className="flex items-center justify-between">
          <p className="font-mono text-[10px] uppercase tracking-wider2 text-ivory">Fee Revenue Split</p>
          <span className="font-mono text-[10px] text-emeraldLight">{feeTotal.toFixed(1)}% Of 100%</span>
        </div>
        <p className="mt-1 font-body text-[11px] text-bronze">
          Drag a bar to reshape where every collected tax goes — the rest rebalance automatically.
        </p>
        <div className="mt-4">
          <AllocationSliderGroup
            rows={feeRows}
            onChange={(next) => onChange(applyFeeSplitRows(value, next))}
            size={140}
            centerLabel="Fees"
          />
        </div>
      </div>

      <div className="space-y-3 border-t border-line pt-4">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-wider2 text-bronze">Marketing Wallet</p>
          <input
            value={value.marketingWallet}
            onChange={(event) => set("marketingWallet", event.target.value)}
            type="text"
            placeholder="0x..."
            className={inputClasses}
          />
        </div>
        <div>
          <p className="font-mono text-[10px] uppercase tracking-wider2 text-bronze">Dev Wallet</p>
          <input
            value={value.devWallet}
            onChange={(event) => set("devWallet", event.target.value)}
            type="text"
            placeholder="0x..."
            className={inputClasses}
          />
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-line pt-4">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-wider2 text-ivory">Auto-Liquidity</p>
          <p className="mt-1 font-body text-[11px] text-bronze">
            Automatically swaps the liquidity share and adds it to the pool.
          </p>
        </div>
        <ToggleSwitch
          checked={value.autoLiquidity}
          onChange={(next) => set("autoLiquidity", next)}
          label="Toggle auto liquidity"
        />
      </div>
    </div>
  );
}
