import { collection, getDocs, query, where } from "firebase/firestore";
import { getClientDb, NFT_COLLECTIONS_COLLECTION } from "./firebase-client";

export type NftCollectionRecord = {
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
  createdAt: number;
};

export async function fetchNftCollectionRecordsByCreator(address: string): Promise<NftCollectionRecord[]> {
  const db = getClientDb();
  const q = query(
    collection(db, NFT_COLLECTIONS_COLLECTION),
    where("creator", "==", address.toLowerCase())
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((docSnapshot) => docSnapshot.data() as NftCollectionRecord);
}
