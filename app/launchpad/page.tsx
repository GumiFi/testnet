import type { Metadata } from "next";
import { Suspense } from "react";
import dynamic from "next/dynamic";
import LaunchpadSkeleton from "@/components/skeletons/LaunchpadSkeleton";

const LaunchpadApp = dynamic(() => import("@/components/launchpad/LaunchpadApp"), {
  loading: () => <LaunchpadSkeleton />,
});

export const metadata: Metadata = {
  title: "Launchpad — Gumifi Ecosystem",
  description:
    "Browse every coin minted across the GUMIFI ecosystem, sorted by momentum, volume, and freshness.",
};

export default function LaunchpadPage() {
  return (
    <Suspense fallback={<LaunchpadSkeleton />}>
      <LaunchpadApp />
    </Suspense>
  );
}
