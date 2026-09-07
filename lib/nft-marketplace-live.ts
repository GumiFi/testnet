"use client";

import { useSyncExternalStore } from "react";
import { fetchAllActiveListings, type MarketListing } from "./nft-marketplace-onchain";

type Store = {
  listings: MarketListing[];
  loaded: boolean;
  loading: boolean;
};

let store: Store = { listings: [], loaded: false, loading: false };
const listeners = new Set<() => void>();

function setStore(patch: Partial<Store>) {
  store = { ...store, ...patch };
  listeners.forEach((listener) => listener());
}

export async function refreshMarketListings(): Promise<void> {
  setStore({ loading: true });
  try {
    const listings = await fetchAllActiveListings();
    setStore({ listings, loaded: true, loading: false });
  } catch {
    setStore({ loaded: true, loading: false });
  }
}

function subscribe(callback: () => void): () => void {
  listeners.add(callback);
  if (!store.loaded && !store.loading) {
    refreshMarketListings();
  }
  return () => {
    listeners.delete(callback);
  };
}

function getSnapshot(): Store {
  return store;
}

function getServerSnapshot(): Store {
  return { listings: [], loaded: false, loading: false };
}

export function useMarketListings(): Store {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
