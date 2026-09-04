import type { EIP1193Provider } from "./wallet-context";

export type OwnedNft = {
  tokenId: string;
  name: string;
  image: string | null;
  tokenUri: string | null;
};

export type GumiNftHoldings = {
  balance: number;
  items: OwnedNft[];
};

export type EthCaller = (to: string, data: string) => Promise<string | null>;

function padHex(value: string, bytes = 32): string {
  return value.replace(/^0x/, "").padStart(bytes * 2, "0");
}

function addressToPadded(address: string): string {
  return padHex(address.toLowerCase());
}

function uintToPadded(value: bigint): string {
  return padHex(value.toString(16));
}

function balanceOfCalldata(owner: string): string {
  return `0x70a08231${addressToPadded(owner)}`;
}

function tokenOfOwnerByIndexCalldata(owner: string, index: bigint): string {
  return `0x2f745c59${addressToPadded(owner)}${uintToPadded(index)}`;
}

function tokenUriCalldata(tokenId: bigint): string {
  return `0xc87b56dd${uintToPadded(tokenId)}`;
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

export function resolveMetadataUri(uri: string): string {
  if (uri.startsWith("ipfs://")) {
    return `https://ipfs.io/ipfs/${uri.slice("ipfs://".length)}`;
  }
  return uri;
}

export function createProviderCaller(provider: EIP1193Provider): EthCaller {
  return async (to, data) => {
    try {
      const result = await provider.request({
        method: "eth_call",
        params: [{ to, data }, "latest"],
      });
      return result as string;
    } catch {
      return null;
    }
  };
}

export function createRpcCaller(rpcUrl: string): EthCaller {
  return async (to, data) => {
    try {
      const response = await fetch(rpcUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: 1,
          method: "eth_call",
          params: [{ to, data }, "latest"],
        }),
      });
      if (!response.ok) return null;
      const payload = await response.json();
      if (!payload || typeof payload.result !== "string") return null;
      return payload.result as string;
    } catch {
      return null;
    }
  };
}

async function fetchTokenMetadata(tokenUri: string): Promise<{ name: string | null; image: string | null }> {
  try {
    const response = await fetch(resolveMetadataUri(tokenUri));
    if (!response.ok) return { name: null, image: null };
    const metadata = await response.json();
    const name = typeof metadata?.name === "string" && metadata.name.trim().length > 0 ? metadata.name : null;
    const image =
      typeof metadata?.image === "string" && metadata.image.trim().length > 0
        ? resolveMetadataUri(metadata.image)
        : null;
    return { name, image };
  } catch {
    return { name: null, image: null };
  }
}

export async function fetchGumiCustomNftBalance(
  call: EthCaller,
  contractAddress: string,
  owner: string
): Promise<number> {
  if (!contractAddress || !owner) return 0;
  const balanceRaw = await call(contractAddress, balanceOfCalldata(owner));
  if (!balanceRaw || balanceRaw === "0x") return 0;
  return Number(BigInt(balanceRaw));
}

export async function fetchGumiCustomNftHoldings(
  call: EthCaller,
  contractAddress: string,
  owner: string
): Promise<GumiNftHoldings> {
  const balance = await fetchGumiCustomNftBalance(call, contractAddress, owner);
  if (balance <= 0) return { balance: 0, items: [] };

  const items: OwnedNft[] = [];
  for (let index = 0; index < balance; index += 1) {
    const tokenIdRaw = await call(contractAddress, tokenOfOwnerByIndexCalldata(owner, BigInt(index)));
    if (!tokenIdRaw || tokenIdRaw === "0x") break;
    const tokenId = BigInt(tokenIdRaw);

    const uriRaw = await call(contractAddress, tokenUriCalldata(tokenId));
    const tokenUri = uriRaw && uriRaw !== "0x" ? decodeAbiString(uriRaw) : null;

    let name = `Gumi Custom NFT #${tokenId.toString()}`;
    let image: string | null = null;

    if (tokenUri) {
      const metadata = await fetchTokenMetadata(tokenUri);
      if (metadata.name) name = metadata.name;
      if (metadata.image) image = metadata.image;
    }

    items.push({ tokenId: tokenId.toString(), name, image, tokenUri });
  }

  return { balance, items };
}
