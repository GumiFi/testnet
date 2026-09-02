"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  liquidityPools as seedPools,
  myLiquidityPositions as seedPositions,
  type LiquidityPool,
  type LiquidityPosition,
} from "./liquidity-data";
import { swapTokens as seedSwapTokens, type SwapToken } from "./swap-data";
import type { Accent } from "./discover-data";

const ACCENTS: Accent[] = ["gold", "emerald", "garnet"];

let idSeed = 0;
function nextId(prefix: string): string {
  idSeed += 1;
  return `${prefix}-${Date.now().toString(36)}-${idSeed}`;
}

function monogramFor(symbol: string): string {
  const clean = symbol.trim().toUpperCase();
  return clean.slice(0, 2).padEnd(2, clean.charAt(0) || "T");
}

export type LaunchTokenInput = {
  name: string;
  symbol: string;
  buyInEth: number;
};

export type AddLiquidityInput = {
  tokenAId: string;
  tokenBId: string;
  amountA: number;
  amountB: number;
  feeTier: string;
};

type LiquidityContextValue = {
  pools: LiquidityPool[];
  positions: LiquidityPosition[];
  tokens: SwapToken[];
  myLaunchedTokenIds: string[];
  getPoolById: (id: string) => LiquidityPool | undefined;
  launchToken: (input: LaunchTokenInput) => { tokenId: string; poolId: string; positionId: string };
  addLiquidity: (input: AddLiquidityInput) => { poolId: string; positionId: string };
  lockPosition: (positionId: string, durationDays: number, boostMultiplier: number) => void;
};

const LiquidityContext = createContext<LiquidityContextValue | null>(null);

export function LiquidityProvider({ children }: { children: ReactNode }) {
  const [pools, setPools] = useState<LiquidityPool[]>(seedPools);
  const [positions, setPositions] = useState<LiquidityPosition[]>(seedPositions);
  const [tokens, setTokens] = useState<SwapToken[]>(seedSwapTokens);
  const [myLaunchedTokenIds, setMyLaunchedTokenIds] = useState<string[]>([]);

  const getPoolById = useCallback((id: string) => pools.find((pool) => pool.id === id), [pools]);

  const launchToken = useCallback(({ name, symbol, buyInEth }: LaunchTokenInput) => {
    const tokenId = nextId("tok");
    const accent = ACCENTS[Math.floor(Math.random() * ACCENTS.length)];
    const monogram = monogramFor(symbol);
    const ethPriceUsd = seedSwapTokens.find((token) => token.id === "eth")?.priceUsd ?? 4200;
    const buyInUsd = Math.max(buyInEth, 0) * ethPriceUsd;

    const newToken: SwapToken = {
      id: tokenId,
      symbol: symbol.trim().toUpperCase(),
      name: name.trim(),
      monogram,
      accent,
      priceUsd: buyInUsd > 0 ? buyInUsd / 1_000_000 : 0.0001,
      change24h: 0,
      liquidity: buyInUsd,
      volume24h: 0,
      marketCap: buyInUsd * 10,
      isBase: false,
    };

    const poolId = `${tokenId}-eth`;
    const newPool: LiquidityPool = {
      id: poolId,
      base: { id: tokenId, symbol: newToken.symbol, monogram, accent },
      quote: { id: "eth", symbol: "ETH", monogram: "ET", accent: "gold" },
      tvlUsd: buyInUsd,
      volume24hUsd: 0,
      aprPct: 0,
      fees24hUsd: 0,
      categories: ["new"],
      isLaunchpad: true,
      createdByUser: true,
      tvlSeries: Array(12).fill(Math.max(buyInUsd / 1000, 0.01)),
      volumeSeries: Array(12).fill(0),
      feesSeries: Array(12).fill(0),
    };

    const positionId = nextId("pos");
    const newPosition: LiquidityPosition = {
      id: positionId,
      poolId,
      valueUsd: buyInUsd,
      poolSharePct: 100,
      feesEarnedUsd24h: 0,
      locked: false,
    };

    setTokens((prev) => [...prev, newToken]);
    setPools((prev) => [newPool, ...prev]);
    setPositions((prev) => [newPosition, ...prev]);
    setMyLaunchedTokenIds((prev) => [...prev, tokenId]);

    return { tokenId, poolId, positionId };
  }, []);

  const addLiquidity = useCallback(
    ({ tokenAId, tokenBId, amountA, amountB, feeTier }: AddLiquidityInput) => {
      const depositUsd =
        amountA * (tokens.find((t) => t.id === tokenAId)?.priceUsd ?? 0) +
        amountB * (tokens.find((t) => t.id === tokenBId)?.priceUsd ?? 0);

      const existingPool = pools.find(
        (pool) =>
          (pool.base.id === tokenAId && pool.quote.id === tokenBId) ||
          (pool.base.id === tokenBId && pool.quote.id === tokenAId)
      );

      const poolId = existingPool ? existingPool.id : `${tokenAId}-${tokenBId}-${nextId("pool")}`;

      if (existingPool) {
        setPools((prev) =>
          prev.map((pool) =>
            pool.id === existingPool.id ? { ...pool, tvlUsd: pool.tvlUsd + depositUsd } : pool
          )
        );
      } else {
        const tokenA = tokens.find((t) => t.id === tokenAId)!;
        const tokenB = tokens.find((t) => t.id === tokenBId)!;
        const involvesMyToken =
          myLaunchedTokenIds.includes(tokenAId) || myLaunchedTokenIds.includes(tokenBId);
        const newPool: LiquidityPool = {
          id: poolId,
          base: { id: tokenA.id, symbol: tokenA.symbol, monogram: tokenA.monogram, accent: tokenA.accent },
          quote: { id: tokenB.id, symbol: tokenB.symbol, monogram: tokenB.monogram, accent: tokenB.accent },
          tvlUsd: depositUsd,
          volume24hUsd: 0,
          aprPct: 0,
          fees24hUsd: 0,
          categories: ["new"],
          isLaunchpad: involvesMyToken,
          createdByUser: involvesMyToken,
          tvlSeries: Array(12).fill(Math.max(depositUsd / 1000, 0.01)),
          volumeSeries: Array(12).fill(0),
          feesSeries: Array(12).fill(0),
        };
        setPools((prev) => [newPool, ...prev]);
      }

      const existingPosition = positions.find((position) => position.poolId === poolId);
      let positionId: string;
      if (existingPosition) {
        positionId = existingPosition.id;
        setPositions((prev) =>
          prev.map((position) =>
            position.id === existingPosition.id
              ? { ...position, valueUsd: position.valueUsd + depositUsd }
              : position
          )
        );
      } else {
        positionId = nextId("pos");
        const newPosition: LiquidityPosition = {
          id: positionId,
          poolId,
          valueUsd: depositUsd,
          poolSharePct: existingPool ? Math.min(100, (depositUsd / (existingPool.tvlUsd + depositUsd)) * 100) : 100,
          feesEarnedUsd24h: 0,
          locked: false,
        };
        setPositions((prev) => [newPosition, ...prev]);
      }

      void feeTier;
      return { poolId, positionId };
    },
    [pools, positions, tokens, myLaunchedTokenIds]
  );

  const lockPosition = useCallback((positionId: string, durationDays: number, boostMultiplier: number) => {
    setPositions((prev) =>
      prev.map((position) => {
        if (position.id !== positionId) return position;
        const unlockDate = new Date();
        unlockDate.setDate(unlockDate.getDate() + durationDays);
        return {
          ...position,
          locked: true,
          lockDurationDays: durationDays,
          lockedUntil: unlockDate.toISOString(),
          boostedAprPct: boostMultiplier,
        };
      })
    );
  }, []);

  const value = useMemo<LiquidityContextValue>(
    () => ({
      pools,
      positions,
      tokens,
      myLaunchedTokenIds,
      getPoolById,
      launchToken,
      addLiquidity,
      lockPosition,
    }),
    [pools, positions, tokens, myLaunchedTokenIds, getPoolById, launchToken, addLiquidity, lockPosition]
  );

  return <LiquidityContext.Provider value={value}>{children}</LiquidityContext.Provider>;
}

export function useLiquidity(): LiquidityContextValue {
  const ctx = useContext(LiquidityContext);
  if (!ctx) {
    throw new Error("useLiquidity must be used within a LiquidityProvider");
  }
  return ctx;
}
