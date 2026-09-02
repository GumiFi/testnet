import type { Metadata } from "next";
import { Suspense } from "react";
import dynamic from "next/dynamic";
import DexSkeleton from "@/components/skeletons/DexSkeleton";

const DexApp = dynamic(() => import("@/components/dex/DexApp"), {
  loading: () => <DexSkeleton />,
});

export const metadata: Metadata = {
  title: "Dex — Gumifi Ecosystem",
  description: "Screen every live trading pair across the GUMIFI ecosystem by trend, volume, and freshness.",
};

export default function DexPage() {
  return (
    <Suspense fallback={<DexSkeleton />}>
      <DexApp />
    </Suspense>
  );
}
