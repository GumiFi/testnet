"use client";

import { useEffect, useState } from "react";
import { DropletIcon } from "@/components/icons";
import { useWallet } from "@/lib/wallet-context";
import { NETWORK } from "@/config/contracts.config";
import { createProviderCaller, createRpcCaller, type EthCaller } from "@/lib/nft-onchain";
import {
  balanceOfCalldata,
  decodeUint256,
  fetchDecimals,
  fetchSymbol,
  formatBaseUnitsToNumber,
  getWethAddress,
} from "@/lib/swap-onchain";
import { fetchPairSides } from "@/lib/lock-liquidity-onchain";
import {
  fetchAllPairAddresses,
  fetchEthUsdRate,
  fetchIsBoostValid,
  fetchRawReserves,
  fetchTotalSupply,
  fetchUserLocks,
  type LockEntry,
  type OnchainPosition,
  type PositionLock,
} from "@/lib/positions-onchain";
import PositionCard from "./PositionCard";

export default function PositionsSection({
  onManage,
  onExplore,
}: {
  onManage: (position: OnchainPosition) => void;
  onExplore: () => void;
}) {
  const { isConnected, connect, address, provider } = useWallet();
  const [positions, setPositions] = useState<OnchainPosition[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [refreshTick, setRefreshTick] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      if (!isConnected || !address) {
        if (!cancelled) {
          setPositions([]);
          setLoading(false);
          setLoadError(null);
        }
        return;
      }

      setLoading(true);
      setLoadError(null);
      try {
        const call: EthCaller = provider ? createProviderCaller(provider) : createRpcCaller(NETWORK.rpcUrl);
        const [wethAddress, pairAddresses, userLocks, ethUsdRate] = await Promise.all([
          getWethAddress(call),
          fetchAllPairAddresses(call),
          fetchUserLocks(call, address),
          fetchEthUsdRate(call),
        ]);
        if (cancelled) return;

        const wethLower = wethAddress?.toLowerCase() ?? null;
        const locksByPair = new Map<string, LockEntry[]>();
        userLocks.forEach((entry) => {
          const key = entry.token.toLowerCase();
          const list = locksByPair.get(key) ?? [];
          list.push(entry);
          locksByPair.set(key, list);
        });

        const built = await Promise.all(
          pairAddresses.map(async (pairAddress): Promise<OnchainPosition | null> => {
            const lockEntries = locksByPair.get(pairAddress.toLowerCase()) ?? [];
            const lockedRaw = lockEntries.reduce(
              (sum, entry) => (entry.withdrawn ? sum : sum + entry.amount),
              0n
            );

            const [sides, walletBalanceRaw, reserves, totalSupplyLp] = await Promise.all([
              fetchPairSides(call, pairAddress),
              call(pairAddress, balanceOfCalldata(address)).then(decodeUint256),
              fetchRawReserves(call, pairAddress),
              fetchTotalSupply(call, pairAddress),
            ]);

            const totalOwnedRaw = walletBalanceRaw + lockedRaw;
            const token0 = sides.token0;
            const token1 = sides.token1;
            if (totalOwnedRaw <= 0n || !token0 || !token1) return null;

            const activeLockEntries = lockEntries.filter((entry) => !entry.withdrawn);
            const [decimals0, decimals1, symbol0Raw, symbol1Raw, boostedResults] = await Promise.all([
              fetchDecimals(call, token0, false),
              fetchDecimals(call, token1, false),
              token0.toLowerCase() === wethLower ? Promise.resolve("ETH") : fetchSymbol(call, token0),
              token1.toLowerCase() === wethLower ? Promise.resolve("ETH") : fetchSymbol(call, token1),
              Promise.all(activeLockEntries.map((entry) => fetchIsBoostValid(call, entry.lockId))),
            ]);

            const boostedMap = new Map<string, boolean>();
            activeLockEntries.forEach((entry, index) => {
              boostedMap.set(entry.lockId.toString(), boostedResults[index] ?? false);
            });

            const isWethPaired = token0.toLowerCase() === wethLower || token1.toLowerCase() === wethLower;
            const shareRatio = totalSupplyLp > 0n ? Number(totalOwnedRaw) / Number(totalSupplyLp) : 0;
            const amount0Owned = formatBaseUnitsToNumber(reserves.reserve0, decimals0) * shareRatio;
            const amount1Owned = formatBaseUnitsToNumber(reserves.reserve1, decimals1) * shareRatio;

            let valueUsd: number | null = null;
            if (isWethPaired && ethUsdRate !== null) {
              const wethSideAmount = token0.toLowerCase() === wethLower ? amount0Owned : amount1Owned;
              valueUsd = wethSideAmount * 2 * ethUsdRate;
            }

            const locks: PositionLock[] = lockEntries.map((entry) => ({
              lockId: entry.lockId,
              amount: entry.amount,
              unlockTime: entry.unlockTime,
              withdrawn: entry.withdrawn,
              boosted: entry.withdrawn ? false : boostedMap.get(entry.lockId.toString()) ?? false,
            }));

            const nextUnlockTime =
              activeLockEntries.length > 0
                ? activeLockEntries.reduce(
                    (min, entry) => (entry.unlockTime < min ? entry.unlockTime : min),
                    activeLockEntries[0].unlockTime
                  )
                : null;

            return {
              pairAddress,
              token0,
              token1,
              symbol0: symbol0Raw || "TOKEN",
              symbol1: symbol1Raw || "TOKEN",
              isWethPaired,
              reserve0: reserves.reserve0,
              reserve1: reserves.reserve1,
              decimals0,
              decimals1,
              totalSupplyLp,
              walletBalanceRaw,
              lockedRaw,
              totalOwnedRaw,
              poolSharePct: shareRatio * 100,
              amount0Owned,
              amount1Owned,
              valueUsd,
              locks,
              nextUnlockTime,
            };
          })
        );

        if (!cancelled) {
          setPositions(built.filter((item): item is OnchainPosition => item !== null));
          setLoading(false);
        }
      } catch (caughtError) {
        if (!cancelled) {
          setLoadError(caughtError instanceof Error ? caughtError.message : "Failed to load positions");
          setLoading(false);
        }
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [isConnected, address, provider, refreshTick]);

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
        ) : loading ? (
          <div className="flex flex-col items-center border border-line bg-panel px-6 py-16 text-center">
            <p className="font-mono text-xs uppercase tracking-wider2 text-bronze">
              Reading Your Positions On-Chain...
            </p>
          </div>
        ) : loadError ? (
          <div className="flex flex-col items-center border border-line bg-panel px-6 py-16 text-center">
            <p className="font-mono text-xs uppercase tracking-wider2 text-garnetLight">{loadError}</p>
            <button
              type="button"
              onClick={() => setRefreshTick((tick) => tick + 1)}
              className="mt-6 border border-gold px-5 py-2.5 font-mono text-[11px] uppercase tracking-wider2 text-goldLight transition-colors hover:bg-gold hover:text-void"
            >
              Retry
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
          <>
            <div className="mb-4 flex justify-end">
              <button
                type="button"
                onClick={() => setRefreshTick((tick) => tick + 1)}
                className="font-mono text-[10px] uppercase tracking-wider2 text-bronze hover:text-ivory"
              >
                Refresh
              </button>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {positions.map((position) => (
                <PositionCard
                  key={position.pairAddress}
                  position={position}
                  onManage={() => onManage(position)}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
