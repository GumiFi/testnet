import type { Metadata } from "next";
import { Suspense } from "react";
import dynamic from "next/dynamic";
import LiquiditySkeleton from "@/components/skeletons/LiquiditySkeleton";
import { LiquidityProvider } from "@/lib/liquidity-context";

const LiquidityApp = dynamic(() => import("@/components/liquidity/LiquidityApp"), {
  loading: () => <LiquiditySkeleton />,
});

export const metadata: Metadata = {
  title: "Liquidity — Gumifi Ecosystem",
  description: "Provide liquidity, earn fees, and manage your positions on GUMIFI.",
};

export default function LiquidityPage() {
  return (
    <LiquidityProvider>
      <Suspense fallback={<LiquiditySkeleton />}>
        <LiquidityApp />
      </Suspense>
    </LiquidityProvider>
  );
}
