import { NextResponse } from "next/server";
import {
  getAdminDb,
  ETH_ORACLE_CACHE_COLLECTION,
  ETH_ORACLE_CACHE_DOC_ID,
} from "@/lib/firebase-admin";
import { CONTRACT_ADDRESSES, NETWORK } from "@/config/contracts.config";

export const runtime = "nodejs";

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

function decodeOracleRate(raw: unknown): number | null {
  if (typeof raw !== "string" || raw === "0x") return null;
  try {
    const rate = BigInt(raw);
    if (rate <= 0n) return null;
    return Number(rate) / 1e18;
  } catch {
    return null;
  }
}

type CachedRate = { rateUsd: number; updatedAt: number };

export async function GET() {
  const db = getAdminDb();
  const docRef = db.collection(ETH_ORACLE_CACHE_COLLECTION).doc(ETH_ORACLE_CACHE_DOC_ID);

  let onchainRate: number | null = null;
  try {
    const raw = await rpcCall("eth_call", [
      { to: CONTRACT_ADDRESSES.priceOracle, data: "0x679aefce" },
      "latest",
    ]);
    onchainRate = decodeOracleRate(raw);
  } catch {
    onchainRate = null;
  }

  if (onchainRate != null) {
    const record: CachedRate = { rateUsd: onchainRate, updatedAt: Date.now() };
    await docRef.set(record);
    return NextResponse.json({ ok: true, source: "onchain", ...record });
  }

  const existing = await docRef.get();
  if (existing.exists) {
    const cached = existing.data() as CachedRate;
    return NextResponse.json({ ok: true, source: "cache", stale: true, ...cached });
  }

  return NextResponse.json(
    { ok: false, error: "ETH oracle tidak tersedia dan belum ada data cache" },
    { status: 502 }
  );
}
