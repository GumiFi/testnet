import type { EthCaller } from "./nft-onchain";
import { getWethAddress, fetchSymbol, fetchDecimals, nameCalldata } from "./swap-onchain";
import { CONTRACT_ADDRESSES, NETWORK } from "@/config/contracts.config";
import type { Accent } from "./discover-data";
import type { DexPair } from "./dex-data";


async function rpcRequest<T>(method: string, params: unknown[]): Promise<T | null> {
  try {
    const response = await fetch(NETWORK.rpcUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
    });
    if (!response.ok) return null;
    const payload = await response.json();
    if (!payload || payload.error) return null;
    return payload.result as T;
  } catch {
    return null;
  }
}

const ethCall: EthCaller = (to, data) => rpcRequest<string>("eth_call", [{ to, data }, "latest"]);

type RawLog = { address: string; topics: string[]; data: string; blockNumber: string; transactionHash: string };

async function getLogs(params: Record<string, unknown>): Promise<RawLog[] | null> {
  return rpcRequest<RawLog[]>("eth_getLogs", [params]);
}

function toHexBlock(n: number): string {
  return `0x${Math.max(0, Math.floor(n)).toString(16)}`;
}

async function getBlockNumber(): Promise<number> {
  const hex = await rpcRequest<string>("eth_blockNumber", []);
  return hex ? Number(BigInt(hex)) : 0;
}

const blockTimestampCache = new Map<number, number>();

async function getBlockTimestamp(blockNumber: number): Promise<number> {
  const cached = blockTimestampCache.get(blockNumber);
  if (cached != null) return cached;
  const block = await rpcRequest<{ timestamp: string } | null>("eth_getBlockByNumber", [
    toHexBlock(blockNumber),
    false,
  ]);
  const ts = block ? Number(BigInt(block.timestamp)) : 0;
  blockTimestampCache.set(blockNumber, ts);
  return ts;
}

async function getTransactionFrom(txHash: string): Promise<string | null> {
  const tx = await rpcRequest<{ from: string } | null>("eth_getTransactionByHash", [txHash]);
  return tx?.from ?? null;
}


function allPairsLengthCalldata(): string {
  return "0x574f2ba3";
}

function getReservesCalldata(): string {
  return "0x0902f1ac";
}

function getRateCalldata(): string {
  return "0x679aefce";
}

function totalSupplyCalldata(): string {
  return "0x18160ddd";
}

function decodeUint256(hex: string | null): bigint {
  if (!hex || hex === "0x") return 0n;
  return BigInt(hex);
}

function decodeReserves(hex: string | null): { reserve0: bigint; reserve1: bigint } {
  if (!hex || hex.length < 2 + 128) return { reserve0: 0n, reserve1: 0n };
  const clean = hex.replace(/^0x/, "");
  return {
    reserve0: BigInt(`0x${clean.slice(0, 64)}`),
    reserve1: BigInt(`0x${clean.slice(64, 128)}`),
  };
}

function decodeAddressWord(word: string): string {
  const clean = word.replace(/^0x/, "");
  return `0x${clean.slice(-40)}`;
}

function decodeAbiString(hex: string): string {
  const clean = hex.replace(/^0x/, "");
  if (clean.length < 128) return "";
  const length = parseInt(clean.slice(64, 128), 16);
  const dataHex = clean.slice(128, 128 + length * 2);
  const bytes = new Uint8Array(Math.floor(dataHex.length / 2));
  for (let i = 0; i < bytes.length; i += 1) {
    bytes[i] = parseInt(dataHex.slice(i * 2, i * 2 + 2), 16);
  }
  return new TextDecoder().decode(bytes);
}

async function fetchName(address: string): Promise<string | null> {
  const raw = await ethCall(address, nameCalldata());
  if (!raw || raw === "0x") return null;
  const decoded = decodeAbiString(raw);
  return decoded || null;
}

const PAIR_CREATED_TOPIC0 = "0x0d3648bd0f6ba80134a33ba9275ac585d9d315f0ad8355cddefde31afa28d0e";
const SWAP_TOPIC0 = "0xd78ad95fa46c994b6551d0da85fc275fe613ce37657fb8d5e3d130840159d82";
const SYNC_TOPIC0 = "0x1c411e9a96e071241c2f21f7726b17ae89e3cab4c78be50e062b03a9fffbbad";

function decodeSwapData(data: string): {
  amount0In: bigint;
  amount1In: bigint;
  amount0Out: bigint;
  amount1Out: bigint;
} {
  const clean = data.replace(/^0x/, "");
  return {
    amount0In: BigInt(`0x${clean.slice(0, 64) || "0"}`),
    amount1In: BigInt(`0x${clean.slice(64, 128) || "0"}`),
    amount0Out: BigInt(`0x${clean.slice(128, 192) || "0"}`),
    amount1Out: BigInt(`0x${clean.slice(192, 256) || "0"}`),
  };
}

function decodeSyncData(data: string): { reserve0: bigint; reserve1: bigint } {
  const clean = data.replace(/^0x/, "");
  return {
    reserve0: BigInt(`0x${clean.slice(0, 64) || "0"}`),
    reserve1: BigInt(`0x${clean.slice(64, 128) || "0"}`),
  };
}

function toUnits(raw: bigint, decimals: number): number {
  return Number(raw) / 10 ** decimals;
}

function formatAge(seconds: number): string {
  if (seconds < 60) return `${Math.max(1, seconds)}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d`;
  return `${Math.floor(days / 30)}mo`;
}

function monogramFor(symbol: string): string {
  const clean = symbol.trim().toUpperCase() || "TK";
  return clean.slice(0, 2).padEnd(2, clean.charAt(0) || "T");
}

const ACCENTS: Accent[] = ["gold", "emerald", "garnet"];
function accentFor(address: string): Accent {
  const index = parseInt(address.slice(-1).toLowerCase(), 16);
  return ACCENTS[Number.isFinite(index) ? index % ACCENTS.length : 0];
}


type TokenMeta = { symbol: string; name: string; decimals: number; totalSupply: bigint };

async function fetchTokenMeta(cache: Map<string, TokenMeta>, address: string): Promise<TokenMeta> {
  const key = address.toLowerCase();
  const cached = cache.get(key);
  if (cached) return cached;
  const [symbol, name, decimals, totalSupplyRaw] = await Promise.all([
    fetchSymbol(ethCall, address),
    fetchName(address),
    fetchDecimals(ethCall, address, false),
    ethCall(address, totalSupplyCalldata()),
  ]);
  const meta: TokenMeta = {
    symbol: symbol ?? address.slice(2, 6).toUpperCase(),
    name: name ?? symbol ?? "Unknown Token",
    decimals,
    totalSupply: decodeUint256(totalSupplyRaw),
  };
  cache.set(key, meta);
  return meta;
}


type PairCreatedEntry = {
  token0: string;
  token1: string;
  pairAddress: string;
  blockNumber: number;
  transactionHash: string;
};

async function fetchPairCreatedEntries(): Promise<PairCreatedEntry[]> {
  let logs = await getLogs({
    address: CONTRACT_ADDRESSES.gumiFactory,
    fromBlock: "0x0",
    toBlock: "latest",
    topics: [PAIR_CREATED_TOPIC0],
  });

  if (logs === null) {
    const latestBlockNum = await getBlockNumber();
    const FALLBACK_WINDOW = 100_000;
    logs = await getLogs({
      address: CONTRACT_ADDRESSES.gumiFactory,
      fromBlock: toHexBlock(Math.max(0, latestBlockNum - FALLBACK_WINDOW)),
      toBlock: "latest",
      topics: [PAIR_CREATED_TOPIC0],
    });
  }

  if (!logs) return [];

  return logs.map((log) => {
    const clean = log.data.replace(/^0x/, "");
    return {
      token0: decodeAddressWord(log.topics[1]),
      token1: decodeAddressWord(log.topics[2]),
      pairAddress: decodeAddressWord(`0x${clean.slice(0, 64)}`),
      blockNumber: Number(BigInt(log.blockNumber)),
      transactionHash: log.transactionHash,
    };
  });
}

export async function fetchAllDexPairsOnchain(): Promise<DexPair[]> {
  const entries = await fetchPairCreatedEntries();
  if (entries.length === 0) return [];

  const wethAddress = await getWethAddress(ethCall).catch(() => null);
  const latestBlockNum = await getBlockNumber();
  const latestBlockTs = await getBlockTimestamp(latestBlockNum);

  const sampleBack = Math.min(2000, latestBlockNum);
  const refTs = sampleBack > 0 ? await getBlockTimestamp(latestBlockNum - sampleBack) : latestBlockTs;
  const avgBlockTime = sampleBack > 0 && latestBlockTs > refTs ? (latestBlockTs - refTs) / sampleBack : 2;
  const blocksIn24h = Math.max(1, Math.round(86400 / Math.max(avgBlockTime, 0.1)));

  const rateRaw = await ethCall(CONTRACT_ADDRESSES.priceOracle, getRateCalldata());
  const ethUsdRateNum = rateRaw ? toUnits(decodeUint256(rateRaw), 18) : null;

  const tokenMetaCache = new Map<string, TokenMeta>();
  const nowSeconds = Math.floor(Date.now() / 1000);

  const built = await Promise.all(
    entries.map(async (entry) => {
      try {
        const reservesRaw = await ethCall(entry.pairAddress, getReservesCalldata());
        const { reserve0, reserve1 } = decodeReserves(reservesRaw);

        const quoteIsToken0 = !!wethAddress && entry.token0.toLowerCase() === wethAddress.toLowerCase();
        const quoteIsWeth =
          quoteIsToken0 || (!!wethAddress && entry.token1.toLowerCase() === wethAddress.toLowerCase());
        const baseAddress = quoteIsToken0 ? entry.token1 : entry.token0;
        const quoteAddress = quoteIsToken0 ? entry.token0 : entry.token1;
        const reserveBase = quoteIsToken0 ? reserve1 : reserve0;
        const reserveQuote = quoteIsToken0 ? reserve0 : reserve1;

        const [baseMeta, quoteMeta] = await Promise.all([
          fetchTokenMeta(tokenMetaCache, baseAddress),
          fetchTokenMeta(tokenMetaCache, quoteAddress),
        ]);

        const priceInQuote =
          reserveBase > 0n ? toUnits(reserveQuote, quoteMeta.decimals) / toUnits(reserveBase, baseMeta.decimals) : 0;
        const priceUsd = quoteIsWeth && ethUsdRateNum != null ? priceInQuote * ethUsdRateNum : 0;
        const liquidityUsd =
          quoteIsWeth && ethUsdRateNum != null ? 2 * toUnits(reserveQuote, quoteMeta.decimals) * ethUsdRateNum : 0;
        const priceEth = quoteIsWeth ? priceInQuote : 0;
        const fdv = priceUsd * toUnits(baseMeta.totalSupply, baseMeta.decimals);

        const createdAtTimestamp = await getBlockTimestamp(entry.blockNumber);
        const creator = (await getTransactionFrom(entry.transactionHash)) ?? entry.pairAddress;

        const fromBlockForLogs = Math.max(entry.blockNumber, latestBlockNum - blocksIn24h);
        const [swapLogsRaw, syncLogsRaw] = await Promise.all([
          getLogs({
            address: entry.pairAddress,
            fromBlock: toHexBlock(fromBlockForLogs),
            toBlock: "latest",
            topics: [SWAP_TOPIC0],
          }),
          getLogs({
            address: entry.pairAddress,
            fromBlock: toHexBlock(fromBlockForLogs),
            toBlock: "latest",
            topics: [SYNC_TOPIC0],
          }),
        ]);
        const swapLogs = swapLogsRaw ?? [];
        const syncLogs = syncLogsRaw ?? [];

        let buys = 0;
        let sells = 0;
        let buyQuoteRaw = 0n;
        let sellQuoteRaw = 0n;
        const buyers = new Set<string>();
        const sellers = new Set<string>();
        for (const log of swapLogs) {
          const { amount0In, amount1In, amount0Out, amount1Out } = decodeSwapData(log.data);
          const to = log.topics[2] ? decodeAddressWord(log.topics[2]) : null;
          const quoteIn = quoteIsToken0 ? amount0In : amount1In;
          const quoteOut = quoteIsToken0 ? amount0Out : amount1Out;
          if (quoteIn > 0n) {
            buys += 1;
            buyQuoteRaw += quoteIn;
            if (to) buyers.add(to.toLowerCase());
          } else if (quoteOut > 0n) {
            sells += 1;
            sellQuoteRaw += quoteOut;
            if (to) sellers.add(to.toLowerCase());
          }
        }
        const volumeQuoteRaw = buyQuoteRaw + sellQuoteRaw;
        const volume24hUsd =
          quoteIsWeth && ethUsdRateNum != null ? toUnits(volumeQuoteRaw, quoteMeta.decimals) * ethUsdRateNum : 0;
        const buyVolUsd =
          quoteIsWeth && ethUsdRateNum != null ? toUnits(buyQuoteRaw, quoteMeta.decimals) * ethUsdRateNum : 0;
        const sellVolUsd =
          quoteIsWeth && ethUsdRateNum != null ? toUnits(sellQuoteRaw, quoteMeta.decimals) * ethUsdRateNum : 0;

        const sampleStep = Math.max(1, Math.ceil(syncLogs.length / 24));
        const sampledSyncLogs = syncLogs.filter((_, idx) => idx % sampleStep === 0);
        const priceHistory: { timestamp: number; priceUsd: number; priceInQuote: number }[] = [];
        for (const log of sampledSyncLogs) {
          const { reserve0: r0, reserve1: r1 } = decodeSyncData(log.data);
          const rBase = quoteIsToken0 ? r1 : r0;
          const rQuote = quoteIsToken0 ? r0 : r1;
          if (rBase <= 0n) continue;
          const p = toUnits(rQuote, quoteMeta.decimals) / toUnits(rBase, baseMeta.decimals);
          const ts = await getBlockTimestamp(Number(BigInt(log.blockNumber)));
          priceHistory.push({
            timestamp: ts,
            priceInQuote: p,
            priceUsd: quoteIsWeth && ethUsdRateNum != null ? p * ethUsdRateNum : 0,
          });
        }
        priceHistory.sort((a, b) => a.timestamp - b.timestamp);
        priceHistory.push({ timestamp: nowSeconds, priceInQuote, priceUsd });

        function changeSince(minutesAgo: number): number {
          if (priceHistory.length < 2) return 0;
          const cutoff = nowSeconds - minutesAgo * 60;
          let past = priceHistory[0];
          for (const point of priceHistory) {
            if (point.timestamp <= cutoff) past = point;
            else break;
          }
          const basisPast = quoteIsWeth ? past.priceUsd : past.priceInQuote;
          const basisNow = quoteIsWeth ? priceUsd : priceInQuote;
          if (!basisPast) return 0;
          return ((basisNow - basisPast) / basisPast) * 100;
        }

        const ageSeconds = Math.max(0, nowSeconds - createdAtTimestamp);
        const trendScore = Math.max(
          1,
          Math.min(
            100,
            Math.round(50 + changeSince(1440) * 0.3 + (liquidityUsd > 0 ? Math.min(30, (volume24hUsd / liquidityUsd) * 20) : 0))
          )
        );

        const pair: DexPair = {
          id: entry.pairAddress.toLowerCase(),
          rank: 0,
          symbol: baseMeta.symbol,
          name: baseMeta.name,
          monogram: monogramFor(baseMeta.symbol),
          accent: accentFor(entry.pairAddress),
          quoteSymbol: quoteMeta.symbol,
          age: formatAge(ageSeconds),
          ageMinutes: Math.round(ageSeconds / 60),
          priceUsd,
          change1h: changeSince(60),
          change24h: changeSince(1440),
          liquidity: liquidityUsd,
          volume24h: volume24hUsd,
          marketCap: fdv,
          txns24h: buys + sells,
          buys24h: buys,
          sells24h: sells,
          boost: null,
          creator,
          isNew: ageSeconds < 86400,
          trendScore,
          priceEth,
          fdv,
          change5m: changeSince(5),
          change6h: changeSince(360),
          buyVolUsd,
          sellVolUsd,
          buyers: buyers.size,
          sellers: sellers.size,
          contractAddress: baseAddress,
          pairAddress: entry.pairAddress,
          quoteTokenAddress: quoteAddress,
          baseIsToken0: !quoteIsToken0,
          baseDecimals: baseMeta.decimals,
          quoteDecimals: quoteMeta.decimals,
          priceHistory,
        };
        return pair;
      } catch {
        return null;
      }
    })
  );

  const pairs = built.filter((pair): pair is DexPair => pair !== null);
  pairs.sort((a, b) => b.liquidity - a.liquidity);
  pairs.forEach((pair, index) => {
    pair.rank = index + 1;
  });
  return pairs;
}

export async function fetchDexPairCount(): Promise<number> {
  const raw = await ethCall(CONTRACT_ADDRESSES.gumiFactory, allPairsLengthCalldata());
  return Number(decodeUint256(raw));
}
