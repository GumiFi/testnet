import { NextRequest, NextResponse } from "next/server";
import { getAdminDb, TOKEN_GENERATOR_TOKENS_COLLECTION } from "@/lib/firebase-admin";
import { CONTRACT_ADDRESSES, NETWORK } from "@/config/contracts.config";
import { SIMPLE_TOKEN_CREATED_TOPIC0, extractCreatedSimpleTokenAddress } from "@/lib/token-onchain";
import { ADVANCED_TOKEN_CREATED_TOPIC0, extractCreatedAdvancedTokenAddress } from "@/lib/advanced-token-onchain";

export const runtime = "nodejs";

type Kind = "simple" | "advanced";

type CreatePayload = {
  address: string;
  creator: string;
  kind: Kind;
  name: string;
  symbol: string;
  description: string;
  image: string | null;
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

type RawReceipt = {
  status: string;
  logs: { address: string; topics: string[]; data: string }[];
} | null;

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as CreatePayload | null;

  if (
    !body ||
    !body.address ||
    !body.txHash ||
    !body.creator ||
    !body.name ||
    !body.symbol ||
    (body.kind !== "simple" && body.kind !== "advanced")
  ) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const tokenAddress = body.address.toLowerCase();
  const creatorAddress = body.creator.toLowerCase();
  const factoryAddress =
    body.kind === "simple" ? CONTRACT_ADDRESSES.simpleTokenFactory : CONTRACT_ADDRESSES.advancedTokenFactory;
  const topic0 = body.kind === "simple" ? SIMPLE_TOKEN_CREATED_TOPIC0 : ADVANCED_TOKEN_CREATED_TOPIC0;

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
    (log) => log.address.toLowerCase() === factoryAddress.toLowerCase() && log.topics[0]?.toLowerCase() === topic0
  );

  if (!matchingLog) {
    return NextResponse.json({ error: "No token generator creation event found" }, { status: 400 });
  }

  const receiptShape = { status: receipt.status, transactionHash: body.txHash, blockNumber: "0x0", logs: receipt.logs };

  const createdToken =
    body.kind === "simple"
      ? extractCreatedSimpleTokenAddress(receiptShape, factoryAddress)
      : extractCreatedAdvancedTokenAddress(receiptShape, factoryAddress);

  if (!createdToken || createdToken.toLowerCase() !== tokenAddress) {
    return NextResponse.json({ error: "Token address does not match transaction" }, { status: 400 });
  }

  const record = {
    address: tokenAddress,
    creator: creatorAddress,
    kind: body.kind,
    name: body.name.slice(0, 32),
    symbol: body.symbol.slice(0, 10).toUpperCase(),
    description: (body.description ?? "").slice(0, 300),
    image: body.image ?? null,
    website: body.website ?? null,
    twitter: body.twitter ?? null,
    telegram: body.telegram ?? null,
    txHash: body.txHash,
    createdAt: Date.now(),
  };

  const db = getAdminDb();
  await db.collection(TOKEN_GENERATOR_TOKENS_COLLECTION).doc(tokenAddress).set(record);

  return NextResponse.json({ ok: true, record });
}
