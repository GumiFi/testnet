import type { Metadata } from "next";
import dynamic from "next/dynamic";
import CreateCoinSkeleton from "@/components/skeletons/CreateCoinSkeleton";
import { LiquidityProvider } from "@/lib/liquidity-context";

const CreateCoinApp = dynamic(() => import("@/components/launchpad/CreateCoinApp"), {
  loading: () => <CreateCoinSkeleton />,
});

export const metadata: Metadata = {
  title: "Create Coin — Gumifi Ecosystem",
  description: "Create and launch your token on Giwa Chain with the GUMIFI Launchpad.",
};

export default function CreateCoinPage() {
  return (
    <LiquidityProvider>
      <CreateCoinApp />
    </LiquidityProvider>
  );
}
