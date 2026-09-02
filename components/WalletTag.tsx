"use client";

import { type SyntheticEvent } from "react";
import { useRouter } from "next/navigation";
import { truncateAddress } from "@/lib/wallet-context";

export default function WalletTag({
  address,
  className = "",
}: {
  address: string;
  className?: string;
}) {
  const router = useRouter();

  function goToProfile(e: SyntheticEvent) {
    e.preventDefault();
    e.stopPropagation();
    router.push(`/profile/${address}`);
  }

  return (
    <span
      role="button"
      tabIndex={0}
      aria-label={`View profile ${address}`}
      onClick={goToProfile}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          goToProfile(e);
        }
      }}
      className={`inline-flex min-w-0 shrink-0 cursor-pointer items-center rounded-full bg-panel2 px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider2 text-bronze ring-1 ring-inset ring-line transition-colors hover:text-ivory hover:ring-gold/50 ${className}`}
    >
      <span className="min-w-0 truncate">{truncateAddress(address)}</span>
    </span>
  );
}
