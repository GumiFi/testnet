export type Accent = "gold" | "emerald" | "garnet";

export type DiscoverToken = {
  id: string;
  symbol: string;
  name: string;
  monogram: string;
  accent: Accent;
  priceUsd: number;
  change24h: number;
  marketCap: number;
  volume24h: number;
  liquidity: number;
  trendScore: number;
  isNew: boolean;
  sparkline: number[];
  boost: number | null;
};

export type DiscoverLaunch = {
  id: string;
  symbol: string;
  name: string;
  monogram: string;
  accent: Accent;
  creator: string;
  bondingCurvePct: number;
  raisedEth: number;
  targetEth: number;
  marketCap: number;
  boost: number | null;
};

export type FeaturedProject = {
  id: string;
  name: string;
  category: string;
  tagline: string;
  monogram: string;
};

export type NftCollection = {
  id: string;
  name: string;
  monogram: string;
  accent: Accent;
  floorEth: number;
  change24h: number;
  volume24hEth: number;
  owners: number;
  items: number;
  isNew: boolean;
};

export type Pool = {
  id: string;
  pair: string;
  tvlUsd: number;
  volume24hUsd: number;
  aprPct: number;
};

export type Creator = {
  id: string;
  name: string;
  handle: string;
  monogram: string;
  accent: Accent;
  tokensCount: number;
  nftsCount: number;
  volumeUsd: number;
};

export function isGumiHandle(creator: string): boolean {
  return creator.startsWith("@");
}

export const discoverTokens: DiscoverToken[] = [
  {
    id: "gumi",
    symbol: "GUMI",
    name: "Gumi Protocol",
    monogram: "GU",
    accent: "gold",
    priceUsd: 0.0842,
    change24h: 24.8,
    marketCap: 8_420_000,
    volume24h: 1_940_000,
    liquidity: 612_000,
    trendScore: 98,
    isNew: false,
    sparkline: [12, 14, 13, 16, 19, 18, 22, 25, 24, 28, 31, 34],
    boost: 200,
  },
  {
    id: "geum",
    symbol: "GEUM",
    name: "Geum Finance",
    monogram: "GE",
    accent: "emerald",
    priceUsd: 1.24,
    change24h: 18.2,
    marketCap: 5_180_000,
    volume24h: 1_120_000,
    liquidity: 398_000,
    trendScore: 91,
    isNew: false,
    sparkline: [20, 19, 21, 20, 23, 22, 25, 27, 26, 29, 30, 33],
    boost: null,
  },
  {
    id: "king",
    symbol: "KING",
    name: "Kingmaker",
    monogram: "KG",
    accent: "gold",
    priceUsd: 0.00612,
    change24h: 12.7,
    marketCap: 2_940_000,
    volume24h: 804_000,
    liquidity: 211_000,
    trendScore: 85,
    isNew: true,
    sparkline: [8, 9, 8, 10, 9, 11, 12, 11, 13, 14, 13, 15],
    boost: 90,
  },
  {
    id: "onyx",
    symbol: "ONYX",
    name: "Onyx Vaults",
    monogram: "ON",
    accent: "garnet",
    priceUsd: 3.42,
    change24h: -6.4,
    marketCap: 4_260_000,
    volume24h: 542_000,
    liquidity: 305_000,
    trendScore: 74,
    isNew: false,
    sparkline: [30, 29, 31, 28, 27, 26, 27, 25, 24, 23, 22, 21],
    boost: null,
  },
  {
    id: "astra",
    symbol: "ASTRA",
    name: "Astra Labs",
    monogram: "AS",
    accent: "emerald",
    priceUsd: 0.412,
    change24h: 9.1,
    marketCap: 1_860_000,
    volume24h: 388_000,
    liquidity: 142_000,
    trendScore: 68,
    isNew: true,
    sparkline: [10, 11, 10, 12, 13, 12, 14, 15, 14, 16, 17, 18],
    boost: 500,
  },
  {
    id: "velur",
    symbol: "VELUR",
    name: "Velur Network",
    monogram: "VE",
    accent: "gold",
    priceUsd: 0.0731,
    change24h: -2.8,
    marketCap: 962_000,
    volume24h: 214_000,
    liquidity: 88_000,
    trendScore: 55,
    isNew: false,
    sparkline: [14, 15, 14, 13, 14, 13, 12, 13, 12, 11, 12, 11],
    boost: null,
  },
  {
    id: "nova",
    symbol: "NOVA",
    name: "Nova Exchange",
    monogram: "NV",
    accent: "garnet",
    priceUsd: 5.86,
    change24h: 4.3,
    marketCap: 3_320_000,
    volume24h: 2_240_000,
    liquidity: 480_000,
    trendScore: 88,
    isNew: false,
    sparkline: [18, 17, 19, 18, 20, 21, 20, 22, 23, 22, 24, 25],
    boost: 10,
  },
  {
    id: "rune",
    symbol: "RUNE",
    name: "Runeforge",
    monogram: "RU",
    accent: "emerald",
    priceUsd: 0.196,
    change24h: 31.5,
    marketCap: 742_000,
    volume24h: 396_000,
    liquidity: 61_000,
    trendScore: 79,
    isNew: true,
    sparkline: [6, 7, 6, 8, 9, 8, 10, 12, 14, 16, 19, 22],
    boost: 100,
  },
];

export const discoverLaunches: DiscoverLaunch[] = [
  {
    id: "gumi-launch",
    symbol: "GUMI",
    name: "Gumi Protocol",
    monogram: "GU",
    accent: "gold",
    creator: "@astra.gumi",
    bondingCurvePct: 72,
    raisedEth: 72,
    targetEth: 100,
    marketCap: 124_000,
    boost: 100,
  },
  {
    id: "moon-launch",
    symbol: "MOON",
    name: "Moonwell Meme",
    monogram: "MO",
    accent: "emerald",
    creator: "@lunar.gumi",
    bondingCurvePct: 46,
    raisedEth: 46,
    targetEth: 100,
    marketCap: 79_000,
    boost: null,
  },
  {
    id: "drac-launch",
    symbol: "DRAC",
    name: "Dracovault",
    monogram: "DR",
    accent: "garnet",
    creator: "@obsidian.gumi",
    bondingCurvePct: 91,
    raisedEth: 91,
    targetEth: 100,
    marketCap: 168_000,
    boost: 500,
  },
  {
    id: "pxl-launch",
    symbol: "PXL",
    name: "Pixelheart",
    monogram: "PX",
    accent: "gold",
    creator: "0x7c4a9e2f81b6d035e4f9a1c8837062ff9d5b21ae",
    bondingCurvePct: 18,
    raisedEth: 18,
    targetEth: 100,
    marketCap: 31_000,
    boost: 10,
  },
];

export const featuredProjects: FeaturedProject[] = [
  {
    id: "gumi-protocol",
    name: "GUMI Protocol",
    category: "DeFi Infrastructure",
    tagline:
      "The instant-bonding launchpad and buyback-burn engine powering the GUMIFI ecosystem.",
    monogram: "GU",
  },
  {
    id: "onyx-vaults",
    name: "Onyx Vaults",
    category: "Yield & Staking",
    tagline: "Automated $GUMI vault strategies with weekly compounding rewards.",
    monogram: "ON",
  },
];

export const nftCollections: NftCollection[] = [
  {
    id: "gilded-fauna",
    name: "Gilded Fauna",
    monogram: "GF",
    accent: "gold",
    floorEth: 0.84,
    change24h: 14.2,
    volume24hEth: 62.4,
    owners: 1240,
    items: 4444,
    isNew: false,
  },
  {
    id: "obsidian-order",
    name: "Obsidian Order",
    monogram: "OO",
    accent: "garnet",
    floorEth: 2.15,
    change24h: -4.6,
    volume24hEth: 118.7,
    owners: 892,
    items: 3333,
    isNew: false,
  },
  {
    id: "ivory-relics",
    name: "Ivory Relics",
    monogram: "IR",
    accent: "emerald",
    floorEth: 0.31,
    change24h: 8.9,
    volume24hEth: 21.3,
    owners: 2104,
    items: 6666,
    isNew: true,
  },
  {
    id: "crownwork",
    name: "Crownwork",
    monogram: "CW",
    accent: "gold",
    floorEth: 1.42,
    change24h: 22.6,
    volume24hEth: 84.1,
    owners: 654,
    items: 2222,
    isNew: true,
  },
  {
    id: "verdant-seal",
    name: "Verdant Seal",
    monogram: "VS",
    accent: "emerald",
    floorEth: 0.58,
    change24h: -1.2,
    volume24hEth: 33.9,
    owners: 1489,
    items: 5000,
    isNew: false,
  },
  {
    id: "garnet-ledger",
    name: "Garnet Ledger",
    monogram: "GL",
    accent: "garnet",
    floorEth: 3.04,
    change24h: 5.7,
    volume24hEth: 156.2,
    owners: 411,
    items: 1000,
    isNew: false,
  },
];

export const pools: Pool[] = [
  { id: "gumi-eth", pair: "GUMI / ETH", tvlUsd: 245_000, volume24hUsd: 88_400, aprPct: 42.6 },
  { id: "geum-eth", pair: "GEUM / ETH", tvlUsd: 182_000, volume24hUsd: 61_200, aprPct: 31.4 },
  { id: "onyx-eth", pair: "ONYX / ETH", tvlUsd: 156_000, volume24hUsd: 40_800, aprPct: 24.1 },
  { id: "king-eth", pair: "KING / ETH", tvlUsd: 94_000, volume24hUsd: 52_600, aprPct: 58.9 },
  { id: "nova-usdc", pair: "NOVA / USDC", tvlUsd: 121_000, volume24hUsd: 33_900, aprPct: 19.7 },
];

export const creators: Creator[] = [
  {
    id: "astra-eth",
    name: "Astra",
    handle: "@astra.gumi",
    monogram: "AS",
    accent: "gold",
    tokensCount: 6,
    nftsCount: 2,
    volumeUsd: 1_240_000,
  },
  {
    id: "obsidian-eth",
    name: "Obsidian",
    handle: "@obsidian.gumi",
    monogram: "OB",
    accent: "garnet",
    tokensCount: 4,
    nftsCount: 5,
    volumeUsd: 982_000,
  },
  {
    id: "lunar-eth",
    name: "Lunar",
    handle: "@lunar.gumi",
    monogram: "LU",
    accent: "emerald",
    tokensCount: 3,
    nftsCount: 1,
    volumeUsd: 641_000,
  },
  {
    id: "juno-eth",
    name: "Juno",
    handle: "@juno.gumi",
    monogram: "JU",
    accent: "gold",
    tokensCount: 2,
    nftsCount: 4,
    volumeUsd: 398_000,
  },
  {
    id: "vesper-eth",
    name: "Vesper",
    handle: "@vesper.gumi",
    monogram: "VE",
    accent: "emerald",
    tokensCount: 5,
    nftsCount: 0,
    volumeUsd: 312_000,
  },
];
