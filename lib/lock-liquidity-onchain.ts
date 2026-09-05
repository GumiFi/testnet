import type { EthCaller } from "./nft-onchain";
import { decodeAddress, decodeUint256 } from "./swap-onchain";

function padHex(value: string, bytes = 32): string {
  return value.replace(/^0x/, "").padStart(bytes * 2, "0");
}

function addressToPadded(address: string): string {
  return padHex(address.toLowerCase());
}

function uintToPadded(value: bigint): string {
  return padHex(value.toString(16));
}

export function lockCalldata(token: string, amount: bigint, unlockTime: bigint, owner: string): string {
  return `0x0852c9ea${addressToPadded(token)}${uintToPadded(amount)}${uintToPadded(unlockTime)}${addressToPadded(owner)}`;
}

export function registerBoostCalldata(lockId: bigint): string {
  return `0x1ea1bda1${uintToPadded(lockId)}`;
}

export function observationReadyAtCalldata(pair: string): string {
  return `0x49f7e31a${addressToPadded(pair)}`;
}

export function tiersCalldata(index: bigint): string {
  return `0x039af9eb${uintToPadded(index)}`;
}

export function token0Calldata(): string {
  return "0x0dfe1681";
}

export function token1Calldata(): string {
  return "0xd21220a7";
}

export type BoostTier = {
  minDays: number;
  multiplier: number;
};

export function decodeTier(hex: string | null): BoostTier | null {
  if (!hex || hex === "0x") return null;
  const clean = hex.replace(/^0x/, "");
  if (clean.length < 128) return null;
  const minDays = Number(BigInt(`0x${clean.slice(0, 64)}`));
  const multiplierE18 = BigInt(`0x${clean.slice(64, 128)}`);
  const multiplier = Number(multiplierE18) / 1e18;
  return { minDays, multiplier };
}

export async function fetchBoostTiers(call: EthCaller, vaultAddress: string, count = 4): Promise<BoostTier[]> {
  const results = await Promise.all(
    Array.from({ length: count }, (_, index) => call(vaultAddress, tiersCalldata(BigInt(index))))
  );
  return results
    .map((raw) => decodeTier(raw))
    .filter((tier): tier is BoostTier => tier !== null && tier.minDays > 0);
}

export async function fetchPairSides(
  call: EthCaller,
  pairAddress: string
): Promise<{ token0: string | null; token1: string | null }> {
  const [token0Raw, token1Raw] = await Promise.all([
    call(pairAddress, token0Calldata()),
    call(pairAddress, token1Calldata()),
  ]);
  return { token0: decodeAddress(token0Raw), token1: decodeAddress(token1Raw) };
}

export async function fetchObservationReadyAt(call: EthCaller, vaultAddress: string, pairAddress: string): Promise<bigint> {
  const raw = await call(vaultAddress, observationReadyAtCalldata(pairAddress));
  return decodeUint256(raw);
}

export const LOCKED_TOPIC0 = "0x1cb39d6ecc8f823fa6183785ee795ddcb2873e92effbff9b9a377ef761035676";
export const OBSERVATION_INITIALIZED_TOPIC0 = "0x4f25f4a0ccd343852e429effea18ea340c3705d3dc7a60ea058d7426c568a5ba";
export const BOOST_REGISTERED_TOPIC0 = "0x53f351f2cde97afa498dcabb084975b8caf60bf7bd4bcefc874386cfb6bb925c";

export type ReceiptLog = {
  address: string;
  topics: string[];
  data: string;
};

export type LockReceipt = {
  status: string;
  transactionHash: string;
  blockNumber: string;
  logs: ReceiptLog[];
};

export function extractLockId(receipt: LockReceipt, lockerAddress: string): bigint | null {
  const locker = lockerAddress.toLowerCase();
  const log = receipt.logs.find(
    (entry) => entry.address.toLowerCase() === locker && entry.topics[0]?.toLowerCase() === LOCKED_TOPIC0
  );
  if (!log || !log.topics[1]) return null;
  return BigInt(log.topics[1]);
}

export type BoostOutcome = "activated" | "checkpointed" | "none";

export function extractBoostOutcome(receipt: LockReceipt, vaultAddress: string): BoostOutcome {
  const vault = vaultAddress.toLowerCase();
  const activated = receipt.logs.some(
    (entry) => entry.address.toLowerCase() === vault && entry.topics[0]?.toLowerCase() === BOOST_REGISTERED_TOPIC0
  );
  if (activated) return "activated";
  const checkpointed = receipt.logs.some(
    (entry) =>
      entry.address.toLowerCase() === vault && entry.topics[0]?.toLowerCase() === OBSERVATION_INITIALIZED_TOPIC0
  );
  if (checkpointed) return "checkpointed";
  return "none";
}
