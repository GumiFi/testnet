"use client";

import { useEffect, useMemo, useState } from "react";
import Avatar from "@/components/discover/Avatar";
import { CloseIcon, SearchIcon, ClockIcon, StarIcon } from "@/components/icons";
import { formatPct, formatPrice } from "@/lib/format";
import {
  createImportedToken,
  getRecentlyUsedTokenIds,
  getSwapTokenById,
  isContractAddress,
  popularTokenIds,
  swapTokens,
  type SwapToken,
} from "@/lib/swap-data";

export default function TokenSearchModal({
  title = "Select a Token",
  excludeId,
  extraTokens,
  onSelect,
  onImportToken,
  onClose,
}: {
  title?: string;
  excludeId?: string;
  extraTokens: SwapToken[];
  onSelect: (tokenId: string) => void;
  onImportToken: (token: SwapToken) => void;
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");

  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  const trimmed = query.trim();
  const isAddress = isContractAddress(trimmed);

  const allTokens = useMemo(
    () => [...swapTokens, ...extraTokens].filter((token) => token.id !== excludeId),
    [extraTokens, excludeId]
  );

  const importedMatch = useMemo(() => {
    if (!isAddress) return null;
    return (
      allTokens.find((token) => token.id === `custom-${trimmed.toLowerCase()}`) ??
      createImportedToken(trimmed)
    );
  }, [isAddress, trimmed, allTokens]);

  const filtered = useMemo(() => {
    if (!trimmed || isAddress) return [];
    const q = trimmed.toLowerCase();
    return allTokens.filter(
      (token) => token.symbol.toLowerCase().includes(q) || token.name.toLowerCase().includes(q)
    );
  }, [trimmed, isAddress, allTokens]);

  const recentlyUsed = useMemo(
    () =>
      getRecentlyUsedTokenIds()
        .map((id) => getSwapTokenById(id, extraTokens))
        .filter((token): token is SwapToken => token !== undefined && token.id !== excludeId)
        .slice(0, 5),
    [extraTokens, excludeId]
  );

  const popular = useMemo(
    () =>
      popularTokenIds
        .map((id) => getSwapTokenById(id, extraTokens))
        .filter((token): token is SwapToken => token !== undefined && token.id !== excludeId),
    [extraTokens, excludeId]
  );

  function handlePick(token: SwapToken) {
    onSelect(token.id);
  }

  function handleImport() {
    if (!importedMatch) return;
    const alreadyKnown = allTokens.some((token) => token.id === importedMatch.id);
    if (!alreadyKnown) onImportToken(importedMatch);
    onSelect(importedMatch.id);
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center md:items-center">
      <div className="absolute inset-0 animate-fadeIn bg-void/80 backdrop-blur-sm" onClick={onClose} />

      <div className="relative flex h-[85vh] w-full flex-col rounded-t-2xl border-t border-gold/40 bg-panel animate-fadeUp md:h-auto md:max-h-[80vh] md:w-full md:max-w-md md:rounded-2xl md:border md:border-gold/40">
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 className="font-display text-sm uppercase tracking-wider2 text-ivory">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-line text-bronze transition-colors hover:border-gold hover:text-goldLight"
            aria-label="Close"
          >
            <CloseIcon className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="border-b border-line px-5 py-4">
          <div className="flex items-center gap-3 rounded-xl border border-line bg-panel2 px-4 py-3 transition-colors focus-within:border-gold/60">
            <SearchIcon className="h-4 w-4 shrink-0 text-bronze" />
            <input
              autoFocus
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              type="text"
              placeholder="Search name, symbol, or paste address"
              className="w-full bg-transparent font-body text-sm text-ivory placeholder:text-bronze/70 focus:outline-none"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {isAddress ? (
            <div>
              {importedMatch && (
                <button
                  type="button"
                  onClick={handleImport}
                  className="flex w-full items-center gap-3 rounded-lg border border-line bg-panel2 px-3 py-3 text-left transition-colors hover:border-gold/60"
                >
                  <Avatar
                    label={importedMatch.monogram}
                    accent={importedMatch.accent}
                    className="h-9 w-9 text-[10px]"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="font-display text-xs uppercase tracking-wider2 text-ivory">
                      {importedMatch.symbol}
                    </p>
                    <p className="truncate font-mono text-[10px] text-bronze">
                      {importedMatch.name}
                    </p>
                  </div>
                </button>
              )}
              <p className="mt-3 font-mono text-[10px] uppercase tracking-wider2 text-garnetLight">
                Pasted address — this token is unverified. Trade with caution.
              </p>
            </div>
          ) : trimmed ? (
            filtered.length === 0 ? (
              <p className="px-1 py-8 text-center font-mono text-xs uppercase tracking-wider2 text-bronze">
                No tokens found
              </p>
            ) : (
              <div className="overflow-hidden rounded-xl border border-line bg-panel2">
                {filtered.map((token) => (
                  <TokenRow key={token.id} token={token} onClick={() => handlePick(token)} />
                ))}
              </div>
            )
          ) : (
            <div className="space-y-6">
              {recentlyUsed.length > 0 && (
                <div>
                  <div className="flex items-center gap-2">
                    <ClockIcon className="h-3.5 w-3.5 text-bronze" />
                    <p className="font-mono text-[10px] uppercase tracking-wider2 text-bronze">
                      Recently Used
                    </p>
                  </div>
                  <div className="no-scrollbar mt-3 flex items-center gap-2 overflow-x-auto">
                    {recentlyUsed.map((token) => (
                      <button
                        key={token.id}
                        type="button"
                        onClick={() => handlePick(token)}
                        className="flex shrink-0 items-center gap-2 rounded-lg border border-line px-3 py-2 transition-colors hover:border-gold/60"
                      >
                        <Avatar label={token.monogram} accent={token.accent} className="h-5 w-5 text-[8px]" />
                        <span className="font-display text-xs uppercase tracking-wider2 text-ivory">
                          {token.symbol}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <div className="flex items-center gap-2">
                  <StarIcon className="h-3.5 w-3.5 text-bronze" />
                  <p className="font-mono text-[10px] uppercase tracking-wider2 text-bronze">
                    Popular Tokens
                  </p>
                </div>
                <div className="mt-3 overflow-hidden rounded-xl border border-line bg-panel2">
                  {popular.map((token) => (
                    <TokenRow key={token.id} token={token} onClick={() => handlePick(token)} />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function TokenRow({ token, onClick }: { token: SwapToken; onClick: () => void }) {
  const positive = token.change24h >= 0;
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 border-b border-line px-3 py-3 text-left transition-colors last:border-b-0 hover:bg-panel"
    >
      <Avatar label={token.monogram} accent={token.accent} className="h-9 w-9 text-[10px]" />
      <div className="min-w-0 flex-1">
        <p className="font-display text-xs uppercase tracking-wider2 text-ivory">{token.symbol}</p>
        <p className="truncate font-mono text-[10px] text-bronze">{token.name}</p>
      </div>
      {token.priceUsd > 0 && (
        <div className="shrink-0 text-right font-mono text-[10px]">
          <p className="text-ivory">{formatPrice(token.priceUsd)}</p>
          <p className={positive ? "text-emeraldLight" : "text-garnetLight"}>
            {formatPct(token.change24h)}
          </p>
        </div>
      )}
    </button>
  );
}
