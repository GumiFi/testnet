"use client";

import ToggleSwitch from "@/components/nft/ToggleSwitch";
import AllocationSliderGroup from "./AllocationSliderGroup";
import SoonTag from "./SoonTag";
import { feeSplitRows, type AdvancedTokenGeneratorValue } from "@/lib/token-generator-data";

const inputClasses =
  "mt-2 w-full rounded-lg border border-line bg-panel px-3 py-2.5 font-mono text-xs text-ivory placeholder:text-bronze/50 focus:border-gold/60 focus:outline-none";

const TREASURY_VARIANT_LABEL: Record<AdvancedTokenGeneratorValue["tokenStandard"], string> = {
  standard: "receives 100% of buy/sell tax",
  antiWhale: "receives 100% of buy/sell tax",
  reflection: "unused — tax is redistributed to holders automatically",
  deflationary: "unused — tax is burned automatically",
  liquidityGenerator: "receives LP tokens from the auto-liquidity engine",
};

function TaxSlider({
  label,
  value,
  onChange,
  disabled,
}: {
  label: string;
  value: number;
  onChange: (next: number) => void;
  disabled?: boolean;
}) {
  return (
    <div className={disabled ? "opacity-50" : undefined}>
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-2">
          <p className="font-mono text-[10px] uppercase tracking-wider2 text-ivory">{label}</p>
          {disabled && <SoonTag />}
        </span>
        <span className="font-mono text-[10px] text-goldLight">{value.toFixed(1)}%</span>
      </div>
      <input
        type="range"
        min={0}
        max={25}
        step={0.5}
        value={value}
        onChange={(event) => onChange(parseFloat(event.target.value))}
        disabled={disabled}
        className="mt-2 w-full cursor-pointer accent-gold disabled:cursor-not-allowed"
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
  const treasuryNote = TREASURY_VARIANT_LABEL[value.tokenStandard];
  const treasuryApplies = value.tokenStandard !== "reflection" && value.tokenStandard !== "deflationary";

  return (
    <div className="space-y-6">
      <div className="space-y-5 rounded-xl border border-line bg-panel2 p-4">
        <TaxSlider label="Buy Tax" value={value.buyTaxPct} onChange={(next) => set("buyTaxPct", next)} />
        <TaxSlider label="Sell Tax" value={value.sellTaxPct} onChange={(next) => set("sellTaxPct", next)} />
        <TaxSlider
          label="Transfer Tax"
          value={value.transferTaxPct}
          onChange={(next) => set("transferTaxPct", next)}
          disabled
        />
        <p className="font-body text-[11px] text-bronze">
          Buy/Sell tax is enforced on-chain (max 25%) and only triggers on trades against a DEX pair.
          Wallet-to-wallet transfer tax isn't supported by any deployed Advanced token contract yet.
        </p>
      </div>

      <div>
        <span className="flex items-center gap-2">
          <p className="font-mono text-[10px] uppercase tracking-wider2 text-ivory">Fee Revenue Split</p>
          <SoonTag />
        </span>
        <p className="mt-1 font-body text-[11px] text-bronze">
          Splitting tax revenue across custom liquidity/marketing/reflection/burn/dev shares isn't
          supported by any deployed Advanced token contract. Each standard routes 100% of collected tax
          to a single destination automatically — see the Treasury Wallet note below.
        </p>
        <div className="mt-4 pointer-events-none opacity-40">
          <AllocationSliderGroup rows={feeRows} onChange={() => {}} size={140} centerLabel="Fees" />
        </div>
        <p className="mt-1 text-right font-mono text-[9px] uppercase tracking-wider2 text-bronze">
          {feeTotal.toFixed(0)}% (Local Preview Only)
        </p>
      </div>

      <div className="space-y-3 border-t border-line pt-4">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-wider2 text-bronze">
            Treasury Wallet {!treasuryApplies && <span className="text-bronze/70">(N/A For This Standard)</span>}
          </p>
          <input
            value={value.treasuryWallet}
            onChange={(event) => set("treasuryWallet", event.target.value)}
            type="text"
            placeholder="Defaults to your connected wallet"
            disabled={!treasuryApplies}
            className={`${inputClasses} disabled:cursor-not-allowed disabled:opacity-50`}
          />
          <p className="mt-1 font-body text-[11px] text-bronze">On-chain, this wallet {treasuryNote}.</p>
        </div>
        <div className="opacity-50">
          <span className="flex items-center gap-2">
            <p className="font-mono text-[10px] uppercase tracking-wider2 text-bronze">Marketing Wallet</p>
            <SoonTag />
          </span>
          <input value={value.marketingWallet} type="text" placeholder="0x..." disabled className={inputClasses} />
        </div>
        <div className="opacity-50">
          <span className="flex items-center gap-2">
            <p className="font-mono text-[10px] uppercase tracking-wider2 text-bronze">Dev Wallet</p>
            <SoonTag />
          </span>
          <input value={value.devWallet} type="text" placeholder="0x..." disabled className={inputClasses} />
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-line pt-4">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-wider2 text-ivory">Seed Initial Liquidity</p>
          <p className="mt-1 font-body text-[11px] text-bronze">
            Uses the Liquidity Pool share of your supply allocation plus the ETH you send at deploy to seed
            the pair on-chain. LP tokens auto-lock — see Liquidity & Launch.
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
