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

function ownerOfCalldata(tokenId: bigint): string {
  return `0x6352211e${uintToPadded(tokenId)}`;
}

function totalMintedCalldata(): string {
  return "0xa2309ff8";
}

function handleOfCalldata(tokenId: bigint): string {
  return `0x49491987${uintToPadded(tokenId)}`;
}

function decodeAddressWord(hex: string): string {
  const clean = hex.replace(/^0x/, "");
  return `0x${clean.slice(-40)}`;
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

export async function fetchGumiHandleForWallet(
  call: EthCaller,
  contractAddress: string,
  owner: string
): Promise<string | null> {
  const totalRaw = await call(contractAddress, totalMintedCalldata());
  if (!totalRaw || totalRaw === "0x") return null;
  const total = Number(BigInt(totalRaw));
  if (total <= 0) return null;
  const ownerLower = owner.toLowerCase();
  const tokenIds = Array.from({ length: total }, (_, index) => BigInt(index + 1));
  const owners = await Promise.all(
    tokenIds.map((tokenId) =>
      call(contractAddress, ownerOfCalldata(tokenId))
        .then((raw) => (raw && raw !== "0x" ? decodeAddressWord(raw) : null))
        .catch(() => null)
    )
  );
  const matchIndex = owners.findIndex((address) => address && address.toLowerCase() === ownerLower);
  if (matchIndex === -1) return null;
  const handleRaw = await call(contractAddress, handleOfCalldata(tokenIds[matchIndex]));
  if (!handleRaw || handleRaw === "0x") return null;
  return decodeAbiString(handleRaw) || null;
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
export function createCollectionCalldata(
  name: string,
  symbol: string,
  baseURI: string,
  mintPriceWei: bigint,
  maxSupply: bigint
): string {
  const nameEncoded = encodeDynamicString(name);
  const symbolEncoded = encodeDynamicString(symbol);
  const baseUriEncoded = encodeDynamicString(baseURI);
  const headBytes = 5 * 32;
  const nameOffset = uintToPadded(BigInt(headBytes));
  const nameBytes = nameEncoded.length / 2;
  const symbolOffset = uintToPadded(BigInt(headBytes + nameBytes));
  const symbolBytes = symbolEncoded.length / 2;
  const baseUriOffset = uintToPadded(BigInt(headBytes + nameBytes + symbolBytes));
  const mintPriceWord = uintToPadded(mintPriceWei);
  const maxSupplyWord = uintToPadded(maxSupply);
  return `0x7ad3e1cf${nameOffset}${symbolOffset}${baseUriOffset}${mintPriceWord}${maxSupplyWord}${nameEncoded}${symbolEncoded}${baseUriEncoded}`;
}
export const COLLECTION_CREATED_TOPIC0 =
  "0x8b191557afa6a02003a58f9c53041c9704d06bbad5df81dbaa8ddcf35ccdf1b0";
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

export function extractCreatedCollectionAddress(
  receipt: TransactionReceipt,
  factoryAddress: string
): string | null {
  const factory = factoryAddress.toLowerCase();
  const log = receipt.logs.find(
    (entry) =>
      entry.address.toLowerCase() === factory &&
      entry.topics[0]?.toLowerCase() === COLLECTION_CREATED_TOPIC0
  );
  if (!log || !log.topics[1]) return null;
  return `0x${log.topics[1].slice(-40)}`;
}

export const GUMI_HANDLE_SUFFIX = ".gumi";
export const GUMI_HANDLE_MAX_LENGTH = 28;
export const GUMI_HANDLE_BASE_MAX_LENGTH = GUMI_HANDLE_MAX_LENGTH - GUMI_HANDLE_SUFFIX.length;
export const GUMI_MINT_PRICE_WEI = 20000000000000000n;
export const GUMI_MINT_PRICE_ETH = "0.02";

const HANDLE_BASE_CHAR_RE = /^[a-zA-Z0-9_-]+$/;

export function sanitizeGumiHandleBase(value: string): string {
  return value.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, GUMI_HANDLE_BASE_MAX_LENGTH);
}

export function isValidGumiHandleBase(base: string): boolean {
  return (
    base.length > 0 &&
    base.length <= GUMI_HANDLE_BASE_MAX_LENGTH &&
    HANDLE_BASE_CHAR_RE.test(base)
  );
}

export function buildGumiHandle(base: string): string {
  return `${base}${GUMI_HANDLE_SUFFIX}`;
}

function mintCalldataFor(selector: string, handle: string): string {
  const encoded = encodeDynamicString(handle);
  const offset = uintToPadded(32n);
  return `${selector}${offset}${encoded}`;
}

export function mintGumiHandleCalldata(handle: string): string {
  return mintCalldataFor("0xd85d3d27", handle);
}

export function isHandleAvailableCalldata(handle: string): string {
  return mintCalldataFor("0x8c1efee1", handle);
}

export function decodeAbiBool(hex: string | null): boolean {
  if (!hex || hex === "0x") return false;
  try {
    return BigInt(hex) !== 0n;
  } catch {
    return false;
  }
}

export const NFT_TRANSFER_TOPIC0 =
  "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";

export function extractMintedTokenId(
  receipt: TransactionReceipt,
  contractAddress: string
): string | null {
  const contract = contractAddress.toLowerCase();
  const log = receipt.logs.find(
    (entry) =>
      entry.address.toLowerCase() === contract &&
      entry.topics[0]?.toLowerCase() === NFT_TRANSFER_TOPIC0 &&
      entry.topics.length >= 4
  );
  if (!log || !log.topics[3]) return null;
  try {
    return BigInt(log.topics[3]).toString();
  } catch {
    return null;
  }
}