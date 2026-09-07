"use client";

import { useEffect, useState } from "react";
import { registerLiveDexPairs, type DexPair } from "./dex-data";
import { fetchAllDexPairsOnchain } from "./dex-onchain";

let livePairsPromise: Promise<DexPair[]> | null = null;

export function loadLiveDexPairs(): Promise<DexPair[]> {
  if (livePairsPromise) return livePairsPromise;
  livePairsPromise = fetchAllDexPairsOnchain()
    .then((pairs) => {
      registerLiveDexPairs(pairs);
      return pairs;
    })
    .catch(() => []);
  return livePairsPromise;
}

export function useLiveDexPairs(): boolean {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    loadLiveDexPairs().then(() => {
      if (!cancelled) setReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return ready;
}
