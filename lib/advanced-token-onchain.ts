import type { EthCaller } from "./nft-onchain";
import type { TransactionReceipt } from "./launchpad-onchain";
import type { TokenStandard } from "./token-generator-data";

export const ADVANCED_TOKEN_DECIMALS = 18;
export const BASIS_POINTS = 10000;
export const MAX_TAX_BPS = 2500;

export const ADVANCED_VARIANT_INDEX: Record<TokenStandard, number> = {
  standard: 0,
  antiWhale: 1,
  reflection: 2,
  deflationary: 3,
  liquidityGenerator: 4,
};

export type AdvancedTokenomicConfigOnchain = {
  buyTaxBps: bigint;
  sellTaxBps: bigint;
  maxWalletBps: bigint;
  maxTxBps: bigint;
  cooldownSeconds: bigint;
  launchProtectionBlocks: bigint;
  blacklistEnabled: boolean;
  timelockEnabled: boolean;
  cliffDays: bigint;
  vestingDays: bigint;
  teamAllocationBps: bigint;
};

export type AdvancedCreateTokenParams = {
  variant: number;
  name: string;
  symbol: string;
  totalSupply: bigint;
  config: AdvancedTokenomicConfigOnchain;
  treasury: string;
  teamBeneficiary: string;
  teamRevocable: boolean;
  autoLiquidity: boolean;
  liquidityTokenAmount: bigint;
  liquidityTokenMin: bigint;
  liquidityEthMin: bigint;
};

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

function padHex(value: string, bytes = 32): string {
  return value.replace(/^0x/, "").padStart(bytes * 2, "0");
}

function addressToPadded(address: string): string {
  const clean = address && address.trim() !== "" ? address : ZERO_ADDRESS;
  return padHex(clean.toLowerCase());
}

function uintToPadded(value: bigint): string {
  return padHex(value.toString(16));
}

function boolToPadded(value: boolean): string {
  return uintToPadded(value ? 1n : 0n);
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

export function pctToBps(pct: number): bigint {
  const bps = Math.round(pct * 100);
  return BigInt(Math.max(0, Math.min(BASIS_POINTS, bps)));
}

export function parseWholeUnitsToBaseUnits(value: string, decimals = ADVANCED_TOKEN_DECIMALS): bigint {
  const digitsOnly = value.replace(/[^0-9]/g, "") || "0";
  const whole = BigInt(digitsOnly === "" ? "0" : digitsOnly);
  return whole * 10n ** BigInt(decimals);
}

export function isValidAddress(value: string): boolean {
  return /^0x[0-9a-fA-F]{40}$/.test(value.trim());
}

// Function selector for AdvancedTokenFactory.createToken(CreateParams) —
// createToken((uint8,string,string,uint256,(uint256,uint256,uint256,uint256,uint256,
// uint256,bool,bool,uint256,uint256,uint256),address,address,bool,bool,uint256,uint256,uint256))
export const CREATE_ADVANCED_TOKEN_SELECTOR = "0x013ac224";

const CREATE_TOKEN_HEAD_WORDS = 22;

export function createAdvancedTokenCalldata(params: AdvancedCreateTokenParams): string {
  const nameEncoded = encodeDynamicString(params.name);
  const symbolEncoded = encodeDynamicString(params.symbol);

  const headBytes = CREATE_TOKEN_HEAD_WORDS * 32;
  const nameOffset = uintToPadded(BigInt(headBytes));
  const nameBytes = nameEncoded.length / 2;
  const symbolOffset = uintToPadded(BigInt(headBytes + nameBytes));

  const head =
    uintToPadded(BigInt(params.variant)) +
    nameOffset +
    symbolOffset +
    uintToPadded(params.totalSupply) +
    uintToPadded(params.config.buyTaxBps) +
    uintToPadded(params.config.sellTaxBps) +
    uintToPadded(params.config.maxWalletBps) +
    uintToPadded(params.config.maxTxBps) +
    uintToPadded(params.config.cooldownSeconds) +
    uintToPadded(params.config.launchProtectionBlocks) +
    boolToPadded(params.config.blacklistEnabled) +
    boolToPadded(params.config.timelockEnabled) +
    uintToPadded(params.config.cliffDays) +
    uintToPadded(params.config.vestingDays) +
    uintToPadded(params.config.teamAllocationBps) +
    addressToPadded(params.treasury) +
    addressToPadded(params.teamBeneficiary) +
    boolToPadded(params.teamRevocable) +
    boolToPadded(params.autoLiquidity) +
    uintToPadded(params.liquidityTokenAmount) +
    uintToPadded(params.liquidityTokenMin) +
    uintToPadded(params.liquidityEthMin);

  const tail = nameEncoded + symbolEncoded;
  const outerOffset = uintToPadded(32n);

  return `${CREATE_ADVANCED_TOKEN_SELECTOR}${outerOffset}${head}${tail}`;
}

// keccak256("TokenCreated(address,address,uint256,string,string,uint256,address)")
export const ADVANCED_TOKEN_CREATED_TOPIC0 =
  "0x00902cef330122b2b2b50ba4847c01e28970ebcf80fc2f00de45f14837f31f2f";

export function extractCreatedAdvancedTokenAddress(
  receipt: TransactionReceipt,
  factoryAddress: string
): string | null {
  const factory = factoryAddress.toLowerCase();
  const log = receipt.logs.find(
    (entry) =>
      entry.address.toLowerCase() === factory &&
      entry.topics[0]?.toLowerCase() === ADVANCED_TOKEN_CREATED_TOPIC0
  );
  if (!log || !log.topics[1]) return null;
  return `0x${log.topics[1].slice(-40)}`;
}

function timelockMinDelayCalldata(): string {
  return "0xeedd3bea";
}

function autoLiquidityLockDurationCalldata(): string {
  return "0x1f1d778e";
}

function decodeUint256(hex: string | null): bigint {
  if (!hex || hex === "0x") return 0n;
  return BigInt(hex);
}

export type AdvancedFactoryDefaults = {
  timelockMinDelaySeconds: number;
  autoLiquidityLockDurationSeconds: number;
};

export async function fetchAdvancedFactoryDefaults(
  call: EthCaller,
  factoryAddress: string
): Promise<AdvancedFactoryDefaults> {
  const [timelockRaw, lockDurationRaw] = await Promise.all([
    call(factoryAddress, timelockMinDelayCalldata()),
    call(factoryAddress, autoLiquidityLockDurationCalldata()),
  ]);
  return {
    timelockMinDelaySeconds: Number(decodeUint256(timelockRaw)),
    autoLiquidityLockDurationSeconds: Number(decodeUint256(lockDurationRaw)),
  };
}

export function secondsToDaysLabel(seconds: number): string {
  if (!seconds || seconds <= 0) return "0 Days";
  const days = seconds / 86400;
  const rounded = Math.round(days * 10) / 10;
  return `${rounded % 1 === 0 ? rounded.toFixed(0) : rounded.toFixed(1)} Days`;
}

export function secondsToHoursLabel(seconds: number): string {
  if (!seconds || seconds <= 0) return "0h";
  const hours = seconds / 3600;
  const rounded = Math.round(hours * 10) / 10;
  return `${rounded % 1 === 0 ? rounded.toFixed(0) : rounded.toFixed(1)}h`;
}
