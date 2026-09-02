import Link from "next/link";
import Avatar from "./Avatar";
import GumiTag from "@/components/GumiTag";
import { countResults, searchEcosystem } from "@/lib/search";
import { handleToSlug } from "@/lib/user-profile-data";
import { formatCompactUsd, formatEth, formatPct, formatPrice } from "@/lib/format";

export default function SearchResults({
  query,
  onAction,
}: {
  query: string;
  onAction: (label: string) => void;
}) {
  const results = searchEcosystem(query);
  const { tokens, collections, pools: matchedPools, creators: matchedCreators } = results;
  const hasResults = countResults(results) > 0;

  return (
    <section className="px-6 py-10">
      <div className="mx-auto max-w-6xl space-y-8">
        <p className="font-mono text-xs uppercase tracking-wider2 text-bronze">
          Results for &ldquo;{query}&rdquo;
        </p>

        {!hasResults && (
          <p className="rounded-xl border border-line bg-panel px-4 py-10 text-center font-mono text-xs uppercase tracking-wider2 text-bronze">
            Nothing matched your search
          </p>
        )}

        {tokens.length > 0 && (
          <div>
            <h3 className="font-display text-sm uppercase tracking-wider2 text-goldLight">Tokens</h3>
            <div className="mt-3 overflow-hidden rounded-xl border border-line bg-panel">
              {tokens.map((token) => {
                const positive = token.change24h >= 0;
                return (
                  <button
                    key={token.id}
                    type="button"
                    onClick={() => onAction(token.symbol)}
                    className="flex w-full items-center gap-3 border-b border-line px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-panel2"
                  >
                    <Avatar label={token.monogram} accent={token.accent} className="h-9 w-9 text-[10px]" />
                    <div className="min-w-0 flex-1">
                      <p className="font-display text-xs uppercase tracking-wider2 text-ivory">
                        {token.symbol}
                      </p>
                      <p className="truncate font-mono text-[10px] text-bronze">{token.name}</p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="font-mono text-xs text-ivory">{formatPrice(token.priceUsd)}</p>
                      <p
                        className={`font-mono text-[10px] ${
                          positive ? "text-emeraldLight" : "text-garnetLight"
                        }`}
                      >
                        {formatPct(token.change24h)}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {collections.length > 0 && (
          <div>
            <h3 className="font-display text-sm uppercase tracking-wider2 text-goldLight">
              NFT Collections
            </h3>
            <div className="mt-3 overflow-hidden rounded-xl border border-line bg-panel">
              {collections.map((collection) => (
                <button
                  key={collection.id}
                  type="button"
                  onClick={() => onAction(collection.name)}
                  className="flex w-full items-center gap-3 border-b border-line px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-panel2"
                >
                  <Avatar
                    label={collection.monogram}
                    accent={collection.accent}
                    className="h-9 w-9 text-[10px]"
                    shape="square"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="font-display text-xs uppercase tracking-wider2 text-ivory">
                      {collection.name}
                    </p>
                    <p className="font-mono text-[10px] text-bronze">
                      Floor {formatEth(collection.floorEth)}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {matchedPools.length > 0 && (
          <div>
            <h3 className="font-display text-sm uppercase tracking-wider2 text-goldLight">Pools</h3>
            <div className="mt-3 overflow-hidden rounded-xl border border-line bg-panel">
              {matchedPools.map((pool) => (
                <button
                  key={pool.id}
                  type="button"
                  onClick={() => onAction(pool.pair)}
                  className="flex w-full items-center justify-between border-b border-line px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-panel2"
                >
                  <span className="font-display text-xs uppercase tracking-wider2 text-ivory">
                    {pool.pair}
                  </span>
                  <span className="font-mono text-[10px] text-bronze">
                    TVL {formatCompactUsd(pool.tvlUsd)}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {matchedCreators.length > 0 && (
          <div>
            <h3 className="font-display text-sm uppercase tracking-wider2 text-goldLight">Creators</h3>
            <div className="mt-3 overflow-hidden rounded-xl border border-line bg-panel">
              {matchedCreators.map((creator) => (
                <Link
                  key={creator.id}
                  href={`/profile/${handleToSlug(creator.handle)}`}
                  className="flex w-full items-center gap-3 border-b border-line px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-panel2"
                >
                  <Avatar
                    label={creator.monogram}
                    accent={creator.accent}
                    className="h-9 w-9 text-[10px]"
                    shape="square"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-display text-xs uppercase tracking-wider2 text-ivory">
                      {creator.name}
                    </p>
                    <GumiTag handle={creator.handle} className="mt-0.5 max-w-full" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
