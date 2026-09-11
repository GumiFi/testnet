"use client";

import Link from "next/link";
import { RocketIcon } from "@/components/icons";
import Avatar from "./Avatar";
import BoosterBadge from "@/components/BoosterBadge";
import GumiTag from "@/components/GumiTag";
import WalletTag from "@/components/WalletTag";
import { discoverLaunches, isGumiHandle } from "@/lib/discover-data";
import { useLiveDiscoverData } from "@/lib/discover-live";
import { formatCompactUsd } from "@/lib/format";

export default function NewLaunchesSection() {
  const liveReady = useLiveDiscoverData();

  return (
    <section className="border-b border-line px-6 py-10">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-center gap-2">
          <RocketIcon className="h-4 w-4 text-goldLight" />
          <h2 className="font-display text-lg uppercase tracking-wider2 text-ivory">Hot Launchpad</h2>
        </div>

        {discoverLaunches.length === 0 ? (
          <p className="mt-5 rounded-2xl border border-line bg-panel px-4 py-8 text-center font-mono text-xs uppercase tracking-wider2 text-bronze">
            {liveReady ? "No launches yet" : "Loading launches from chain..."}
          </p>
        ) : (
          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {discoverLaunches.slice(0, 4).map((launch) => (
              <div key={launch.id} className="rounded-2xl border border-line bg-panel p-5">
                <div className="flex items-center gap-3">
                  <Avatar label={launch.monogram} accent={launch.accent} className="h-11 w-11 text-xs" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <p className="font-display text-sm uppercase tracking-wider2 text-ivory">
                        ${launch.symbol}
                      </p>
                      {launch.boost != null && <BoosterBadge value={launch.boost} />}
                    </div>
                    {isGumiHandle(launch.creator) ? (
                      <GumiTag handle={launch.creator} className="mt-1 max-w-full" />
                    ) : (
                      <WalletTag address={launch.creator} className="mt-1 max-w-full" />
                    )}
                  </div>
                  <span className="shrink-0 font-mono text-[0.625rem] uppercase tracking-wider2 text-goldLight">
                    {launch.bondingCurvePct}%
                  </span>
                </div>

                <div className="mt-4 h-1.5 w-full border border-line bg-void">
                  <div
                    className="h-full bg-gradient-to-r from-goldDim to-goldLight"
                    style={{ width: `${launch.bondingCurvePct}%` }}
                  />
                </div>

                <div className="mt-3 flex items-center justify-between font-mono text-[0.625rem] uppercase tracking-wider2 text-bronze">
                  <span>Launched {launch.age} ago</span>
                  <span>MC {formatCompactUsd(launch.marketCap)}</span>
                </div>

                <Link
                  href={`/launchpad/coin/${launch.id}`}
                  className="mt-4 flex w-full items-center justify-center rounded-lg border border-gold px-4 py-2 font-mono text-[0.625rem] uppercase tracking-wider2 text-goldLight transition-colors hover:bg-gold hover:text-void"
                >
                  View
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
