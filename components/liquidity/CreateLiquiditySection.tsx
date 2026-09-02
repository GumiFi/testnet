"use client";

import { useMemo, useState } from "react";
import { PlusIcon } from "@/components/icons";
import { useWallet } from "@/lib/wallet-context";
import { useLiquidity } from "@/lib/liquidity-context";
import { swapTokens, type SwapToken } from "@/lib/swap-data";
import { formatCompactUsd } from "@/lib/format";
import TokenSelectButton from "@/components/swap/TokenSelectButton";
import dynamic from "next/dynamic";
import ModalSkeleton from "@/components/skeletons/ModalSkeleton";

const TokenSearchModal = dynamic(() => import("@/components/swap/TokenSearchModal"), {
  loading: () => <ModalSkeleton />,
});

const feeTiers = [
  { id: "0.05", label: "0.05%", description: "Best for stable pairs" },
  { id: "0.3", label: "0.3%", description: "Best for most pairs" },
  { id: "1", label: "1%", description: "Best for exotic pairs" },
] as const;

type FeeTier = (typeof feeTiers)[number]["id"];

export default function CreateLiquiditySection({
  onCreated,
}: {
  onCreated: (result: { poolId: string; positionId: string }) => void;
}) {
  const { isConnected, connect } = useWallet();
  const { pools, tokens, addLiquidity } = useLiquidity();

  const myTokens = useMemo(
    () => tokens.filter((token) => !swapTokens.some((base) => base.id === token.id)),
    [tokens]
  );
  const allTokens = useMemo(() => [...swapTokens, ...myTokens], [myTokens]);

  const [tokenAId, setTokenAId] = useState("eth");
  const [tokenBId, setTokenBId] = useState("usdc");
  const [amountA, setAmountA] = useState("");
  const [amountB, setAmountB] = useState("");
  const [feeTier, setFeeTier] = useState<FeeTier>("0.3");
  const [searchSide, setSearchSide] = useState<"a" | "b" | null>(null);

  const tokenA = allTokens.find((token) => token.id === tokenAId)!;
  const tokenB = allTokens.find((token) => token.id === tokenBId)!;

  const existingPool = useMemo(
    () =>
      pools.find(
        (pool) =>
          (pool.base.id === tokenAId && pool.quote.id === tokenBId) ||
          (pool.base.id === tokenBId && pool.quote.id === tokenAId)
      ),
    [pools, tokenAId, tokenBId]
  );

  const amountANum = parseFloat(amountA) || 0;
  const amountBNum = parseFloat(amountB) || 0;
  const hasAmounts = amountANum > 0 && amountBNum > 0;
  const depositUsd = amountANum * tokenA.priceUsd + amountBNum * tokenB.priceUsd;
  const poolSharePct = existingPool
    ? Math.min(100, (depositUsd / (existingPool.tvlUsd + depositUsd)) * 100)
    : 100;

  function handleSelectToken(tokenId: string) {
    if (searchSide === "a") {
      if (tokenId === tokenBId) setTokenBId(tokenAId);
      setTokenAId(tokenId);
    } else if (searchSide === "b") {
      if (tokenId === tokenAId) setTokenAId(tokenBId);
      setTokenBId(tokenId);
    }
    setSearchSide(null);
  }

  function handleSubmit() {
    const result = addLiquidity({
      tokenAId,
      tokenBId,
      amountA: amountANum,
      amountB: amountBNum,
      feeTier,
    });
    setAmountA("");
    setAmountB("");
    onCreated(result);
  }

  let ctaLabel = "Create Liquidity Pool";
  let ctaDisabled = false;
  let ctaAction: () => void = handleSubmit;

  if (!isConnected) {
    ctaLabel = "Connect Wallet";
    ctaAction = connect;
  } else if (tokenAId === tokenBId) {
    ctaLabel = "Choose Different Tokens";
    ctaDisabled = true;
  } else if (!hasAmounts) {
    ctaLabel = "Enter an Amount";
    ctaDisabled = true;
  }

  return (
    <section className="border-b border-line px-6 py-10">
      <div className="mx-auto max-w-xl">
        <div className="border border-gold/40 bg-panel px-5 py-6 md:px-6">
          <h2 className="font-display text-sm uppercase tracking-wider2 text-ivory">
            Create Liquidity Pool
          </h2>
          <p className="mt-1 font-body text-xs text-bronze">
            Deposit two tokens to seed or add to a pool and start earning fees. Launched your own
            token? It shows up here too — pair it and lock it once liquidity is live.
          </p>

          <div className="mt-6 space-y-3">
            <AmountField
              label="Token A"
              token={tokenA}
              amount={amountA}
              onAmountChange={setAmountA}
              onSelectToken={() => setSearchSide("a")}
            />
            <div className="relative z-10 -my-3 flex justify-center">
              <div className="flex h-8 w-8 items-center justify-center border border-gold/50 bg-panel2 text-goldLight">
                <PlusIcon className="h-4 w-4" />
              </div>
            </div>
            <AmountField
              label="Token B"
              token={tokenB}
              amount={amountB}
              onAmountChange={setAmountB}
              onSelectToken={() => setSearchSide("b")}
            />
          </div>

          <div className="mt-6">
            <p className="font-mono text-[10px] uppercase tracking-wider2 text-bronze">Fee Tier</p>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {feeTiers.map((tier) => (
                <button
                  key={tier.id}
                  type="button"
                  onClick={() => setFeeTier(tier.id)}
                  className={`border px-3 py-2.5 text-center transition-colors ${
                    feeTier === tier.id
                      ? "border-gold bg-gold/10 text-goldLight"
                      : "border-line text-bronze hover:border-gold/40 hover:text-ivory"
                  }`}
                >
                  <p className="font-display text-xs uppercase tracking-wider2">{tier.label}</p>
                  <p className="mt-1 font-mono text-[9px] leading-tight text-bronze">
                    {tier.description}
                  </p>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 space-y-2 border-t border-line pt-4">
            <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-wider2">
              <span className="text-bronze">Pool</span>
              <span className="text-ivory">{existingPool ? "Existing Pool" : "New Pool"}</span>
            </div>
            {existingPool && (
              <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-wider2">
                <span className="text-bronze">Current Liquidity</span>
                <span className="text-ivory">{formatCompactUsd(existingPool.tvlUsd)}</span>
              </div>
            )}
            <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-wider2">
              <span className="text-bronze">Deposit Value</span>
              <span className="text-ivory">{hasAmounts ? formatCompactUsd(depositUsd) : "—"}</span>
            </div>
            <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-wider2">
              <span className="text-bronze">Est. Pool Share</span>
              <span className="text-goldLight">{hasAmounts ? `${poolSharePct.toFixed(2)}%` : "—"}</span>
            </div>
          </div>

          <button
            type="button"
            disabled={ctaDisabled}
            onClick={ctaAction}
            className={`mt-6 w-full border px-4 py-3 font-mono text-[11px] uppercase tracking-wider2 transition-colors ${
              ctaDisabled
                ? "cursor-not-allowed border-line bg-panel2 text-bronze"
                : "border-gold text-goldLight hover:bg-gold hover:text-void"
            }`}
          >
            {ctaLabel}
          </button>
        </div>
      </div>

      {searchSide && (
        <TokenSearchModal
          title={searchSide === "a" ? "Select Token A" : "Select Token B"}
          excludeId={searchSide === "a" ? tokenBId : tokenAId}
          extraTokens={myTokens}
          onSelect={handleSelectToken}
          onImportToken={() => {}}
          onClose={() => setSearchSide(null)}
        />
      )}
    </section>
  );
}

function AmountField({
  label,
  token,
  amount,
  onAmountChange,
  onSelectToken,
}: {
  label: string;
  token: SwapToken;
  amount: string;
  onAmountChange: (value: string) => void;
  onSelectToken: () => void;
}) {
  return (
    <div>
      <p className="font-mono text-[10px] uppercase tracking-wider2 text-bronze">{label}</p>
      <div className="mt-2 border border-line bg-panel2 px-4 py-3 transition-colors focus-within:border-gold/60">
        <div className="flex items-center gap-3">
          <input
            value={amount}
            onChange={(event) => onAmountChange(event.target.value)}
            type="text"
            inputMode="decimal"
            placeholder="0.0"
            className="w-full min-w-0 bg-transparent font-display text-2xl text-ivory placeholder:text-bronze/50 focus:outline-none"
          />
          <TokenSelectButton token={token} onClick={onSelectToken} />
        </div>
      </div>
    </div>
  );
}
