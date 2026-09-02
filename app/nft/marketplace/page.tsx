import type { Metadata } from "next";
import { Suspense } from "react";
import dynamic from "next/dynamic";
import NftMarketplaceSkeleton from "@/components/skeletons/NftMarketplaceSkeleton";

const NftMarketplaceApp = dynamic(() => import("@/components/nft/NftMarketplaceApp"), {
  loading: () => <NftMarketplaceSkeleton />,
});

export const metadata: Metadata = {
  title: "NFT Marketplace — Gumifi Ecosystem",
  description: "Browse live NFT collections across the GUMIFI ecosystem by trend, volume, and freshness.",
};

export default function NftMarketplacePage() {
  return (
    <Suspense fallback={<NftMarketplaceSkeleton />}>
      <NftMarketplaceApp />
    </Suspense>
  );
}
