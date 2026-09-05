import type { EthCaller } from "./nft-onchain";
import { fetchDecimals, fetchSymbol, formatBaseUnitsToNumber, getWethAddress } from "./swap-onchain";
import { fetchPairSides } from "./lock-liquidity-onchain";
import { fetchAllPairAddresses, fetchEthUsdRate, fetchRawReserves } from "./positions-onchain";
import {
  getPriceUsdCalldata,
  isLaunchpadTokenCalldata,
  decodeBool as decodeLaunchpadBool,
  decodeUint256 as decodeLaunchpadUint256,
  weiToUsdNumber,
} from "./launchpad-onchain";
import { CONTRACT_ADDRESSES, NETWORK } from "@/config/contracts.config";
import type { Accent } from "./discover-data";

export type OnchainPool = {
  pairAddress: string;
  token0: string;
  token1: string;
  symbol0: string;
  symbol1: string;
  decimals0: number;
  decimals1: number;
  reserve0: bigint;
  reserve1: bigint;
  isWethPaired: boolean;
  isLaunchpad: boolean;
  createdAtMs: number | null;
  tvlUsd: number | null;
  volume24hUsd: number | null;
  fees24hUsd: number | null;
  aprPct: number | null;
  tvlSeries: number[];
  volumeSeries: number[];
  feesSeries: number[];
};

export type PoolCategory = "stable" | "trending" | "new" | "highApr";

export const poolFilters = ["All", "Stable", "Trending", "New", "High APR"] as const;
export type PoolFilter = (typeof poolFilters)[number];

type RawLog = {
  address: string;
  topics: string[];
  data: string;
  blockNumber: string;
};

const SWAP_TOPIC0 = "0xd78ad95fa46c994b6551d0da85fc275fe613ce37657fb8d5e3d130840159d822";
const PAIR_CREATED_TOPIC0 = "0x0d3648bd0f6ba80134a33ba9275ac585d9d315f0ad8355cddefde31afa28d0e9";
const SWAP_FEE_BPS = 30;
const WINDOW_MS = 24 * 60 * 60 * 1000;
const BUCKET_COUNT = 12;
const BUCKET_MS = WINDOW_MS / BUCKET_COUNT;
const STABLE_SYMBOLS = ["USDC", "USDT", "DAI", "BUSD"];
const ACCENTS: Accent[] = ["gold", "emerald", "garnet"];

async function rpcRequest(method: string, params: unknown[]): Promise<unknown> {
  const response = await fetch(NETWORK.rpcUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
  });
  const payload = await response.json();
  if (payload.error) throw new Error(payload.error.message ?? "RPC error");
  return payload.result;
}

async function getLogs(address: string, topics: (string | null)[]): Promise<RawLog[]> {
  try {
    const result = await rpcRequest("eth_getLogs", [{ address, topics, fromBlock: "0x0", toBlock: "latest" }]);
    return (result as RawLog[]) ?? [];
  } catch {
    return [];
  }
}

const blockTimestampCache = new Map<string, number>();

async function getBlockTimestampMs(blockNumberHex: string): Promise<number> {
  const cached = blockTimestampCache.get(blockNumberHex);
  if (cached !== undefined) return cached;
  try {
    const block = (await rpcRequest("eth_getBlockByNumber", [blockNumberHex, false])) as {
      timestamp: string;
    } | null;
    const timestampMs = block ? Number(BigInt(block.timestamp)) * 1000 : Date.now();
    blockTimestampCache.set(blockNumberHex, timestampMs);
    return timestampMs;
  } catch {
    return Date.now();
  }
}

function decodeSwapData(data: string): {
  amount0In: bigint;
  amount1In: bigint;
  amount0Out: bigint;
  amount1Out: bigint;
} {
  const clean = data.replace(/^0x/, "");
  const word = (index: number) => clean.slice(index * 64, index * 64 + 64);
  return {
    amount0In: BigInt(`0x${word(0)}`),
    amount1In: BigInt(`0x${word(1)}`),
    amount0Out: BigInt(`0x${word(2)}`),
    amount1Out: BigInt(`0x${word(3)}`),
  };
}

function decodePairCreatedAddress(data: string): string {
  const clean = data.replace(/^0x/, "");
  return `0x${clean.slice(24, 64)}`;
}

async function fetchPairCreationTimestamps(factoryAddress: string): Promise<Map<string, number>> {
  const logs = await getLogs(factoryAddress, [PAIR_CREATED_TOPIC0]);
  const entries = await Promise.all(
    logs.map(async (log) => {
      const pairAddress = decodePairCreatedAddress(log.data).toLowerCase();
      const timestampMs = await getBlockTimestampMs(log.blockNumber);
      return [pairAddress, timestampMs] as const;
    })
  );
  return new Map(entries);
}

async function resolveTokenUsdPrice(
  call: EthCaller,
  token: string,
  wethLower: string | null,
  ethUsdRate: number | null
): Promise<number | null> {
  if (wethLower && token.toLowerCase() === wethLower) return ethUsdRate;
  const isLaunchpadRaw = await call(CONTRACT_ADDRESSES.bondingCurveEngine, isLaunchpadTokenCalldata(token));
  if (!decodeLaunchpadBool(isLaunchpadRaw)) return null;
  const priceRaw = await call(CONTRACT_ADDRESSES.bondingCurveEngine, getPriceUsdCalldata(token));
  const price = weiToUsdNumber(decodeLaunchpadUint256(priceRaw));
  return price > 0 ? price : null;
}

async function buildPool(
  call: EthCaller,
  pairAddress: string,
  wethLower: string | null,
  ethUsdRate: number | null,
  createdAtMs: number | null
): Promise<OnchainPool | null> {
  const sides = await fetchPairSides(call, pairAddress);
  const token0 = sides.token0;
  const token1 = sides.token1;
  if (!token0 || !token1) return null;

  const [reserves, decimals0, decimals1, symbol0Raw, symbol1Raw] = await Promise.all([
    fetchRawReserves(call, pairAddress),
    fetchDecimals(call, token0, false),
    fetchDecimals(call, token1, false),
    token0.toLowerCase() === wethLower ? Promise.resolve("ETH") : fetchSymbol(call, token0),
    token1.toLowerCase() === wethLower ? Promise.resolve("ETH") : fetchSymbol(call, token1),
  ]);

  const [price0, price1] = await Promise.all([
    resolveTokenUsdPrice(call, token0, wethLower, ethUsdRate),
    resolveTokenUsdPrice(call, token1, wethLower, ethUsdRate),
  ]);

  const isWethPaired = Boolean(
    (wethLower && token0.toLowerCase() === wethLower) || (wethLower && token1.toLowerCase() === wethLower)
  );
  const isLaunchpad = Boolean(
    (price0 !== null && token0.toLowerCase() !== wethLower) || (price1 !== null && token1.toLowerCase() !== wethLower)
  );

  const amount0 = formatBaseUnitsToNumber(reserves.reserve0, decimals0);
  const amount1 = formatBaseUnitsToNumber(reserves.reserve1, decimals1);

  let tvlUsd: number | null = null;
  if (price0 !== null && price1 !== null) tvlUsd = amount0 * price0 + amount1 * price1;
  else if (price0 !== null) tvlUsd = amount0 * price0 * 2;
  else if (price1 !== null) tvlUsd = amount1 * price1 * 2;

  const priceKnown = price0 !== null || price1 !== null;
  const logs = await getLogs(pairAddress, [SWAP_TOPIC0]);
  const annotated = await Promise.all(
    logs.map(async (log) => ({ log, timestampMs: await getBlockTimestampMs(log.blockNumber) }))
  );

  const nowMs = Date.now();
  const boundaries = Array.from(
    { length: BUCKET_COUNT + 1 },
    (_, index) => nowMs - (BUCKET_COUNT - index) * BUCKET_MS
  );

  const volumeBuckets = new Array(BUCKET_COUNT).fill(0);
  let volume24hUsd = 0;

  annotated.forEach(({ log, timestampMs }) => {
    if (!priceKnown || timestampMs < boundaries[0]) return;
    const { amount0In, amount1In, amount0Out, amount1Out } = decodeSwapData(log.data);
    const side0Amount = formatBaseUnitsToNumber(amount0In > amount0Out ? amount0In : amount0Out, decimals0);
    const side1Amount = formatBaseUnitsToNumber(amount1In > amount1Out ? amount1In : amount1Out, decimals1);
    const swapUsd = price0 !== null ? side0Amount * price0 : price1 !== null ? side1Amount * price1 : null;
    if (swapUsd === null) return;
    volume24hUsd += swapUsd;
    const bucketIndex = Math.min(BUCKET_COUNT - 1, Math.max(0, Math.floor((timestampMs - boundaries[0]) / BUCKET_MS)));
    volumeBuckets[bucketIndex] += swapUsd;
  });

  const feesBuckets = volumeBuckets.map((value) => (value * SWAP_FEE_BPS) / 10000);
  const fees24hUsd = (volume24hUsd * SWAP_FEE_BPS) / 10000;
  const aprPct = tvlUsd && tvlUsd > 0 ? (fees24hUsd * 365 * 100) / tvlUsd : null;

  const sortedDesc = [...annotated].sort((a, b) => b.timestampMs - a.timestampMs);
  let runningReserve0 = reserves.reserve0;
  let runningReserve1 = reserves.reserve1;
  const tvlPoints: number[] = new Array(BUCKET_COUNT + 1);
  tvlPoints[BUCKET_COUNT] = tvlUsd ?? 0;
  let cursor = 0;
  for (let bucketIndex = BUCKET_COUNT - 1; bucketIndex >= 0; bucketIndex -= 1) {
    while (cursor < sortedDesc.length && sortedDesc[cursor].timestampMs > boundaries[bucketIndex]) {
      const { amount0In, amount1In, amount0Out, amount1Out } = decodeSwapData(sortedDesc[cursor].log.data);
      runningReserve0 = runningReserve0 - amount0In + amount0Out;
      runningReserve1 = runningReserve1 - amount1In + amount1Out;
      if (runningReserve0 < 0n) runningReserve0 = 0n;
      if (runningReserve1 < 0n) runningReserve1 = 0n;
      cursor += 1;
    }
    const pointAmount0 = formatBaseUnitsToNumber(runningReserve0, decimals0);
    const pointAmount1 = formatBaseUnitsToNumber(runningReserve1, decimals1);
    let pointTvl: number | null = null;
    if (price0 !== null && price1 !== null) pointTvl = pointAmount0 * price0 + pointAmount1 * price1;
    else if (price0 !== null) pointTvl = pointAmount0 * price0 * 2;
    else if (price1 !== null) pointTvl = pointAmount1 * price1 * 2;
    tvlPoints[bucketIndex] = pointTvl ?? 0;
  }

  return {
    pairAddress,
    token0,
    token1,
    symbol0: symbol0Raw || "TOKEN",
    symbol1: symbol1Raw || "TOKEN",
    decimals0,
    decimals1,
    reserve0: reserves.reserve0,
    reserve1: reserves.reserve1,
    isWethPaired,
    isLaunchpad,
    createdAtMs,
    tvlUsd,
    volume24hUsd: priceKnown ? volume24hUsd : null,
    fees24hUsd: priceKnown ? fees24hUsd : null,
    aprPct,
    tvlSeries: tvlPoints.slice(1),
    volumeSeries: volumeBuckets,
    feesSeries: feesBuckets,
  };
}

export async function fetchExplorePools(call: EthCaller): Promise<OnchainPool[]> {
  const [wethAddress, ethUsdRate, pairAddresses, creationTimestamps] = await Promise.all([
    getWethAddress(call),
    fetchEthUsdRate(call),
    fetchAllPairAddresses(call),
    fetchPairCreationTimestamps(CONTRACT_ADDRESSES.gumiFactory),
  ]);
  const wethLower = wethAddress?.toLowerCase() ?? null;

  const pools = await Promise.all(
    pairAddresses.map((pairAddress) =>
      buildPool(call, pairAddress, wethLower, ethUsdRate, creationTimestamps.get(pairAddress.toLowerCase()) ?? null)
    )
  );

  return pools.filter((pool): pool is OnchainPool => pool !== null);
}

export function classifyPool(pool: OnchainPool, allPools: OnchainPool[]): PoolCategory[] {
  const categories: PoolCategory[] = [];
  if (STABLE_SYMBOLS.includes(pool.symbol0.toUpperCase()) || STABLE_SYMBOLS.includes(pool.symbol1.toUpperCase())) {
    categories.push("stable");
  }
  if (pool.aprPct !== null && pool.aprPct >= 20) {
    categories.push("highApr");
  }
  if (pool.createdAtMs !== null && Date.now() - pool.createdAtMs <= 7 * 24 * 60 * 60 * 1000) {
    categories.push("new");
  }
  const sortedVolumes = allPools.map((item) => item.volume24hUsd ?? 0).sort((a, b) => b - a);
  const trendingThreshold = sortedVolumes[Math.min(2, sortedVolumes.length - 1)] ?? 0;
  if ((pool.volume24hUsd ?? 0) > 0 && (pool.volume24hUsd ?? 0) >= trendingThreshold) {
    categories.push("trending");
  }
  return categories;
}

export function filterOnchainPools(
  pools: OnchainPool[],
  filter: PoolFilter,
  query: string,
  categoriesByPair: Map<string, PoolCategory[]>
): OnchainPool[] {
  const trimmed = query.trim().toLowerCase();
  let list = pools;
  if (filter !== "All") {
    const categoryMap: Record<Exclude<PoolFilter, "All">, PoolCategory> = {
      Stable: "stable",
      Trending: "trending",
      New: "new",
      "High APR": "highApr",
    };
    const category = categoryMap[filter];
    list = list.filter((pool) => (categoriesByPair.get(pool.pairAddress.toLowerCase()) ?? []).includes(category));
  }
  if (trimmed) {
    list = list.filter(
      (pool) => pool.symbol0.toLowerCase().includes(trimmed) || pool.symbol1.toLowerCase().includes(trimmed)
    );
  }
  return list;
}

export function poolPairLabel(pool: OnchainPool): string {
  return `${pool.symbol0} / ${pool.symbol1}`;
}

export function monogramFor(symbol: string): string {
  const clean = symbol.trim().toUpperCase();
  return clean.slice(0, 2).padEnd(2, clean.charAt(0) || "T");
}

export function accentForAddress(address: string): Accent {
  const clean = address.toLowerCase().replace(/^0x/, "");
  const lastByte = parseInt(clean.slice(-2), 16) || 0;
  return ACCENTS[lastByte % ACCENTS.length];
}

export type ChartMetric = "tvl" | "volume" | "fees";

export const chartMetrics: { id: ChartMetric; label: string }[] = [
  { id: "tvl", label: "TVL" },
  { id: "volume", label: "Volume" },
  { id: "fees", label: "Fees" },
];

export function getSeriesForMetric(pool: OnchainPool, metric: ChartMetric): number[] {
  if (metric === "volume") return pool.volumeSeries;
  if (metric === "fees") return pool.feesSeries;
  return pool.tvlSeries;
}
