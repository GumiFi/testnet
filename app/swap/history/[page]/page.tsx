import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import dynamic from "next/dynamic";
import { buildPageParams, parsePageSegment } from "@/lib/pagination";
import SwapHistorySkeleton from "@/components/skeletons/SwapHistorySkeleton";

const SwapHistoryApp = dynamic(() => import("@/components/swap/SwapHistoryApp"), {
  loading: () => <SwapHistorySkeleton />,
});

const STATIC_PAGE_RANGE = 5;
const SANITY_MAX_PAGE = 500;

export const dynamicParams = true;

export function generateStaticParams() {
  return buildPageParams(STATIC_PAGE_RANGE);
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
  if (!pageNumber || pageNumber > SANITY_MAX_PAGE) {
    notFound();
  }

  return (
    <Suspense fallback={<SwapHistorySkeleton />}>
      <SwapHistoryApp />
    </Suspense>
  );
}
