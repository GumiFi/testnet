"use client";

import { useEffect, useState } from "react";
import { useWallet } from "./wallet-context";
import { loadLiveDexPairs } from "./dex-live";
import { dexPairs } from "./dex-data";
import {
  fetchWalletSwapHistory,
  fetchSwapByTxHash,
  fetchEthUsdRateForHistory,
  type SwapHistoryItem,
} from "./swap-history-onchain";

export function useSwapHistory(): { history: SwapHistoryItem[]; loading: boolean; loaded: boolean } {
  const { address } = useWallet();
  const [history, setHistory] = useState<SwapHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!address) {
      setHistory([]);
      setLoaded(true);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    Promise.all([loadLiveDexPairs(), fetchEthUsdRateForHistory()])
      .then(([, ethUsdRate]) => fetchWalletSwapHistory(address, dexPairs, ethUsdRate))
      .then((items) => {
        if (!cancelled) setHistory(items);
      })
      .catch(() => {
        if (!cancelled) setHistory([]);
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
          setLoaded(true);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [address]);

  return { history, loading, loaded };
}

export function useSwapByTxHash(txHash: string): {
  item: SwapHistoryItem | null;
  loading: boolean;
  loaded: boolean;
} {
  const [item, setItem] = useState<SwapHistoryItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setLoaded(false);
    Promise.all([loadLiveDexPairs(), fetchEthUsdRateForHistory()])
      .then(([, ethUsdRate]) => fetchSwapByTxHash(txHash, dexPairs, ethUsdRate))
      .then((result) => {
        if (!cancelled) setItem(result);
      })
      .catch(() => {
        if (!cancelled) setItem(null);
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
          setLoaded(true);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [txHash]);

  return { item, loading, loaded };
}
