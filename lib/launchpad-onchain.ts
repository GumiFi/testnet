import type { EIP1193Provider } from "./wallet-context";
import type { EthCaller } from "./nft-onchain";

function padHex(value: string, bytes = 32): string {
  return value.replace(/^0x/, "").padStart(bytes * 2, "0");
}

function addressToPadded(address: string): string {
  return padHex(address.toLowerCase());
}

function uintToPadded(value: bigint): string {
  return padHex(value.toString(16));
}

function utf8ToHex(value: string): string {
  const bytes = new TextEncoder().encode(value);
  let hex = "";
  for (let i = 0; i < bytes.length; i += 1) {
    hex += bytes[i].toString(16).padStart(2, "0");
  }
  return hex;
}

function encodeDynamicString(value: string): string {
  const dataHex = utf8ToHex(value);
  const byteLength = dataHex.length / 2;
  const lengthWord = uintToPadded(BigInt(byteLength));
  const paddedLength = Math.ceil(dataHex.length / 64) * 64;
  const dataWord = dataHex.padEnd(paddedLength, "0");
  return lengthWord + dataWord;
}

export function createCoinCalldata(name: string, symbol: string): string {
  const nameEncoded = encodeDynamicString(name);
  const symbolEncoded = encodeDynamicString(symbol);
  const nameOffset = uintToPadded(BigInt(64));
  const nameWordsBytes = nameEncoded.length / 2;
  const symbolOffset = uintToPadded(BigInt(64 + nameWordsBytes));
  return `0x172de6da${nameOffset}${symbolOffset}${nameEncoded}${symbolEncoded}`;
}

export function buyCalldata(token: string, minTokensOut: bigint, to: string): string {
  return `0xdb61c76e${addressToPadded(token)}${uintToPadded(minTokensOut)}${addressToPadded(to)}`;
}

export function sellCalldata(token: string, tokensIn: bigint, minEthOut: bigint, to: string): string {
  return `0x2dc8f867${addressToPadded(token)}${uintToPadded(tokensIn)}${uintToPadded(minEthOut)}${addressToPadded(to)}`;
}

export function isLaunchpadTokenCalldata(token: string): string {
  return `0x47868b32${addressToPadded(token)}`;
}

export function curvesCalldata(token: string): string {
  return `0x2cc3dc6e${addressToPadded(token)}`;
}

export function getPriceUsdCalldata(token: string): string {
  return `0xc4e4109e${addressToPadded(token)}`;
}

export function getMarketCapUsdCalldata(token: string): string {
  return `0xb627e4f0${addressToPadded(token)}`;
}

export function getLiquidityUsdCalldata(token: string): string {
  return `0x9c37f9fb${addressToPadded(token)}`;
}

export function previewBuyCalldata(token: string, ethIn: bigint): string {
  return `0xb5ac48a0${addressToPadded(token)}${uintToPadded(ethIn)}`;
}

export function graduationThresholdUsdCalldata(): string {
  return "0x3d5d5469";
}

export function decodeUint256(hex: string | null): bigint {
  if (!hex || hex === "0x") return 0n;
  return BigInt(hex);
}

export function decodeBool(hex: string | null): boolean {
  return decodeUint256(hex) !== 0n;
}

export type CurveState = {
  virtualEthReserve: bigint;
  virtualTokenReserve: bigint;
  realEthReserve: bigint;
  realTokenReserve: bigint;
  initialized: boolean;
  graduated: boolean;
};

export function decodeCurveState(hex: string | null): CurveState | null {
  if (!hex || hex === "0x") return null;
  const clean = hex.replace(/^0x/, "");
  if (clean.length < 64 * 6) return null;
  const words: string[] = [];
  for (let i = 0; i < 6; i += 1) {
    words.push(clean.slice(i * 64, i * 64 + 64));
  }
  return {
    virtualEthReserve: BigInt(`0x${words[0]}`),
    virtualTokenReserve: BigInt(`0x${words[1]}`),
    realEthReserve: BigInt(`0x${words[2]}`),
    realTokenReserve: BigInt(`0x${words[3]}`),
    initialized: BigInt(`0x${words[4]}`) !== 0n,
    graduated: BigInt(`0x${words[5]}`) !== 0n,
  };
}

export function weiToUsdNumber(value: bigint): number {
  return Number(value) / 1e18;
}

export function parseEtherToWei(value: string): bigint {
  const trimmed = value.trim();
  if (!trimmed) return 0n;
  const [wholePartRaw, fractionPartRaw = ""] = trimmed.split(".");
  const wholePart = wholePartRaw.replace(/[^0-9]/g, "") || "0";
  const fractionPart = fractionPartRaw.replace(/[^0-9]/g, "").slice(0, 18).padEnd(18, "0");
  return BigInt(wholePart) * 10n ** 18n + BigInt(fractionPart || "0");
}

export async function sendLaunchpadTransaction(
  provider: EIP1193Provider,
  from: string,
  to: string,
  data: string,
  valueWei: bigint
): Promise<string> {
  const params: Record<string, string> = { from, to, data };
  if (valueWei > 0n) {
    params.value = `0x${valueWei.toString(16)}`;
  }
  const result = await provider.request({
    method: "eth_sendTransaction",
    params: [params],
  });
  return result as string;
}

export type TransactionLog = {
  address: string;
  topics: string[];
  data: string;
};

export type TransactionReceipt = {
  status: string;
  transactionHash: string;
  blockNumber: string;
  logs: TransactionLog[];
};

export async function waitForTransactionReceipt(
  provider: EIP1193Provider,
  txHash: string,
  timeoutMs = 180000,
  intervalMs = 2500
): Promise<TransactionReceipt | null> {
  const startedAt = Date.now();
  while (Date.now() - startedAt < timeoutMs) {
    const receipt = await provider
      .request({ method: "eth_getTransactionReceipt", params: [txHash] })
      .catch(() => null);
    if (receipt) return receipt as TransactionReceipt;
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }
  return null;
}

export const COIN_CREATED_TOPIC0 =
  "0xf6aa4fbc518b8a449a467b9b6d16c64b038ac738e56f47bb2cb2237932024033";

export function extractCreatedCoinAddress(
  receipt: TransactionReceipt,
  factoryAddress: string
): string | null {
  const factory = factoryAddress.toLowerCase();
  const log = receipt.logs.find(
    (entry) =>
      entry.address.toLowerCase() === factory &&
      entry.topics[0]?.toLowerCase() === COIN_CREATED_TOPIC0
  );
  if (!log || !log.topics[1]) return null;
  return `0x${log.topics[1].slice(-40)}`;
}

export async function readCurveSnapshot(
  call: EthCaller,
  engineAddress: string,
  registryAddress: string,
  token: string
) {
  const [priceRaw, mcapRaw, liquidityRaw, curveRaw, thresholdRaw] = await Promise.all([
    call(engineAddress, getPriceUsdCalldata(token)),
    call(engineAddress, getMarketCapUsdCalldata(token)),
    call(engineAddress, getLiquidityUsdCalldata(token)),
    call(engineAddress, curvesCalldata(token)),
    call(registryAddress, graduationThresholdUsdCalldata()),
  ]);

  const curve = decodeCurveState(curveRaw);
  const priceUsd = weiToUsdNumber(decodeUint256(priceRaw));
  const marketCapUsd = weiToUsdNumber(decodeUint256(mcapRaw));
  const liquidityUsd = weiToUsdNumber(decodeUint256(liquidityRaw));
  const thresholdUsd = weiToUsdNumber(decodeUint256(thresholdRaw));
  const bondingProgress =
    thresholdUsd > 0 ? Math.max(1, Math.min(100, Math.round((liquidityUsd / thresholdUsd) * 100))) : 1;

  return {
    priceUsd,
    marketCapUsd,
    liquidityUsd,
    bondingProgress,
    graduated: curve?.graduated ?? false,
    initialized: curve?.initialized ?? false,
  };
}
