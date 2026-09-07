import type { Metadata } from "next";
import { Suspense } from "react";
import dynamic from "next/dynamic";
import { getDexPairById } from "@/lib/dex-data";
import PairDetailSkeleton from "@/components/skeletons/PairDetailSkeleton";

const PairDetailApp = dynamic(() => import("@/components/dex/PairDetailApp"), {
  loading: () => <PairDetailSkeleton />,
});

export const dynamicParams = true;

export function generateStaticParams() {
  return [];
}

export function generateMetadata({ params }: { params: { id: string } }): Metadata {
  const pair = getDexPairById(params.id);
  if (!pair) {
    return {
      title: "Gumifi Dex — Gumifi Ecosystem",
      description: "Screen every live trading pair across the GUMIFI ecosystem by trend, volume, and freshness.",
    };
  }

  return {
    title: `${pair.symbol} / ${pair.quoteSymbol} — Gumifi Ecosystem`,
    description: `Live price, liquidity, and trading activity for ${pair.name} (${pair.symbol}) on the GUMIFI Dex.`,
  };
}

export default function DexPairPage({ params }: { params: { id: string } }) {
  return (
    <Suspense fallback={<PairDetailSkeleton />}>
      <PairDetailApp id={params.id} />
    </Suspense>
  );
}
