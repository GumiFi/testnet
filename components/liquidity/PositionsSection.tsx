"use client";

import { DropletIcon } from "@/components/icons";
import { useWallet } from "@/lib/wallet-context";
import { useLiquidity } from "@/lib/liquidity-context";
import PositionCard from "./PositionCard";

export default function PositionsSection({
  onManage,
  onExplore,
}: {
  onManage: (positionId: string) => void;
  onExplore: () => void;
}) {
  const { isConnected, connect } = useWallet();
  const { positions } = useLiquidity();

  return (
    <section className="border-b border-line px-6 py-10">
      <div className="mx-auto max-w-6xl">
        {!isConnected ? (
          <div className="flex flex-col items-center border border-line bg-panel px-6 py-16 text-center">
            <div className="flex h-12 w-12 items-center justify-center border border-gold/50 text-goldLight">
              <DropletIcon className="h-5 w-5" />
            </div>
            <h2 className="mt-5 font-display text-lg uppercase tracking-wider2 text-ivory">
              Your Liquidity Positions
            </h2>
            <p className="mt-2 max-w-xs font-body text-sm text-bronze">
              Connect your wallet to view and manage your positions.
            </p>
            <button
              type="button"
              onClick={connect}
              className="mt-6 border border-gold px-5 py-2.5 font-mono text-[11px] uppercase tracking-wider2 text-goldLight transition-colors hover:bg-gold hover:text-void"
            >
              Connect Wallet
            </button>
          </div>
        ) : positions.length === 0 ? (
          <div className="flex flex-col items-center border border-line bg-panel px-6 py-16 text-center">
            <div className="flex h-12 w-12 items-center justify-center border border-gold/50 text-goldLight">
              <DropletIcon className="h-5 w-5" />
            </div>
            <h2 className="mt-5 font-display text-lg uppercase tracking-wider2 text-ivory">
              No Positions Yet
            </h2>
            <p className="mt-2 max-w-xs font-body text-sm text-bronze">
              Add liquidity to a pool to start earning trading fees.
            </p>
            <button
              type="button"
              onClick={onExplore}
              className="mt-6 border border-gold px-5 py-2.5 font-mono text-[11px] uppercase tracking-wider2 text-goldLight transition-colors hover:bg-gold hover:text-void"
            >
              Explore Pools
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {positions.map((position) => (
              <PositionCard
                key={position.id}
                position={position}
                onManage={() => onManage(position.id)}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
