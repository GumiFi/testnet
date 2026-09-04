import type { Metadata } from "next";
import { Suspense } from "react";
import dynamic from "next/dynamic";
import { getLaunchpadCoinDetail } from "@/lib/launchpad-data";
import { fetchRealLaunchpadCoin } from "@/lib/launchpad-realtime";
import LaunchpadCoinDetailSkeleton from "@/components/skeletons/LaunchpadCoinDetailSkeleton";

const CoinDetailApp = dynamic(() => import("@/components/launchpad/coin/CoinDetailApp"), {
  loading: () => <LaunchpadCoinDetailSkeleton />,
});

const ADDRESS_PATTERN = /^0x[0-9a-fA-F]{40}$/;

export const dynamicParams = true;

export function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  let detail = getLaunchpadCoinDetail(params.id);

  if (!detail && ADDRESS_PATTERN.test(params.id)) {
    const coin = await fetchRealLaunchpadCoin(params.id).catch(() => null);
    if (coin) detail = getLaunchpadCoinDetail(coin.id, coin);
  }

  if (!detail) {
    return {
      title: "Gumifi Launchpad — Gumifi Ecosystem",
    };
  }

  return {
    title: `${detail.name} (${detail.symbol}) — Gumifi Launchpad`,
    description: detail.description,
  };
}

export default function LaunchpadCoinPage({ params }: { params: { id: string } }) {
  return (
    <Suspense fallback={<LaunchpadCoinDetailSkeleton />}>
      <CoinDetailApp id={params.id} />
    </Suspense>
  );
}
