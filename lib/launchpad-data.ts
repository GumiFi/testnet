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
export const TOTAL_COINS = 300;
export const TOKEN_SUPPLY = 1_000_000_000;
export const BONDING_MCAP_TARGET = 100_000;

const prefixes = [
  "Gilded",
  "Obsidian",
  "Velvet",
  "Crimson",
  "Astral",
  "Ivory",
  "Ember",
  "Sable",
  "Marble",
  "Opal",
  "Cobalt",
  "Amber",
  "Jade",
  "Solar",
  "Lunar",
  "Royal",
  "Noble",
  "Sacred",
  "Iron",
  "Silver",
  "Golden",
  "Bronze",
  "Storm",
  "Phantom",
  "Divine",
  "Frost",
  "Crown",
  "Regal",
  "Mystic",
  "Arcane",
];

const suffixes = [
  "Fox",
  "Bull",
  "Wolf",
  "Raven",
  "Falcon",
  "Tiger",
  "Dragon",
  "Phoenix",
  "Lion",
  "Hound",
  "Stag",
  "Bear",
  "Hawk",
  "Panther",
  "Owl",
  "Shark",
  "Crane",
  "Lynx",
  "Griffin",
  "Kraken",
  "Oracle",
  "Templar",
  "Sentinel",
  "Warden",
  "Voyager",
  "Nomad",
  "Herald",
  "Vanguard",
  "Paragon",
  "Sovereign",
];

const creatorWords = [
  "astra",
  "obsidian",
  "lunar",
  "juno",
  "vesper",
  "cipher",
  "raven",
  "echo",
  "zephyr",
  "nyx",
  "orin",
  "talon",
  "vale",
  "rook",
  "sable",
  "ember",
  "frost",
  "onix",
  "brix",
  "kade",
  "soren",
  "lior",
  "wren",
  "atlas",
];

const taglines = [
  "gm gm",
  "wagmi",
  "to the moon",
  "diamond hands only",
  "fresh mint, still warm",
  "community first",
  "no team allocation",
  "liquidity locked forever",
  "born on gumifi",
  "chart looks bullish",
  "early or never",
  "building in silence",
  "the vault opens soon",
  "legends only",
];

const ageBuckets: { label: string; isNew: boolean }[] = [
  { label: "2m", isNew: true },
  { label: "8m", isNew: true },
  { label: "15m", isNew: true },
  { label: "32m", isNew: true },
  { label: "47m", isNew: true },
  { label: "1h", isNew: true },
  { label: "2h", isNew: true },
  { label: "4h", isNew: true },
  { label: "6h", isNew: true },
  { label: "9h", isNew: true },
  { label: "14h", isNew: true },
  { label: "20h", isNew: true },
  { label: "1d", isNew: false },
  { label: "2d", isNew: false },
  { label: "3d", isNew: false },
  { label: "5d", isNew: false },
  { label: "8d", isNew: false },
  { label: "12d", isNew: false },
  { label: "18d", isNew: false },
  { label: "25d", isNew: false },
  { label: "1mo", isNew: false },
  { label: "2mo", isNew: false },
  { label: "3mo", isNew: false },
];

const accentOptions: Accent[] = ["gold", "emerald", "garnet"];

const hexChars = "0123456789abcdef";

function randomHex(rng: () => number, length: number): string {
  let out = "";
  for (let i = 0; i < length; i++) {
    out += hexChars[Math.floor(rng() * hexChars.length)];
  }
  return out;
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

function generateLaunchpadCoins(count: number): LaunchpadCoin[] {
  const rng = createRng(1337);
  const pairCount = prefixes.length * suffixes.length;
  const pairIndices = Array.from({ length: pairCount }, (_, index) => index);

  for (let i = pairIndices.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const temp = pairIndices[i];
    pairIndices[i] = pairIndices[j];
    pairIndices[j] = temp;
  }

  const coins: LaunchpadCoin[] = [];

  for (let i = 0; i < count; i++) {
    const pairIndex = pairIndices[i % pairIndices.length];
    const prefix = prefixes[Math.floor(pairIndex / suffixes.length)];
    const suffix = suffixes[pairIndex % suffixes.length];
    const name = `${prefix} ${suffix}`;
    const symbol = `${prefix.slice(0, 2)}${suffix.slice(0, 2)}`.toUpperCase();
    const monogram = `${prefix[0]}${suffix[0]}`.toUpperCase();
    const accent = accentOptions[Math.floor(rng() * accentOptions.length)];
    const marketCap = Math.round((4_000 + Math.pow(rng(), 3) * 7_500_000) / 100) * 100;
    const change24h = Math.round((rng() * 100 - 35) * 10) / 10;
    const volume24h = Math.round(marketCap * (0.03 + rng() * 0.65));
    const ageIndex = Math.min(ageBuckets.length - 1, Math.floor(Math.pow(rng(), 1.6) * ageBuckets.length));
    const ageBucket = ageBuckets[ageIndex];
    const creator =
      rng() < 0.25
        ? `0x${randomHex(rng, 40)}`
        : `@${creatorWords[Math.floor(rng() * creatorWords.length)]}.gumi`;
    const tagline = rng() < 0.45 ? taglines[Math.floor(rng() * taglines.length)] : undefined;
    const trendScore = Math.round(
      Math.max(1, Math.min(100, 50 + change24h * 0.6 + (volume24h / Math.max(marketCap, 1)) * 25 + rng() * 15))
    );
    const priceUsd = marketCap / TOKEN_SUPPLY;
    const bondingProgress = Math.max(1, Math.min(100, Math.round((marketCap / BONDING_MCAP_TARGET) * 100)));
    const boost = rng() < 0.3 ? [10, 90, 100, 200, 500][Math.floor(rng() * 5)] : null;

    coins.push({
      id: `coin-${i}`,
      symbol,
      name,
      monogram,
      accent,
      marketCap,
      change24h,
      volume24h,
      priceUsd,
      bondingProgress,
      trendScore,
      creator,
      age: ageBucket.label,
      isNew: ageBucket.isNew,
      tagline,
      boost,
      image: null,
      bannerImage: null,
      isLive: false,
    });
  }

  return coins;
}

export const launchpadCoins: LaunchpadCoin[] = generateLaunchpadCoins(TOTAL_COINS);

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

export const trendingLaunchpadCoins: LaunchpadCoin[] = [...launchpadCoins]
  .sort((a, b) => b.trendScore - a.trendScore)
  .slice(0, 10);

const launchpadCoinsById = new Map(launchpadCoins.map((coin) => [coin.id, coin]));

export function registerLiveLaunchpadCoins(coins: LaunchpadCoin[]): void {
  for (const coin of coins) {
    if (launchpadCoinsById.has(coin.id)) continue;
    launchpadCoinsById.set(coin.id, coin);
    launchpadCoins.unshift(coin);
    coinDetailCache.delete(coin.id);
  }
}

export function getTrendingLaunchpadCoins(): LaunchpadCoin[] {
  return [...launchpadCoins].sort((a, b) => b.trendScore - a.trendScore).slice(0, 10);
}

const ETH_USD_PRICE = 3200;

function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) | 0;
  }
  return hash;
}

function randomAddress(rng: () => number): string {
  return `0x${randomHex(rng, 4)}...${randomHex(rng, 4)}`;
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

const descriptionTemplates: ((coin: LaunchpadCoin) => string)[] = [
  (coin) =>
    `${coin.name} is a community-minted coin on the Gumifi Launchpad, built for holders chasing ${
      coin.tagline ?? "the next narrative"
    }. No presale, no team allocation — just a bonding curve and pure momentum.`,
  (coin) =>
    `Born on Gumifi, $${coin.symbol} rides on community energy alone. Liquidity locks automatically once the bonding curve graduates to Gumifi Dex.`,
  (coin) =>
    `Meet ${coin.name}: a high-energy Gumifi Ecosystem coin ready for big reactions, wild posts, and a community-powered spotlight.`,
  (coin) =>
    `$${coin.symbol} launched fair and open on the Gumifi Launchpad. Every buy pushes the bonding curve closer to graduation on Gumifi Dex.`,
  (coin) =>
    `${coin.name} exists for one reason — ${
      coin.tagline ?? "to see how far the chart can run"
    }. Mint transparent, supply fixed, chart wide open.`,
  (coin) =>
    `A fresh mint from the Gumifi forge. $${coin.symbol} has no vesting, no insiders, and no roadmap beyond the next candle.`,
  (coin) =>
    `${coin.name} is fueled entirely by its holders. Comment, vote, and trade — every action shapes where $${coin.symbol} goes next.`,
  (coin) =>
    `Straight off the Gumifi Launchpad: $${coin.symbol}. ${
      coin.tagline ? `"${coin.tagline}"` : "Community first, always."
    } Graduates to Gumifi Dex once fully bonded.`,
];

function buildHolders(rng: () => number, coin: LaunchpadCoin): LaunchpadHolder[] {
  const graduated = coin.bondingProgress >= 100;
  const holderCount = graduated ? 20 + Math.floor(rng() * 110) : 6 + Math.floor(rng() * 40);
  const distributedPct = graduated
    ? 45 + rng() * 45
    : Math.min(48, 3 + coin.bondingProgress * 0.4 + rng() * 6);

  const weights: number[] = [];
  let weightSum = 0;
  for (let i = 0; i < holderCount; i++) {
    const weight = Math.pow(rng(), 1.8);
    weights.push(weight);
    weightSum += weight;
  }

  const holders = weights
    .map((weight) => {
      const pct = Math.max(0.01, Math.round(((weight / weightSum) * distributedPct) * 100) / 100);
      const amountToken = Math.max(1, Math.round((pct / 100) * TOKEN_SUPPLY));
      return {
        rank: 0,
        address: randomAddress(rng),
        isCreator: false,
        pct,
        amountToken,
        valueUsd: amountToken * coin.priceUsd,
      };
    })
    .sort((a, b) => b.pct - a.pct)
    .map((holder, index) => ({
      ...holder,
      rank: index + 1,
      isCreator: index === 0 && rng() < 0.7,
    }));

  return holders;
}

function formatRelativeAge(totalSeconds: number): string {
  if (totalSeconds < 60) return `${Math.max(1, Math.round(totalSeconds))}s ago`;
  const minutes = totalSeconds / 60;
  if (minutes < 60) return `${Math.round(minutes)}m ago`;
  const hours = minutes / 60;
  if (hours < 24) return `${Math.round(hours)}h ago`;
  const days = hours / 24;
  return `${Math.round(days)}d ago`;
}

function buildTrades(rng: () => number, coin: LaunchpadCoin): LaunchpadTrade[] {
  const count = 15 + Math.floor(rng() * 30);
  const trades: LaunchpadTrade[] = [];
  let secondsAgo = 4 + rng() * 20;

  for (let i = 0; i < count; i++) {
    const type: LaunchpadTrade["type"] = rng() < 0.62 ? "Buy" : "Sell";
    const ethAmount = 0.00000005 + Math.pow(rng(), 3) * 0.08;
    const amountToken = Math.max(1, Math.round((ethAmount * ETH_USD_PRICE) / Math.max(coin.priceUsd, 1e-10)));
    const trader = randomAddress(rng);

    trades.push({
      id: `${coin.id}-trade-${i}`,
      trader,
      monogram: trader.slice(2, 4).toUpperCase(),
      accent: accentOptions[Math.floor(rng() * accentOptions.length)],
      type,
      amountEth: ethAmount,
      valueUsd: ethAmount * ETH_USD_PRICE,
      amountToken,
      timeAgo: formatRelativeAge(secondsAgo),
    });

    secondsAgo += 8 + rng() * 45;
  }

  return trades;
}

const coinDetailCache = new Map<string, LaunchpadCoinDetail>();

function buildLaunchpadCoinDetail(coin: LaunchpadCoin): LaunchpadCoinDetail {
  const rng = createRng(hashString(coin.id));

  const isAth = rng() < 0.3;
  const athMarketCap = isAth ? coin.marketCap : Math.round(coin.marketCap * (1 + rng() * 0.55));

  const change5m = Math.round((rng() * 10 - 4) * 100) / 100;
  const change1h = Math.round((rng() * 40 - 15) * 10) / 10;
  const change6h = Math.round((rng() * 80 - 28) * 10) / 10;

  const votesUp = coin.isLive ? 0 : Math.round(4 + rng() * 60);
  const votesDown = coin.isLive ? 0 : Math.round(rng() * votesUp * 0.6);
  const commentCount = coin.isLive ? 0 : rng() < 0.35 ? 0 : Math.round(1 + rng() * 40);
  const contractAddress = coin.isLive ? coin.id : `0x${randomHex(rng, 40)}`;
  const description = coin.isLive
    ? coin.description ?? ""
    : descriptionTemplates[Math.floor(rng() * descriptionTemplates.length)](coin);

  return {
    ...coin,
    athMarketCap: coin.isLive ? coin.marketCap : athMarketCap,
    contractAddress,
    description,
    holders: coin.isLive ? [] : buildHolders(rng, coin),
    trades: coin.isLive ? [] : buildTrades(rng, coin),
    commentCount,
    votesUp,
    votesDown,
    change5m,
    change1h,
    change6h,
  };
}

export function getLaunchpadCoinDetail(id: string): LaunchpadCoinDetail | undefined {
  const cached = coinDetailCache.get(id);
  if (cached) return cached;

  const coin = launchpadCoinsById.get(id);
  if (!coin) return undefined;

  const detail = buildLaunchpadCoinDetail(coin);
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
    const noise = (rng() - 0.5) * swing * 0.5;
    values.push(Math.max(trendValue + noise, end * 0.001));
  }
  values[points - 1] = end;

  return values;
}
