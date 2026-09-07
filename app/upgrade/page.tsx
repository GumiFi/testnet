import type { Metadata } from "next";
import dynamic from "next/dynamic";
import UpgradePlanSkeleton from "@/components/skeletons/UpgradePlanSkeleton";

const UpgradePlanApp = dynamic(() => import("@/components/upgrade/UpgradePlanApp"), {
  loading: () => <UpgradePlanSkeleton />,
});

export const metadata: Metadata = {
  title: "Upgrade Plan — Gumifi Ecosystem",
  description: "Compare the Free Plan and the Gumi Plan, then mint your permanent .gumi identity NFT.",
};

export default function UpgradePage() {
  return <UpgradePlanApp />;
}
