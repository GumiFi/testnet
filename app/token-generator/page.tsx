import type { Metadata } from "next";
import dynamic from "next/dynamic";
import TokenGeneratorSkeleton from "@/components/skeletons/TokenGeneratorSkeleton";

const TokenGeneratorApp = dynamic(() => import("@/components/token-generator/TokenGeneratorApp"), {
  loading: () => <TokenGeneratorSkeleton />,
});

export const metadata: Metadata = {
  title: "Token Generator — Gumifi Ecosystem",
  description: "Choose Simple or Advance mode to configure your token on Gumifi.",
};

export default function TokenGeneratorPage() {
  return <TokenGeneratorApp />;
}
