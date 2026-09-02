import type { Accent } from "@/lib/discover-data";

export type DexCategoryId = "regalia" | "beasts" | "artifacts" | "elementals" | "spirits";

export type DexPair = {
  id: string;
  rank: number;
  symbol: string;
  name: string;
  monogram: string;
  accent: Accent;
  category: DexCategoryId;
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
};

export const ETH_USD_PRICE = 3200;

export const PAIRS_PER_PAGE = 20;
export const TOTAL_PAIRS = 240;

export const dexCategories: { id: DexCategoryId; label: string }[] = [
  { id: "regalia", label: "Regalia" },
  { id: "beasts", label: "Beasts" },
  { id: "artifacts", label: "Artifacts" },
  { id: "elementals", label: "Elementals" },
  { id: "spirits", label: "Spirits" },
];

const prefixes = [
  "Gilt",
  "Onyx",
  "Ember",
  "Sable",
  "Marble",
  "Opal",
  "Cobalt",
  "Amber",
  "Jade",
  "Solar",
  "Lunar",
  "Regal",
  "Mystic",
  "Arcane",
  "Velvet",
  "Crimson",
  "Astral",
  "Frost",
  "Storm",
  "Phantom",
  "Divine",
  "Iron",
  "Bronzed",
  "Hollow",
];

const suffixes = [
  "Wyrm",
  "Stag",
  "Kraken",
  "Griffin",
  "Warden",
  "Templar",
  "Oracle",
  "Sentinel",
  "Reliquary",
  "Sigil",
  "Ember",
  "Crest",
  "Throne",
  "Tide",
  "Ashes",
  "Fang",
  "Halo",
  "Vow",
  "Cinder",
  "Rune",
  "Shard",
  "Bloom",
  "Wisp",
  "Cairn",
];

const accentOptions: Accent[] = ["gold", "emerald", "garnet"];

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

const ageBuckets: { label: string; minutes: number; isNew: boolean }[] = [
  { label: "6m", minutes: 6, isNew: true },
  { label: "24m", minutes: 24, isNew: true },
  { label: "48m", minutes: 48, isNew: true },
  { label: "1h", minutes: 60, isNew: true },
  { label: "2h", minutes: 120, isNew: true },
  { label: "3h", minutes: 180, isNew: true },
  { label: "6h", minutes: 360, isNew: true },
  { label: "9h", minutes: 540, isNew: true },
  { label: "12h", minutes: 720, isNew: false },
  { label: "19h", minutes: 1_140, isNew: false },
  { label: "22h", minutes: 1_320, isNew: false },
  { label: "1d", minutes: 1_440, isNew: false },
  { label: "2d", minutes: 2_880, isNew: false },
  { label: "5d", minutes: 7_200, isNew: false },
  { label: "13d", minutes: 18_720, isNew: false },
  { label: "1mo", minutes: 43_200, isNew: false },
];

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

const hexChars = "0123456789abcdef";

function randomHex(rng: () => number, length: number): string {
  let out = "";
  for (let i = 0; i < length; i++) {
    out += hexChars[Math.floor(rng() * hexChars.length)];
  }
  return out;
}

export function isGumiHandle(creator: string): boolean {
  return creator.startsWith("@");
}

function generatePairs(count: number): DexPair[] {
  const rng = createRng(4242);
  const pairSlots = prefixes.length * suffixes.length;
  const order = Array.from({ length: pairSlots }, (_, index) => index);

  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const temp = order[i];
    order[i] = order[j];
    order[j] = temp;
  }

  const pairs: DexPair[] = [];

  for (let i = 0; i < count; i++) {
    const slot = order[i % order.length];
    const prefix = prefixes[Math.floor(slot / suffixes.length)];
    const suffix = suffixes[slot % suffixes.length];
    const name = `${prefix} ${suffix}`;
    const symbol = `${prefix.slice(0, 2)}${suffix.slice(0, 2)}`.toUpperCase();
    const monogram = `${prefix[0]}${suffix[0]}`.toUpperCase();
    const accent = accentOptions[Math.floor(rng() * accentOptions.length)];
    const category = dexCategories[Math.floor(rng() * dexCategories.length)].id;

    const ageIndex = Math.min(ageBuckets.length - 1, Math.floor(Math.pow(rng(), 1.5) * ageBuckets.length));
    const ageBucket = ageBuckets[ageIndex];

    const magnitude = Math.pow(rng(), 4.2);
    const priceUsd = 0.0000008 + magnitude * 0.35;

    const change1h = Math.round((rng() * 60 - 22) * 10) / 10;
    const change24h = Math.round((rng() * 160 - 45) * 10) / 10;

    const liquidity = Math.round((800 + Math.pow(rng(), 2.5) * 260_000) / 100) * 100;
    const volume24h = Math.round(liquidity * (0.4 + rng() * 9));
    const marketCap = Math.round(liquidity * (2 + rng() * 60));

    const buys24h = Math.round(30 + rng() * 4_200);
    const sells24h = Math.round(20 + rng() * 3_800);
    const txns24h = buys24h + sells24h;

    const boost = rng() < 0.3 ? [10, 90, 100, 200, 500][Math.floor(rng() * 5)] : null;
    const creator =
      rng() < 0.25
        ? `0x${randomHex(rng, 40)}`
        : `@${creatorWords[Math.floor(rng() * creatorWords.length)]}.gumi`;

    const trendScore = Math.round(
      Math.max(1, Math.min(100, 50 + change24h * 0.4 + (volume24h / Math.max(liquidity, 1)) * 4 + rng() * 12))
    );

    const detailRng = createRng(90_000 + i * 17);
    const priceEth = priceUsd / ETH_USD_PRICE;
    const fdv = Math.round(marketCap * (1 + detailRng() * 0.12));
    const change5m = Math.round((detailRng() * 8 - 3) * 100) / 100;
    const change6h = Math.round((detailRng() * 90 - 32) * 10) / 10;
    const buyShare = 0.4 + detailRng() * 0.2;
    const buyVolUsd = Math.round(volume24h * buyShare);
    const sellVolUsd = Math.max(0, volume24h - buyVolUsd);
    const buyers = Math.max(1, Math.round(buys24h * (0.55 + detailRng() * 0.2)));
    const sellers = Math.max(1, Math.round(sells24h * (0.55 + detailRng() * 0.2)));
    const contractAddress = `0x${randomHex(detailRng, 40)}`;
    const pairAddress = `0x${randomHex(detailRng, 40)}`;

    pairs.push({
      id: `pair-${i}`,
      rank: i + 1,
      symbol,
      name,
      monogram,
      accent,
      category,
      age: ageBucket.label,
      ageMinutes: ageBucket.minutes,
      priceUsd,
      change1h,
      change24h,
      liquidity,
      volume24h,
      marketCap,
      txns24h,
      buys24h,
      sells24h,
      boost,
      creator,
      isNew: ageBucket.isNew,
      trendScore,
      priceEth,
      fdv,
      change5m,
      change6h,
      buyVolUsd,
      sellVolUsd,
      buyers,
      sellers,
      contractAddress,
      pairAddress,
    });
  }

  return pairs;
}

export const dexPairs: DexPair[] = generatePairs(TOTAL_PAIRS);

export const dexCategoryTotals: Record<DexCategoryId, number> = dexPairs.reduce(
  (totals, pair) => {
    totals[pair.category] += pair.marketCap;
    return totals;
  },
  { regalia: 0, beasts: 0, artifacts: 0, elementals: 0, spirits: 0 } as Record<DexCategoryId, number>
);

export const dexStats = dexPairs.reduce(
  (acc, pair) => {
    acc.volume24h += pair.volume24h;
    acc.txns24h += pair.txns24h;
    return acc;
  },
  { volume24h: 0, txns24h: 0 }
);

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

const dexPairsById = new Map(dexPairs.map((pair) => [pair.id, pair]));

export function getDexPairById(id: string): DexPair | undefined {
  return dexPairsById.get(id);
}

export function getDexCategoryLabel(category: DexCategoryId): string {
  return dexCategories.find((entry) => entry.id === category)?.label ?? category;
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

function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) | 0;
  }
  return hash;
}

export function getPairSparkline(pair: DexPair, timeframe: DexDetailTimeframe): number[] {
  const points = 24;
  const rng = createRng(hashString(`${pair.id}-${timeframe}`));
  const trendPct = getDexPairChanges(pair)[timeframe];
  const end = pair.priceUsd;
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
