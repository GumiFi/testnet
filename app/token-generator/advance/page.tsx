import type { Metadata } from "next";
import dynamic from "next/dynamic";
import AdvancedTokenGeneratorSkeleton from "@/components/skeletons/AdvancedTokenGeneratorSkeleton";

const AdvancedTokenGeneratorApp = dynamic(() => import("@/components/token-generator/AdvancedTokenGeneratorApp"), {
  loading: () => <AdvancedTokenGeneratorSkeleton />,
});

export const metadata: Metadata = {
  title: "Advance Mode — Token Generator — Gumifi Ecosystem",
  description: "Fine-tune tokenomics, taxes, mint authority, and advanced contract settings on Gumifi.",
};

export default function AdvancedTokenGeneratorPage() {
  return <AdvancedTokenGeneratorApp />;
}
