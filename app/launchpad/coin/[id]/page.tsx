import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import dynamic from "next/dynamic";
import { launchpadCoins, getLaunchpadCoinDetail } from "@/lib/launchpad-data";
import LaunchpadCoinDetailSkeleton from "@/components/skeletons/LaunchpadCoinDetailSkeleton";

const CoinDetailApp = dynamic(() => import("@/components/launchpad/coin/CoinDetailApp"), {
  loading: () => <LaunchpadCoinDetailSkeleton />,
});

export const dynamicParams = false;

export function generateStaticParams() {
  return launchpadCoins.map((coin) => ({ id: coin.id }));
}

export function generateMetadata({ params }: { params: { id: string } }): Metadata {
  const detail = getLaunchpadCoinDetail(params.id);
  if (!detail) {
    return {
      title: "Coin Not Found — Gumifi Ecosystem",
    };
  }

  return {
    title: `${detail.name} (${detail.symbol}) — Gumifi Launchpad`,
    description: detail.description,
  };
}

export default function LaunchpadCoinPage({ params }: { params: { id: string } }) {
  if (!getLaunchpadCoinDetail(params.id)) {
    notFound();
  }

  return (
    <Suspense fallback={<LaunchpadCoinDetailSkeleton />}>
      <CoinDetailApp id={params.id} />
    </Suspense>
  );
}
