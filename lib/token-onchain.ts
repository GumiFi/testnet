import type { EIP1193Provider } from "./wallet-context";
import type { EthCaller } from "./nft-onchain";
import type { TransactionReceipt } from "./launchpad-onchain";

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

function balanceOfCalldata(owner: string): string {
  return `0x70a08231${addressToPadded(owner)}`;
}

function decimalsCalldata(): string {
  return "0x313ce567";
}

export function parseWholeUnitsToBaseUnits(value: string, decimals = 18): bigint {
  const digitsOnly = value.replace(/[^0-9]/g, "") || "0";
  const whole = BigInt(digitsOnly === "" ? "0" : digitsOnly);
  return whole * 10n ** BigInt(decimals);
}

export function createSimpleTokenCalldata(name: string, symbol: string, totalSupplyBaseUnits: bigint): string {
  const nameEncoded = encodeDynamicString(name);
  const symbolEncoded = encodeDynamicString(symbol);
  const headBytes = 3 * 32;
  const nameOffset = uintToPadded(BigInt(headBytes));
  const nameBytes = nameEncoded.length / 2;
  const symbolOffset = uintToPadded(BigInt(headBytes + nameBytes));
  const totalSupplyWord = uintToPadded(totalSupplyBaseUnits);
  return `0x5b060530${nameOffset}${symbolOffset}${totalSupplyWord}${nameEncoded}${symbolEncoded}`;
}

export const SIMPLE_TOKEN_CREATED_TOPIC0 =
  "0x6e6ae68e7d7d45fbd855c40d1eaafa8de46c5fbec3ee26f1af88730e400bc92c";

export function extractCreatedSimpleTokenAddress(
  receipt: TransactionReceipt,
  factoryAddress: string
): string | null {
  const factory = factoryAddress.toLowerCase();
  const log = receipt.logs.find(
    (entry) =>
      entry.address.toLowerCase() === factory &&
      entry.topics[0]?.toLowerCase() === SIMPLE_TOKEN_CREATED_TOPIC0
  );
  if (!log || !log.topics[1]) return null;
  return `0x${log.topics[1].slice(-40)}`;
}

export async function fetchErc20Balance(
  call: EthCaller,
  tokenAddress: string,
  owner: string,
  fallbackDecimals = 18
): Promise<number> {
  if (!tokenAddress || !owner) return 0;
  const [balanceRaw, decimalsRaw] = await Promise.all([
    call(tokenAddress, balanceOfCalldata(owner)),
    call(tokenAddress, decimalsCalldata()),
  ]);
  if (!balanceRaw || balanceRaw === "0x") return 0;
  const decimals = decimalsRaw && decimalsRaw !== "0x" ? Number(BigInt(decimalsRaw)) : fallbackDecimals;
  return Number(BigInt(balanceRaw)) / 10 ** decimals;
}

export async function fetchNativeBalance(
  provider: EIP1193Provider | null,
  rpcUrl: string,
  owner: string
): Promise<number> {
  if (!owner) return 0;
  try {
    let hex: string | null = null;
    if (provider) {
      hex = (await provider.request({
        method: "eth_getBalance",
        params: [owner, "latest"],
      })) as string;
    } else {
      const response = await fetch(rpcUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: 1,
          method: "eth_getBalance",
          params: [owner, "latest"],
        }),
      });
      if (!response.ok) return 0;
      const payload = await response.json();
      hex = typeof payload?.result === "string" ? payload.result : null;
    }
    if (!hex || hex === "0x") return 0;
    return Number(BigInt(hex)) / 1e18;
  } catch {
    return 0;
  }
}
