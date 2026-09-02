import type { Accent } from "./discover-data";

export type PortfolioAsset = {
  id: string;
  symbol: string;
  name: string;
  monogram: string;
  accent: Accent;
  priceUsd: number;
  balance: number;
  change24h: number;
};

export type PortfolioAssetWithValue = PortfolioAsset & { valueUsd: number };

export const portfolioAssets: PortfolioAsset[] = [
  {
    id: "eth",
    symbol: "ETH",
    name: "Ethereum",
    monogram: "ET",
    accent: "gold",
    priceUsd: 4200,
    balance: 1.24,
    change24h: 2.4,
  },
  {
    id: "gumi",
    symbol: "GUMI",
    name: "Gumi Protocol",
    monogram: "GU",
    accent: "gold",
    priceUsd: 0.0842,
    balance: 62_000,
    change24h: 24.8,
  },
  {
    id: "geum",
    symbol: "GEUM",
    name: "Geum Finance",
    monogram: "GE",
    accent: "emerald",
    priceUsd: 1.24,
    balance: 1_050,
    change24h: 18.2,
  },
  {
    id: "king",
    symbol: "KING",
    name: "Kingmaker",
    monogram: "KG",
    accent: "gold",
    priceUsd: 0.00612,
    balance: 145_000,
    change24h: 12.7,
  },
  {
    id: "onyx",
    symbol: "ONYX",
    name: "Onyx Vaults",
    monogram: "ON",
    accent: "garnet",
    priceUsd: 3.42,
    balance: 0.9,
    change24h: -6.4,
  },
];

export const SMALL_BALANCE_THRESHOLD_USD = 5;

export function getAssetsWithValue(): PortfolioAssetWithValue[] {
  return portfolioAssets
    .map((asset) => ({ ...asset, valueUsd: asset.priceUsd * asset.balance }))
    .sort((a, b) => b.valueUsd - a.valueUsd);
}

export function getPortfolioSummary(assets: PortfolioAssetWithValue[]) {
  const totalValueUsd = assets.reduce((sum, asset) => sum + asset.valueUsd, 0);
  const changeUsdToday = assets.reduce(
    (sum, asset) => sum + asset.valueUsd * (asset.change24h / 100),
    0
  );
  const changePctToday = totalValueUsd === 0 ? 0 : (changeUsdToday / totalValueUsd) * 100;

  return { totalValueUsd, changeUsdToday, changePctToday };
}

export const portfolioRanges = ["1D", "1W", "1M", "1Y", "ALL"] as const;
export type PortfolioRange = (typeof portfolioRanges)[number];

export const portfolioChartSeries: Record<PortfolioRange, number[]> = {
  "1D": [
    12180, 12210, 12190, 12305, 12260, 12340, 12290, 12400, 12380, 12450, 12500, 12480, 12530, 12570,
    12550, 12600, 12580, 12621,
  ],
  "1W": [11420, 11680, 11540, 11920, 12080, 11960, 12280, 12140, 12360, 12490, 12410, 12580, 12530, 12621],
  "1M": [
    9840, 10120, 9960, 10380, 10240, 10680, 10520, 10940, 11180, 11020, 11460, 11380, 11720, 11960, 11840,
    12130, 12340, 12621,
  ],
  "1Y": [4820, 5340, 5120, 6280, 6940, 6510, 7830, 8460, 8120, 9370, 10240, 9860, 11080, 12621],
  ALL: [1240, 1860, 1520, 2480, 3140, 2760, 3980, 5210, 4780, 6340, 7860, 7240, 9180, 10620, 9840, 12621],
};

export type LiquidityPosition = {
  id: string;
  pair: string;
  valueUsd: number;
  poolSharePct: number;
  feesEarnedUsd: number;
};

export const liquidityPositions: LiquidityPosition[] = [
  { id: "gumi-eth-lp", pair: "GUMI / ETH", valueUsd: 2482, poolSharePct: 1.82, feesEarnedUsd: 42.18 },
];

export type Launch = {
  id: string;
  symbol: string;
  name: string;
  monogram: string;
  accent: Accent;
  bondingCurvePct: number;
  marketCap: number;
  holders: number;
  graduated: boolean;
};

export const myLaunches: Launch[] = [
  {
    id: "mytoken",
    symbol: "MYTOKEN",
    name: "My Token",
    monogram: "MT",
    accent: "gold",
    bondingCurvePct: 86,
    marketCap: 124_000,
    holders: 428,
    graduated: false,
  },
  {
    id: "xyz",
    symbol: "XYZ",
    name: "XYZ Protocol",
    monogram: "XY",
    accent: "emerald",
    bondingCurvePct: 100,
    marketCap: 342_000,
    holders: 1_204,
    graduated: true,
  },
];

export type NftCategory = "owned" | "created" | "listed";

export type PortfolioNftItem = {
  id: string;
  name: string;
  collection: string;
  monogram: string;
  accent: Accent;
  category: NftCategory;
  priceEth?: number;
};

export const nftPortfolioItems: PortfolioNftItem[] = [
  { id: "gf-1284", name: "Gilded Fauna #1284", collection: "Gilded Fauna", monogram: "GF", accent: "gold", category: "owned" },
  { id: "oo-0092", name: "Obsidian Order #92", collection: "Obsidian Order", monogram: "OO", accent: "garnet", category: "owned" },
  { id: "ir-3310", name: "Ivory Relics #3310", collection: "Ivory Relics", monogram: "IR", accent: "emerald", category: "owned" },
  { id: "cw-0451", name: "Crownwork #451", collection: "Crownwork", monogram: "CW", accent: "gold", category: "created" },
  { id: "cw-0452", name: "Crownwork #452", collection: "Crownwork", monogram: "CW", accent: "gold", category: "created" },
  { id: "gf-0740", name: "Gilded Fauna #740", collection: "Gilded Fauna", monogram: "GF", accent: "gold", category: "listed", priceEth: 0.95 },
];

export type ActivityType = "buy" | "sell" | "liquidity" | "nft" | "launch";

export type ActivityItem = {
  id: string;
  type: ActivityType;
  description: string;
  timeAgo: string;
};

export const recentActivity: ActivityItem[] = [
  { id: "a1", type: "buy", description: "Bought 2,400 GUMI", timeAgo: "12m ago" },
  { id: "a2", type: "liquidity", description: "Added liquidity to GUMI / ETH", timeAgo: "2h ago" },
  { id: "a3", type: "nft", description: "Created NFT collection Crownwork", timeAgo: "1d ago" },
  { id: "a4", type: "launch", description: "Launched $MYTOKEN", timeAgo: "3d ago" },
  { id: "a5", type: "sell", description: "Sold Gilded Fauna #184", timeAgo: "5d ago" },
];
