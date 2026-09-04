"use client";

import { useEffect, useState } from "react";
import { registerLiveLaunchpadCoins, type LaunchpadCoin } from "./launchpad-data";
import { fetchRealLaunchpadCoins } from "./launchpad-realtime";

let liveCoinsPromise: Promise<LaunchpadCoin[]> | null = null;

export function loadLiveLaunchpadCoins(): Promise<LaunchpadCoin[]> {
  if (liveCoinsPromise) return liveCoinsPromise;
  liveCoinsPromise = fetchRealLaunchpadCoins()
    .then((coins) => {
      registerLiveLaunchpadCoins(coins);
      return coins;
    })
    .catch(() => []);
  return liveCoinsPromise;
}

export function useLiveLaunchpadCoins(): boolean {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    loadLiveLaunchpadCoins().then(() => {
      if (!cancelled) setReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return ready;
}
