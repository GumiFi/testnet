import { doc, getDoc } from "firebase/firestore";
import { getClientDb } from "./firebase-client";
import { CONTRACT_ADDRESSES } from "@/config/contracts.config";
import type { EthCaller } from "./nft-onchain";

export const ETH_ORACLE_CACHE_COLLECTION = "ethOracleCache";
export const ETH_ORACLE_CACHE_DOC_ID = "latest";
export const ETH_ORACLE_UPDATE_INTERVAL_MS = 10 * 60 * 1000;

export type EthOracleCacheRecord = {
  rateUsd: number;
  updatedAt: number;
};

export function getRateCalldata(): string {
  return "0x679aefce";
}

export function decodeOracleRate(raw: string | null | undefined): number | null {
  if (!raw || raw === "0x") return null;
  try {
    const rate = BigInt(raw);
    if (rate <= 0n) return null;
    return Number(rate) / 1e18;
  } catch {
    return null;
  }
}

export async function fetchOnchainEthUsdRate(call: EthCaller): Promise<number | null> {
  try {
    const raw = await call(CONTRACT_ADDRESSES.priceOracle, getRateCalldata());
    return decodeOracleRate(raw);
  } catch {
    return null;
  }
}

export async function fetchCachedEthUsdRate(): Promise<EthOracleCacheRecord | null> {
  try {
    const db = getClientDb();
    const snapshot = await getDoc(doc(db, ETH_ORACLE_CACHE_COLLECTION, ETH_ORACLE_CACHE_DOC_ID));
    if (!snapshot.exists()) return null;
    const data = snapshot.data() as Partial<EthOracleCacheRecord>;
    if (typeof data.rateUsd !== "number" || !(data.rateUsd > 0)) return null;
    return {
      rateUsd: data.rateUsd,
      updatedAt: typeof data.updatedAt === "number" ? data.updatedAt : 0,
    };
  } catch {
    return null;
  }
}

export type EthUsdRateResult = {
  rateUsd: number | null;
  updatedAt: number | null;
  source: "onchain" | "cache" | null;
};

export async function getEthUsdRateDetailed(call: EthCaller): Promise<EthUsdRateResult> {
  const onchainRate = await fetchOnchainEthUsdRate(call);
  if (onchainRate != null) {
    return { rateUsd: onchainRate, updatedAt: Date.now(), source: "onchain" };
  }

  const cached = await fetchCachedEthUsdRate();
  if (cached) {
    return { rateUsd: cached.rateUsd, updatedAt: cached.updatedAt, source: "cache" };
  }

  return { rateUsd: null, updatedAt: null, source: null };
}

export async function getEthUsdRateWithFallback(call: EthCaller): Promise<number | null> {
  const result = await getEthUsdRateDetailed(call);
  return result.rateUsd;
}
