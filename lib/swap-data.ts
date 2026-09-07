import { pools, type Accent } from "./discover-data";
import { portfolioAssets } from "./portfolio-data";

export type SwapToken = {
  id: string;
  symbol: string;
  name: string;
  monogram: string;
  accent: Accent;
  priceUsd: number;
  change24h: number;
  liquidity: number;
  volume24h: number;
  marketCap: number;
  isBase: boolean;
  imported?: boolean;
};

export const swapTokens: SwapToken[] = [
  {
    id: "eth",
    symbol: "ETH",
    name: "Ethereum",
    monogram: "ET",
    accent: "gold",
    priceUsd: 4200,
    change24h: 2.4,
    liquidity: 42_000_000,
    volume24h: 18_400_000,
    marketCap: 504_000_000_000,
    isBase: true,
  },
  {
    id: "usdc",
    symbol: "USDC",
    name: "USD Coin",
    monogram: "US",
    accent: "emerald",
    priceUsd: 1,
    change24h: 0,
    liquidity: 28_000_000,
    volume24h: 9_200_000,
    marketCap: 32_000_000_000,
    isBase: true,
  },
  {
    id: "gumi",
    symbol: "GUMI",
    name: "Gumi",
    monogram: "GU",
    accent: "gold",
    priceUsd: 0.012,
    change24h: 6.1,
    liquidity: 1_400_000,
    volume24h: 620_000,
    marketCap: 12_000_000,
    isBase: false,
  },
  {
    id: "geum",
    symbol: "GEUM",
    name: "Geum",
    monogram: "GE",
    accent: "emerald",
    priceUsd: 0.34,
    change24h: -2.8,
    liquidity: 980_000,
    volume24h: 410_000,
    marketCap: 8_100_000,
    isBase: false,
  },
  {
    id: "nova",
    symbol: "NOVA",
    name: "Nova",
    monogram: "NO",
    accent: "emerald",
    priceUsd: 1.86,
    change24h: 4.4,
    liquidity: 720_000,
    volume24h: 305_000,
    marketCap: 6_400_000,
    isBase: false,
  },
  {
    id: "king",
    symbol: "KING",
    name: "King",
    monogram: "KI",
    accent: "gold",
    priceUsd: 0.0041,
    change24h: 11.2,
    liquidity: 540_000,
    volume24h: 260_000,
    marketCap: 3_900_000,
    isBase: false,
  },
];

export function getSwapTokenById(
  id: string,
  extra: SwapToken[] = []
): SwapToken | undefined {
  return extra.find((token) => token.id === id) ?? swapTokens.find((token) => token.id === id);
}

export function getSwapBalance(tokenId: string): number {
  const asset = portfolioAssets.find((item) => item.id === tokenId);
  return asset ? asset.balance : 0;
}

export const popularTokenIds = ["eth", "usdc", "gumi", "geum", "nova", "king"];

export function getRecentlyUsedTokenIds(): string[] {
  return [];
}
export type SwapRoute = {
  hops: string[];
  via: string[];
};
function findDirectPool(symbolA: string, symbolB: string) {
  return pools.find((pool) => {
    const [a, b] = pool.pair.split(" / ");
    return (a === symbolA && b === symbolB) || (a === symbolB && b === symbolA);
  });
}
export function getSwapRoute(pay: SwapToken, receive: SwapToken): SwapRoute {
  if (pay.id === receive.id) {
    return { hops: [pay.id], via: [] };
  }
  if (pay.id === "eth" || receive.id === "eth") {
    const other = pay.id === "eth" ? receive : pay;
    return { hops: [pay.id, receive.id], via: [`${other.symbol}/ETH`] };
  }
  const direct = findDirectPool(pay.symbol, receive.symbol);
  if (direct) {
    return { hops: [pay.id, receive.id], via: [direct.pair.split(" / ").join("/")] };
  }
  return {
    hops: [pay.id, "eth", receive.id],
    via: [`${pay.symbol}/ETH`, `ETH/${receive.symbol}`],
  };
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
export type SwapQuote = {
  receiveAmount: number;
  priceImpactPct: number;
  minimumReceived: number;
  networkFeeUsd: number;
  rate: number;
  unknownPrice: boolean;
};
export function computeSwapQuote(
  payToken: SwapToken,
  receiveToken: SwapToken,
  payAmount: number,
  slippagePct: number,
  route: SwapRoute
): SwapQuote {
  const empty: SwapQuote = {
    receiveAmount: 0,
    priceImpactPct: 0,
    minimumReceived: 0,
    networkFeeUsd: 0,
    rate: 0,
    unknownPrice: false,
  };
  if (!payAmount || payAmount <= 0 || payToken.id === receiveToken.id) {
    return empty;
  }
  if (payToken.priceUsd <= 0 || receiveToken.priceUsd <= 0) {
    return { ...empty, unknownPrice: true };
  }
  const payValueUsd = payAmount * payToken.priceUsd;
  const referenceLiquidity = Math.max(
    1,
    Math.min(payToken.liquidity || Infinity, receiveToken.liquidity || Infinity)
  );
  const hopExtra = route.hops.length > 2 ? 0.08 : 0;
  const priceImpactPct = clamp((payValueUsd / referenceLiquidity) * 45 + hopExtra, 0.01, 15);
  const rate = payToken.priceUsd / receiveToken.priceUsd;
  const grossReceiveAmount = payAmount * rate;
  const receiveAmount = grossReceiveAmount * (1 - priceImpactPct / 100);
  const minimumReceived = receiveAmount * (1 - slippagePct / 100);
  const networkFeeUsd = 1.85 + (route.hops.length - 1) * 1.1;

  return { receiveAmount, priceImpactPct, minimumReceived, networkFeeUsd, rate, unknownPrice: false };
}
export function isContractAddress(value: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(value.trim());
}
export function createImportedToken(address: string): SwapToken {
  const clean = address.trim();
  return {
    id: `custom-${clean.toLowerCase()}`,
    symbol: clean.slice(2, 6).toUpperCase(),
    name: `Imported Token (${clean.slice(0, 6)}...${clean.slice(-4)})`,
    monogram: clean.slice(2, 4).toUpperCase(),
    accent: "gold",
    priceUsd: 0,
    change24h: 0,
    liquidity: 0,
    volume24h: 0,
    marketCap: 0,
    isBase: false,
    imported: true,
  };
}