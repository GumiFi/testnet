import type { EthCaller } from "./nft-onchain";
import { decodeAddress, getPairCalldata, getReservesCalldata, ZERO_ADDRESS } from "./swap-onchain";
import { CONTRACT_ADDRESSES } from "@/config/contracts.config";

function padHex(value: string, bytes = 32): string {
  return value.replace(/^0x/, "").padStart(bytes * 2, "0");
}

function addressToPadded(address: string): string {
  return padHex(address.toLowerCase());
}

function uintToPadded(value: bigint): string {
  return padHex(value.toString(16));
}

export function addLiquidityCalldata(
  tokenA: string,
  tokenB: string,
  amountADesired: bigint,
  amountBDesired: bigint,
  amountAMin: bigint,
  amountBMin: bigint,
  to: string,
  deadline: bigint
): string {
  return `0xe8e33700${addressToPadded(tokenA)}${addressToPadded(tokenB)}${uintToPadded(amountADesired)}${uintToPadded(amountBDesired)}${uintToPadded(amountAMin)}${uintToPadded(amountBMin)}${addressToPadded(to)}${uintToPadded(deadline)}`;
}

export function addLiquidityEthCalldata(
  token: string,
  amountTokenDesired: bigint,
  amountTokenMin: bigint,
  amountEthMin: bigint,
  to: string,
  deadline: bigint
): string {
  return `0xf305d719${addressToPadded(token)}${uintToPadded(amountTokenDesired)}${uintToPadded(amountTokenMin)}${uintToPadded(amountEthMin)}${addressToPadded(to)}${uintToPadded(deadline)}`;
}

export type PairReserves = {
  pairAddress: string | null;
  exists: boolean;
  reserveA: bigint;
  reserveB: bigint;
};

function decodeReserves(hex: string | null): { reserve0: bigint; reserve1: bigint } | null {
  if (!hex || hex === "0x") return null;
  const clean = hex.replace(/^0x/, "");
  if (clean.length < 128) return null;
  return {
    reserve0: BigInt(`0x${clean.slice(0, 64)}`),
    reserve1: BigInt(`0x${clean.slice(64, 128)}`),
  };
}

export async function fetchPairReserves(call: EthCaller, tokenA: string, tokenB: string): Promise<PairReserves> {
  const pairRaw = await call(CONTRACT_ADDRESSES.gumiFactory, getPairCalldata(tokenA, tokenB));
  const pairAddress = decodeAddress(pairRaw);
  if (!pairAddress || pairAddress.toLowerCase() === ZERO_ADDRESS) {
    return { pairAddress: null, exists: false, reserveA: 0n, reserveB: 0n };
  }

  const reservesRaw = await call(pairAddress, getReservesCalldata());
  const reserves = decodeReserves(reservesRaw);
  if (!reserves) {
    return { pairAddress, exists: false, reserveA: 0n, reserveB: 0n };
  }

  const token0IsA = tokenA.toLowerCase() < tokenB.toLowerCase();
  const reserveA = token0IsA ? reserves.reserve0 : reserves.reserve1;
  const reserveB = token0IsA ? reserves.reserve1 : reserves.reserve0;
  return { pairAddress, exists: true, reserveA, reserveB };
}

export function quoteOptimalAmount(amountDesired: bigint, reserveIn: bigint, reserveOut: bigint): bigint {
  if (reserveIn <= 0n) return 0n;
  return (amountDesired * reserveOut) / reserveIn;
}
