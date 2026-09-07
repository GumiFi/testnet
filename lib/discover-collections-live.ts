"use client";

import { useEffect, useState } from "react";
import { fetchAllNftCollectionRecords } from "./nft-collections-realtime";
import { fetchAllActiveListings } from "./nft-marketplace-onchain";
import { loadLiveLaunchpadCoins } from "./launchpad-live";
import { launchpadCoins } from "./launchpad-data";
import { setNftCollections, setCreators, type NftCollection, type Creator, type Accent } from "./discover-data";
import { NETWORK } from "@/config/contracts.config";

async function rpcRequest<T>(method: string, params: unknown[]): Promise<T | null> {
  try {
    const response = await fetch(NETWORK.rpcUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
    });
    if (!response.ok) return null;
    const payload = await response.json();
    if (!payload || payload.error) return null;
    return payload.result as T;
  } catch {
    return null;
  }
}

async function ethCall(to: string, data: string): Promise<string | null> {
  return rpcRequest<string>("eth_call", [{ to, data }, "latest"]);
}

function padHex(value: string): string {
  return value.replace(/^0x/, "").padStart(64, "0");
}

function ownerOfCalldata(tokenId: bigint): string {
  return `0x6352211e${padHex(tokenId.toString(16))}`;
}

function totalSupplyCalldata(): string {
  return "0x18160ddd";
}

function decodeUint256(hex: string | null): bigint {
  if (!hex || hex === "0x") return 0n;
  return BigInt(hex);
}

function decodeAddressWord(hex: string): string {
  return `0x${hex.replace(/^0x/, "").slice(-40)}`;
}

function monogramFromName(name: string): string {
  const clean = name.trim().toUpperCase() || "NF";
  return clean.slice(0, 2).padEnd(2, clean.charAt(0) || "N");
}

const ACCENTS: Accent[] = ["gold", "emerald", "garnet"];
function accentFromAddress(address: string): Accent {
  const index = parseInt(address.slice(-1).toLowerCase(), 16);
  return ACCENTS[Number.isFinite(index) ? index % ACCENTS.length : 0];
}

async function fetchCollectionStats(address: string): Promise<{ items: number; owners: number }> {
  const totalRaw = await ethCall(address, totalSupplyCalldata());
  const total = Number(decodeUint256(totalRaw));
  if (total <= 0) return { items: 0, owners: 0 };

  const ids = Array.from({ length: total }, (_, index) => BigInt(index + 1));
  const owners = await Promise.all(
    ids.map((tokenId) =>
      ethCall(address, ownerOfCalldata(tokenId))
        .then((raw) => (raw && raw !== "0x" ? decodeAddressWord(raw) : null))
        .catch(() => null)
    )
  );
  const uniqueOwners = new Set(owners.filter((owner): owner is string => owner !== null).map((o) => o.toLowerCase()));
  return { items: total, owners: uniqueOwners.size };
}

async function loadLiveDiscoverCollectionsAndCreators(): Promise<void> {
  const [records, listings] = await Promise.all([
    fetchAllNftCollectionRecords().catch(() => []),
    fetchAllActiveListings().catch(() => []),
    loadLiveLaunchpadCoins(),
  ]);

  const floorByCollection = new Map<string, number>();
  for (const listing of listings) {
    const key = listing.nft.toLowerCase();
    const priceEth = Number(listing.priceWei) / 1e18;
    const current = floorByCollection.get(key);
    if (current == null || priceEth < current) floorByCollection.set(key, priceEth);
  }

  const collections = await Promise.all(
    records.map(async (record): Promise<NftCollection> => {
      const stats = await fetchCollectionStats(record.address).catch(() => ({ items: 0, owners: 0 }));
      return {
        id: record.address.toLowerCase(),
        name: record.name,
        monogram: monogramFromName(record.name),
        accent: accentFromAddress(record.address),
        floorEth: floorByCollection.get(record.address.toLowerCase()) ?? 0,
        change24h: 0,
        volume24hEth: 0,
        owners: stats.owners,
        items: stats.items,
        isNew: Date.now() - record.createdAt < 86_400_000,
      };
    })
  );

  setNftCollections(collections.sort((a, b) => b.items - a.items));

  const creatorStats = new Map<string, { tokensCount: number; nftsCount: number; volumeUsd: number }>();
  for (const coin of launchpadCoins) {
    const key = coin.creator.toLowerCase();
    const entry = creatorStats.get(key) ?? { tokensCount: 0, nftsCount: 0, volumeUsd: 0 };
    entry.tokensCount += 1;
    entry.volumeUsd += coin.marketCap;
    creatorStats.set(key, entry);
  }
  for (const record of records) {
    const key = record.creator.toLowerCase();
    const entry = creatorStats.get(key) ?? { tokensCount: 0, nftsCount: 0, volumeUsd: 0 };
    entry.nftsCount += 1;
    creatorStats.set(key, entry);
  }

  const creatorsList: Creator[] = Array.from(creatorStats.entries()).map(([address, stats]) => ({
    id: address,
    name: `${address.slice(0, 6)}…${address.slice(-4)}`,
    handle: address,
    monogram: address.slice(2, 4).toUpperCase(),
    accent: accentFromAddress(address),
    tokensCount: stats.tokensCount,
    nftsCount: stats.nftsCount,
    volumeUsd: stats.volumeUsd,
  }));

  setCreators(creatorsList.sort((a, b) => b.volumeUsd - a.volumeUsd).slice(0, 10));
}

let cachedPromise: Promise<void> | null = null;
function loadOnce(): Promise<void> {
  if (!cachedPromise) {
    cachedPromise = loadLiveDiscoverCollectionsAndCreators().catch(() => {});
  }
  return cachedPromise;
}

export function useLiveDiscoverCollectionsAndCreators(): boolean {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    loadOnce().then(() => {
      if (!cancelled) setReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return ready;
}
