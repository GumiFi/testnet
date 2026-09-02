import type { Metadata } from "next";
import dynamic from "next/dynamic";
import SwapSkeleton from "@/components/skeletons/SwapSkeleton";

const SwapApp = dynamic(() => import("@/components/swap/SwapApp"), {
  loading: () => <SwapSkeleton />,
});

export const metadata: Metadata = {
  title: "Swap — Gumifi Ecosystem",
  description: "Trade tokens instantly on GUMIFI.",
};

export default function SwapPage() {
  return <SwapApp />;
}
