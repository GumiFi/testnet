import type { DexPair } from "./dex-data";
import type { Accent } from "./discover-data";
import { CONTRACT_ADDRESSES, NETWORK } from "@/config/contracts.config";

export type SwapHistoryItem = {
  id: string;
  txHash: string;
  pairAddress: string;
  fromSymbol: string;
  fromMonogram: string;
  fromAccent: Accent;
  fromTokenContract: string;
  fromAmount: number;
  toSymbol: string;
  toMonogram: string;
  toAccent: Accent;
  toTokenContract: string;
  toAmount: number;
  rate: number;
  networkFeeUsd: number | null;
  blockNumber: number;
  timestampMs: number;
  status: "completed";
  walletAddress: string;
};

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

type RawLog = { address: string; topics: string[]; data: string; blockNumber: string; transactionHash: string; logIndex: string };

const SWAP_TOPIC0 = "0xd78ad95fa46c994b6551d0da85fc275fe613ce37657fb8d5e3d130840159d82";

function addressToTopic(address: string): string {
  return `0x${address.replace(/^0x/, "").toLowerCase().padStart(64, "0")}`;
}

function decodeSwapData(data: string): { amount0In: bigint; amount1In: bigint; amount0Out: bigint; amount1Out: bigint } {
  const clean = data.replace(/^0x/, "");
  return {
    amount0In: BigInt(`0x${clean.slice(0, 64) || "0"}`),
    amount1In: BigInt(`0x${clean.slice(64, 128) || "0"}`),
    amount0Out: BigInt(`0x${clean.slice(128, 192) || "0"}`),
    amount1Out: BigInt(`0x${clean.slice(192, 256) || "0"}`),
  };
}

const blockTimestampCache = new Map<string, number>();

async function getBlockTimestampMs(blockNumberHex: string): Promise<number> {
  const cached = blockTimestampCache.get(blockNumberHex);
  if (cached != null) return cached;
  const block = await rpcRequest<{ timestamp: string } | null>("eth_getBlockByNumber", [blockNumberHex, false]);
  const ms = block ? Number(BigInt(block.timestamp)) * 1000 : Date.now();
  blockTimestampCache.set(blockNumberHex, ms);
  return ms;
}

async function getRealGasFeeUsd(txHash: string, ethUsdRate: number | null): Promise<number | null> {
  if (ethUsdRate == null) return null;
  const receipt = await rpcRequest<{ gasUsed: string; effectiveGasPrice?: string } | null>(
    "eth_getTransactionReceipt",
    [txHash]
  );
  if (!receipt || !receipt.effectiveGasPrice) return null;
  const gasUsed = BigInt(receipt.gasUsed);
  const gasPrice = BigInt(receipt.effectiveGasPrice);
  const feeEth = Number(gasUsed * gasPrice) / 1e18;
  return feeEth * ethUsdRate;
}

function monogramFromSymbol(symbol: string): string {
  const clean = symbol.trim().toUpperCase() || "TK";
  return clean.slice(0, 2).padEnd(2, clean.charAt(0) || "T");
}

const ACCENTS: Accent[] = ["gold", "emerald", "garnet"];
function accentFromAddress(address: string): Accent {
  const index = parseInt(address.slice(-1).toLowerCase(), 16);
  return ACCENTS[Number.isFinite(index) ? index % ACCENTS.length : 0];
}

function buildItem(
  pair: DexPair,
  log: RawLog,
  timestampMs: number,
  networkFeeUsd: number | null,
  wallet: string
): SwapHistoryItem | null {
  const { amount0In, amount1In, amount0Out, amount1Out } = decodeSwapData(log.data);
  const baseIn = pair.baseIsToken0 ? amount0In : amount1In;
  const baseOut = pair.baseIsToken0 ? amount0Out : amount1Out;
  const quoteIn = pair.baseIsToken0 ? amount1In : amount0In;
  const quoteOut = pair.baseIsToken0 ? amount1Out : amount0Out;

  const baseAmountIn = Number(baseIn) / 10 ** pair.baseDecimals;
  const baseAmountOut = Number(baseOut) / 10 ** pair.baseDecimals;
  const quoteAmountIn = Number(quoteIn) / 10 ** pair.quoteDecimals;
  const quoteAmountOut = Number(quoteOut) / 10 ** pair.quoteDecimals;

  let fromSymbol: string, toSymbol: string, fromContract: string, toContract: string, fromAmount: number, toAmount: number;
  if (quoteIn > 0n) {
    fromSymbol = pair.quoteSymbol;
    fromContract = pair.quoteTokenAddress;
    fromAmount = quoteAmountIn;
    toSymbol = pair.symbol;
    toContract = pair.contractAddress;
    toAmount = baseAmountOut;
  } else if (baseIn > 0n) {
    fromSymbol = pair.symbol;
    fromContract = pair.contractAddress;
    fromAmount = baseAmountIn;
    toSymbol = pair.quoteSymbol;
    toContract = pair.quoteTokenAddress;
    toAmount = quoteAmountOut;
  } else {
    return null;
  }

  return {
    id: `${log.transactionHash}-${log.logIndex}`,
    txHash: log.transactionHash,
    pairAddress: pair.pairAddress,
    fromSymbol,
    fromMonogram: monogramFromSymbol(fromSymbol),
    fromAccent: accentFromAddress(fromContract),
    fromTokenContract: fromContract,
    fromAmount,
    toSymbol,
    toMonogram: monogramFromSymbol(toSymbol),
    toAccent: accentFromAddress(toContract),
    toTokenContract: toContract,
    toAmount,
    rate: fromAmount > 0 ? toAmount / fromAmount : 0,
    networkFeeUsd,
    blockNumber: Number(BigInt(log.blockNumber)),
    timestampMs,
    status: "completed",
    walletAddress: wallet,
  };
}

async function getSwapLogsForPair(pairAddress: string, walletTopic: string): Promise<RawLog[]> {
  const params = { address: pairAddress, topics: [SWAP_TOPIC0, null, walletTopic], fromBlock: "0x0", toBlock: "latest" };
  let logs = await rpcRequest<RawLog[]>("eth_getLogs", [params]);
  if (logs === null) {
    const latestHex = await rpcRequest<string>("eth_blockNumber", []);
    const latest = latestHex ? Number(BigInt(latestHex)) : 0;
    const FALLBACK_WINDOW = 100_000;
    const fromBlock = `0x${Math.max(0, latest - FALLBACK_WINDOW).toString(16)}`;
    logs = await rpcRequest<RawLog[]>("eth_getLogs", [{ ...params, fromBlock }]);
  }
  return logs ?? [];
}

export async function fetchWalletSwapHistory(
  wallet: string,
  pairs: DexPair[],
  ethUsdRate: number | null
): Promise<SwapHistoryItem[]> {
  const walletTopic = addressToTopic(wallet);

  const perPairLogs = await Promise.all(
    pairs.map((pair) =>
      getSwapLogsForPair(pair.pairAddress, walletTopic).then((logs) => logs.map((log) => ({ pair, log })))
    )
  );

  const flat = perPairLogs.flat();

  const items = await Promise.all(
    flat.map(async ({ pair, log }) => {
      const [timestampMs, networkFeeUsd] = await Promise.all([
        getBlockTimestampMs(log.blockNumber),
        getRealGasFeeUsd(log.transactionHash, ethUsdRate),
      ]);
      return buildItem(pair, log, timestampMs, networkFeeUsd, wallet);
    })
  );

  return items
    .filter((item): item is SwapHistoryItem => item !== null)
    .sort((a, b) => b.timestampMs - a.timestampMs);
}

export async function fetchSwapByTxHash(
  txHash: string,
  pairs: DexPair[],
  ethUsdRate: number | null
): Promise<SwapHistoryItem | null> {
  const receipt = await rpcRequest<{ logs: RawLog[]; from: string } | null>("eth_getTransactionReceipt", [txHash]);
  if (!receipt) return null;

  const swapLog = receipt.logs.find((log) => log.topics[0]?.toLowerCase() === SWAP_TOPIC0);
  if (!swapLog) return null;

  const pair = pairs.find((candidate) => candidate.pairAddress.toLowerCase() === swapLog.address.toLowerCase());
  if (!pair) return null;

  const [timestampMs, networkFeeUsd] = await Promise.all([
    getBlockTimestampMs(swapLog.blockNumber),
    getRealGasFeeUsd(txHash, ethUsdRate),
  ]);

  return buildItem(pair, swapLog, timestampMs, networkFeeUsd, receipt.from);
}

export async function fetchEthUsdRateForHistory(): Promise<number | null> {
  const raw = await rpcRequest<string>("eth_call", [
    { to: CONTRACT_ADDRESSES.priceOracle, data: "0x679aefce" },
    "latest",
  ]);
  if (!raw || raw === "0x") return null;
  return Number(BigInt(raw)) / 1e18;
}
