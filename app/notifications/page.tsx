import type { Metadata } from "next";
import { Suspense } from "react";
import dynamic from "next/dynamic";
import NotificationsSkeleton from "@/components/skeletons/NotificationsSkeleton";

const NotificationCenterApp = dynamic(
  () => import("@/components/notifications/NotificationCenterApp"),
  {
    loading: () => <NotificationsSkeleton />,
  }
);

export const metadata: Metadata = {
  title: "Notifications — Gumifi Ecosystem",
  description:
    "Track transactions, launches, liquidity changes, NFT activity, and rewards across Gumifi Ecosystem.",
};

export default function NotificationsPage() {
  return (
    <Suspense fallback={<NotificationsSkeleton />}>
      <NotificationCenterApp />
    </Suspense>
  );
}
