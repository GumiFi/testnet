import { NextRequest, NextResponse } from "next/server";
import { getAdminDb, NFT_COLLECTIONS_COLLECTION } from "@/lib/firebase-admin";
import { CONTRACT_ADDRESSES, NETWORK } from "@/config/contracts.config";
import { COLLECTION_CREATED_TOPIC0, extractCreatedCollectionAddress } from "@/lib/nft-onchain";

export const runtime = "nodejs";

type AdvancedPayload = {
  tokenStandard: string;
  royaltyPct: number;
  maxPerWallet: number;
  revealMode: string;
  revealDate: string;
  allowlistEnabled: boolean;
  presalePrice: string;
  presaleStart: string;
  publicSaleStart: string;
  freezeMetadata: boolean;
};

type TraitPayload = {
  traitType: string;
  values: string;
};

type CreatePayload = {
  metadataId: string;
  address: string;
  creator: string;
  name: string;
  symbol: string;
  description: string;
  image: string | null;
  bannerImage: string | null;
  mintPriceWei: string;
  maxSupply: number;
  website: string | null;
  twitter: string | null;
  telegram: string | null;
  txHash: string;
  advanced: AdvancedPayload | null;
  traits: TraitPayload[] | null;
};

async function rpcCall(method: string, params: unknown[]): Promise<unknown> {
  const response = await fetch(NETWORK.rpcUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
  });
  const payload = await response.json();
  if (payload.error) {
    throw new Error(payload.error.message ?? "RPC error");
  }
  return payload.result;
}

type RawReceipt = {
  status: string;
  logs: { address: string; topics: string[]; data: string }[];
} | null;

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as CreatePayload | null;

  if (
    !body ||
    !body.metadataId ||
    !body.address ||
    !body.txHash ||
    !body.creator ||
    !body.name ||
    !body.symbol
  ) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const collectionAddress = body.address.toLowerCase();
  const creatorAddress = body.creator.toLowerCase();

  let receipt: RawReceipt = null;

  try {
    receipt = (await rpcCall("eth_getTransactionReceipt", [body.txHash])) as RawReceipt;
  } catch {
    return NextResponse.json({ error: "Failed to verify transaction" }, { status: 502 });
  }

  if (!receipt || receipt.status !== "0x1") {
    return NextResponse.json({ error: "Transaction not confirmed" }, { status: 400 });
  }

  const matchingLog = receipt.logs.find(
    (log) =>
      log.address.toLowerCase() === CONTRACT_ADDRESSES.nftFactory.toLowerCase() &&
      log.topics[0]?.toLowerCase() === COLLECTION_CREATED_TOPIC0
  );

  if (!matchingLog) {
    return NextResponse.json({ error: "No collection creation event found" }, { status: 400 });
  }

  const createdCollection = extractCreatedCollectionAddress(
    { status: receipt.status, transactionHash: body.txHash, blockNumber: "0x0", logs: receipt.logs },
    CONTRACT_ADDRESSES.nftFactory
  );

  if (!createdCollection || createdCollection.toLowerCase() !== collectionAddress) {
    return NextResponse.json({ error: "Collection address does not match transaction" }, { status: 400 });
  }

  const creatorTopic = matchingLog.topics[2];
  if (!creatorTopic || `0x${creatorTopic.slice(-40)}`.toLowerCase() !== creatorAddress) {
    return NextResponse.json({ error: "Creator address does not match transaction" }, { status: 400 });
  }

  const record = {
    metadataId: body.metadataId,
    address: collectionAddress,
    creator: creatorAddress,
    name: body.name.slice(0, 32),
    symbol: body.symbol.slice(0, 10).toUpperCase(),
    description: (body.description ?? "").slice(0, 300),
    image: body.image ?? null,
    bannerImage: body.bannerImage ?? null,
    mintPriceWei: body.mintPriceWei ?? "0",
    maxSupply: body.maxSupply ?? 0,
    website: body.website ?? null,
    twitter: body.twitter ?? null,
    telegram: body.telegram ?? null,
    txHash: body.txHash,
    advanced: body.advanced ?? null,
    traits: body.traits ?? [],
    createdAt: Date.now(),
  };

  const db = getAdminDb();
  await db.collection(NFT_COLLECTIONS_COLLECTION).doc(body.metadataId).set(record);

  return NextResponse.json({ ok: true, record });
}
