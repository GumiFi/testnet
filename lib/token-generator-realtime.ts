import { collection, doc, getDoc, getDocs, query, where } from "firebase/firestore";
import { getClientDb, TOKEN_GENERATOR_TOKENS_COLLECTION } from "./firebase-client";

export type TokenGeneratorKind = "simple" | "advanced";

export type TokenGeneratorTokenRecord = {
  address: string;
  creator: string;
  kind: TokenGeneratorKind;
  name: string;
  symbol: string;
  description: string;
  image: string | null;
  website: string | null;
  twitter: string | null;
  telegram: string | null;
  txHash: string;
  createdAt: number;
};

export async function fetchTokenGeneratorRecords(): Promise<TokenGeneratorTokenRecord[]> {
  const db = getClientDb();
  const snapshot = await getDocs(collection(db, TOKEN_GENERATOR_TOKENS_COLLECTION));
  return snapshot.docs.map((docSnapshot) => docSnapshot.data() as TokenGeneratorTokenRecord);
}

export async function fetchTokenGeneratorRecord(address: string): Promise<TokenGeneratorTokenRecord | null> {
  const db = getClientDb();
  const snapshot = await getDoc(doc(db, TOKEN_GENERATOR_TOKENS_COLLECTION, address.toLowerCase()));
  if (!snapshot.exists()) return null;
  return snapshot.data() as TokenGeneratorTokenRecord;
}

export async function fetchTokenGeneratorRecordsByCreator(address: string): Promise<TokenGeneratorTokenRecord[]> {
  const db = getClientDb();
  const q = query(
    collection(db, TOKEN_GENERATOR_TOKENS_COLLECTION),
    where("creator", "==", address.toLowerCase())
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((docSnapshot) => docSnapshot.data() as TokenGeneratorTokenRecord);
}
