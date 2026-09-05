"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import ComingSoonModal from "@/components/ComingSoonModal";
import LiquiditySuccessModal from "./LiquiditySuccessModal";
import LiquidityHeader from "./LiquidityHeader";
import LiquidityTabs, { type LiquidityTab } from "./LiquidityTabs";
import SectionSkeleton from "@/components/skeletons/SectionSkeleton";
import ModalSkeleton from "@/components/skeletons/ModalSkeleton";
import type { OnchainPosition } from "@/lib/positions-onchain";
import type { OnchainPool } from "@/lib/pools-onchain";

const CreateLiquiditySection = dynamic(() => import("./CreateLiquiditySection"), {
  loading: () => <SectionSkeleton />,
});
const LockLiquiditySection = dynamic(() => import("./LockLiquiditySection"), {
  loading: () => <SectionSkeleton />,
});
const PositionsSection = dynamic(() => import("./PositionsSection"), {
  loading: () => <SectionSkeleton />,
});
const ExplorePoolsSection = dynamic(() => import("./ExplorePoolsSection"), {
  loading: () => <SectionSkeleton />,
});
const PoolDetailModal = dynamic(() => import("./PoolDetailModal"), {
  loading: () => <ModalSkeleton />,
});
const ManagePositionModal = dynamic(() => import("./ManagePositionModal"), {
  loading: () => <ModalSkeleton />,
});

const validTabs: LiquidityTab[] = ["create", "lock", "positions", "explore"];

type SuccessState = {
  title: string;
  message: string;
  primaryLabel?: string;
  onPrimary?: () => void;
};

export default function LiquidityApp() {
  const searchParams = useSearchParams();
  const requestedTab = searchParams.get("tab");
  const initialTab: LiquidityTab = validTabs.includes(requestedTab as LiquidityTab)
    ? (requestedTab as LiquidityTab)
    : "positions";

  const [tab, setTab] = useState<LiquidityTab>(initialTab);
  const [selectedPool, setSelectedPool] = useState<OnchainPool | null>(null);
  const [managePosition, setManagePosition] = useState<OnchainPosition | null>(null);
  const [comingSoon, setComingSoon] = useState<string | null>(null);
  const [success, setSuccess] = useState<SuccessState | null>(null);

  return (
    <div>
      <LiquidityHeader />
      <LiquidityTabs active={tab} onChange={setTab} />

      {tab === "create" && (
        <CreateLiquiditySection
          onCreated={() =>
            setSuccess({
              title: "Liquidity Added",
              message: "Your position is live. Lock it now to boost its APR.",
              primaryLabel: "Lock Liquidity",
              onPrimary: () => {
                setTab("lock");
                setSuccess(null);
              },
            })
          }
        />
      )}
      {tab === "lock" && (
        <LockLiquiditySection
          onExplore={() => setTab("explore")}
          onLocked={(unlockDateLabel) =>
            setSuccess({
              title: "Liquidity Locked",
              message: `Your position is locked and boosted. Unlocks on ${unlockDateLabel}.`,
              primaryLabel: "View My Positions",
              onPrimary: () => {
                setTab("positions");
                setSuccess(null);
              },
            })
          }
        />
      )}
      {tab === "positions" && (
        <PositionsSection onManage={setManagePosition} onExplore={() => setTab("explore")} />
      )}
      {tab === "explore" && <ExplorePoolsSection onSelectPool={setSelectedPool} />}

      {selectedPool && (
        <PoolDetailModal
          pool={selectedPool}
          onClose={() => setSelectedPool(null)}
          onAction={setComingSoon}
        />
      )}

      {managePosition && (
        <ManagePositionModal
          position={managePosition}
          onClose={() => setManagePosition(null)}
          onAction={setComingSoon}
        />
      )}

      {comingSoon && <ComingSoonModal label={comingSoon} onClose={() => setComingSoon(null)} />}
      {success && (
        <LiquiditySuccessModal
          title={success.title}
          message={success.message}
          primaryLabel={success.primaryLabel}
          onPrimary={success.onPrimary}
          onClose={() => setSuccess(null)}
        />
      )}
    </div>
  );
}
