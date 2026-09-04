import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import { getClientDb, LAUNCHPAD_COINS_COLLECTION } from "./firebase-client";
import { createRpcCaller, type EthCaller } from "./nft-onchain";
import { readCurveSnapshot } from "./launchpad-onchain";
import { CONTRACT_ADDRESSES, NETWORK } from "@/config/contracts.config";
import type { Accent } from "./discover-data";
import type { LaunchpadCoin } from "./launchpad-data";

export type LaunchpadCoinRecord = {
  address: string;
  creator: string;
  name: string;
  symbol: string;
  description: string;
  image: string | null;
  bannerImage: string | null;
  website: string | null;
  twitter: string | null;
  telegram: string | null;
  txHash: string;
  createdAt: number;
};

function monogramFor(symbol: string): string {
  const clean = symbol.trim().toUpperCase();
  return clean.slice(0, 2).padEnd(2, clean.charAt(0) || "T");
}

function accentFor(address: string): Accent {
  const accents: Accent[] = ["gold", "emerald", "garnet"];
  const lastChar = address.slice(-1).toLowerCase();
  const index = parseInt(lastChar, 16);
  return accents[Number.isFinite(index) ? index % accents.length : 0];
}

function formatRelativeAge(createdAt: number): { label: string; isNew: boolean } {
  const seconds = Math.max(0, (Date.now() - createdAt) / 1000);
  if (seconds < 3600) return { label: `${Math.max(1, Math.round(seconds / 60))}m`, isNew: true };
  if (seconds < 86400) return { label: `${Math.round(seconds / 3600)}h`, isNew: true };
  return { label: `${Math.round(seconds / 86400)}d`, isNew: false };
}

export async function fetchLaunchpadCoinRecords(): Promise<LaunchpadCoinRecord[]> {
  const db = getClientDb();
  const snapshot = await getDocs(collection(db, LAUNCHPAD_COINS_COLLECTION));
  return snapshot.docs.map((docSnapshot) => docSnapshot.data() as LaunchpadCoinRecord);
}

export async function fetchLaunchpadCoinRecord(address: string): Promise<LaunchpadCoinRecord | null> {
  const db = getClientDb();
  const snapshot = await getDoc(doc(db, LAUNCHPAD_COINS_COLLECTION, address.toLowerCase()));
  if (!snapshot.exists()) return null;
  return snapshot.data() as LaunchpadCoinRecord;
}

export async function buildLaunchpadCoinFromRecord(
  record: LaunchpadCoinRecord,
  call: EthCaller
): Promise<LaunchpadCoin> {
  const snapshot = await readCurveSnapshot(
    call,
    CONTRACT_ADDRESSES.bondingCurveEngine,
    CONTRACT_ADDRESSES.launchpadRegistry,
    record.address
  );
  const age = formatRelativeAge(record.createdAt);

  return {
    id: record.address.toLowerCase(),
    symbol: record.symbol,
    name: record.name,
    monogram: monogramFor(record.symbol),
    accent: accentFor(record.address),
    marketCap: snapshot.marketCapUsd,
    change24h: 0,
    volume24h: 0,
    priceUsd: snapshot.priceUsd,
    bondingProgress: snapshot.graduated ? 100 : snapshot.bondingProgress,
    trendScore: Math.min(100, 40 + snapshot.bondingProgress * 0.4),
    creator: record.creator,
    age: age.label,
    isNew: age.isNew,
    tagline: undefined,
    boost: null,
    image: record.image,
    bannerImage: record.bannerImage,
    description: record.description,
    isLive: true,
  };
}

export async function fetchRealLaunchpadCoins(): Promise<LaunchpadCoin[]> {
  const records = await fetchLaunchpadCoinRecords();
  if (records.length === 0) return [];
  const call = createRpcCaller(NETWORK.rpcUrl);
  const coins = await Promise.all(
    records.map((record) => buildLaunchpadCoinFromRecord(record, call).catch(() => null))
  );
  return coins.filter((coin): coin is LaunchpadCoin => coin !== null);
}

export async function fetchRealLaunchpadCoin(address: string): Promise<LaunchpadCoin | null> {
  const record = await fetchLaunchpadCoinRecord(address);
  if (!record) return null;
  const call = createRpcCaller(NETWORK.rpcUrl);
  return buildLaunchpadCoinFromRecord(record, call).catch(() => null);
}
