import { discoverTokens, type Accent } from "./discover-data";

export type PoolCategory = "stable" | "trending" | "new" | "highApr";

export type PoolToken = {
  id: string;
  symbol: string;
  monogram: string;
  accent: Accent;
};

export type LiquidityPool = {
  id: string;
  base: PoolToken;
  quote: PoolToken;
  tvlUsd: number;
  volume24hUsd: number;
  aprPct: number;
  fees24hUsd: number;
  categories: PoolCategory[];
  isLaunchpad: boolean;
  createdByUser?: boolean;
  tvlSeries: number[];
  volumeSeries: number[];
  feesSeries: number[];
};

const ETH: PoolToken = { id: "eth", symbol: "ETH", monogram: "ET", accent: "gold" };
const USDC: PoolToken = { id: "usdc", symbol: "USDC", monogram: "US", accent: "emerald" };
const MOON: PoolToken = { id: "moon", symbol: "MOON", monogram: "MO", accent: "emerald" };
const DRAC: PoolToken = { id: "drac", symbol: "DRAC", monogram: "DR", accent: "garnet" };

function fromDiscover(id: string): PoolToken {
  const token = discoverTokens.find((item) => item.id === id)!;
  return { id: token.id, symbol: token.symbol, monogram: token.monogram, accent: token.accent };
}

export const liquidityPools: LiquidityPool[] = [
  {
    id: "eth-gumi",
    base: ETH,
    quote: fromDiscover("gumi"),
    tvlUsd: 612_000,
    volume24hUsd: 1_940_000,
    aprPct: 18.4,
    fees24hUsd: 5_820,
    categories: ["trending", "highApr"],
    isLaunchpad: true,
    tvlSeries: [38, 41, 40, 44, 47, 45, 49, 52, 50, 54, 58, 61],
    volumeSeries: [60, 72, 65, 80, 92, 84, 98, 110, 102, 118, 130, 194],
    feesSeries: [18, 21, 19, 24, 27, 25, 29, 32, 30, 34, 38, 58],
  },
  {
    id: "gumi-usdc",
    base: fromDiscover("gumi"),
    quote: USDC,
    tvlUsd: 284_000,
    volume24hUsd: 820_000,
    aprPct: 14.2,
    fees24hUsd: 2_460,
    categories: ["stable", "trending"],
    isLaunchpad: true,
    tvlSeries: [20, 21, 22, 21, 23, 24, 23, 25, 26, 27, 28, 28],
    volumeSeries: [40, 44, 42, 48, 52, 50, 56, 60, 58, 64, 70, 82],
    feesSeries: [8, 9, 8, 10, 11, 10, 12, 13, 12, 14, 15, 16],
  },
  {
    id: "eth-moon",
    base: ETH,
    quote: MOON,
    tvlUsd: 156_000,
    volume24hUsd: 540_000,
    aprPct: 26.8,
    fees24hUsd: 1_620,
    categories: ["new", "trending"],
    isLaunchpad: true,
    tvlSeries: [6, 8, 7, 10, 12, 11, 13, 12, 14, 15, 15, 16],
    volumeSeries: [12, 16, 14, 20, 24, 22, 28, 26, 32, 36, 40, 54],
    feesSeries: [4, 5, 4, 6, 7, 6, 8, 7, 9, 10, 11, 14],
  },
  {
    id: "eth-drac",
    base: ETH,
    quote: DRAC,
    tvlUsd: 91_000,
    volume24hUsd: 320_000,
    aprPct: 32.8,
    fees24hUsd: 960,
    categories: ["new", "highApr"],
    isLaunchpad: true,
    tvlSeries: [4, 5, 4, 6, 6, 7, 7, 8, 8, 9, 9, 9],
    volumeSeries: [8, 10, 9, 12, 14, 13, 16, 18, 17, 20, 24, 32],
    feesSeries: [2, 3, 2, 3, 4, 3, 5, 5, 6, 7, 8, 10],
  },
  {
    id: "eth-geum",
    base: ETH,
    quote: fromDiscover("geum"),
    tvlUsd: 398_000,
    volume24hUsd: 1_120_000,
    aprPct: 22.1,
    fees24hUsd: 3_360,
    categories: ["trending"],
    isLaunchpad: false,
    tvlSeries: [28, 29, 28, 31, 33, 32, 35, 34, 37, 38, 39, 40],
    volumeSeries: [50, 55, 52, 60, 66, 62, 70, 76, 72, 82, 96, 112],
    feesSeries: [15, 16, 15, 18, 19, 18, 21, 22, 21, 24, 28, 34],
  },
  {
    id: "eth-onyx",
    base: ETH,
    quote: fromDiscover("onyx"),
    tvlUsd: 211_000,
    volume24hUsd: 380_000,
    aprPct: 9.4,
    fees24hUsd: 1_140,
    categories: [],
    isLaunchpad: false,
    tvlSeries: [24, 23, 24, 22, 23, 21, 22, 21, 20, 21, 21, 21],
    volumeSeries: [40, 38, 41, 36, 39, 35, 37, 34, 36, 33, 35, 38],
    feesSeries: [12, 11, 12, 10, 11, 10, 11, 9, 10, 9, 10, 11],
  },
  {
    id: "eth-nova",
    base: ETH,
    quote: fromDiscover("nova"),
    tvlUsd: 305_000,
    volume24hUsd: 640_000,
    aprPct: 16.9,
    fees24hUsd: 1_920,
    categories: ["trending"],
    isLaunchpad: false,
    tvlSeries: [22, 23, 22, 24, 26, 25, 27, 29, 28, 30, 31, 31],
    volumeSeries: [36, 40, 38, 44, 48, 46, 52, 56, 54, 58, 62, 64],
    feesSeries: [10, 11, 10, 12, 13, 12, 14, 15, 14, 16, 18, 19],
  },
  {
    id: "king-usdc",
    base: fromDiscover("king"),
    quote: USDC,
    tvlUsd: 94_000,
    volume24hUsd: 526_000,
    aprPct: 58.9,
    fees24hUsd: 1_580,
    categories: ["stable", "highApr"],
    isLaunchpad: false,
    tvlSeries: [8, 8, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9],
    volumeSeries: [16, 18, 20, 22, 24, 26, 28, 30, 34, 40, 46, 53],
    feesSeries: [5, 5, 6, 6, 7, 7, 8, 8, 9, 10, 12, 16],
  },
];

export function poolPairLabel(pool: LiquidityPool): string {
  return `${pool.base.symbol} / ${pool.quote.symbol}`;
}

export function getPoolById(id: string): LiquidityPool | undefined {
  return liquidityPools.find((pool) => pool.id === id);
}

export const poolFilters = ["All", "Stable", "Trending", "New", "High APR"] as const;
export type PoolFilter = (typeof poolFilters)[number];

const filterCategoryMap: Record<Exclude<PoolFilter, "All">, PoolCategory> = {
  Stable: "stable",
  Trending: "trending",
  New: "new",
  "High APR": "highApr",
};

export function filterPools(pools: LiquidityPool[], filter: PoolFilter, query: string): LiquidityPool[] {
  const trimmed = query.trim().toLowerCase();
  let list = pools;
  if (filter !== "All") {
    const category = filterCategoryMap[filter];
    list = list.filter((pool) => pool.categories.includes(category));
  }
  if (trimmed) {
    list = list.filter(
      (pool) =>
        pool.base.symbol.toLowerCase().includes(trimmed) ||
        pool.quote.symbol.toLowerCase().includes(trimmed)
    );
  }
  return list;
}

export type LiquidityPosition = {
  id: string;
  poolId: string;
  valueUsd: number;
  poolSharePct: number;
  feesEarnedUsd24h: number;
  locked?: boolean;
  lockDurationDays?: number;
  lockedUntil?: string;
  boostedAprPct?: number;
};

export const myLiquidityPositions: LiquidityPosition[] = [
  { id: "pos-eth-gumi", poolId: "eth-gumi", valueUsd: 1_284.2, poolSharePct: 0.42, feesEarnedUsd24h: 12.84 },
  { id: "pos-eth-moon", poolId: "eth-moon", valueUsd: 342.5, poolSharePct: 0.18, feesEarnedUsd24h: 3.12 },
];

export type ChartMetric = "tvl" | "volume" | "fees";

export const chartMetrics: { id: ChartMetric; label: string }[] = [
  { id: "tvl", label: "TVL" },
  { id: "volume", label: "Volume" },
  { id: "fees", label: "Fees" },
];

export function getSeriesForMetric(pool: LiquidityPool, metric: ChartMetric): number[] {
  if (metric === "volume") return pool.volumeSeries;
  if (metric === "fees") return pool.feesSeries;
  return pool.tvlSeries;
}
