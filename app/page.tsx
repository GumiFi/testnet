import type { Metadata } from "next";
import { Suspense } from "react";
import dynamic from "next/dynamic";
import DiscoverSkeleton from "@/components/skeletons/DiscoverSkeleton";

const DiscoverApp = dynamic(() => import("@/components/discover/DiscoverApp"), {
  loading: () => <DiscoverSkeleton />,
});

export const metadata: Metadata = {
  title: "Discover — Gumifi Ecosystem",
  description:
    "Explore trending tokens, new launchpad projects, NFT collections, liquidity pools, and top creators across the GUMIFI ecosystem.",
};

export default function Page() {
  return (
    <Suspense fallback={<DiscoverSkeleton />}>
      <DiscoverApp />
    </Suspense>
  );
}
