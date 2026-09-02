"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import dynamic from "next/dynamic";
import DiscoverHeader from "./DiscoverHeader";
import TrendingSection from "./TrendingSection";
import NewLaunchesSection from "./NewLaunchesSection";
import ComingSoonModal from "@/components/ComingSoonModal";
import SectionSkeleton from "@/components/skeletons/SectionSkeleton";
import LazyOnView from "@/components/LazyOnView";

const SearchResults = dynamic(() => import("./SearchResults"), {
  loading: () => <SectionSkeleton />,
});

const FeaturedSection = dynamic(() => import("./FeaturedSection"), {
  loading: () => <SectionSkeleton />,
});
const NftSection = dynamic(() => import("./NftSection"), {
  loading: () => <SectionSkeleton />,
});
const PoolsSection = dynamic(() => import("./PoolsSection"), {
  loading: () => <SectionSkeleton />,
});
const CreatorsSection = dynamic(() => import("./CreatorsSection"), {
  loading: () => <SectionSkeleton />,
});

export default function DiscoverApp() {
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(() => searchParams.get("q") ?? "");
  const [comingSoon, setComingSoon] = useState<string | null>(null);

  const isSearching = query.trim().length > 0;

  return (
    <div>
      <DiscoverHeader query={query} onQueryChange={setQuery} />

      {isSearching ? (
        <SearchResults query={query} onAction={setComingSoon} />
      ) : (
        <>
          <TrendingSection onAction={setComingSoon} />
          <NewLaunchesSection onAction={setComingSoon} />
          <LazyOnView fallback={<SectionSkeleton />}>
            <FeaturedSection onAction={setComingSoon} />
          </LazyOnView>
          <LazyOnView fallback={<SectionSkeleton />}>
            <NftSection onAction={setComingSoon} />
          </LazyOnView>
          <LazyOnView fallback={<SectionSkeleton />}>
            <PoolsSection onAction={setComingSoon} />
          </LazyOnView>
          <LazyOnView fallback={<SectionSkeleton />}>
            <CreatorsSection />
          </LazyOnView>
        </>
      )}

      {comingSoon && <ComingSoonModal label={comingSoon} onClose={() => setComingSoon(null)} />}
    </div>
  );
}
