"use client";

import Link from "next/link";
import { CrownIcon } from "@/components/icons";
import Avatar from "./Avatar";
import { creators } from "@/lib/discover-data";
import { useLiveDiscoverCollectionsAndCreators } from "@/lib/discover-collections-live";
import { formatCompactUsd } from "@/lib/format";

export default function CreatorsSection() {
  const liveReady = useLiveDiscoverCollectionsAndCreators();
  const ranked = [...creators].sort((a, b) => b.volumeUsd - a.volumeUsd);

  return (
    <section className="px-6 py-10">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-center gap-2">
          <CrownIcon className="h-4 w-4 text-goldLight" />
          <h2 className="font-display text-lg uppercase tracking-wider2 text-ivory">Top Creators</h2>
        </div>

        <div className="mt-5 border border-line bg-panel">
          {ranked.length === 0 ? (
            <p className="px-4 py-8 text-center font-mono text-xs uppercase tracking-wider2 text-bronze">
              {liveReady ? "No creators yet" : "Loading creators from chain..."}
            </p>
          ) : (
            ranked.map((creator, index) => (
              <Link
                key={creator.id}
                href={`/profile/${creator.id}`}
                className="flex w-full items-center gap-3 border-b border-line px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-panel2"
              >
                <span className="w-5 shrink-0 font-mono text-[0.625rem] text-bronze">{index + 1}</span>
                <Avatar
                  label={creator.monogram}
                  accent={creator.accent}
                  className="h-9 w-9 text-[0.625rem]"
                  shape="square"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-display text-xs uppercase tracking-wider2 text-ivory">
                    {creator.name}
                  </p>
                </div>
                <div className="hidden shrink-0 gap-4 font-mono text-[0.625rem] uppercase tracking-wider2 text-bronze sm:flex">
                  <span>{creator.tokensCount} Tokens</span>
                  <span>{creator.nftsCount} NFTs</span>
                </div>
                <span className="shrink-0 font-mono text-[0.625rem] text-goldLight">
                  {formatCompactUsd(creator.volumeUsd)}
                </span>
              </Link>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
