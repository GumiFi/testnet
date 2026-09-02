import { discoverTokens, pools, type Accent } from "./discover-data";
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
  ...discoverTokens.map((token) => ({
    id: token.id,
    symbol: token.symbol,
    name: token.name,
    monogram: token.monogram,
    accent: token.accent,
    priceUsd: token.priceUsd,
    change24h: token.change24h,
    liquidity: token.liquidity,
    volume24h: token.volume24h,
    marketCap: token.marketCap,
    isBase: false,
  })),
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

export type SwapHistoryStatus = "completed" | "failed";

export type SwapHistoryItem = {
  id: string;
  fromId: string;
  toId: string;
  fromAmount: number;
  toAmount: number;
  rate: number;
  priceImpactPct: number;
  networkFeeUsd: number;
  blockNumber: number;
  timeAgo: string;
  status: SwapHistoryStatus;
  txHash: string;
  walletAddress: string;
  fromTokenContract: string;
  toTokenContract: string;
};

export const SWAP_NETWORK_NAME = "Giwa Testnet";
export const SWAP_HISTORY_WALLET_ADDRESS = "0x8f3aC1b4E9d26F5A7c3B8D1e4F2A9c6B3D7e4F21";
export const SWAP_HISTORY_PAGE_SIZE = 15;
export const TOTAL_SWAP_HISTORY = 64;

function createHistoryRng(seed: number): () => number {
  let state = seed;
  return function random() {
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function randomHex(rng: () => number, length: number): string {
  const chars = "0123456789abcdef";
  let out = "";
  for (let i = 0; i < length; i++) {
    out += chars[Math.floor(rng() * chars.length)];
  }
  return out;
}

const tokenContractCache = new Map<string, string>();

function getTokenContract(tokenId: string): string {
  const cached = tokenContractCache.get(tokenId);
  if (cached) return cached;
  let seed = 0;
  for (let i = 0; i < tokenId.length; i++) {
    seed = (seed * 31 + tokenId.charCodeAt(i)) | 0;
  }
  const rng = createHistoryRng(seed || 1);
  const address = `0x${randomHex(rng, 40)}`;
  tokenContractCache.set(tokenId, address);
  return address;
}

function historyTimeAgo(index: number): string {
  const minuteBuckets = [2, 8, 12, 26, 41];
  const hourBuckets = [1, 2, 3, 5, 9, 14, 20];

  if (index < minuteBuckets.length) {
    return `${minuteBuckets[index]} min ago`;
  }
  const hourIndex = index - minuteBuckets.length;
  if (hourIndex < hourBuckets.length) {
    return `${hourBuckets[hourIndex]} hr ago`;
  }
  const days = hourIndex - hourBuckets.length + 1;
  if (days < 7) {
    return days === 1 ? "1 day ago" : `${days} days ago`;
  }
  const weeks = Math.floor(days / 7);
  return weeks === 1 ? "1 week ago" : `${weeks} weeks ago`;
}

function generateSwapHistory(count: number): SwapHistoryItem[] {
  const rng = createHistoryRng(7331);
  const pairIds = swapTokens.filter((token) => !token.imported).map((token) => token.id);
  const items: SwapHistoryItem[] = [];

  for (let i = 0; i < count; i++) {
    const fromId = pairIds[Math.floor(rng() * pairIds.length)];
    let toId = pairIds[Math.floor(rng() * pairIds.length)];
    if (toId === fromId) {
      toId = pairIds[(pairIds.indexOf(fromId) + 1) % pairIds.length];
    }

    const fromToken = getSwapTokenById(fromId)!;
    const toToken = getSwapTokenById(toId)!;
    const rate = fromToken.priceUsd > 0 && toToken.priceUsd > 0 ? fromToken.priceUsd / toToken.priceUsd : 0;
    const fromAmount = Math.round((0.5 + rng() * 40) * 1000) / 1000;
    const toAmount = Math.round(fromAmount * rate * 10000) / 10000;
    const priceImpactPct = Math.round((0.02 + rng() * 2.4) * 100) / 100;
    const networkFeeUsd = Math.round((0.8 + rng() * 3.2) * 100) / 100;
    const blockNumber = 4_812_000 + Math.floor(rng() * 90_000) + i;
    const status: SwapHistoryStatus = rng() < 0.92 ? "completed" : "failed";

    items.push({
      id: `tx-${i + 1}`,
      fromId,
      toId,
      fromAmount,
      toAmount,
      rate,
      priceImpactPct,
      networkFeeUsd,
      blockNumber,
      timeAgo: historyTimeAgo(i),
      status,
      txHash: `0x${randomHex(rng, 64)}`,
      walletAddress: SWAP_HISTORY_WALLET_ADDRESS,
      fromTokenContract: getTokenContract(fromId),
      toTokenContract: getTokenContract(toId),
    });
  }

  return items;
}

export const swapHistory: SwapHistoryItem[] = generateSwapHistory(TOTAL_SWAP_HISTORY);

export function getRecentSwapHistory(limit: number): SwapHistoryItem[] {
  return swapHistory.slice(0, limit);
}

export function getSwapHistoryById(id: string): SwapHistoryItem | undefined {
  return swapHistory.find((item) => item.id === id);
}

export type SwapHistoryQueryResult = {
  items: SwapHistoryItem[];
  total: number;
  totalPages: number;
};

export function querySwapHistory(
  page: number,
  pageSize: number = SWAP_HISTORY_PAGE_SIZE
): SwapHistoryQueryResult {
  const total = swapHistory.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(Math.max(page, 1), totalPages);
  const items = swapHistory.slice((safePage - 1) * pageSize, safePage * pageSize);
  return { items, total, totalPages };
}

export function getRecentlyUsedTokenIds(): string[] {
  const ids: string[] = [];
  for (const item of swapHistory.slice(0, 6)) {
    if (!ids.includes(item.fromId)) ids.push(item.fromId);
    if (!ids.includes(item.toId)) ids.push(item.toId);
  }
  return ids;
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
