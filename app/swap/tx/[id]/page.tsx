import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import dynamic from "next/dynamic";
import { getSwapHistoryById, getSwapTokenById, swapHistory } from "@/lib/swap-data";
import SwapTxSkeleton from "@/components/skeletons/SwapTxSkeleton";

const SwapTxDetailApp = dynamic(() => import("@/components/swap/SwapTxDetailApp"), {
  loading: () => <SwapTxSkeleton />,
});

export const dynamicParams = false;

export function generateStaticParams() {
  return swapHistory.map((item) => ({ id: item.id }));
}

export function generateMetadata({ params }: { params: { id: string } }): Metadata {
  const item = getSwapHistoryById(params.id);
  if (!item) {
    return {
      title: "Transaction Not Found — Gumifi Ecosystem",
    };
  }

  const fromToken = getSwapTokenById(item.fromId);
  const toToken = getSwapTokenById(item.toId);

  return {
    title: `${fromToken?.symbol ?? "Token"} → ${toToken?.symbol ?? "Token"} Swap — Gumifi Ecosystem`,
    description: "Full details for this GUMIFI swap transaction.",
  };
}

export default function SwapTxPage({ params }: { params: { id: string } }) {
  if (!getSwapHistoryById(params.id)) {
    notFound();
  }

  return (
    <Suspense fallback={<SwapTxSkeleton />}>
      <SwapTxDetailApp id={params.id} />
    </Suspense>
  );
}
