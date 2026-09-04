"use client";

import { useRouter } from "next/navigation";
import Avatar from "@/components/discover/Avatar";
import GumiTag from "@/components/GumiTag";
import WalletTag from "@/components/WalletTag";
import { ArrowUpIcon, ArrowDownIcon } from "@/components/icons";
import { formatCompactUsd, formatPct, formatPrice } from "@/lib/format";
import { isGumiHandle, type LaunchpadCoin } from "@/lib/launchpad-data";

export default function CoinTableView({
  coins,
  animationsEnabled,
}: {
  coins: LaunchpadCoin[];
  animationsEnabled: boolean;
}) {
  const router = useRouter();
  if (coins.length === 0) {
    return (
      <p className="px-4 py-10 text-center font-mono text-xs uppercase tracking-wider2 text-bronze">
        No coins match this filter yet
      </p>
    );
  }

  return (
    <div className="overflow-x-auto border border-line">
      <table className="w-full min-w-[560px] border-collapse text-left">
        <thead>
          <tr className="border-b border-line font-mono text-[9px] uppercase tracking-wider2 text-bronze">
            <th className="px-3 py-2 font-normal">Coin</th>
            <th className="px-3 py-2 font-normal">Price</th>
            <th className="px-3 py-2 font-normal">Mcap</th>
            <th className="px-3 py-2 font-normal">24h</th>
            <th className="px-3 py-2 font-normal">Bonding</th>
            <th className="px-3 py-2 font-normal">Creator</th>
          </tr>
        </thead>
        <tbody>
          {coins.map((coin) => {
            const positive = coin.change24h >= 0;
            const bonded = Math.min(100, coin.bondingProgress);
            return (
              <tr
                key={coin.id}
                onClick={() => router.push(`/launchpad/coin/${coin.id}`)}
                className={`cursor-pointer border-b border-line last:border-b-0 hover:bg-panel2 ${
                  animationsEnabled ? "transition-colors" : ""
                }`}
              >
                <td className="px-3 py-2.5">
                  <div className="flex items-center gap-2.5">
                    <Avatar label={coin.monogram} accent={coin.accent} shape="square" className="h-8 w-8 shrink-0 text-[10px]" src={coin.image ?? undefined} />
                    <div className="min-w-0">
                      <p className="truncate font-display text-xs uppercase tracking-wider2 text-ivory">{coin.name}</p>
                      <p className="truncate font-mono text-[9px] uppercase tracking-wider2 text-bronze">${coin.symbol}</p>
                    </div>
                  </div>
                </td>
                <td className="px-3 py-2.5 font-mono text-[10px] text-goldLight">{formatPrice(coin.priceUsd)}</td>
                <td className="px-3 py-2.5 font-mono text-[10px] text-ivory">{formatCompactUsd(coin.marketCap)}</td>
                <td className="px-3 py-2.5">
                  <span
                    className={`flex items-center gap-0.5 font-mono text-[10px] uppercase tracking-wider2 ${
                      positive ? "text-emeraldLight" : "text-garnetLight"
                    }`}
                  >
                    {positive ? <ArrowUpIcon className="h-2.5 w-2.5" /> : <ArrowDownIcon className="h-2.5 w-2.5" />}
                    {formatPct(coin.change24h)}
                  </span>
                </td>
                <td className="px-3 py-2.5">
                  <div className="flex items-center gap-1.5">
                    <div className="h-1 w-14 overflow-hidden rounded-full bg-line">
                      <div
                        className={`h-full rounded-full ${bonded >= 100 ? "bg-emeraldLight" : "bg-gold"}`}
                        style={{ width: `${bonded}%` }}
                      />
                    </div>
                    <span className="font-mono text-[9px] text-bronze">{bonded}%</span>
                  </div>
                </td>
                <td className="px-3 py-2.5">
                  <div className="flex items-center gap-1.5">
                    {isGumiHandle(coin.creator) ? (
                      <GumiTag handle={coin.creator} className="max-w-[110px]" />
                    ) : (
                      <WalletTag address={coin.creator} className="max-w-[110px]" />
                    )}
                    <span className="font-mono text-[9px] uppercase tracking-wider2 text-bronze">{coin.age}</span>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
