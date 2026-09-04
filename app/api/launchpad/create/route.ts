import { NextRequest, NextResponse } from "next/server";
import { getAdminDb, LAUNCHPAD_COINS_COLLECTION } from "@/lib/firebase-admin";
import { CONTRACT_ADDRESSES, NETWORK } from "@/config/contracts.config";
import { COIN_CREATED_TOPIC0, extractCreatedCoinAddress } from "@/lib/launchpad-onchain";

export const runtime = "nodejs";

type CreatePayload = {
  address: string;
  creator: string;
  name: string;
  symbol: string;
  description: string;
  image: string | null;
  bannerImage: string | null;
  website: string | null;
  twitter: string | null;
  telegram: string | null;
  txHash: string;
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

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as CreatePayload | null;

  if (!body || !body.address || !body.txHash || !body.creator || !body.name || !body.symbol) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const tokenAddress = body.address.toLowerCase();
  const creatorAddress = body.creator.toLowerCase();

  let receipt: {
    status: string;
    logs: { address: string; topics: string[]; data: string }[];
  } | null = null;

  try {
    receipt = (await rpcCall("eth_getTransactionReceipt", [body.txHash])) as typeof receipt;
  } catch {
    return NextResponse.json({ error: "Failed to verify transaction" }, { status: 502 });
  }

  if (!receipt || receipt.status !== "0x1") {
    return NextResponse.json({ error: "Transaction not confirmed" }, { status: 400 });
  }

  const matchingLog = receipt.logs.find(
    (log) =>
      log.address.toLowerCase() === CONTRACT_ADDRESSES.launchpadFactory.toLowerCase() &&
      log.topics[0]?.toLowerCase() === COIN_CREATED_TOPIC0
  );

  if (!matchingLog) {
    return NextResponse.json({ error: "No launchpad creation event found" }, { status: 400 });
  }

  const createdToken = extractCreatedCoinAddress(
    { status: receipt.status, transactionHash: body.txHash, blockNumber: "0x0", logs: receipt.logs },
    CONTRACT_ADDRESSES.launchpadFactory
  );

  if (!createdToken || createdToken.toLowerCase() !== tokenAddress) {
    return NextResponse.json({ error: "Token address does not match transaction" }, { status: 400 });
  }

  const creatorTopic = matchingLog.topics[2];
  if (!creatorTopic || `0x${creatorTopic.slice(-40)}`.toLowerCase() !== creatorAddress) {
    return NextResponse.json({ error: "Creator address does not match transaction" }, { status: 400 });
  }

  const record = {
    address: tokenAddress,
    creator: creatorAddress,
    name: body.name.slice(0, 32),
    symbol: body.symbol.slice(0, 10).toUpperCase(),
    description: (body.description ?? "").slice(0, 300),
    image: body.image ?? null,
    bannerImage: body.bannerImage ?? null,
    website: body.website ?? null,
    twitter: body.twitter ?? null,
    telegram: body.telegram ?? null,
    txHash: body.txHash,
    createdAt: Date.now(),
  };

  const db = getAdminDb();
  await db.collection(LAUNCHPAD_COINS_COLLECTION).doc(tokenAddress).set(record);

  return NextResponse.json({ ok: true, record });
}
