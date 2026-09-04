import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import dynamic from "next/dynamic";
import { getWalletProfile, normalizeAddressParam } from "@/lib/user-profile-data";
import ProfileSkeleton from "@/components/skeletons/ProfileSkeleton";

const UserProfileApp = dynamic(() => import("@/components/profile/UserProfileApp"), {
  loading: () => <ProfileSkeleton />,
});

export function generateMetadata({ params }: { params: { handle: string } }): Metadata {
  const address = normalizeAddressParam(params.handle);
  if (!address) {
    return {
      title: "Profile Not Found — Gumifi Ecosystem",
    };
  }

  const profile = getWalletProfile(address);
  return {
    title: `${profile.name} — Gumifi Ecosystem`,
    description: `On-chain holdings, launches, NFTs, and activity for ${profile.name} on GUMIFI.`,
  };
}

export default function UserProfilePage({ params }: { params: { handle: string } }) {
  const address = normalizeAddressParam(params.handle);
  if (!address) {
    notFound();
  }

  return (
    <Suspense fallback={<ProfileSkeleton />}>
      <UserProfileApp address={address} />
    </Suspense>
  );
}
