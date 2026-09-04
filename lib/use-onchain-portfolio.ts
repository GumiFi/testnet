"use client";

import { useEffect, useMemo, useState } from "react";
import { CONTRACT_ADDRESSES, NETWORK } from "@/config/contracts.config";
import { createRpcCaller, type EthCaller } from "./nft-onchain";
import { fetchErc20Balance, fetchNativeBalance } from "./token-onchain";
import { readCurveSnapshot } from "./launchpad-onchain";
import { fetchLaunchpadCoinRecords, type LaunchpadCoinRecord } from "./launchpad-realtime";
import { fetchNftCollectionRecordsByCreator, type NftCollectionRecord } from "./nft-collections-realtime";
import { fetchWalletActivity, type ActivityEntry } from "./activity-onchain";
import type { Accent } from "./discover-data";

const MAX_HELD_TOKENS_CHECKED = 30;

export type OnchainAsset = {
  id: string;
  symbol: string;
  name: string;
  monogram: string;
  accent: Accent;
  balance: number;
  priceUsd: number | null;
  valueUsd: number | null;
};

export type OnchainLaunch = {
  id: string;
  address: string;
  symbol: string;
  name: string;
  monogram: string;
  bondingProgress: number;
  marketCapUsd: number;
  graduated: boolean;
};

export type OnchainPortfolio = {
  loading: boolean;
  assets: OnchainAsset[];
  totalValueUsd: number;
  myLaunches: OnchainLaunch[];
  myCollections: NftCollectionRecord[];
  activity: ActivityEntry[];
};

function monogramFor(symbol: string): string {
  const clean = symbol.trim().toUpperCase();
  return clean.slice(0, 2).padEnd(2, clean.charAt(0) || "T");
}

async function buildHeldLaunchpadAssets(
  call: EthCaller,
  address: string,
  records: LaunchpadCoinRecord[]
): Promise<OnchainAsset[]> {
  const candidates = records.slice(0, MAX_HELD_TOKENS_CHECKED);

  const withBalances = await Promise.all(
    candidates.map(async (record) => ({
      record,
      balance: await fetchErc20Balance(call, record.address, address).catch(() => 0),
    }))
  );

  const held = withBalances.filter((entry) => entry.balance > 0);

  return Promise.all(
    held.map(async ({ record, balance }) => {
      const snapshot = await readCurveSnapshot(
        call,
        CONTRACT_ADDRESSES.bondingCurveEngine,
        CONTRACT_ADDRESSES.launchpadRegistry,
        record.address
      ).catch(() => null);

      return {
        id: record.address.toLowerCase(),
        symbol: record.symbol,
        name: record.name,
        monogram: monogramFor(record.symbol),
        accent: "emerald" as Accent,
        balance,
        priceUsd: snapshot ? snapshot.priceUsd : null,
        valueUsd: snapshot ? snapshot.priceUsd * balance : null,
      };
    })
  );
}

async function buildMyLaunches(call: EthCaller, records: LaunchpadCoinRecord[]): Promise<OnchainLaunch[]> {
  return Promise.all(
    records.map(async (record) => {
      const snapshot = await readCurveSnapshot(
        call,
        CONTRACT_ADDRESSES.bondingCurveEngine,
        CONTRACT_ADDRESSES.launchpadRegistry,
        record.address
      ).catch(() => null);

      return {
        id: record.address.toLowerCase(),
        address: record.address,
        symbol: record.symbol,
        name: record.name,
        monogram: monogramFor(record.symbol),
        bondingProgress: snapshot ? snapshot.bondingProgress : 0,
        marketCapUsd: snapshot ? snapshot.marketCapUsd : 0,
        graduated: snapshot ? snapshot.graduated : false,
      };
    })
  );
}

export function useOnchainPortfolio(address: string | null): OnchainPortfolio {
  const [assets, setAssets] = useState<OnchainAsset[]>([]);
  const [myLaunches, setMyLaunches] = useState<OnchainLaunch[]>([]);
  const [myCollections, setMyCollections] = useState<NftCollectionRecord[]>([]);
  const [activity, setActivity] = useState<ActivityEntry[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!address) {
      setAssets([]);
      setMyLaunches([]);
      setMyCollections([]);
      setActivity([]);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    const call = createRpcCaller(NETWORK.rpcUrl);

    async function run() {
      const [ethBalance, gumiBalance, allLaunchpadRecords, myCollectionRecords] = await Promise.all([
        fetchNativeBalance(null, NETWORK.rpcUrl, address as string),
        fetchErc20Balance(call, CONTRACT_ADDRESSES.gumiToken, address as string),
        fetchLaunchpadCoinRecords().catch(() => []),
        fetchNftCollectionRecordsByCreator(address as string).catch(() => []),
      ]);
      if (cancelled) return;

      const gumiCurve = await readCurveSnapshot(
        call,
        CONTRACT_ADDRESSES.bondingCurveEngine,
        CONTRACT_ADDRESSES.launchpadRegistry,
        CONTRACT_ADDRESSES.gumiToken
      ).catch(() => null);

      const ownLaunchRecords = allLaunchpadRecords.filter(
        (record) => record.creator.toLowerCase() === (address as string).toLowerCase()
      );
      const otherLaunchRecords = allLaunchpadRecords.filter(
        (record) => record.creator.toLowerCase() !== (address as string).toLowerCase()
      );

      const [heldAssets, launches] = await Promise.all([
        buildHeldLaunchpadAssets(call, address as string, otherLaunchRecords),
        buildMyLaunches(call, ownLaunchRecords),
      ]);
      if (cancelled) return;

      const baseAssets: OnchainAsset[] = [
        {
          id: "eth",
          symbol: NETWORK.nativeCurrency.symbol,
          name: NETWORK.nativeCurrency.name,
          monogram: "ET",
          accent: "gold",
          balance: ethBalance,
          priceUsd: null,
          valueUsd: null,
        },
        {
          id: "gumi",
          symbol: "GUMI",
          name: "Gumi Protocol",
          monogram: "GU",
          accent: "gold",
          balance: gumiBalance,
          priceUsd: gumiCurve && gumiCurve.initialized ? gumiCurve.priceUsd : null,
          valueUsd: gumiCurve && gumiCurve.initialized ? gumiCurve.priceUsd * gumiBalance : null,
        },
        ...heldAssets,
      ];

      const activityEntries = await fetchWalletActivity(address as string, {
        launches: ownLaunchRecords,
        collections: myCollectionRecords,
      }).catch(() => []);
      if (cancelled) return;

      setAssets(baseAssets);
      setMyLaunches(launches);
      setMyCollections(myCollectionRecords);
      setActivity(activityEntries);
      setLoading(false);
    }

    run().catch(() => {
      if (!cancelled) setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [address]);

  const totalValueUsd = useMemo(
    () => assets.reduce((sum, asset) => sum + (asset.valueUsd ?? 0), 0),
    [assets]
  );

  return { loading, assets, totalValueUsd, myLaunches, myCollections, activity };
}
