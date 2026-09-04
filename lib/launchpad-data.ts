import type { Accent } from "@/lib/discover-data";

export type LaunchpadCoin = {
  id: string;
  symbol: string;
  name: string;
  monogram: string;
  accent: Accent;
  marketCap: number;
  change24h: number;
  volume24h: number;
  priceUsd: number;
  bondingProgress: number;
  trendScore: number;
  creator: string;
  age: string;
  isNew: boolean;
  tagline?: string;
  boost: number | null;
  image?: string | null;
  bannerImage?: string | null;
  description?: string;
  isLive?: boolean;
};

export const COINS_PER_PAGE = 24;
export const TOTAL_COINS = 2_400;
export const TOKEN_SUPPLY = 1_000_000_000;
export const BONDING_MCAP_TARGET = 100_000;

export const launchpadCoins: LaunchpadCoin[] = [];

export const launchpadExploreFilters = ["Trending", "Movers", "Mayhem", "New"] as const;
export type LaunchpadExploreFilter = (typeof launchpadExploreFilters)[number];

export function isLaunchpadExploreFilter(value: string | null): value is LaunchpadExploreFilter {
  return !!value && (launchpadExploreFilters as readonly string[]).includes(value);
}

function sortLaunchpadCoins(coins: LaunchpadCoin[], filter: LaunchpadExploreFilter): LaunchpadCoin[] {
  const list = [...coins];
  switch (filter) {
    case "Movers":
      return list.sort((a, b) => b.change24h - a.change24h);
    case "Mayhem":
      return list.sort((a, b) => b.volume24h - a.volume24h);
    case "New":
      return list.filter((coin) => coin.isNew).sort((a, b) => b.trendScore - a.trendScore);
    default:
      return list.sort((a, b) => b.trendScore - a.trendScore);
  }
}

export const MCAP_FILTER_MIN = 0;
export const MCAP_FILTER_MAX = 8_000_000;
export const VOLUME_FILTER_MIN = 0;
export const VOLUME_FILTER_MAX = 2_000_000;

export type LaunchpadQueryParams = {
  filter: LaunchpadExploreFilter;
  query?: string;
  page: number;
  pageSize?: number;
  mcapMin?: number;
  mcapMax?: number;
  volMin?: number;
  volMax?: number;
};

export type LaunchpadQueryResult = {
  coins: LaunchpadCoin[];
  total: number;
  totalPages: number;
};

export function queryLaunchpadCoins({
  filter,
  query = "",
  page,
  pageSize = COINS_PER_PAGE,
  mcapMin = MCAP_FILTER_MIN,
  mcapMax = MCAP_FILTER_MAX,
  volMin = VOLUME_FILTER_MIN,
  volMax = VOLUME_FILTER_MAX,
}: LaunchpadQueryParams): LaunchpadQueryResult {
  const q = query.trim().toLowerCase();
  const sorted = sortLaunchpadCoins(launchpadCoins, filter);
  let filtered = q
    ? sorted.filter((coin) => coin.name.toLowerCase().includes(q) || coin.symbol.toLowerCase().includes(q))
    : sorted;

  filtered = filtered.filter((coin) => {
    const withinMcap = coin.marketCap >= mcapMin && (mcapMax >= MCAP_FILTER_MAX || coin.marketCap <= mcapMax);
    const withinVol = coin.volume24h >= volMin && (volMax >= VOLUME_FILTER_MAX || coin.volume24h <= volMax);
    return withinMcap && withinVol;
  });

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(Math.max(page, 1), totalPages);
  const coins = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

  return { coins, total, totalPages };
}

const launchpadCoinsById = new Map<string, LaunchpadCoin>();

export function registerLiveLaunchpadCoins(coins: LaunchpadCoin[]): void {
  for (const coin of coins) {
    if (launchpadCoinsById.has(coin.id)) {
      launchpadCoinsById.set(coin.id, coin);
      const index = launchpadCoins.findIndex((existing) => existing.id === coin.id);
      if (index >= 0) launchpadCoins[index] = coin;
      coinDetailCache.delete(coin.id);
      continue;
    }
    launchpadCoinsById.set(coin.id, coin);
    launchpadCoins.unshift(coin);
    coinDetailCache.delete(coin.id);
  }
}

export function getTrendingLaunchpadCoins(): LaunchpadCoin[] {
  return [...launchpadCoins].sort((a, b) => b.trendScore - a.trendScore).slice(0, 10);
}

export function isGumiHandle(creator: string): boolean {
  return creator.startsWith("@");
}

export type LaunchpadTrade = {
  id: string;
  trader: string;
  monogram: string;
  accent: Accent;
  type: "Buy" | "Sell";
  amountEth: number;
  valueUsd: number;
  amountToken: number;
  timeAgo: string;
};

export type LaunchpadHolder = {
  rank: number;
  address: string;
  isCreator: boolean;
  pct: number;
  amountToken: number;
  valueUsd: number;
};

export type LaunchpadCoinDetail = LaunchpadCoin & {
  athMarketCap: number;
  contractAddress: string;
  description: string;
  holders: LaunchpadHolder[];
  trades: LaunchpadTrade[];
  commentCount: number;
  votesUp: number;
  votesDown: number;
  change5m: number;
  change1h: number;
  change6h: number;
};

const coinDetailCache = new Map<string, LaunchpadCoinDetail>();

function buildLaunchpadCoinDetail(coin: LaunchpadCoin): LaunchpadCoinDetail {
  return {
    ...coin,
    athMarketCap: coin.marketCap,
    contractAddress: coin.id,
    description: coin.description ?? "",
    holders: [],
    trades: [],
    commentCount: 0,
    votesUp: 0,
    votesDown: 0,
    change5m: 0,
    change1h: 0,
    change6h: 0,
  };
}

export function getLaunchpadCoinDetail(id: string, coin?: LaunchpadCoin): LaunchpadCoinDetail | undefined {
  if (coin) {
    registerLiveLaunchpadCoins([coin]);
  }

  const cached = coinDetailCache.get(id);
  if (cached) return cached;

  const source = launchpadCoinsById.get(id);
  if (!source) return undefined;

  const detail = buildLaunchpadCoinDetail(source);
  coinDetailCache.set(id, detail);
  return detail;
}

export const launchpadDetailTimeframes = ["5M", "1H", "6H", "24H"] as const;
export type LaunchpadDetailTimeframe = (typeof launchpadDetailTimeframes)[number];

export function getLaunchpadCoinChanges(
  detail: LaunchpadCoinDetail
): Record<LaunchpadDetailTimeframe, number> {
  return {
    "5M": detail.change5m,
    "1H": detail.change1h,
    "6H": detail.change6h,
    "24H": detail.change24h,
  };
}

function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) | 0;
  }
  return hash;
}

function createRng(seed: number): () => number {
  let state = seed;
  return function random() {
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function getLaunchpadCoinSparkline(
  detail: LaunchpadCoinDetail,
  timeframe: LaunchpadDetailTimeframe
): number[] {
  const points = 24;
  const rng = createRng(hashString(`${detail.id}-${timeframe}`));
  const trendPct = getLaunchpadCoinChanges(detail)[timeframe];
  const end = detail.priceUsd;
  const start = end / (1 + trendPct / 100);
  const swing = Math.max(Math.abs(end - start), end * 0.04);

  const values: number[] = [];
  for (let index = 0; index < points; index++) {
    const progress = index / (points - 1);
    const trendValue = start + (end - start) * progress;
    const noise = trendPct === 0 ? 0 : (rng() - 0.5) * swing * 0.5;
    values.push(Math.max(trendValue + noise, end * 0.001));
  }
  values[points - 1] = end;

  return values;
}
