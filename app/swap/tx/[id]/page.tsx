import type { Metadata } from "next";
import { Suspense } from "react";
import dynamic from "next/dynamic";
import SwapTxSkeleton from "@/components/skeletons/SwapTxSkeleton";

const SwapTxDetailApp = dynamic(() => import("@/components/swap/SwapTxDetailApp"), {
  loading: () => <SwapTxSkeleton />,
});

export const dynamicParams = true;

export function generateStaticParams() {
  return [];
}

export const metadata: Metadata = {
  title: "Swap Transaction — Gumifi Ecosystem",
  description: "Full details for this GUMIFI swap transaction.",
};

export default function SwapTxPage({ params }: { params: { id: string } }) {
  return (
    <Suspense fallback={<SwapTxSkeleton />}>
      <SwapTxDetailApp id={params.id} />
    </Suspense>
  );
}
