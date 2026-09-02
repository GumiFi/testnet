import type { Metadata } from "next";
import dynamic from "next/dynamic";
import SimpleTokenGeneratorSkeleton from "@/components/skeletons/SimpleTokenGeneratorSkeleton";

const SimpleTokenGeneratorApp = dynamic(() => import("@/components/token-generator/SimpleTokenGeneratorApp"), {
  loading: () => <SimpleTokenGeneratorSkeleton />,
});

export const metadata: Metadata = {
  title: "Simple Mode — Token Generator — Gumifi Ecosystem",
  description: "Launch a standard token in a few quick steps on Gumifi.",
};

export default function SimpleTokenGeneratorPage() {
  return <SimpleTokenGeneratorApp />;
}
