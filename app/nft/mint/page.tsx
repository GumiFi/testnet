import type { Metadata } from "next";
import dynamic from "next/dynamic";
import MintNftSkeleton from "@/components/skeletons/MintNftSkeleton";

const MintGumiIdentityApp = dynamic(() => import("@/components/nft/MintGumiIdentityApp"), {
  loading: () => <MintNftSkeleton />,
});

export const metadata: Metadata = {
  title: "Mint Your .gumi Identity — Gumifi Ecosystem",
  description: "Mint your permanent on-chain .gumi identity NFT on Gumifi.",
};

export default function MintNftPage() {
  return <MintGumiIdentityApp />;
}
