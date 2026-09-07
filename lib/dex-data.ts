import type { Accent } from "@/lib/discover-data";

export type DexPair = {
  id: string;
  rank: number;
  symbol: string;
  name: string;
  monogram: string;
  accent: Accent;
  quoteSymbol: string;
  age: string;
  ageMinutes: number;
  priceUsd: number;
  change1h: number;
  change24h: number;
  liquidity: number;
  volume24h: number;
  marketCap: number;
  txns24h: number;
  buys24h: number;
  sells24h: number;
  boost: number | null;
  creator: string;
  isNew: boolean;
  trendScore: number;
  priceEth: number;
  fdv: number;
  change5m: number;
  change6h: number;
  buyVolUsd: number;
  sellVolUsd: number;
  buyers: number;
  sellers: number;
  contractAddress: string;
  pairAddress: string;
  quoteTokenAddress: string;
  baseIsToken0: boolean;
  baseDecimals: number;
  quoteDecimals: number;
  priceHistory: { timestamp: number; priceUsd: number; priceInQuote: number }[];
};

export const PAIRS_PER_PAGE = 20;

export function isGumiHandle(creator: string): boolean {
  return creator.startsWith("@");
}

export const dexPairs: DexPair[] = [];
const dexPairsById = new Map<string, DexPair>();

export function registerLiveDexPairs(pairs: DexPair[]): void {
  for (const pair of pairs) {
    if (dexPairsById.has(pair.id)) {
      dexPairsById.set(pair.id, pair);
      const index = dexPairs.findIndex((existing) => existing.id === pair.id);
      if (index >= 0) dexPairs[index] = pair;
      continue;
    }
    dexPairsById.set(pair.id, pair);
    dexPairs.push(pair);
  }
}

export function getDexPairById(id: string): DexPair | undefined {
  return dexPairsById.get(id.toLowerCase());
}

export function getDexStats(): { volume24h: number; txns24h: number } {
  return dexPairs.reduce(
    (acc, pair) => {
      acc.volume24h += pair.volume24h;
      acc.txns24h += pair.txns24h;
      return acc;
    },
    { volume24h: 0, txns24h: 0 }
  );
}

export const dexMainTabs = ["Trending", "New", "Top"] as const;
export type DexMainTab = (typeof dexMainTabs)[number];

export const dexTimeframes = ["1H", "6H", "24H"] as const;
export type DexTimeframe = (typeof dexTimeframes)[number];

export const dexSortOptions = [
  "Rank",
  "Liquidity",
  "Volume",
  "Market Cap",
  "Age",
  "Txns",
  "Buys",
  "Sells",
] as const;
export type DexSortOption = (typeof dexSortOptions)[number];

export function isDexMainTab(value: string | null): value is DexMainTab {
  return !!value && (dexMainTabs as readonly string[]).includes(value);
}

export function isDexTimeframe(value: string | null): value is DexTimeframe {
  return !!value && (dexTimeframes as readonly string[]).includes(value);
}

export function isDexSortOption(value: string | null): value is DexSortOption {
  return !!value && (dexSortOptions as readonly string[]).includes(value);
}

const timeframeMinutes: Record<DexTimeframe, number> = {
  "1H": 60,
  "6H": 360,
  "24H": 1_440,
};

function applyDexTab(pairs: DexPair[], tab: DexMainTab, timeframe: DexTimeframe): DexPair[] {
  const list = [...pairs];
  switch (tab) {
    case "New":
      return list
        .filter((pair) => pair.ageMinutes <= timeframeMinutes[timeframe])
        .sort((a, b) => a.ageMinutes - b.ageMinutes);
    case "Top":
      return list.sort((a, b) => b.marketCap - a.marketCap);
    default:
      return list.sort((a, b) => b.trendScore - a.trendScore);
  }
}

function applyDexSort(pairs: DexPair[], sort: DexSortOption | null): DexPair[] {
  if (!sort) return pairs;
  const list = [...pairs];
  switch (sort) {
    case "Rank":
      return list.sort((a, b) => a.rank - b.rank);
    case "Liquidity":
      return list.sort((a, b) => b.liquidity - a.liquidity);
    case "Volume":
      return list.sort((a, b) => b.volume24h - a.volume24h);
    case "Market Cap":
      return list.sort((a, b) => b.marketCap - a.marketCap);
    case "Age":
      return list.sort((a, b) => a.ageMinutes - b.ageMinutes);
    case "Txns":
      return list.sort((a, b) => b.txns24h - a.txns24h);
    case "Buys":
      return list.sort((a, b) => b.buys24h - a.buys24h);
    case "Sells":
      return list.sort((a, b) => b.sells24h - a.sells24h);
    default:
      return list;
  }
}

export type DexQueryParams = {
  tab: DexMainTab;
  timeframe: DexTimeframe;
  sort: DexSortOption | null;
  query?: string;
  page: number;
  pageSize?: number;
};

export type DexQueryResult = {
  pairs: DexPair[];
  total: number;
  totalPages: number;
};

export function queryDexPairs({
  tab,
  timeframe,
  sort,
  query = "",
  page,
  pageSize = PAIRS_PER_PAGE,
}: DexQueryParams): DexQueryResult {
  const q = query.trim().toLowerCase();
  let list = dexPairs;
  if (q) {
    list = list.filter(
      (pair) => pair.symbol.toLowerCase().includes(q) || pair.name.toLowerCase().includes(q)
    );
  }

  const tabbed = applyDexTab(list, tab, timeframe);
  const filtered = applyDexSort(tabbed, sort);

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(Math.max(page, 1), totalPages);
  const pairs = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

  return { pairs, total, totalPages };
}

export const dexDetailTimeframes = ["5M", "1H", "6H", "24H"] as const;
export type DexDetailTimeframe = (typeof dexDetailTimeframes)[number];

export function getDexPairChanges(pair: DexPair): Record<DexDetailTimeframe, number> {
  return {
    "5M": pair.change5m,
    "1H": pair.change1h,
    "6H": pair.change6h,
    "24H": pair.change24h,
  };
}

const timeframeSeconds: Record<DexDetailTimeframe, number> = {
  "5M": 5 * 60,
  "1H": 60 * 60,
  "6H": 6 * 60 * 60,
  "24H": 24 * 60 * 60,
};

export function getPairSparkline(pair: DexPair, timeframe: DexDetailTimeframe): number[] {
  const nowSeconds = Math.floor(Date.now() / 1000);
  const windowStart = nowSeconds - timeframeSeconds[timeframe];
  const inWindow = pair.priceHistory.filter((point) => point.timestamp >= windowStart);
  const source = inWindow.length >= 2 ? inWindow : pair.priceHistory;
  const values = source.map((point) => (point.priceUsd || point.priceInQuote));
  if (values.length === 0) return [pair.priceUsd || pair.priceEth || 0, pair.priceUsd || pair.priceEth || 0];
  if (values.length === 1) return [values[0], values[0]];
  return values;
}