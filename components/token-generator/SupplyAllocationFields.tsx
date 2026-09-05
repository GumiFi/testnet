"use client";

import AllocationSliderGroup from "./AllocationSliderGroup";
import type { AllocationRow } from "@/lib/token-generator-data";

export default function SupplyAllocationFields({
  rows,
  onChange,
}: {
  rows: AllocationRow[];
  onChange: (next: AllocationRow[]) => void;
}) {
  return (
    <div>
      <p className="font-mono text-[10px] uppercase tracking-wider2 text-ivory">Supply Distribution</p>
      <p className="mt-1 font-body text-[11px] text-bronze">
        Drag each bar to shape how the total supply is split. The rest rebalance automatically to keep the
        circle at 100%.
      </p>
      <p className="mt-2 font-body text-[11px] text-bronze">
        On-chain, only the Liquidity Pool share is enforced separately (seeded into the pair at launch).
        Founder & Treasury, Reserve, Marketing, and Community aren't tracked as separate on-chain buckets —
        whatever isn't sent to liquidity or team vesting mints directly to your wallet as one balance.
      </p>
      <div className="mt-5">
        <AllocationSliderGroup rows={rows} onChange={onChange} centerLabel="100%" centerSubLabel="Total Supply" />
      </div>
    </div>
  );
}
