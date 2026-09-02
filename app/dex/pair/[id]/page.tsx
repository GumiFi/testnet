import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import dynamic from "next/dynamic";
import { dexPairs, getDexPairById } from "@/lib/dex-data";
import PairDetailSkeleton from "@/components/skeletons/PairDetailSkeleton";

const PairDetailApp = dynamic(() => import("@/components/dex/PairDetailApp"), {
  loading: () => <PairDetailSkeleton />,
});

export const dynamicParams = false;

export function generateStaticParams() {
  return dexPairs.map((pair) => ({ id: pair.id }));
}

export function generateMetadata({ params }: { params: { id: string } }): Metadata {
  const pair = getDexPairById(params.id);
  if (!pair) {
    return {
      title: "Pair Not Found — Gumifi Ecosystem",
    };
  }

  return {
    title: `${pair.symbol} / ETH — Gumifi Ecosystem`,
    description: `Live price, liquidity, and trading activity for ${pair.name} (${pair.symbol}) on the GUMIFI Dex.`,
  };
}

export default function DexPairPage({ params }: { params: { id: string } }) {
  if (!getDexPairById(params.id)) {
    notFound();
  }

  return (
    <Suspense fallback={<PairDetailSkeleton />}>
      <PairDetailApp id={params.id} />
    </Suspense>
  );
}
