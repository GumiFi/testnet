import Link from "next/link";
import { ArrowUpIcon, ArrowDownIcon } from "@/components/icons";
import Avatar from "@/components/discover/Avatar";
import BoosterBadge from "@/components/BoosterBadge";
import GumiTag from "@/components/GumiTag";
import WalletTag from "@/components/WalletTag";
import PriceValue from "./PriceValue";
import { isGumiHandle, type DexPair } from "@/lib/dex-data";
import { formatCompactUsd, formatPct } from "@/lib/format";

function ChangeTag({ value, label }: { value: number; label: string }) {
  const positive = value >= 0;
  return (
    <div className="flex flex-col items-end gap-0.5">
      <span className="font-mono text-[8px] uppercase tracking-wider2 text-bronze">{label}</span>
      <span
        className={`flex items-center justify-end gap-0.5 font-mono text-[10px] ${
          positive ? "text-emeraldLight" : "text-garnetLight"
        }`}
      >
        {positive ? <ArrowUpIcon className="h-2.5 w-2.5" /> : <ArrowDownIcon className="h-2.5 w-2.5" />}
        {formatPct(value)}
      </span>
    </div>
  );
}

export default function PairRow({ pair }: { pair: DexPair }) {
  return (
    <Link
      href={`/dex/pair/${pair.id}`}
      className="flex w-full flex-col gap-2 border-b border-line px-4 py-3.5 text-left transition-colors last:border-b-0 hover:bg-panel2 sm:px-6"
    >
      <div className="flex items-start gap-3">
        <Avatar label={pair.monogram} accent={pair.accent} className="mt-0.5 h-9 w-9 shrink-0 text-[10px]" />

        <div className="min-w-0 flex-1 pt-0.5">
          <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
            <span className="font-display text-sm uppercase tracking-wider2 text-ivory">{pair.symbol}</span>
            <span className="font-mono text-[9px] text-bronze">{pair.age}</span>
            {pair.boost != null && <BoosterBadge value={pair.boost} />}
          </div>
          <p className="truncate font-body text-[11px] text-bronze">{pair.name}</p>
        </div>

        <div className="shrink-0 pt-0.5 text-right">
          <PriceValue value={pair.priceUsd} className="font-mono text-xs text-ivory" />
          <div className="mt-1.5 flex items-center justify-end gap-2.5">
            <ChangeTag value={pair.change1h} label="1H" />
            <ChangeTag value={pair.change24h} label="24H" />
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-1.5">
        <div className="flex flex-wrap items-center gap-1.5 font-mono text-[9px] uppercase tracking-wider2 text-bronze">
          <span className="border border-line px-1.5 py-0.5">LIQ {formatCompactUsd(pair.liquidity)}</span>
          <span className="border border-line px-1.5 py-0.5">VOL {formatCompactUsd(pair.volume24h)}</span>
          <span className="border border-line px-1.5 py-0.5">MCAP {formatCompactUsd(pair.marketCap)}</span>
        </div>
        {isGumiHandle(pair.creator) ? (
          <GumiTag handle={pair.creator} className="max-w-[130px] shrink-0" />
        ) : (
          <WalletTag address={pair.creator} className="max-w-[130px] shrink-0" />
        )}
      </div>
    </Link>
  );
}
