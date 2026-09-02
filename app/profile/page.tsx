import type { Metadata } from "next";
import { Suspense } from "react";
import dynamic from "next/dynamic";
import ProfileSkeleton from "@/components/skeletons/ProfileSkeleton";

const ProfileApp = dynamic(() => import("@/components/profile/ProfileApp"), {
  loading: () => <ProfileSkeleton />,
});

export const metadata: Metadata = {
  title: "Profile — Gumifi Ecosystem",
  description: "View your wallet profile, holdings, launches, and activity on GUMIFI.",
};

export default function ProfilePage() {
  return (
    <Suspense fallback={<ProfileSkeleton />}>
      <ProfileApp />
    </Suspense>
  );
}
