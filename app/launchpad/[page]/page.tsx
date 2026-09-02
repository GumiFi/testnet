import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import dynamic from "next/dynamic";
import { COINS_PER_PAGE, TOTAL_COINS } from "@/lib/launchpad-data";
import { buildPageParams, parsePageSegment } from "@/lib/pagination";
import LaunchpadSkeleton from "@/components/skeletons/LaunchpadSkeleton";

const LaunchpadApp = dynamic(() => import("@/components/launchpad/LaunchpadApp"), {
  loading: () => <LaunchpadSkeleton />,
});

const MAX_PAGE = Math.ceil(TOTAL_COINS / COINS_PER_PAGE);

export const dynamicParams = false;

export function generateStaticParams() {
  return buildPageParams(MAX_PAGE);
}

export function generateMetadata({ params }: { params: { page: string } }): Metadata {
  const pageNumber = parsePageSegment(params.page) ?? 1;
  return {
    title: `Launchpad — Page ${pageNumber} — Gumifi Ecosystem`,
    description:
      "Browse every coin minted across the GUMIFI ecosystem, sorted by momentum, volume, and freshness.",
  };
}

export default function LaunchpadPagedPage({ params }: { params: { page: string } }) {
  const pageNumber = parsePageSegment(params.page);
  if (!pageNumber || pageNumber > MAX_PAGE) {
    notFound();
  }

  return (
    <Suspense fallback={<LaunchpadSkeleton />}>
      <LaunchpadApp />
    </Suspense>
  );
}
