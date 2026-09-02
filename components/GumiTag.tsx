"use client";

import { type SyntheticEvent } from "react";
import { useRouter } from "next/navigation";
import { CrownIcon } from "@/components/icons";
import { handleToSlug } from "@/lib/user-profile-data";

export default function GumiTag({
  handle,
  className = "",
}: {
  handle: string;
  className?: string;
}) {
  const router = useRouter();

  function goToProfile(e: SyntheticEvent) {
    e.preventDefault();
    e.stopPropagation();
    router.push(`/profile/${handleToSlug(handle)}`);
  }

  return (
    <span
      role="button"
      tabIndex={0}
      aria-label={`View profile ${handle}`}
      onClick={goToProfile}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          goToProfile(e);
        }
      }}
      className={`inline-flex min-w-0 shrink-0 cursor-pointer items-center gap-1 rounded-full bg-gradient-to-r from-goldDim/25 via-panel2 to-goldDim/25 px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider2 text-goldLight shadow-[0_0_5px_rgba(201,162,39,0.35)] ring-1 ring-inset ring-gold/50 transition-colors hover:text-ivory hover:ring-gold ${className}`}
    >
      <span className="min-w-0 truncate">{handle}</span>
      <CrownIcon className="h-2.5 w-2.5 shrink-0 text-goldLight" />
    </span>
  );
}
