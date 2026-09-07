import type { EthCaller } from "./nft-onchain";
import { resolveMetadataUri } from "./nft-onchain";
import { CONTRACT_ADDRESSES, NETWORK } from "@/config/contracts.config";

export type MarketListing = {
  listingId: number;
  seller: string;
  nft: string;
  tokenId: string;
  priceWei: bigint;
  name: string;
  image: string | null;
};


async function rpcRequest<T>(method: string, params: unknown[]): Promise<T | null> {
  try {
    const response = await fetch(NETWORK.rpcUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
    });
    if (!response.ok) return null;
    const payload = await response.json();
    if (!payload || payload.error) return null;
    return payload.result as T;
  } catch {
    return null;
  }
}

const rpcCall: EthCaller = (to, data) => rpcRequest<string>("eth_call", [{ to, data }, "latest"]);


function padHex(value: string, bytes = 32): string {
  return value.replace(/^0x/, "").padStart(bytes * 2, "0");
}

function addressToPadded(address: string): string {
  return padHex(address.toLowerCase());
}

function uintToPadded(value: bigint): string {
  return padHex(value.toString(16));
}

function boolToPadded(value: boolean): string {
  return padHex(value ? "1" : "0");
}

export function listingCountCalldata(): string {
  return "0xa9b07c26";
}

export function listingsCalldata(listingId: bigint): string {
  return `0xde74e57b${uintToPadded(listingId)}`;
}

export function listItemCalldata(nft: string, tokenId: bigint, priceWei: bigint): string {
  return `0x89bfd38f${addressToPadded(nft)}${uintToPadded(tokenId)}${uintToPadded(priceWei)}`;
}

export function buyItemCalldata(listingId: bigint): string {
  return `0xe7fb74c7${uintToPadded(listingId)}`;
}

export function cancelListingCalldata(listingId: bigint): string {
  return `0x305a67a8${uintToPadded(listingId)}`;
}

export function updatePriceCalldata(listingId: bigint, newPriceWei: bigint): string {
  return `0x82367b2d${uintToPadded(listingId)}${uintToPadded(newPriceWei)}`;
}

export function ownerOfCalldata(tokenId: bigint): string {
  return `0x6352211e${uintToPadded(tokenId)}`;
}

export function getApprovedCalldata(tokenId: bigint): string {
  return `0x081812fc${uintToPadded(tokenId)}`;
}

export function isApprovedForAllCalldata(owner: string, operator: string): string {
  return `0xe985e9c5${addressToPadded(owner)}${addressToPadded(operator)}`;
}

export function setApprovalForAllCalldata(operator: string, approved: boolean): string {
  return `0xa22cb465${addressToPadded(operator)}${boolToPadded(approved)}`;
}

export function tokenUriCalldata(tokenId: bigint): string {
  return `0xc87b56dd${uintToPadded(tokenId)}`;
}


function decodeUint256(hex: string | null): bigint {
  if (!hex || hex === "0x") return 0n;
  return BigInt(hex);
}

function decodeBool(word: string): boolean {
  return BigInt(`0x${word || "0"}`) !== 0n;
}

function decodeAddressWord(word: string): string {
  return `0x${word.slice(-40)}`;
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

function decodeListingStruct(
  hex: string | null
): { seller: string; nft: string; tokenId: bigint; price: bigint; active: boolean } | null {
  if (!hex || hex.length < 2 + 64 * 5) return null;
  const clean = hex.replace(/^0x/, "");
  return {
    seller: decodeAddressWord(clean.slice(0, 64)),
    nft: decodeAddressWord(clean.slice(64, 128)),
    tokenId: BigInt(`0x${clean.slice(128, 192)}`),
    price: BigInt(`0x${clean.slice(192, 256)}`),
    active: decodeBool(clean.slice(256, 320)),
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


export async function fetchListing(listingId: number): Promise<MarketListing | null> {
  const raw = await rpcCall(CONTRACT_ADDRESSES.nftMarketplace, listingsCalldata(BigInt(listingId)));
  const parsed = decodeListingStruct(raw);
  if (!parsed || !parsed.active || parsed.seller === "0x0000000000000000000000000000000000000000") return null;

  let name = `${parsed.nft.slice(0, 6)}... #${parsed.tokenId.toString()}`;
  let image: string | null = null;
  const uriRaw = await rpcCall(parsed.nft, tokenUriCalldata(parsed.tokenId));
  if (uriRaw && uriRaw !== "0x") {
    const tokenUri = decodeAbiString(uriRaw);
    if (tokenUri) {
      const metadata = await fetchTokenMetadata(tokenUri);
      if (metadata.name) name = metadata.name;
      image = metadata.image;
    }
  }

  return {
    listingId,
    seller: parsed.seller,
    nft: parsed.nft,
    tokenId: parsed.tokenId.toString(),
    priceWei: parsed.price,
    name,
    image,
  };
}

export async function fetchAllActiveListings(): Promise<MarketListing[]> {
  const countRaw = await rpcCall(CONTRACT_ADDRESSES.nftMarketplace, listingCountCalldata());
  const count = Number(decodeUint256(countRaw));
  if (count <= 0) return [];

  const ids = Array.from({ length: count }, (_, i) => i);
  const listings = await Promise.all(
    ids.map((id) => fetchListing(id).catch(() => null))
  );
  return listings
    .filter((listing): listing is MarketListing => listing !== null)
    .sort((a, b) => b.listingId - a.listingId);
}

export async function fetchOwnerOf(nft: string, tokenId: bigint): Promise<string | null> {
  const raw = await rpcCall(nft, ownerOfCalldata(tokenId));
  if (!raw || raw === "0x") return null;
  return decodeAddressWord(raw.replace(/^0x/, ""));
}

export async function fetchIsApprovedForMarketplace(
  call: EthCaller,
  nft: string,
  owner: string,
  tokenId: bigint
): Promise<boolean> {
  const [approvedRaw, allRaw] = await Promise.all([
    call(nft, getApprovedCalldata(tokenId)),
    call(nft, isApprovedForAllCalldata(owner, CONTRACT_ADDRESSES.nftMarketplace)),
  ]);
  const approved = approvedRaw ? decodeAddressWord(approvedRaw.replace(/^0x/, "")) : null;
  const isMarketplaceApproved =
    approved != null && approved.toLowerCase() === CONTRACT_ADDRESSES.nftMarketplace.toLowerCase();
  const approvedForAll = allRaw ? decodeBool(allRaw.replace(/^0x/, "")) : false;
  return isMarketplaceApproved || approvedForAll;
}
