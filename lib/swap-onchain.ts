import type { EIP1193Provider } from "./wallet-context";
import type { EthCaller } from "./nft-onchain";
import { isContractAddress, type SwapToken } from "./swap-data";
import { CONTRACT_ADDRESSES } from "@/config/contracts.config";

export const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

function padHex(value: string, bytes = 32): string {
  return value.replace(/^0x/, "").padStart(bytes * 2, "0");
}

function addressToPadded(address: string): string {
  return padHex(address.toLowerCase());
}

function uintToPadded(value: bigint): string {
  return padHex(value.toString(16));
}

function decodeAddressWord(hex: string): string {
  return `0x${hex.slice(-40)}`;
}

export function decodeUint256(hex: string | null): bigint {
  if (!hex || hex === "0x") return 0n;
  return BigInt(hex);
}

export function decodeAddress(hex: string | null): string | null {
  if (!hex || hex === "0x") return null;
  const clean = hex.replace(/^0x/, "");
  if (clean.length < 64) return null;
  return decodeAddressWord(clean.slice(0, 64));
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

export function balanceOfCalldata(owner: string): string {
  return `0x70a08231${addressToPadded(owner)}`;
}

export function decimalsCalldata(): string {
  return "0x313ce567";
}

export function symbolCalldata(): string {
  return "0x95d89b41";
}

export function nameCalldata(): string {
  return "0x06fdde03";
}

export function allowanceCalldata(owner: string, spender: string): string {
  return `0xdd62ed3e${addressToPadded(owner)}${addressToPadded(spender)}`;
}

export function approveCalldata(spender: string, amount: bigint): string {
  return `0x095ea7b3${addressToPadded(spender)}${uintToPadded(amount)}`;
}

export async function fetchDecimals(call: EthCaller, tokenAddress: string, isNative: boolean): Promise<number> {
  if (isNative) return 18;
  const raw = await call(tokenAddress, decimalsCalldata());
  if (!raw || raw === "0x") return 18;
  try {
    return Number(BigInt(raw));
  } catch {
    return 18;
  }
}

export async function fetchSymbol(call: EthCaller, tokenAddress: string): Promise<string | null> {
  const raw = await call(tokenAddress, symbolCalldata());
  if (!raw || raw === "0x") return null;
  const decoded = decodeAbiString(raw);
  return decoded || null;
}

export async function fetchAllowance(
  call: EthCaller,
  tokenAddress: string,
  owner: string,
  spender: string
): Promise<bigint> {
  const raw = await call(tokenAddress, allowanceCalldata(owner, spender));
  return decodeUint256(raw);
}

export function wethCalldata(): string {
  return "0x3fc8cef3";
}

function encodePathTail(path: string[]): string {
  const length = uintToPadded(BigInt(path.length));
  const addresses = path.map((address) => addressToPadded(address)).join("");
  return `${length}${addresses}`;
}

export function getAmountsOutCalldata(amountIn: bigint, path: string[]): string {
  const offset = uintToPadded(64n);
  return `0xd06ca61f${uintToPadded(amountIn)}${offset}${encodePathTail(path)}`;
}

export function swapExactTokensForTokensCalldata(
  amountIn: bigint,
  amountOutMin: bigint,
  path: string[],
  to: string,
  deadline: bigint
): string {
  const offset = uintToPadded(160n);
  return `0x38ed1739${uintToPadded(amountIn)}${uintToPadded(amountOutMin)}${offset}${addressToPadded(to)}${uintToPadded(deadline)}${encodePathTail(path)}`;
}

export function swapExactETHForTokensCalldata(
  amountOutMin: bigint,
  path: string[],
  to: string,
  deadline: bigint
): string {
  const offset = uintToPadded(128n);
  return `0x7ff36ab5${uintToPadded(amountOutMin)}${offset}${addressToPadded(to)}${uintToPadded(deadline)}${encodePathTail(path)}`;
}

export function swapExactTokensForETHCalldata(
  amountIn: bigint,
  amountOutMin: bigint,
  path: string[],
  to: string,
  deadline: bigint
): string {
  const offset = uintToPadded(160n);
  return `0x18cbafe5${uintToPadded(amountIn)}${uintToPadded(amountOutMin)}${offset}${addressToPadded(to)}${uintToPadded(deadline)}${encodePathTail(path)}`;
}

export function decodeAmountsOut(hex: string | null): bigint[] | null {
  if (!hex || hex === "0x") return null;
  const clean = hex.replace(/^0x/, "");
  if (clean.length < 128) return null;
  const length = Number(BigInt(`0x${clean.slice(64, 128)}`));
  const amounts: bigint[] = [];
  for (let i = 0; i < length; i += 1) {
    const start = 128 + i * 64;
    const word = clean.slice(start, start + 64);
    if (word.length < 64) return null;
    amounts.push(BigInt(`0x${word}`));
  }
  return amounts;
}

let cachedWethAddress: string | null = null;

export async function getWethAddress(call: EthCaller): Promise<string | null> {
  if (cachedWethAddress) return cachedWethAddress;
  const raw = await call(CONTRACT_ADDRESSES.gumiRouter, wethCalldata());
  const address = decodeAddress(raw);
  if (address) cachedWethAddress = address;
  return address;
}

export async function getAmountsOutOnchain(
  call: EthCaller,
  amountIn: bigint,
  path: string[]
): Promise<bigint[] | null> {
  if (amountIn <= 0n || path.length < 2) return null;
  const raw = await call(CONTRACT_ADDRESSES.gumiRouter, getAmountsOutCalldata(amountIn, path));
  return decodeAmountsOut(raw);
}

export function getPairCalldata(tokenA: string, tokenB: string): string {
  return `0xe6a43905${addressToPadded(tokenA)}${addressToPadded(tokenB)}`;
}

export function getReservesCalldata(): string {
  return "0x0902f1ac";
}

function decodeReserves(hex: string | null): { reserve0: bigint; reserve1: bigint } | null {
  if (!hex || hex === "0x") return null;
  const clean = hex.replace(/^0x/, "");
  if (clean.length < 128) return null;
  return {
    reserve0: BigInt(`0x${clean.slice(0, 64)}`),
    reserve1: BigInt(`0x${clean.slice(64, 128)}`),
  };
}

export async function fetchSpotRate(
  call: EthCaller,
  tokenInAddress: string,
  tokenOutAddress: string,
  tokenInDecimals: number,
  tokenOutDecimals: number
): Promise<number | null> {
  const pairRaw = await call(CONTRACT_ADDRESSES.gumiFactory, getPairCalldata(tokenInAddress, tokenOutAddress));
  const pairAddress = decodeAddress(pairRaw);
  if (!pairAddress || pairAddress.toLowerCase() === ZERO_ADDRESS) return null;

  const reservesRaw = await call(pairAddress, getReservesCalldata());
  const reserves = decodeReserves(reservesRaw);
  if (!reserves) return null;

  const token0IsIn = tokenInAddress.toLowerCase() < tokenOutAddress.toLowerCase();
  const reserveInRaw = token0IsIn ? reserves.reserve0 : reserves.reserve1;
  const reserveOutRaw = token0IsIn ? reserves.reserve1 : reserves.reserve0;
  if (reserveInRaw <= 0n) return null;

  const reserveIn = Number(reserveInRaw) / 10 ** tokenInDecimals;
  const reserveOut = Number(reserveOutRaw) / 10 ** tokenOutDecimals;
  if (reserveIn <= 0) return null;
  return reserveOut / reserveIn;
}

export type ResolvedToken = {
  address: string;
  isNative: boolean;
};

export function resolveTokenContract(token: SwapToken): ResolvedToken | null {
  if (token.id === "eth") return { address: ZERO_ADDRESS, isNative: true };
  if (token.id === "gumi") return { address: CONTRACT_ADDRESSES.gumiToken, isNative: false };
  if (token.imported) {
    const address = token.id.replace(/^custom-/, "");
    if (isContractAddress(address)) return { address, isNative: false };
    return null;
  }
  return null;
}

export function parseAmountToBaseUnits(value: string, decimals: number): bigint {
  const trimmed = value.trim();
  if (!trimmed) return 0n;
  const [wholePartRaw, fractionPartRaw = ""] = trimmed.split(".");
  const wholePart = wholePartRaw.replace(/[^0-9]/g, "") || "0";
  const fractionPart = fractionPartRaw.replace(/[^0-9]/g, "").slice(0, decimals).padEnd(decimals, "0");
  return BigInt(wholePart) * 10n ** BigInt(decimals) + BigInt(fractionPart || "0");
}

export function formatBaseUnitsToNumber(value: bigint, decimals: number): number {
  return Number(value) / 10 ** decimals;
}

export function applySlippageToRaw(amountOutRaw: bigint, slippagePct: number): bigint {
  const bps = BigInt(Math.max(0, Math.min(10000, Math.round(slippagePct * 100))));
  return (amountOutRaw * (10000n - bps)) / 10000n;
}

export function getDeadlineTimestamp(minutes: number): bigint {
  const safeMinutes = Number.isFinite(minutes) && minutes > 0 ? minutes : 20;
  return BigInt(Math.floor(Date.now() / 1000) + Math.round(safeMinutes * 60));
}

export async function fetchGasPriceWei(rpcUrl: string): Promise<bigint | null> {
  try {
    const response = await fetch(rpcUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "eth_gasPrice", params: [] }),
    });
    if (!response.ok) return null;
    const payload = await response.json();
    if (!payload || typeof payload.result !== "string") return null;
    return BigInt(payload.result);
  } catch {
    return null;
  }
}

export async function estimateSwapGas(
  provider: EIP1193Provider,
  from: string,
  to: string,
  data: string,
  valueWei: bigint
): Promise<bigint | null> {
  try {
    const params: Record<string, string> = { from, to, data };
    if (valueWei > 0n) params.value = `0x${valueWei.toString(16)}`;
    const raw = await provider.request({ method: "eth_estimateGas", params: [params] });
    return BigInt(raw as string);
  } catch {
    return null;
  }
}

export const FALLBACK_GAS_UNITS_DIRECT = 170_000n;
export const FALLBACK_GAS_UNITS_MULTIHOP = 260_000n;
export const FALLBACK_GAS_UNITS_APPROVE = 55_000n;

export type SwapQuote = {
  path: string[];
  amountOutRaw: bigint;
  receiveAmount: number;
  rate: number;
  priceImpactPct: number | null;
};

export async function fetchSwapQuote(params: {
  call: EthCaller;
  wethAddress: string;
  payResolved: ResolvedToken;
  receiveResolved: ResolvedToken;
  payAmountRaw: bigint;
  payDecimals: number;
  receiveDecimals: number;
}): Promise<SwapQuote | null> {
  const { call, wethAddress, payResolved, receiveResolved, payAmountRaw, payDecimals, receiveDecimals } = params;

  const tokenInAddress = payResolved.isNative ? wethAddress : payResolved.address;
  const tokenOutAddress = receiveResolved.isNative ? wethAddress : receiveResolved.address;
  if (tokenInAddress.toLowerCase() === tokenOutAddress.toLowerCase()) return null;
  if (payAmountRaw <= 0n) return null;

  let path = [tokenInAddress, tokenOutAddress];
  let amounts = await getAmountsOutOnchain(call, payAmountRaw, path);

  const canHop =
    tokenInAddress.toLowerCase() !== wethAddress.toLowerCase() &&
    tokenOutAddress.toLowerCase() !== wethAddress.toLowerCase();

  if ((!amounts || amounts[amounts.length - 1] <= 0n) && canHop) {
    path = [tokenInAddress, wethAddress, tokenOutAddress];
    amounts = await getAmountsOutOnchain(call, payAmountRaw, path);
  }

  if (!amounts || amounts.length < 2 || amounts[amounts.length - 1] <= 0n) return null;

  const amountOutRaw = amounts[amounts.length - 1];
  const receiveAmount = formatBaseUnitsToNumber(amountOutRaw, receiveDecimals);
  const payAmountNumber = formatBaseUnitsToNumber(payAmountRaw, payDecimals);
  const rate = payAmountNumber > 0 ? receiveAmount / payAmountNumber : 0;

  let spotRate: number | null = null;
  if (path.length === 2) {
    spotRate = await fetchSpotRate(call, path[0], path[1], payDecimals, receiveDecimals);
  } else {
    const hop1 = await fetchSpotRate(call, path[0], path[1], payDecimals, 18);
    const hop2 = await fetchSpotRate(call, path[1], path[2], 18, receiveDecimals);
    spotRate = hop1 !== null && hop2 !== null ? hop1 * hop2 : null;
  }

  const priceImpactPct =
    spotRate && spotRate > 0 ? Math.max(0, Math.min(100, (1 - rate / spotRate) * 100)) : null;

  return { path, amountOutRaw, receiveAmount, rate, priceImpactPct };
}
