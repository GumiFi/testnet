import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import dynamic from "next/dynamic";
import { SWAP_HISTORY_PAGE_SIZE, TOTAL_SWAP_HISTORY } from "@/lib/swap-data";
import { buildPageParams, parsePageSegment } from "@/lib/pagination";
import SwapHistorySkeleton from "@/components/skeletons/SwapHistorySkeleton";

const SwapHistoryApp = dynamic(() => import("@/components/swap/SwapHistoryApp"), {
  loading: () => <SwapHistorySkeleton />,
});

const MAX_PAGE = Math.ceil(TOTAL_SWAP_HISTORY / SWAP_HISTORY_PAGE_SIZE);

export const dynamicParams = false;

export function generateStaticParams() {
  return buildPageParams(MAX_PAGE);
}

export function generateMetadata({ params }: { params: { page: string } }): Metadata {
  const pageNumber = parsePageSegment(params.page) ?? 1;
  return {
    title: `Transaction History — Page ${pageNumber} — Gumifi Ecosystem`,
    description: "Browse your full swap transaction history on GUMIFI.",
  };
}

export default function SwapHistoryPagedPage({ params }: { params: { page: string } }) {
  const pageNumber = parsePageSegment(params.page);
  if (!pageNumber || pageNumber > MAX_PAGE) {
    notFound();
  }

  return (
    <Suspense fallback={<SwapHistorySkeleton />}>
      <SwapHistoryApp />
    </Suspense>
  );
}
