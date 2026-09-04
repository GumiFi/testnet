import { NextRequest, NextResponse } from "next/server";
import { getAdminDb, NFT_COLLECTIONS_COLLECTION } from "@/lib/firebase-admin";

export const runtime = "nodejs";

type CollectionRecord = {
  name: string;
  description: string | null;
  image: string | null;
};

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string; tokenId: string } }
) {
  const db = getAdminDb();
  const snapshot = await db.collection(NFT_COLLECTIONS_COLLECTION).doc(params.id).get();

  if (!snapshot.exists) {
    return NextResponse.json({ error: "Collection not found" }, { status: 404 });
  }

  const record = snapshot.data() as CollectionRecord;

  return NextResponse.json({
    name: `${record.name} #${params.tokenId}`,
    description: record.description ?? "",
    image: record.image ?? null,
    attributes: [],
  });
}
