import type { Metadata } from "next";
import { Suspense } from "react";
import dynamic from "next/dynamic";
import SwapHistorySkeleton from "@/components/skeletons/SwapHistorySkeleton";

const SwapHistoryApp = dynamic(() => import("@/components/swap/SwapHistoryApp"), {
  loading: () => <SwapHistorySkeleton />,
});

export const metadata: Metadata = {
  title: "Transaction History — Gumifi Ecosystem",
  description: "Browse your full swap transaction history on GUMIFI.",
};

export default function SwapHistoryPage() {
  return (
    <Suspense fallback={<SwapHistorySkeleton />}>
      <SwapHistoryApp />
    </Suspense>
  );
}
