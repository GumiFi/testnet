import { formatCompactUsd } from "@/lib/format";
import { BONDING_MCAP_TARGET } from "@/lib/launchpad-data";

export default function CoinGraduationCard({ marketCap }: { marketCap: number }) {
  const bonded = Math.min(100, Math.round((marketCap / BONDING_MCAP_TARGET) * 100));
  const graduated = bonded >= 100;
  const remaining = Math.max(0, BONDING_MCAP_TARGET - marketCap);

  return (
    <div className="border border-line bg-panel p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span
            className={`h-2 w-2 shrink-0 rounded-full ${graduated ? "bg-emeraldLight" : "bg-goldLight"}`}
          />
          <p className="font-mono text-[10px] uppercase tracking-wider2 text-ivory">
            Graduation {bonded}%
          </p>
        </div>
        <span className="border border-emeraldLight/40 px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider2 text-emeraldLight">
          Gumifi Dex
        </span>
      </div>

      <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-line">
        <div
          className={`h-full rounded-full ${graduated ? "bg-emeraldLight" : "bg-gold"}`}
          style={{ width: `${bonded}%` }}
        />
      </div>

      <div className="mt-2 flex items-center justify-between font-mono text-[9px] uppercase tracking-wider2 text-bronze">
        <span>
          {formatCompactUsd(marketCap)} / {formatCompactUsd(BONDING_MCAP_TARGET)}
        </span>
        <span>{graduated ? "Trading live on Gumifi Dex" : `${formatCompactUsd(remaining)} to graduate`}</span>
      </div>
    </div>
  );
}
