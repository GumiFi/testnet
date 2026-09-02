import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import dynamic from "next/dynamic";
import { PAIRS_PER_PAGE, TOTAL_PAIRS } from "@/lib/dex-data";
import { buildPageParams, parsePageSegment } from "@/lib/pagination";
import DexSkeleton from "@/components/skeletons/DexSkeleton";

const DexApp = dynamic(() => import("@/components/dex/DexApp"), {
  loading: () => <DexSkeleton />,
});

const MAX_PAGE = Math.ceil(TOTAL_PAIRS / PAIRS_PER_PAGE);

export const dynamicParams = false;

export function generateStaticParams() {
  return buildPageParams(MAX_PAGE);
}

export function generateMetadata({ params }: { params: { page: string } }): Metadata {
  const pageNumber = parsePageSegment(params.page) ?? 1;
  return {
    title: `Dex — Page ${pageNumber} — Gumifi Ecosystem`,
    description:
      "Screen every live trading pair across the GUMIFI ecosystem by trend, volume, and freshness.",
  };
}

export default function DexPagedPage({ params }: { params: { page: string } }) {
  const pageNumber = parsePageSegment(params.page);
  if (!pageNumber || pageNumber > MAX_PAGE) {
    notFound();
  }

  return (
    <Suspense fallback={<DexSkeleton />}>
      <DexApp />
    </Suspense>
  );
}
