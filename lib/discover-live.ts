"use client";

import { useEffect, useState } from "react";
import { loadLiveDexPairs } from "./dex-live";
import { loadLiveLaunchpadCoins } from "./launchpad-live";
import { dexPairs, getPairSparkline, type DexPair } from "./dex-data";
import { launchpadCoins, type LaunchpadCoin } from "./launchpad-data";
import {
  setDiscoverTokens,
  setDiscoverLaunches,
  setPools,
  type DiscoverToken,
  type DiscoverLaunch,
  type Pool,
} from "./discover-data";
import { CONTRACT_ADDRESSES, NETWORK } from "@/config/contracts.config";

async function fetchDexFeeBps(): Promise<number> {
  try {
    const response = await fetch(NETWORK.rpcUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "eth_call",
        params: [{ to: CONTRACT_ADDRESSES.feeConfigRegistry, data: "0x9f553f43" }, "latest"],
      }),
    });
    if (!response.ok) return 50;
    const payload = await response.json();
    if (!payload?.result || payload.result === "0x") return 50;
    return Number(BigInt(payload.result));
  } catch {
    return 50;
  }
}

function dexPairToDiscoverToken(pair: DexPair): DiscoverToken {
  return {
    id: pair.id,
    symbol: pair.symbol,
    name: pair.name,
    monogram: pair.monogram,
    accent: pair.accent,
    priceUsd: pair.priceUsd,
    change24h: pair.change24h,
    marketCap: pair.marketCap,
    volume24h: pair.volume24h,
    liquidity: pair.liquidity,
    trendScore: pair.trendScore,
    isNew: pair.isNew,
    sparkline: getPairSparkline(pair, "24H"),
    boost: pair.boost,
  };
}

function coinToDiscoverLaunch(coin: LaunchpadCoin): DiscoverLaunch {
  return {
    id: coin.id,
    symbol: coin.symbol,
    name: coin.name,
    monogram: coin.monogram,
    accent: coin.accent,
    creator: coin.creator,
    bondingCurvePct: Math.round(coin.bondingProgress),
    age: coin.age,
    marketCap: coin.marketCap,
    boost: coin.boost,
  };
}

function dexPairToPool(pair: DexPair, dexFeeBps: number): Pool {
  const aprPct =
    pair.liquidity > 0 ? ((pair.volume24h * (dexFeeBps / 10_000) * 365) / pair.liquidity) * 100 : 0;
  return {
    id: pair.id,
    pair: `${pair.symbol} / ${pair.quoteSymbol}`,
    tvlUsd: pair.liquidity,
    volume24hUsd: pair.volume24h,
    aprPct,
  };
}

let discoverPromise: Promise<void> | null = null;

export function loadLiveDiscoverData(): Promise<void> {
  if (discoverPromise) return discoverPromise;
  discoverPromise = Promise.all([loadLiveDexPairs(), loadLiveLaunchpadCoins(), fetchDexFeeBps()])
    .then(([, , dexFeeBps]) => {
      setDiscoverTokens(dexPairs.map(dexPairToDiscoverToken).sort((a, b) => b.trendScore - a.trendScore));
      setDiscoverLaunches(launchpadCoins.map(coinToDiscoverLaunch).sort((a, b) => b.bondingCurvePct - a.bondingCurvePct));
      setPools(dexPairs.map((pair) => dexPairToPool(pair, dexFeeBps)).sort((a, b) => b.tvlUsd - a.tvlUsd));
    })
    .catch(() => {
    });
  return discoverPromise;
}

export function useLiveDiscoverData(): boolean {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    loadLiveDiscoverData().then(() => {
      if (!cancelled) setReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return ready;
}
