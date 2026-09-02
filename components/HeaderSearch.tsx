"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { SearchIcon, CloseIcon } from "@/components/icons";
import Avatar from "@/components/discover/Avatar";
import { countResults, searchEcosystem } from "@/lib/search";
import { formatCompactUsd, formatEth, formatPct, formatPrice } from "@/lib/format";

const RESULT_LIMIT = 4;

export default function HeaderSearch({
  onClose,
  onAction,
}: {
  onClose: () => void;
  onAction: (label: string) => void;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const q = query.trim();
  const results = searchEcosystem(q);
  const total = countResults(results);

  function goToDiscover() {
    router.push(`/?q=${encodeURIComponent(q)}`);
    onClose();
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (q) goToDiscover();
  }

  return (
    <div className="fixed inset-0 z-[70] flex flex-col bg-void">
      <div className="border-b border-line px-4 py-4 md:px-6">
        <form
          onSubmit={handleSubmit}
          className="mx-auto flex max-w-2xl items-center gap-3 rounded-xl border border-line bg-panel2 px-4 py-3 transition-colors focus-within:border-gold/60"
        >
          <SearchIcon className="h-4 w-4 shrink-0 text-bronze" />
          <input
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            type="text"
            placeholder="Search tokens, NFTs, pools, creators..."
            className="w-full bg-transparent font-body text-sm text-ivory placeholder:text-bronze/70 focus:outline-none"
          />
          <button
            type="button"
            onClick={onClose}
            aria-label="Close search"
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-line text-bronze transition-colors hover:border-gold hover:text-goldLight"
          >
            <CloseIcon className="h-3.5 w-3.5" />
          </button>
        </form>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 md:px-6">
        <div className="mx-auto max-w-2xl space-y-4">
          {q.length === 0 && (
            <p className="px-1 py-6 text-center font-mono text-[10px] uppercase tracking-wider2 text-bronze">
              Start typing to search tokens, NFTs, pools, and creators
            </p>
          )}

          {q.length > 0 && total === 0 && (
            <p className="rounded-xl border border-line bg-panel2 px-4 py-6 text-center font-mono text-[10px] uppercase tracking-wider2 text-bronze">
              Nothing matched your search
            </p>
          )}

          {results.tokens.length > 0 && (
            <div>
              <p className="font-mono text-[10px] uppercase tracking-wider2 text-bronze">Tokens</p>
              <div className="mt-2 overflow-hidden rounded-xl border border-line bg-panel2">
                {results.tokens.slice(0, RESULT_LIMIT).map((token) => (
                  <button
                    key={token.id}
                    type="button"
                    onClick={() => {
                      onAction(token.symbol);
                      onClose();
                    }}
                    className="flex w-full items-center gap-3 border-b border-line px-3 py-2.5 text-left transition-colors last:border-b-0 hover:bg-panel"
                  >
                    <Avatar label={token.monogram} accent={token.accent} className="h-7 w-7 text-[9px]" />
                    <div className="min-w-0 flex-1">
                      <p className="font-display text-xs uppercase tracking-wider2 text-ivory">
                        {token.symbol}
                      </p>
                    </div>
                    <div className="shrink-0 text-right font-mono text-[10px]">
                      <p className="text-ivory">{formatPrice(token.priceUsd)}</p>
                      <p className={token.change24h >= 0 ? "text-emeraldLight" : "text-garnetLight"}>
                        {formatPct(token.change24h)}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {results.collections.length > 0 && (
            <div>
              <p className="font-mono text-[10px] uppercase tracking-wider2 text-bronze">
                NFT Collections
              </p>
              <div className="mt-2 overflow-hidden rounded-xl border border-line bg-panel2">
                {results.collections.slice(0, RESULT_LIMIT).map((collection) => (
                  <button
                    key={collection.id}
                    type="button"
                    onClick={() => {
                      onAction(collection.name);
                      onClose();
                    }}
                    className="flex w-full items-center gap-3 border-b border-line px-3 py-2.5 text-left transition-colors last:border-b-0 hover:bg-panel"
                  >
                    <Avatar
                      label={collection.monogram}
                      accent={collection.accent}
                      className="h-7 w-7 text-[9px]"
                      shape="square"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="font-display text-xs uppercase tracking-wider2 text-ivory">
                        {collection.name}
                      </p>
                    </div>
                    <p className="shrink-0 font-mono text-[10px] text-bronze">
                      Floor {formatEth(collection.floorEth)}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {results.pools.length > 0 && (
            <div>
              <p className="font-mono text-[10px] uppercase tracking-wider2 text-bronze">Pools</p>
              <div className="mt-2 overflow-hidden rounded-xl border border-line bg-panel2">
                {results.pools.slice(0, RESULT_LIMIT).map((pool) => (
                  <button
                    key={pool.id}
                    type="button"
                    onClick={() => {
                      onAction(pool.pair);
                      onClose();
                    }}
                    className="flex w-full items-center justify-between border-b border-line px-3 py-2.5 text-left transition-colors last:border-b-0 hover:bg-panel"
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

          {results.creators.length > 0 && (
            <div>
              <p className="font-mono text-[10px] uppercase tracking-wider2 text-bronze">Creators</p>
              <div className="mt-2 overflow-hidden rounded-xl border border-line bg-panel2">
                {results.creators.slice(0, RESULT_LIMIT).map((creator) => (
                  <button
                    key={creator.id}
                    type="button"
                    onClick={() => {
                      onAction(creator.handle);
                      onClose();
                    }}
                    className="flex w-full items-center gap-3 border-b border-line px-3 py-2.5 text-left transition-colors last:border-b-0 hover:bg-panel"
                  >
                    <Avatar
                      label={creator.monogram}
                      accent={creator.accent}
                      className="h-7 w-7 text-[9px]"
                      shape="square"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-display text-xs uppercase tracking-wider2 text-ivory">
                        {creator.name}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {total > 0 && (
            <button
              type="button"
              onClick={goToDiscover}
              className="w-full rounded-lg border border-gold px-4 py-2.5 font-mono text-[10px] uppercase tracking-wider2 text-goldLight transition-colors hover:bg-gold hover:text-void"
            >
              View all results ({total}) →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
