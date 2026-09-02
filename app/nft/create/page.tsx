import type { Metadata } from "next";
import dynamic from "next/dynamic";
import CreateNftSkeleton from "@/components/skeletons/CreateNftSkeleton";

const CreateNftApp = dynamic(() => import("@/components/nft/CreateNftApp"), {
  loading: () => <CreateNftSkeleton />,
});

export const metadata: Metadata = {
  title: "Create NFT Collection — Gumifi Ecosystem",
  description: "Configure and preview your NFT collection on Gumifi before it goes live.",
};

export default function CreateNftPage() {
  return <CreateNftApp />;
}
