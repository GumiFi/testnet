import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import dynamic from "next/dynamic";
import { creators } from "@/lib/discover-data";
import { getUserProfile, handleToSlug } from "@/lib/user-profile-data";
import ProfileSkeleton from "@/components/skeletons/ProfileSkeleton";

const UserProfileApp = dynamic(() => import("@/components/profile/UserProfileApp"), {
  loading: () => <ProfileSkeleton />,
});

export const dynamicParams = true;

export function generateStaticParams() {
  return creators.map((creator) => ({ handle: handleToSlug(creator.handle) }));
}

export function generateMetadata({ params }: { params: { handle: string } }): Metadata {
  const profile = getUserProfile(params.handle);
  if (!profile) {
    return {
      title: "Profile Not Found — Gumifi Ecosystem",
    };
  }

  return {
    title: `${profile.name} (${profile.handle}) — Gumifi Ecosystem`,
    description: profile.bio,
  };
}

export default function UserProfilePage({ params }: { params: { handle: string } }) {
  if (!getUserProfile(params.handle)) {
    notFound();
  }

  return (
    <Suspense fallback={<ProfileSkeleton />}>
      <UserProfileApp handle={params.handle} />
    </Suspense>
  );
}
