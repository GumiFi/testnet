import type { EthCaller } from "./nft-onchain";
import { decodeAddress, decodeUint256, getReservesCalldata } from "./swap-onchain";
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

function wordAt(clean: string, index: number): string {
  return clean.slice(index * 64, index * 64 + 64);
}

function addressFromWord(word: string): string {
  return `0x${word.slice(-40)}`;
}

export function allPairsLengthCalldata(): string {
  return "0x574f2ba3";
}

export function allPairsCalldata(index: bigint): string {
  return `0x1e3dd18b${uintToPadded(index)}`;
}

export function totalSupplyCalldata(): string {
  return "0x18160ddd";
}

export function getLocksByOwnerCalldata(owner: string): string {
  return `0xe15fec18${addressToPadded(owner)}`;
}

export function locksCalldata(lockId: bigint): string {
  return `0xf4dadc61${uintToPadded(lockId)}`;
}

export function priceOracleRateCalldata(): string {
  return "0x679aefce";
}

export function isBoostValidCalldata(lockId: bigint): string {
  return `0x6ad4943a${uintToPadded(lockId)}`;
}

export function decodeUint256Array(hex: string | null): bigint[] {
  if (!hex || hex === "0x") return [];
  const clean = hex.replace(/^0x/, "");
  if (clean.length < 128) return [];
  const length = Number(BigInt(`0x${wordAt(clean, 1)}`));
  const values: bigint[] = [];
  for (let i = 0; i < length; i += 1) {
    const word = wordAt(clean, 2 + i);
    if (word.length < 64) break;
    values.push(BigInt(`0x${word}`));
  }
  return values;
}

export function decodeRawReserves(hex: string | null): { reserve0: bigint; reserve1: bigint } {
  if (!hex || hex === "0x") return { reserve0: 0n, reserve1: 0n };
  const clean = hex.replace(/^0x/, "");
  if (clean.length < 128) return { reserve0: 0n, reserve1: 0n };
  return {
    reserve0: BigInt(`0x${wordAt(clean, 0)}`),
    reserve1: BigInt(`0x${wordAt(clean, 1)}`),
  };
}

export type LockEntry = {
  lockId: bigint;
  token: string;
  owner: string;
  amount: bigint;
  unlockTime: bigint;
  withdrawn: boolean;
};

export function decodeLockTuple(lockId: bigint, hex: string | null): LockEntry | null {
  if (!hex || hex === "0x") return null;
  const clean = hex.replace(/^0x/, "");
  if (clean.length < 320) return null;
  return {
    lockId,
    token: addressFromWord(wordAt(clean, 0)),
    owner: addressFromWord(wordAt(clean, 1)),
    amount: BigInt(`0x${wordAt(clean, 2)}`),
    unlockTime: BigInt(`0x${wordAt(clean, 3)}`),
    withdrawn: BigInt(`0x${wordAt(clean, 4)}`) === 1n,
  };
}

export async function fetchAllPairAddresses(call: EthCaller): Promise<string[]> {
  const lengthRaw = await call(CONTRACT_ADDRESSES.gumiFactory, allPairsLengthCalldata());
  const length = Number(decodeUint256(lengthRaw));
  if (length <= 0) return [];
  const raws = await Promise.all(
    Array.from({ length }, (_, index) => call(CONTRACT_ADDRESSES.gumiFactory, allPairsCalldata(BigInt(index))))
  );
  return raws.map((raw) => decodeAddress(raw)).filter((entry): entry is string => !!entry);
}

export async function fetchUserLocks(call: EthCaller, owner: string): Promise<LockEntry[]> {
  const idsRaw = await call(CONTRACT_ADDRESSES.liquidityLocker, getLocksByOwnerCalldata(owner));
  const ids = decodeUint256Array(idsRaw);
  if (ids.length === 0) return [];
  const raws = await Promise.all(ids.map((id) => call(CONTRACT_ADDRESSES.liquidityLocker, locksCalldata(id))));
  return ids
    .map((id, index) => decodeLockTuple(id, raws[index]))
    .filter((entry): entry is LockEntry => entry !== null);
}

export async function fetchRawReserves(call: EthCaller, pairAddress: string): Promise<{ reserve0: bigint; reserve1: bigint }> {
  const raw = await call(pairAddress, getReservesCalldata());
  return decodeRawReserves(raw);
}

export async function fetchTotalSupply(call: EthCaller, tokenAddress: string): Promise<bigint> {
  const raw = await call(tokenAddress, totalSupplyCalldata());
  return decodeUint256(raw);
}

export async function fetchEthUsdRate(call: EthCaller): Promise<number | null> {
  const raw = await call(CONTRACT_ADDRESSES.priceOracle, priceOracleRateCalldata());
  if (!raw || raw === "0x") return null;
  const rate = decodeUint256(raw);
  if (rate <= 0n) return null;
  return Number(rate) / 1e18;
}

export async function fetchIsBoostValid(call: EthCaller, lockId: bigint): Promise<boolean> {
  const raw = await call(CONTRACT_ADDRESSES.liquidityBoostVault, isBoostValidCalldata(lockId));
  return decodeUint256(raw) === 1n;
}

export type PositionLock = {
  lockId: bigint;
  amount: bigint;
  unlockTime: bigint;
  withdrawn: boolean;
  boosted: boolean;
};

export type OnchainPosition = {
  pairAddress: string;
  token0: string;
  token1: string;
  symbol0: string;
  symbol1: string;
  isWethPaired: boolean;
  reserve0: bigint;
  reserve1: bigint;
  decimals0: number;
  decimals1: number;
  totalSupplyLp: bigint;
  walletBalanceRaw: bigint;
  lockedRaw: bigint;
  totalOwnedRaw: bigint;
  poolSharePct: number;
  amount0Owned: number;
  amount1Owned: number;
  valueUsd: number | null;
  locks: PositionLock[];
  nextUnlockTime: bigint | null;
};
