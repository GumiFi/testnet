import type { EIP1193Provider } from "./wallet-context";
import type { EthCaller } from "./nft-onchain";

function padHex(value: string, bytes = 32): string {
  return value.replace(/^0x/, "").padStart(bytes * 2, "0");
}

function addressToPadded(address: string): string {
  return padHex(address.toLowerCase());
}

function balanceOfCalldata(owner: string): string {
  return `0x70a08231${addressToPadded(owner)}`;
}

function decimalsCalldata(): string {
  return "0x313ce567";
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
